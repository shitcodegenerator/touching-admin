<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import http from '../../request/http'
import { securityEventTypeMap, scopeMap } from './constants'

interface SecurityEvent {
  _id: string
  type: string
  target: string
  ip: string
  userAgent: string
  method: string
  path: string
  detail: { scope?: string; count?: number; windowMinutes?: number; source?: string; field?: string }
  isTest: boolean
  createdAt: string
}

const keyword = ref('')
const type = ref('')
const dateRange = ref<[string, string] | null>(null)
const hideTest = ref(true)
const items = ref<SecurityEvent[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)

const fmt = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm:ss')

const describe = (row: SecurityEvent) => {
  const d = row.detail || {}
  if (row.type === 'nosql_injection') return `${d.source ?? ''}.${d.field ?? ''}`
  const scope = d.scope ? scopeMap[d.scope] || d.scope : ''
  return `${scope}｜${d.count ?? '-'} 次／${d.windowMinutes ?? '-'} 分鐘`
}

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await http.get('/security-events', {
      params: {
        page: currentPage.value,
        limit: pageSize,
        q: keyword.value.trim() || undefined,
        type: type.value || undefined,
        hideTest: hideTest.value ? 'true' : undefined,
        from: dateRange.value?.[0],
        to: dateRange.value?.[1],
      },
    })
    items.value = res.data.data
    total.value = res.data.meta?.total ?? 0
  } finally {
    loading.value = false
  }
}

const search = () => {
  currentPage.value = 1
  fetchItems()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchItems()
}

onMounted(fetchItems)
</script>

<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h1 class="text-xl font-bold text-gray-800 mb-1">資安紀錄</h1>
      <p class="text-sm text-gray-500 mb-4">
        登入或驗證碼錯誤過多被封鎖、擋下的攻擊請求。保留 180 天；土地案件的刪除紀錄在「土地審核 → 刪除紀錄」。
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <el-input
          v-model="keyword"
          class="!w-64"
          clearable
          placeholder="IP、帳號或路徑"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="type" class="!w-56" clearable placeholder="全部類型" @change="search">
          <el-option v-for="(label, value) in securityEventTypeMap" :key="value" :label="label" :value="value" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          class="!w-72 !flex-none"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          @change="search"
        />
        <el-checkbox v-model="hideTest" @change="search">隱藏測試流量</el-checkbox>
        <el-button type="primary" @click="search">查詢</el-button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column label="時間" width="170">
          <template #default="{ row }">{{ fmt(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="類型" width="190">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'nosql_injection' ? 'danger' : 'warning'" effect="plain" disable-transitions>
              {{ securityEventTypeMap[row.type] || row.type }}
            </el-tag>
            <el-tag v-if="row.isTest" size="small" type="info" class="ml-1" disable-transitions>測試</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="對象" min-width="160">
          <template #default="{ row }">{{ row.target || '-' }}</template>
        </el-table-column>
        <el-table-column label="來源 IP" width="140">
          <template #default="{ row }"><span class="font-mono text-xs">{{ row.ip || '-' }}</span></template>
        </el-table-column>
        <el-table-column label="細節" min-width="200">
          <template #default="{ row }">{{ describe(row) }}</template>
        </el-table-column>
        <el-table-column label="請求" min-width="220">
          <template #default="{ row }">
            <div class="font-mono text-xs break-all">{{ row.method }} {{ row.path }}</div>
            <div class="text-xs text-gray-400 truncate" :title="row.userAgent">{{ row.userAgent }}</div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
