<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import http from '../request/http'

interface Member {
  _id: string
  name?: string
  username?: string
  email?: string
  mobile?: string
}

interface ReviewReply {
  content: string
  reviewerName?: string
  createdAt: string
}

interface LandPost {
  _id: string
  type: string
  landType?: string[]
  contactName: string
  city: string
  district: string
  section?: string
  landNumbers?: string[]
  approximateLocation?: string
  landArea?: number
  landAreaUnit?: string
  landShareNumerator?: number
  landShareDenominator?: number
  landOwnerCount?: number
  floorAreaRatio?: number
  buildingCoverageRatio?: number
  frontageWidth?: number
  lotDepth?: number
  roadCondition?: string
  landCondition?: string
  description: string
  priceBudget?: string
  unitPrice?: number
  hasAuthorizationLetter?: boolean
  directOwnerContact?: boolean
  visibility: string
  images?: { key: string; url: string }[]
  contactPhone?: string
  contactLine?: string
  status: string
  reviewNote?: string
  reviewReplies?: ReviewReply[]
  env?: string
  userId?: Member | string | null
  createdAt: string
  updatedAt: string
  lastEditedAt?: string
}

const posts = ref<LandPost[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const activeTab = ref('pending')
const loading = ref(false)

// Review dialog（核准 / 駁回）
const reviewDialogVisible = ref(false)
const reviewAction = ref<'approve' | 'reject'>('approve')
const reviewNote = ref('')
const reviewTarget = ref<LandPost | null>(null)

// Reply dialog（意見回覆）
const replyDialogVisible = ref(false)
const replyContent = ref('')
const replyReviewerName = ref('')
const replyTarget = ref<LandPost | null>(null)
const replySubmitting = ref(false)

// Detail dialog
const detailDialogVisible = ref(false)
const detailPost = ref<LandPost | null>(null)

// Member（聯絡人）dialog
const memberDialogVisible = ref(false)
const memberDialogData = ref<{ member: Member | null; post: LandPost } | null>(null)

const typeMap: Record<string, string> = {
  sell: '出售',
  rent: '出租',
  buy: '土地購入',
  joint_development: '合建',
  asset_lease: '承租資產',
  hotel_building_sale: '飯店/建物整棟出售',
  other: '其他或複合性開發使用',
}

const landTypeMap: Record<string, string> = {
  farmland: '農地',
  building: '建地',
  residential: '住宅用地',
  commercial: '商業用地',
  industrial: '工業用地',
  forest: '林地',
  slope: '山坡地',
  road: '道路用地',
  public_facility: '公保地',
  other: '其他',
}

const areaUnitMap: Record<string, string> = {
  ping: '坪',
  sqm: '平方公尺',
  hectare: '公頃',
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

// 取出已 populate 的會員物件（未 populate 時為字串或 null）
const memberOf = (post?: LandPost | null): Member | null => {
  const u = post?.userId
  if (u && typeof u === 'object') return u as Member
  return null
}

const landTypeText = (arr?: string[]) =>
  arr && arr.length ? arr.map((t) => landTypeMap[t] || t).join('、') : ''

const areaText = (post: LandPost) =>
  post.landArea != null ? `${post.landArea} ${areaUnitMap[post.landAreaUnit ?? 'ping'] ?? '坪'}` : ''

const shareText = (post: LandPost) =>
  post.landShareNumerator != null && post.landShareDenominator != null
    ? `${post.landShareNumerator} / ${post.landShareDenominator}`
    : ''

// 開價（總）：純數字補「萬元」，舊自由文字原樣顯示
const priceBudgetText = (post: LandPost) => {
  const p = post.priceBudget
  if (!p) return ''
  return /^\d+(\.\d+)?$/.test(p) ? `${p} 萬元` : p
}

// feature 2-c：判斷案件是否在最後一次意見回覆「之後」又被編輯，提醒審核人員複審
const editedAfterReply = (post: LandPost) => {
  if (!post.lastEditedAt) return false
  const replies = post.reviewReplies ?? []
  if (replies.length === 0) return true // 有編輯、但尚未回覆過 → 仍提示已編輯
  const lastReplyAt = replies[replies.length - 1].createdAt
  return dayjs(post.lastEditedAt).isAfter(dayjs(lastReplyAt))
}

const fmt = (d?: string) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-')

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

const showMember = (post: LandPost) => {
  memberDialogData.value = { member: memberOf(post), post }
  memberDialogVisible.value = true
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

const openReplyDialog = (post: LandPost) => {
  replyTarget.value = post
  replyContent.value = ''
  replyReviewerName.value = ''
  replyDialogVisible.value = true
}

const submitReply = async () => {
  if (!replyTarget.value) return
  if (!replyContent.value.trim()) {
    ElMessage.warning('請填寫回覆內容')
    return
  }

  replySubmitting.value = true
  try {
    await http.patch(`/land-post/admin/${replyTarget.value._id}/reply`, {
      content: replyContent.value.trim(),
      reviewerName: replyReviewerName.value.trim() || undefined,
    })
    ElMessage.success('已送出意見回覆，並通知投稿者')
    replyDialogVisible.value = false
    // 若詳情彈窗開著同一筆，關閉以避免顯示舊資料
    if (detailPost.value?._id === replyTarget.value._id) detailDialogVisible.value = false
    fetchPosts()
  } catch {
    // error handled by interceptor
  } finally {
    replySubmitting.value = false
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

const detailMember = computed(() => memberOf(detailPost.value))

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

        <el-table-column label="聯絡人" width="110">
          <template #default="{ row }">
            <el-button link type="primary" @click="showMember(row)">
              {{ row.contactName }}
            </el-button>
          </template>
        </el-table-column>

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

        <el-table-column label="狀態" width="130">
          <template #default="{ row }">
            <div class="flex flex-col items-start gap-1">
              <el-tag :type="statusTagType(row.status)" size="small">
                {{ statusMap[row.status] }}
              </el-tag>
              <el-tag
                v-if="row.status === 'pending' && editedAfterReply(row)"
                type="warning"
                size="small"
                effect="plain"
              >
                已重新編輯
              </el-tag>
              <el-tag v-if="row.env === 'qat'" type="info" size="small" effect="plain">
                QAT
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="提交／最後編輯" width="170">
          <template #default="{ row }">
            <div class="text-xs text-gray-600">
              <div>提交：{{ fmt(row.createdAt) }}</div>
              <div v-if="row.lastEditedAt" class="text-orange-500">
                編輯：{{ fmt(row.lastEditedAt) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-button size="small" @click="showDetail(row)">詳情</el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="primary"
                plain
                @click="openReplyDialog(row)"
              >
                意見回覆
              </el-button>
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
            </div>
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

    <!-- Detail Dialog（完整呈現所有欄位） -->
    <el-dialog v-model="detailDialogVisible" title="投稿詳情" width="720px">
      <div v-if="detailPost" class="space-y-5">
        <!-- 基本資訊 -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            基本資訊
          </h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <span class="text-gray-500 text-sm">案件類型</span>
              <p class="font-medium">{{ typeMap[detailPost.type] || detailPost.type }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">狀態</span>
              <p>
                <el-tag :type="statusTagType(detailPost.status)" size="small">
                  {{ statusMap[detailPost.status] }}
                </el-tag>
                <el-tag v-if="detailPost.env === 'qat'" type="info" size="small" class="ml-1">
                  QAT
                </el-tag>
              </p>
            </div>
            <div v-if="landTypeText(detailPost.landType)">
              <span class="text-gray-500 text-sm">土地類型</span>
              <p class="font-medium">{{ landTypeText(detailPost.landType) }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">可見度</span>
              <p>{{ visibilityMap[detailPost.visibility] || detailPost.visibility }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">聯絡人</span>
              <p>
                <el-button link type="primary" @click="showMember(detailPost)">
                  {{ detailPost.contactName }}
                </el-button>
              </p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">位置</span>
              <p>{{ detailPost.city }} {{ detailPost.district }} {{ detailPost.section || '' }}</p>
            </div>
            <div v-if="detailPost.approximateLocation">
              <span class="text-gray-500 text-sm">概略位置</span>
              <p>{{ detailPost.approximateLocation }}</p>
            </div>
          </div>
        </div>

        <!-- 土地資訊 -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            土地資訊
          </h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div v-if="areaText(detailPost)">
              <span class="text-gray-500 text-sm">面積</span>
              <p>{{ areaText(detailPost) }}</p>
            </div>
            <div v-if="shareText(detailPost)">
              <span class="text-gray-500 text-sm">土地持分</span>
              <p>{{ shareText(detailPost) }}</p>
            </div>
            <div v-if="detailPost.landOwnerCount != null">
              <span class="text-gray-500 text-sm">地主人數</span>
              <p>{{ detailPost.landOwnerCount }} 人</p>
            </div>
            <div v-if="detailPost.floorAreaRatio != null">
              <span class="text-gray-500 text-sm">容積率</span>
              <p>{{ detailPost.floorAreaRatio }}%</p>
            </div>
            <div v-if="detailPost.buildingCoverageRatio != null">
              <span class="text-gray-500 text-sm">建蔽率</span>
              <p>{{ detailPost.buildingCoverageRatio }}%</p>
            </div>
            <div v-if="detailPost.frontageWidth != null">
              <span class="text-gray-500 text-sm">面寬</span>
              <p>{{ detailPost.frontageWidth }} 米</p>
            </div>
            <div v-if="detailPost.lotDepth != null">
              <span class="text-gray-500 text-sm">縱深</span>
              <p>{{ detailPost.lotDepth }} 米</p>
            </div>
            <div v-if="detailPost.roadCondition">
              <span class="text-gray-500 text-sm">臨路條件</span>
              <p>{{ detailPost.roadCondition }}</p>
            </div>
          </div>

          <div v-if="detailPost.landNumbers?.length" class="mt-3">
            <span class="text-gray-500 text-sm">地號</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <el-tag v-for="num in detailPost.landNumbers" :key="num" size="small" type="info">
                {{ num }}
              </el-tag>
            </div>
          </div>

          <div v-if="detailPost.landCondition" class="mt-3">
            <span class="text-gray-500 text-sm">土地現況</span>
            <p class="mt-1 whitespace-pre-wrap">{{ detailPost.landCondition }}</p>
          </div>
        </div>

        <!-- 說明與價格 -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            說明與價格
          </h3>
          <div>
            <span class="text-gray-500 text-sm">案件描述</span>
            <p class="mt-1 whitespace-pre-wrap">{{ detailPost.description }}</p>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 mt-3">
            <div v-if="detailPost.priceBudget">
              <span class="text-gray-500 text-sm">開價（總）</span>
              <p class="text-orange-600 font-medium">{{ priceBudgetText(detailPost) }}</p>
            </div>
            <div v-if="detailPost.unitPrice != null">
              <span class="text-gray-500 text-sm">單價</span>
              <p>{{ detailPost.unitPrice }} 萬元/坪</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">委託（授權）書</span>
              <p>{{ detailPost.hasAuthorizationLetter ? '已取得' : '未取得' }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">直接對所有權人/買方</span>
              <p>{{ detailPost.directOwnerContact ? '是' : '否' }}</p>
            </div>
          </div>
        </div>

        <!-- 聯絡與時間 -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            聯絡與時間
          </h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div v-if="detailPost.contactPhone">
              <span class="text-gray-500 text-sm">聯絡電話</span>
              <p>{{ detailPost.contactPhone }}</p>
            </div>
            <div v-if="detailPost.contactLine">
              <span class="text-gray-500 text-sm">LINE</span>
              <p>{{ detailPost.contactLine }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">提交時間</span>
              <p>{{ fmt(detailPost.createdAt) }}</p>
            </div>
            <div v-if="detailPost.lastEditedAt">
              <span class="text-gray-500 text-sm">最後編輯</span>
              <p class="text-orange-500">{{ fmt(detailPost.lastEditedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- 圖片 -->
        <div v-if="detailPost.images?.length">
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            圖片
          </h3>
          <div class="flex gap-2 flex-wrap">
            <el-image
              v-for="img in detailPost.images"
              :key="img.key"
              :src="img.url"
              :preview-src-list="detailPost.images.map((i) => i.url)"
              class="w-24 h-24 rounded border object-cover"
              fit="cover"
            />
          </div>
        </div>

        <!-- 審核備註（核准/駁回） -->
        <div v-if="detailPost.reviewNote">
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            審核備註
          </h3>
          <p class="text-orange-600 whitespace-pre-wrap">{{ detailPost.reviewNote }}</p>
        </div>

        <!-- 意見回覆歷史 -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2 border-l-4 border-emerald-500 pl-2">
            內部人員回覆
          </h3>
          <div v-if="detailPost.reviewReplies?.length" class="space-y-2">
            <div
              v-for="(r, idx) in detailPost.reviewReplies"
              :key="idx"
              class="rounded bg-blue-50 border border-blue-100 p-3"
            >
              <p class="text-xs text-gray-500 mb-1">
                {{ r.reviewerName || '踏取審核人員' }}　{{ fmt(r.createdAt) }}
              </p>
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ r.content }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">目前尚無內部人員回覆</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="detailDialogVisible = false">關閉</el-button>
          <el-button
            v-if="detailPost?.status === 'pending'"
            type="primary"
            plain
            @click="openReplyDialog(detailPost!)"
          >
            意見回覆
          </el-button>
          <el-button
            v-if="detailPost?.status === 'pending'"
            type="success"
            @click="((detailDialogVisible = false), openReviewDialog(detailPost!, 'approve'))"
          >
            核准
          </el-button>
          <el-button
            v-if="detailPost?.status === 'pending'"
            type="danger"
            @click="((detailDialogVisible = false), openReviewDialog(detailPost!, 'reject'))"
          >
            駁回
          </el-button>
          <el-button
            v-if="detailPost?.status === 'approved' || detailPost?.status === 'rejected'"
            type="danger"
            plain
            @click="((detailDialogVisible = false), handleDelete(detailPost!))"
          >
            刪除
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Member（聯絡人）Dialog -->
    <el-dialog v-model="memberDialogVisible" title="聯絡人會員資訊" width="440px">
      <div v-if="memberDialogData" class="space-y-3">
        <div v-if="memberDialogData.member">
          <div class="grid grid-cols-1 gap-3">
            <div>
              <span class="text-gray-500 text-sm">會員姓名</span>
              <p class="font-medium">
                {{ memberDialogData.member.name || memberDialogData.member.username || '—' }}
              </p>
            </div>
            <div v-if="memberDialogData.member.username">
              <span class="text-gray-500 text-sm">帳號</span>
              <p>{{ memberDialogData.member.username }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">註冊 Email</span>
              <p>{{ memberDialogData.member.email || '—' }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-sm">註冊手機</span>
              <p>{{ memberDialogData.member.mobile || '—' }}</p>
            </div>
          </div>
        </div>
        <el-alert
          v-else
          type="info"
          :closable="false"
          title="此投稿無關聯會員資料（可能為舊資料）"
        />

        <el-divider>案件填寫之聯絡方式</el-divider>
        <div class="grid grid-cols-1 gap-3">
          <div>
            <span class="text-gray-500 text-sm">聯絡人姓名</span>
            <p class="font-medium">{{ memberDialogData.post.contactName }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">聯絡電話</span>
            <p>{{ memberDialogData.post.contactPhone || '—' }}</p>
          </div>
          <div>
            <span class="text-gray-500 text-sm">LINE</span>
            <p>{{ memberDialogData.post.contactLine || '—' }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="memberDialogVisible = false">關閉</el-button>
      </template>
    </el-dialog>

    <!-- Review Dialog（核准 / 駁回） -->
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
        <el-button :type="reviewAction === 'approve' ? 'success' : 'danger'" @click="submitReview">
          確認{{ reviewAction === 'approve' ? '核准' : '駁回' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Reply Dialog（意見回覆） -->
    <el-dialog v-model="replyDialogVisible" title="意見回覆" width="520px">
      <div class="space-y-4">
        <el-alert
          type="info"
          :closable="false"
          title="意見回覆不會改變案件狀態（仍為審核中），會顯示於投稿者的會員中心並寄信通知。"
        />
        <div>
          <label class="text-sm text-gray-500 mb-1 block">回覆者姓名（選填，預設「踏取審核人員」）</label>
          <el-input v-model="replyReviewerName" maxlength="30" placeholder="如：王專員" />
        </div>
        <div>
          <label class="text-sm text-gray-500 mb-1 block">回覆內容（必填）</label>
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
            placeholder="請輸入要回覆給投稿者的意見，例如：請補充地籍謄本、說明現況照片等"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replySubmitting" @click="submitReply">
          送出回覆
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
