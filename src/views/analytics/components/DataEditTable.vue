<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">
          點擊數值可直接編輯，修改後點擊「儲存全部修改」送出
        </span>
        <el-popover
          :visible="showAddMonth"
          placement="bottom"
          :width="220"
          trigger="click"
        >
          <template #reference>
            <el-button size="small" @click="showAddMonth = true">
              + 新增日期
            </el-button>
          </template>
          <div class="flex flex-col gap-2">
            <span class="text-sm font-bold">新增日期欄位</span>
            <el-input
              v-model="newMonthInput"
              :placeholder="useRawLabels ? '例：114/4/30' : '例：114/5'"
              size="small"
              @keyup.enter="addMonth"
            />
            <div class="flex justify-end gap-2">
              <el-button size="small" @click="showAddMonth = false">取消</el-button>
              <el-button type="primary" size="small" @click="addMonth">確認</el-button>
            </div>
          </div>
        </el-popover>
      </div>
      <div class="flex gap-2">
        <el-tag v-if="pendingCount > 0" type="warning">
          {{ pendingCount }} 筆待儲存
        </el-tag>
        <el-button
          type="primary"
          :disabled="pendingCount === 0"
          :loading="saving"
          @click="saveAll"
        >
          儲存全部修改
        </el-button>
      </div>
    </div>

    <el-table :data="tableRows" border class="w-full" max-height="500">
      <el-table-column prop="label" label="指標名稱" fixed width="220">
        <template #default="{ row }">
          <a
            v-if="indicatorSourceUrls[row.dbIndex]"
            :href="indicatorSourceUrls[row.dbIndex]"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 underline hover:text-blue-800"
          >
            {{ row.label }}
          </a>
          <span v-else>{{ row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(month, colIdx) in allDates"
        :key="month"
        :label="month"
        min-width="110"
        align="center"
      >
        <template #default="{ row }">
          <div
            v-if="!isEditing(row.dbIndex, colIdx)"
            class="cursor-pointer rounded px-2 py-1 hover:bg-blue-50"
            :class="{
              'bg-yellow-100': isModified(row.dbIndex, colIdx),
              'bg-green-50': isNewMonth(month),
            }"
            @click="startEdit(row.dbIndex, colIdx)"
          >
            {{ formatValue(row.values[colIdx]) }}
          </div>
          <el-input
            v-else
            v-model.number="editValue"
            size="small"
            @blur="finishEdit(row.dbIndex, colIdx)"
            @keyup.enter="finishEdit(row.dbIndex, colIdx)"
            :ref="(el: any) => setInputRef(el)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../../../request/http'
import type { IndicatorFlat } from '../index.vue'
import { indicatorSourceUrls } from './chartGroups'

interface ChartGroupIndicator {
  dbIndex: number
  label: string
}

const props = defineProps<{
  indicatorMap: Record<number, IndicatorFlat>
  indicators: ChartGroupIndicator[]
  useRawLabels?: boolean
}>()

const emit = defineEmits<{
  saved: []
}>()

const DATE_PATTERN = /^(\d{3}\/\d{1,2}|\d{3}Q\d)$/

const parseDate = (d: string) => {
  const monthMatch = d.match(/^(\d{3})\/(\d{1,2})$/)
  if (monthMatch) return { year: +monthMatch[1], period: +monthMatch[2] }
  const quarterMatch = d.match(/^(\d{3})Q(\d)$/)
  if (quarterMatch) return { year: +quarterMatch[1], period: +quarterMatch[2] }
  return { year: 0, period: 0 }
}

const sortDateStrings = (dates: string[]) =>
  [...dates].sort((a, b) => {
    const pa = parseDate(a)
    const pb = parseDate(b)
    return pa.year !== pb.year ? pa.year - pb.year : pa.period - pb.period
  })

// 從該組指標計算已有標籤
const existingDates = computed(() => {
  if (props.useRawLabels) {
    // 各區資料：直接用第一個指標的 dates 順序（行政區名稱）
    const first = props.indicators[0]
    const flat = props.indicatorMap[first.dbIndex]
    return flat?.dates ?? []
  }

  const dateSet = new Set<string>()
  for (const indicator of props.indicators) {
    const flat = props.indicatorMap[indicator.dbIndex]
    if (!flat) continue
    flat.dates.filter((d) => DATE_PATTERN.test(d)).forEach((d) => dateSet.add(d))
  }
  return sortDateStrings(Array.from(dateSet))
})

// 使用者手動新增的月份
const extraMonths = ref<string[]>([])

// 合併後的完整日期列（已有 + 新增）
const allDates = computed(() => {
  const merged = [...new Set([...existingDates.value, ...extraMonths.value])]
  return props.useRawLabels ? merged : sortDateStrings(merged)
})

const isNewMonth = (month: string) => extraMonths.value.includes(month)

// 新增月份 UI
const showAddMonth = ref(false)
const newMonthInput = ref('')

const addMonth = () => {
  const value = newMonthInput.value.trim()
  if (!value) return
  if (!props.useRawLabels && !DATE_PATTERN.test(value)) {
    ElMessage.warning('格式錯誤，請輸入如 114/5 或 114Q1')
    return
  }
  if (allDates.value.includes(value)) {
    ElMessage.warning(`${value} 已存在`)
    showAddMonth.value = false
    newMonthInput.value = ''
    return
  }
  extraMonths.value = [...extraMonths.value, value]
  showAddMonth.value = false
  newMonthInput.value = ''
  ElMessage.success(`已新增 ${value} 欄位，請填入數值後儲存`)
}

// 修改記錄：key = `${dbIndex}-${colIdx}`
const modifications = ref<Map<string, number>>(new Map())
const editingCell = ref<string | null>(null)
const editValue = ref<number | null>(null)
const saving = ref(false)

const tableRows = computed(() =>
  props.indicators.map((indicator) => {
    const flat = props.indicatorMap[indicator.dbIndex]

    const values = allDates.value.map((month, colIdx) => {
      const modKey = `${indicator.dbIndex}-${colIdx}`
      if (modifications.value.has(modKey)) {
        return modifications.value.get(modKey)!
      }
      if (!flat) return null
      const idx = flat.dates.indexOf(month)
      return idx >= 0 ? flat.values[idx] : null
    })

    return { dbIndex: indicator.dbIndex, label: indicator.label, values }
  })
)

const pendingCount = computed(() => modifications.value.size)

const cellKey = (dbIndex: number, colIdx: number) => `${dbIndex}-${colIdx}`

const isEditing = (dbIndex: number, colIdx: number) =>
  editingCell.value === cellKey(dbIndex, colIdx)

const isModified = (dbIndex: number, colIdx: number) =>
  modifications.value.has(cellKey(dbIndex, colIdx))

const formatValue = (v: number | null | undefined) =>
  v != null ? v.toLocaleString() : '-'

let inputRef: HTMLInputElement | null = null
const setInputRef = (el: any) => {
  inputRef = el?.$el?.querySelector('input') ?? el?.input ?? null
}

const startEdit = (dbIndex: number, colIdx: number) => {
  const row = tableRows.value.find((r) => r.dbIndex === dbIndex)
  editValue.value = row?.values[colIdx] ?? null
  editingCell.value = cellKey(dbIndex, colIdx)
  nextTick(() => inputRef?.focus())
}

const finishEdit = (dbIndex: number, colIdx: number) => {
  const key = cellKey(dbIndex, colIdx)
  const flat = props.indicatorMap[dbIndex]
  const month = allDates.value[colIdx]
  const originalIdx = flat?.dates.indexOf(month) ?? -1
  const originalValue = originalIdx >= 0 ? flat?.values[originalIdx] : null

  if (editValue.value != null && editValue.value !== originalValue) {
    modifications.value = new Map(modifications.value).set(key, editValue.value)
  } else {
    const next = new Map(modifications.value)
    next.delete(key)
    modifications.value = next
  }
  editingCell.value = null
}

const saveAll = async () => {
  if (modifications.value.size === 0) return
  saving.value = true

  const updates = Array.from(modifications.value.entries()).map(([key, value]) => {
    const [dbIndexStr, colIdxStr] = key.split('-')
    const dbIndex = Number(dbIndexStr)
    const colIdx = Number(colIdxStr)
    const date = allDates.value[colIdx]
    return { index: dbIndex, date, value }
  })

  await http.put('/indicator/v2/batch', { updates })

  modifications.value = new Map()
  extraMonths.value = []
  saving.value = false
  ElMessage.success(`已儲存 ${updates.length} 筆修改`)
  emit('saved')
}
</script>
