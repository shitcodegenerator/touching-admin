<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import http from '../../../request/http'
import { typeMap, statusMap, deletionActorMap } from '../constants'
import type { LandPostDeletion } from '../types'

const keyword = ref('')
const items = ref<LandPostDeletion[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)

const detail = ref<LandPostDeletion | null>(null)
const detailVisible = ref(false)
const detailLoading = ref(false)

const fmt = (d?: string | null) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : '-')

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await http.get('/land-post/admin/deletions', {
      params: { q: keyword.value.trim() || undefined, page: currentPage.value, limit: pageSize },
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

const showDetail = async (row: LandPostDeletion) => {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await http.get(`/land-post/admin/deletions/${row._id}`)
    detail.value = res.data.data
  } finally {
    detailLoading.value = false
  }
}

const restore = async (row: LandPostDeletion) => {
  try {
    await ElMessageBox.confirm(
      `確定要還原案件 ${row.landPostId} 嗎？會以原本的狀態（${statusMap[row.statusAtDeletion] || row.statusAtDeletion}）重新出現在列表中。`,
      '還原案件',
      { confirmButtonText: '確定還原', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  await http.post(`/land-post/admin/deletions/${row._id}/restore`)
  ElMessage.success('已還原案件')
  detailVisible.value = false
  fetchItems()
}

onMounted(fetchItems)
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <el-input
        v-model="keyword"
        class="max-w-md"
        clearable
        placeholder="案件編號、會員 ID、帳號、信箱或聯絡人"
        @keyup.enter="search"
        @clear="search"
      />
      <el-button type="primary" @click="search">查詢</el-button>
      <span class="text-xs text-gray-500">會員撤回與管理員刪除都會留存紀錄，案件內容與圖片可還原。</span>
    </div>

    <el-table :data="items" v-loading="loading" stripe>
      <el-table-column label="刪除時間" width="170">
        <template #default="{ row }">{{ fmt(row.deletedAt) }}</template>
      </el-table-column>
      <el-table-column label="刪除方式" width="130">
        <template #default="{ row }">
          <el-tag size="small" :type="row.actor.role === 'admin' ? 'danger' : 'warning'" effect="plain">
            {{ deletionActorMap[row.actor.role] }}
          </el-tag>
          <div v-if="row.actor.role === 'admin'" class="text-xs text-gray-500 mt-1">{{ row.actor.username || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="案件" min-width="200">
        <template #default="{ row }">
          <div>{{ typeMap[row.snapshot?.type] || row.snapshot?.type }}｜{{ row.snapshot?.city }}{{ row.snapshot?.district }}</div>
          <div class="text-xs text-gray-500 font-mono">{{ row.landPostId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="聯絡人／會員" min-width="180">
        <template #default="{ row }">
          <div>{{ row.snapshot?.contactName || '-' }}</div>
          <div class="text-xs text-gray-500">{{ row.owner?.username }} {{ row.owner?.email }}</div>
        </template>
      </el-table-column>
      <el-table-column label="刪除時狀態" width="100">
        <template #default="{ row }">{{ statusMap[row.statusAtDeletion] || row.statusAtDeletion }}</template>
      </el-table-column>
      <el-table-column label="來源 IP" width="140">
        <template #default="{ row }"><span class="font-mono text-xs">{{ row.ip || '-' }}</span></template>
      </el-table-column>
      <el-table-column label="還原" width="110">
        <template #default="{ row }">
          <span v-if="row.restoredAt" class="text-xs text-green-600">已還原<br />{{ fmt(row.restoredAt) }}</span>
          <span v-else class="text-xs text-gray-400">未還原</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDetail(row)">詳情</el-button>
          <el-button v-if="!row.restoredAt" link type="warning" @click="restore(row)">還原</el-button>
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

    <el-dialog v-model="detailVisible" title="刪除紀錄詳情" width="720px">
      <div v-loading="detailLoading" class="min-h-[120px]">
        <template v-if="detail">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="案件編號" :span="2">{{ detail.landPostId }}</el-descriptions-item>
            <el-descriptions-item label="刪除方式">{{ deletionActorMap[detail.actor.role] }}</el-descriptions-item>
            <el-descriptions-item label="操作者">{{ detail.actor.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="刪除時間">{{ fmt(detail.deletedAt) }}</el-descriptions-item>
            <el-descriptions-item label="刪除時狀態">{{ statusMap[detail.statusAtDeletion] || detail.statusAtDeletion }}</el-descriptions-item>
            <el-descriptions-item label="來源 IP">{{ detail.ip || '-' }}</el-descriptions-item>
            <el-descriptions-item label="環境">{{ detail.env }}</el-descriptions-item>
            <el-descriptions-item label="瀏覽器" :span="2"><span class="text-xs break-all">{{ detail.userAgent || '-' }}</span></el-descriptions-item>
            <el-descriptions-item label="會員" :span="2">{{ detail.owner?.username }}｜{{ detail.owner?.email }}</el-descriptions-item>
            <el-descriptions-item label="還原" :span="2">
              {{ detail.restoredAt ? `${fmt(detail.restoredAt)}（${detail.restoredBy?.username || '-'}）` : '未還原' }}
            </el-descriptions-item>
          </el-descriptions>

          <h3 class="font-semibold text-gray-700 mt-5 mb-2">刪除當下的案件內容</h3>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="類型">{{ typeMap[detail.snapshot.type || ''] || detail.snapshot.type }}</el-descriptions-item>
            <el-descriptions-item label="位置">{{ detail.snapshot.city }}{{ detail.snapshot.district }} {{ detail.snapshot.section }}</el-descriptions-item>
            <el-descriptions-item label="聯絡人">{{ detail.snapshot.contactName }}</el-descriptions-item>
            <el-descriptions-item label="電話">{{ detail.snapshot.contactPhone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地號" :span="2">{{ detail.snapshot.landNumbers?.join('、') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="建立時間" :span="2">{{ fmt(detail.snapshot.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="說明" :span="2"><div class="whitespace-pre-wrap">{{ detail.snapshot.description || '-' }}</div></el-descriptions-item>
          </el-descriptions>

          <div v-if="detail.snapshot.images?.length" class="flex flex-wrap gap-2 mt-3">
            <el-image
              v-for="img in detail.snapshot.images"
              :key="img.url"
              :src="img.url"
              :preview-src-list="detail.snapshot.images.map((i) => i.url)"
              fit="cover"
              class="w-24 h-24 rounded"
              preview-teleported
            />
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">關閉</el-button>
        <el-button v-if="detail && !detail.restoredAt" type="warning" @click="restore(detail)">還原案件</el-button>
      </template>
    </el-dialog>
  </div>
</template>
