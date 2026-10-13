<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import http from '../../../request/http'
import { typeMap, landTypeMap, areaUnitMap, visibilityMap } from '../constants'
import type { LandPost } from '../types'

const props = defineProps<{ post: LandPost | null }>()
const emit = defineEmits<{ success: [post: LandPost] }>()
const open = defineModel<boolean>('open', { required: true })

const TEXT_FIELDS = [
  'type',
  'contactName',
  'city',
  'district',
  'section',
  'approximateLocation',
  'frontageWidth',
  'roadCondition',
  'landCondition',
  'description',
  'priceBudget',
  'visibility',
  'contactPhone',
  'contactLine',
  'landAreaUnit',
] as const

const NUMBER_FIELDS = [
  'landArea',
  'landShareNumerator',
  'landShareDenominator',
  'landOwnerCount',
  'floorAreaRatio',
  'buildingCoverageRatio',
  'lotDepth',
  'unitPrice',
] as const

type TextField = (typeof TEXT_FIELDS)[number]
type NumberField = (typeof NUMBER_FIELDS)[number]

type EditForm = Record<TextField, string> &
  Record<NumberField, number | null> & {
    landType: string[]
    landNumbers: string[]
    hasAuthorizationLetter: boolean
    directOwnerContact: boolean
  }

const createForm = (post: LandPost): EditForm => ({
  ...(Object.fromEntries(
    TEXT_FIELDS.map((f) => [f, post[f] == null ? '' : String(post[f])]),
  ) as Record<TextField, string>),
  ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f, post[f] ?? null])) as Record<
    NumberField,
    number | null
  >),
  landType: [...(post.landType ?? [])],
  landNumbers: [...(post.landNumbers ?? [])],
  hasAuthorizationLetter: post.hasAuthorizationLetter ?? false,
  directOwnerContact: post.directOwnerContact ?? false,
})

const formRef = ref<FormInstance>()
const form = reactive<Partial<EditForm>>({})
const submitting = ref(false)

const required = (message: string) => ({ required: true, message, trigger: 'blur' })
const rules: FormRules = {
  type: [required('請選擇案件類型')],
  contactName: [required('請填寫聯絡人')],
  city: [required('請填寫縣市')],
  district: [required('請填寫行政區')],
  description: [required('請填寫案件描述')],
  visibility: [required('請選擇可見度')],
}

watch(open, (visible) => {
  if (visible && props.post) Object.assign(form, createForm(props.post))
})

// 數字欄位為空時不送出（後端數字欄位不接受 null；未送出代表維持原值）
const buildPayload = (data: EditForm) => {
  const numbers = Object.fromEntries(
    NUMBER_FIELDS.filter((f) => data[f] != null).map((f) => [f, data[f]]),
  )
  const texts = Object.fromEntries(TEXT_FIELDS.map((f) => [f, data[f].trim()]))
  if (!texts.landAreaUnit) delete texts.landAreaUnit
  return {
    ...texts,
    ...numbers,
    landType: data.landType,
    landNumbers: data.landNumbers.map((n) => n.trim()).filter(Boolean),
    hasAuthorizationLetter: data.hasAuthorizationLetter,
    directOwnerContact: data.directOwnerContact,
    version: props.post?.version ?? 1,
  }
}

const submit = async () => {
  if (!props.post || !formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await http.put(
      `/land-post/admin/${props.post._id}`,
      buildPayload(form as EditForm),
    )
    const updated: LandPost = res.data.data
    const edited = (updated.version ?? 0) !== (props.post.version ?? 0)
    ElMessage.success(edited ? '已更新案件內容，並記錄修改差異' : '內容未變更')
    open.value = false
    emit('success', updated)
  } catch {
    // error handled by interceptor（409 版本衝突亦由全域提示）
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="open" title="編輯已核准案件" width="760px" top="5vh">
    <el-alert
      type="warning"
      :closable="false"
      class="mb-4"
      title="修改會立即反映在前台公開頁，系統會記錄每個欄位修改前後的內容。圖片請由投稿者自行調整。"
    />
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="案件類型" prop="type">
          <el-select v-model="form.type" class="w-full">
            <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="土地類型（可複選）">
          <el-select v-model="form.landType" multiple clearable class="w-full">
            <el-option
              v-for="(label, value) in landTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可見度" prop="visibility">
          <el-select v-model="form.visibility" class="w-full">
            <el-option
              v-for="(label, value) in visibilityMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="聯絡人" prop="contactName">
          <el-input v-model="form.contactName" maxlength="15" show-word-limit />
        </el-form-item>
        <el-form-item label="縣市" prop="city">
          <el-input v-model="form.city" placeholder="如：臺北市" />
        </el-form-item>
        <el-form-item label="行政區" prop="district">
          <el-input v-model="form.district" placeholder="如：中正區" />
        </el-form-item>
        <el-form-item label="地段">
          <el-input v-model="form.section" />
        </el-form-item>
        <el-form-item label="概略位置">
          <el-input v-model="form.approximateLocation" maxlength="50" show-word-limit />
        </el-form-item>
      </div>

      <el-form-item label="地號（輸入後按 Enter 新增，最多 20 筆）">
        <el-select
          v-model="form.landNumbers"
          multiple
          filterable
          allow-create
          default-first-option
          :multiple-limit="20"
          :reserve-keyword="false"
          placeholder="輸入地號"
          class="w-full"
        />
      </el-form-item>

      <div class="grid grid-cols-3 gap-x-4">
        <el-form-item label="面積">
          <el-input-number v-model="form.landArea" :min="0" :precision="2" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="面積單位">
          <el-select v-model="form.landAreaUnit" clearable class="w-full">
            <el-option
              v-for="(label, value) in areaUnitMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地主人數">
          <el-input-number v-model="form.landOwnerCount" :min="1" :max="999" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="持分（分子）">
          <el-input-number v-model="form.landShareNumerator" :min="0" :max="999999" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="持分（分母）">
          <el-input-number v-model="form.landShareDenominator" :min="0" :max="999999" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="容積率（%）">
          <el-input-number v-model="form.floorAreaRatio" :min="0" :max="999" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="建蔽率（%）">
          <el-input-number v-model="form.buildingCoverageRatio" :min="0" :max="999" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="面寬（米）">
          <el-input v-model="form.frontageWidth" maxlength="30" placeholder="如：12 或 128米/43米" />
        </el-form-item>
        <el-form-item label="縱深（米）">
          <el-input-number v-model="form.lotDepth" :min="0" :precision="2" controls-position="right" class="!w-full" />
        </el-form-item>
      </div>

      <el-form-item label="臨路條件">
        <el-input v-model="form.roadCondition" maxlength="20" show-word-limit />
      </el-form-item>
      <el-form-item label="土地現況">
        <el-input v-model="form.landCondition" type="textarea" :rows="2" maxlength="200" show-word-limit />
      </el-form-item>
      <el-form-item label="案件描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" maxlength="200" show-word-limit />
      </el-form-item>

      <div class="grid grid-cols-2 gap-x-4">
        <el-form-item label="開價（總，萬元）">
          <el-input v-model="form.priceBudget" maxlength="20" />
        </el-form-item>
        <el-form-item label="單價（萬元/坪）">
          <el-input-number v-model="form.unitPrice" :min="0" :precision="2" controls-position="right" class="!w-full" />
        </el-form-item>
        <el-form-item label="聯絡電話">
          <el-input v-model="form.contactPhone" maxlength="20" />
        </el-form-item>
        <el-form-item label="LINE">
          <el-input v-model="form.contactLine" maxlength="20" />
        </el-form-item>
      </div>

      <div class="flex flex-wrap gap-6">
        <el-checkbox v-model="form.hasAuthorizationLetter">已取得委託（授權）書</el-checkbox>
        <el-checkbox v-model="form.directOwnerContact">直接對所有權人/買方</el-checkbox>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">儲存修改</el-button>
    </template>
  </el-dialog>
</template>
