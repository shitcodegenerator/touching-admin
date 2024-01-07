<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import axios from 'axios'
import dayjs from 'dayjs'
import ImageUploader from 'quill-image-uploader';
import lodash from 'lodash';
import bannerImage from '../assets/banner.png'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { usePageStore } from '../store/page';

interface FormData {
  title: string
  author: string
  content: string
  avatar: string
  summary: string
  categoryId: string
  image: string
  type: string
  _id?: string
  id?: string
}

const {setLoading } = usePageStore()
const ruleFormRef = ref<FormInstance>()

const formData = ref<FormData>({
  title: '',
  author: '',
  avatar: '1',
  content: '',
  categoryId: '',
  image: '2',
  type: 'news',
  summary: ''
})


const categoryList = ref<{
  _id: string
  title: string
}[]>([])

const articleList = ref([])


const rules = reactive<FormRules<FormData>>({
  author: [
    { required: true, message: '請輸入作者名', trigger: 'blur' },
  ],
  title: [
    { required: true, message: '請輸入文章標題', trigger: 'blur' },
  ],
  summary: [
    { required: true, message: '請輸入大綱', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '請輸入文章內容', trigger: 'blur' },
  ],
})

type Error = {
  message: string
}

const addArticle = async () => {
  await axios.post('https://touching-backend.vercel.app/api/article', formData.value)
  ElMessage.success('新增成功')
}
const editArticle = async () => {
  await axios.put(`https://touching-backend.vercel.app/api/article/${formData.value.id}`, formData.value)
  ElMessage.success('編輯成功')
}

const successHandler = async() => {
  isAddShow.value = false
    await getArticles()
    setLoading(false)
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (!valid) return
    setLoading(true)
    try {
      if(actionType.value === 'add') {
        await addArticle()
      } else {
        await editArticle()
      }
      successHandler()
    } catch (err: unknown) {
      ElMessage.error((err as Error).message)
      setLoading(false)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  console.log(formEl)
  formEl.resetFields()

}

const clear = () => {
  formData.value.content = ''
  formData.value.title = ''
  formData.value.author = ''
  isAddShow.value = false
}



const getArticles = async () => {
  try {
    const { data } = await axios.get('https://touching-backend.vercel.app/api/articles')
    articleList.value = data.data
  } catch {
    setLoading(false)
  }
}
const getCategories = async () => {
  try {
    const { data } = await axios.get('https://touching-backend.vercel.app/api/categories')
    categoryList.value = data.data
  } catch {
    setLoading(false)
  }
}

const categoryFilter = (categoryId: string) => {
  return categoryList.value.find(i => i._id === categoryId)?.title ?? '-'
}

const isAddShow = ref(false)
type Actions = 'add' | 'edit'
const actionType = ref<Actions>('add')

const showAddArticleDialog = (type: Actions) => {
  formData.value.categoryId = categoryList.value[0]._id
  isAddShow.value = true
  actionType.value = type
}


onMounted(async () => {
  setLoading(true)
  await getArticles()
  await getCategories()
  setLoading(false)
})

const modules = {
  name: 'imageUploader',
  module: ImageUploader,
  options: {
    upload: (file: Blob) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);
        axios.post('https://touching-backend.vercel.app/api/uploadImage', formData)
          .then(res => {
            console.log(res)
            resolve(res.data.data);
          })
          .catch(err => {
            reject("Upload failed");
            console.error("Error:", err)
          })
      })
    }
  }
}

const deleteHandler = async (id: string) => {
  setLoading(true)
  await axios.delete(`https://touching-backend.vercel.app/api/article/${id}`)
  ElMessage.success('文章刪除成功')
  await getArticles()
  setLoading(false)
}

const editHandler = async (rowData: FormData) => {
  showAddArticleDialog('edit')
  formData.value = lodash.cloneDeep(rowData)
}

</script>

<template>

  
  <el-dialog v-model="isAddShow" title="新增文章" width="960px" align-top :before-close="clear">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="120px" status-icon>
      
      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author" />
      </el-form-item>
      <el-form-item label="標題" prop="title">
        <el-input v-model="formData.title" />
      </el-form-item>

      <el-form-item label="標籤" prop="categoryId">
        <el-radio-group v-model="formData.categoryId">
          <el-radio :key="i._id" :label="i._id" v-for="i in categoryList">{{ i.title }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="種類" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="news">新聞文章</el-radio>
          <el-radio label="knowledge">知識文章</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="大綱" prop="content">
        <el-input
          v-model="formData.summary"
          maxlength="60"
          placeholder="請輸入60字內大綱"
          show-word-limit
          type="textarea"
        />
      </el-form-item>

      <el-form-item label="內容" prop="content">
        <QuillEditor :modules="modules" class="w-full" toolbar="full" :placeholder="'請輸入文章內容'"
          v-model:content="formData.content" :contentType="'html'" />
      </el-form-item>

      <el-form-item class="mt-40">
        <el-button type="primary" size="small" @click="submitForm(ruleFormRef)">
          新增
        </el-button>
        <el-button  size="small" @click="resetForm(ruleFormRef)">清空</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <div class="relative border-box">
    <span class="absolute z-10 w-full text-center h-40 flex items-center justify-center text-white drop-shadow tracking-wider text-5xl">踏取後台文章系統</span>
    <el-image class="block w-full mb-4 h-40 rounded-md brightness-[0.5]" :src="bannerImage" :fit="'cover'"   />
  </div>

  <el-button size="small" :icon="Plus" class="mb-5" type="primary" @click="showAddArticleDialog('add')">新增文章</el-button>

  <!-- 資料列表 -->
  <el-table :data="articleList">
    <el-table-column prop="created_at" label="創建日期" width="120">
      <template #default="scope">
        {{ dayjs(scope.row.created_at).format('YYYY-MM-DD') }}
      </template>
    </el-table-column>
    <el-table-column prop="author" label="作者" width="120" />
    <el-table-column prop="type" label="類型" width="100">
      <template #default="scope">
        <el-tag :type="scope.row.type === 'news' ? 'info' : 'success'">{{ scope.row.type === 'news' ? '新聞' : '知識文章' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="title" label="標題" width="200" />
    <el-table-column prop="summary" label="大綱" />
    <el-table-column prop="categoryId" label="標籤" width="100">
      <template #default="scope">
        <el-tag>{{ categoryFilter(scope.row.categoryId) }}</el-tag>
      </template>
     </el-table-column>
     <el-table-column prop="id" label="動作" width="180">
        <template #default="scope">
          <el-button :icon="Delete" type="danger" size="small" @click="deleteHandler(scope.row.id)">刪除</el-button>
          <el-button :icon="Edit" type="info" size="small" @click="editHandler(scope.row)">編輯</el-button>
        </template>
      </el-table-column>
  </el-table>
</template>

<style  lang="scss">
#app :deep(.el-loading-mask) {
  z-index: 3000!important;
}
</style>
