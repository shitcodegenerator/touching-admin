<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import http from '../request/http'

interface LandPost {
  _id: string
  type: string
  contactName: string
  city: string
  district: string
  section?: string
  landNumbers?: string[]
  approximateLocation?: string
  landCondition?: string
  description: string
  priceBudget?: string
  visibility: string
  images?: { key: string; url: string }[]
  contactPhone?: string
  contactLine?: string
  status: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
}

const posts = ref<LandPost[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const activeTab = ref('pending')
const loading = ref(false)

// Review dialog
const reviewDialogVisible = ref(false)
const reviewAction = ref<'approve' | 'reject'>('approve')
const reviewNote = ref('')
const reviewTarget = ref<LandPost | null>(null)

// Detail dialog
const detailDialogVisible = ref(false)
const detailPost = ref<LandPost | null>(null)

const typeMap: Record<string, string> = {
  sell: '出售',
  rent: '出租',
  buy: '土地購入',
  joint_development: '合建',
  asset_lease: '資產租賃',
  other: '其他或複合性開發使用',
}

const visibilityMap: Record<string, string> = {
  platform_public: '公開於踏取平台',
  internal_only: '僅內部可見',
}

const statusMap: Record<string, string> = {
  pending: '待審核',
  approved: '已核准',
  rejected: '已駁回',
}

const statusTagType = (status: string) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await http.get('/land-post/admin/list', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        status: activeTab.value === 'all' ? undefined : activeTab.value,
      },
    })
    posts.value = res.data.data
    total.value = res.data.meta?.total ?? 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  fetchPosts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPosts()
}

const showDetail = (post: LandPost) => {
  detailPost.value = post
  detailDialogVisible.value = true
}

const openReviewDialog = (post: LandPost, action: 'approve' | 'reject') => {
  reviewTarget.value = post
  reviewAction.value = action
  reviewNote.value = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewTarget.value) return

  if (reviewAction.value === 'reject' && !reviewNote.value.trim()) {
    ElMessage.warning('駁回需填寫原因')
    return
  }

  try {
    const endpoint = reviewAction.value === 'approve' ? 'approve' : 'reject'
    await http.patch(`/land-post/admin/${reviewTarget.value._id}/${endpoint}`, {
      reviewNote: reviewNote.value || undefined,
    })
    ElMessage.success(reviewAction.value === 'approve' ? '已核准' : '已駁回')
    reviewDialogVisible.value = false
    fetchPosts()
  } catch {
    // error handled by interceptor
  }
}

const handleDelete = async (post: LandPost) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除「${post.contactName}」在 ${post.city}${post.district} 的投稿嗎？此操作無法復原，圖片也會一併刪除。`,
      '刪除投稿',
      { confirmButtonText: '確定刪除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return // 使用者取消
  }

  try {
    await http.delete(`/land-post/admin/${post._id}`)
    ElMessage.success('已刪除投稿')
    fetchPosts()
  } catch {
    // error handled by interceptor
  }
}

onMounted(fetchPosts)
</script>

<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h1 class="text-xl font-bold text-gray-800 mb-4">土地互惠審核</h1>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待審核" name="pending" />
        <el-tab-pane label="已核准" name="approved" />
        <el-tab-pane label="已駁回" name="rejected" />
        <el-tab-pane label="全部" name="all" />
      </el-tabs>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <el-table :data="posts" v-loading="loading" stripe>
        <el-table-column label="類型" width="90">
          <template #default="{ row }">
            {{ typeMap[row.type] || row.type }}
          </template>
        </el-table-column>

        <el-table-column label="聯絡人" prop="contactName" width="100" />

        <el-table-column label="位置" min-width="160">
          <template #default="{ row }">
            {{ row.city }} {{ row.district }}
            <span v-if="row.section" class="text-gray-500">{{ row.section }}</span>
          </template>
        </el-table-column>

        <el-table-column label="說明" prop="description" min-width="200" show-overflow-tooltip />

        <el-table-column label="可見度" width="120">
          <template #default="{ row }">
            {{ visibilityMap[row.visibility] || row.visibility }}
          </template>
        </el-table-column>

        <el-table-column label="狀態" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交時間" width="160">
          <template #default="{ row }">
            {{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row)">詳情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="openReviewDialog(row, 'approve')"
            >
              核准
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="danger"
              @click="openReviewDialog(row, 'reject')"
            >
              駁回
            </el-button>
            <el-button
              v-if="row.status === 'approved' || row.status === 'rejected'"
              size="small"
              type="danger"
              plain
              @click="handleDelete(row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialogVisible" title="投稿詳情" width="640px">
      <div v-if="detailPost" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-gray-500 text-sm">類型</span>
            <p class="font-medium">{{ typeMap[detailPost.type] }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">狀態</span>
            <p>
              <el-tag :type="statusTagType(detailPost.status)" size="small">
                {{ statusMap[detailPost.status] }}
              </el-tag>
            </p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">聯絡人</span>
            <p class="font-medium">{{ detailPost.contactName }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">可見度</span>
            <p>{{ visibilityMap[detailPost.visibility] }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">位置</span>
            <p>{{ detailPost.city }} {{ detailPost.district }} {{ detailPost.section || '' }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">提交時間</span>
            <p>{{ dayjs(detailPost.createdAt).format('YYYY-MM-DD HH:mm') }}</p>
          </div>
        </div>

        <div v-if="detailPost.landNumbers?.length">
          <span class="text-gray-500 text-sm">地號</span>
          <div class="flex flex-wrap gap-1 mt-1">
            <el-tag v-for="num in detailPost.landNumbers" :key="num" size="small" type="info">
              {{ num }}
            </el-tag>
          </div>
        </div>

        <div v-if="detailPost.landCondition">
          <span class="text-gray-500 text-sm">土地現況</span>
          <p class="mt-1 whitespace-pre-wrap">{{ detailPost.landCondition }}</p>
        </div>

        <div>
          <span class="text-gray-500 text-sm">說明</span>
          <p class="mt-1 whitespace-pre-wrap">{{ detailPost.description }}</p>
        </div>

        <div v-if="detailPost.priceBudget">
          <span class="text-gray-500 text-sm">價格預算</span>
          <p class="mt-1">{{ detailPost.priceBudget }}</p>
        </div>

        <div v-if="detailPost.contactPhone || detailPost.contactLine" class="grid grid-cols-2 gap-4">
          <div v-if="detailPost.contactPhone">
            <span class="text-gray-500 text-sm">電話</span>
            <p>{{ detailPost.contactPhone }}</p>
          </div>
          <div v-if="detailPost.contactLine">
            <span class="text-gray-500 text-sm">LINE</span>
            <p>{{ detailPost.contactLine }}</p>
          </div>
        </div>

        <div v-if="detailPost.images?.length">
          <span class="text-gray-500 text-sm">圖片</span>
          <div class="flex gap-2 mt-2 flex-wrap">
            <el-image
              v-for="img in detailPost.images"
              :key="img.key"
              :src="img.url"
              :preview-src-list="detailPost.images.map(i => i.url)"
              class="w-24 h-24 rounded border object-cover"
              fit="cover"
            />
          </div>
        </div>

        <div v-if="detailPost.reviewNote">
          <span class="text-gray-500 text-sm">審核備註</span>
          <p class="mt-1 text-orange-600">{{ detailPost.reviewNote }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="detailDialogVisible = false">關閉</el-button>
          <el-button
            v-if="detailPost?.status === 'pending'"
            type="success"
            @click="detailDialogVisible = false; openReviewDialog(detailPost!, 'approve')"
          >
            核准
          </el-button>
          <el-button
            v-if="detailPost?.status === 'pending'"
            type="danger"
            @click="detailDialogVisible = false; openReviewDialog(detailPost!, 'reject')"
          >
            駁回
          </el-button>
          <el-button
            v-if="detailPost?.status === 'approved' || detailPost?.status === 'rejected'"
            type="danger"
            plain
            @click="detailDialogVisible = false; handleDelete(detailPost!)"
          >
            刪除
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Review Dialog -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewAction === 'approve' ? '核准投稿' : '駁回投稿'"
      width="480px"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          {{ reviewAction === 'approve' ? '確定核准此筆土地投稿？' : '確定駁回此筆土地投稿？' }}
        </p>
        <div>
          <label class="text-sm text-gray-500 mb-1 block">
            {{ reviewAction === 'approve' ? '備註（選填）' : '駁回原因（必填）' }}
          </label>
          <el-input
            v-model="reviewNote"
            type="textarea"
            :rows="3"
            :placeholder="reviewAction === 'approve' ? '可選填核准備註' : '請填寫駁回原因'"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button
          :type="reviewAction === 'approve' ? 'success' : 'danger'"
          @click="submitReview"
        >
          確認{{ reviewAction === 'approve' ? '核准' : '駁回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
