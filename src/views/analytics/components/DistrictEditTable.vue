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
              + 新增月份
            </el-button>
          </template>
          <div class="flex flex-col gap-2">
            <span class="text-sm font-bold">新增月份欄位</span>
            <el-input
              v-model="newMonthInput"
              placeholder="例：114/6"
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

    <el-table :data="tableRows" border class="w-full" max-height="600">
      <el-table-column prop="district" label="行政區" fixed width="120" />
      <el-table-column
        v-for="month in allMonths"
        :key="month"
        :label="month"
        min-width="110"
        align="center"
      >
        <template #default="{ row }">
          <div
            v-if="!isEditing(row.district, month)"
            class="cursor-pointer rounded px-2 py-1 hover:bg-blue-50"
            :class="{
              'bg-yellow-100': isModified(row.district, month),
              'bg-green-50': isNewMonth(month),
            }"
            @click="startEdit(row.district, month)"
          >
            {{ formatValue(row.values[month]) }}
          </div>
          <el-input
            v-else
            v-model.number="editValue"
            size="small"
            @blur="finishEdit(row.district, month)"
            @keyup.enter="finishEdit(row.district, month)"
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

const props = defineProps<{
  indicatorMap: Record<number, IndicatorFlat>
  dbIndex: number
  districts: string[]
}>()

const emit = defineEmits<{
  saved: []
}>()

const DATE_PATTERN = /^\d{3}\/\d{1,2}$/

// 從 indicatorMap 解析複合日期 → { yearMonth → { district → value } }
const dataGrid = computed(() => {
  const flat = props.indicatorMap[props.dbIndex]
  if (!flat) return {} as Record<string, Record<string, number>>

  const grid: Record<string, Record<string, number>> = {}
  flat.dates.forEach((date, i) => {
    const parts = date.split('/')
    if (parts.length < 3) return
    const yearMonth = `${parts[0]}/${parts[1]}`
    const district = parts.slice(2).join('/')
    if (!grid[yearMonth]) grid[yearMonth] = {}
    grid[yearMonth][district] = flat.values[i] as number
  })
  return grid
})

// 已有月份（排序）
const existingMonths = computed(() => {
  const months = Object.keys(dataGrid.value)
  return months.sort((a, b) => {
    const [ya, ma] = a.split('/').map(Number)
    const [yb, mb] = b.split('/').map(Number)
    return ya * 12 + ma - (yb * 12 + mb)
  })
})

// 手動新增月份
const extraMonths = ref<string[]>([])

const allMonths = computed(() => {
  const merged = [...new Set([...existingMonths.value, ...extraMonths.value])]
  return merged.sort((a, b) => {
    const [ya, ma] = a.split('/').map(Number)
    const [yb, mb] = b.split('/').map(Number)
    return ya * 12 + ma - (yb * 12 + mb)
  })
})

const isNewMonth = (month: string) => extraMonths.value.includes(month)

const showAddMonth = ref(false)
const newMonthInput = ref('')

const addMonth = () => {
  const value = newMonthInput.value.trim()
  if (!value || !DATE_PATTERN.test(value)) {
    ElMessage.warning('格式錯誤，請輸入如 114/6')
    return
  }
  if (allMonths.value.includes(value)) {
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

// 修改記錄：key = "district|yearMonth"
const modifications = ref<Map<string, number>>(new Map())
const editingCell = ref<string | null>(null)
const editValue = ref<number | null>(null)
const saving = ref(false)

const cellKey = (district: string, month: string) => `${district}|${month}`

const tableRows = computed(() =>
  props.districts.map((district) => {
    const values: Record<string, number | null> = {}
    for (const month of allMonths.value) {
      const key = cellKey(district, month)
      if (modifications.value.has(key)) {
        values[month] = modifications.value.get(key)!
      } else {
        values[month] = dataGrid.value[month]?.[district] ?? null
      }
    }
    return { district, values }
  })
)

const pendingCount = computed(() => modifications.value.size)

const isEditing = (district: string, month: string) =>
  editingCell.value === cellKey(district, month)

const isModified = (district: string, month: string) =>
  modifications.value.has(cellKey(district, month))

const formatValue = (v: number | null | undefined) =>
  v != null ? v.toLocaleString() : '-'

let inputRef: HTMLInputElement | null = null
const setInputRef = (el: any) => {
  inputRef = el?.$el?.querySelector('input') ?? el?.input ?? null
}

const startEdit = (district: string, month: string) => {
  const row = tableRows.value.find((r) => r.district === district)
  editValue.value = row?.values[month] ?? null
  editingCell.value = cellKey(district, month)
  nextTick(() => inputRef?.focus())
}

const finishEdit = (district: string, month: string) => {
  const key = cellKey(district, month)
  const originalValue = dataGrid.value[month]?.[district] ?? null

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
    const [district, month] = key.split('|')
    const compositeDate = `${month}/${district}`
    return { index: props.dbIndex, date: compositeDate, value }
  })

  await http.put('/indicator/v2/batch', { updates })

  modifications.value = new Map()
  extraMonths.value = []
  saving.value = false
  ElMessage.success(`已儲存 ${updates.length} 筆修改`)
  emit('saved')
}
</script>
