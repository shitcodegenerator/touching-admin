<script setup lang="ts">
import { onMounted, reactive , ref} from 'vue';
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import dayjs from 'dayjs'
// import ImageUploader from 'quill-image-uploader';
const ImageUploader = require('quill-image-uploader');


import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

interface RuleForm {
  title: string
author: string
content: string
categoryId: string
image: string
type: string
}
const ruleFormRef = ref<FormInstance>()
const ruleForm = ref({
  title: '',
  author: '',
  avatar: '1',
  content: '',
  categoryId: '',
  image: '2',
  type: 'news',
})

const rules = reactive<FormRules<RuleForm>>({
  author: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
  ],
  title: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
  ],
  content: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
  ],
})

type Error = {
  message: string
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async(valid) => {
    if (!valid) return
      try {
        await axios.post('https://touching-backend.vercel.app/api/article', ruleForm.value)
      } catch (err: unknown) {
        ElMessage.error((err as Error).message)
      }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  console.log(formEl)
  formEl.resetFields()
  
}

const clear =() => {
  ruleForm.value.content = ''
  ruleForm.value.title = ''
  ruleForm.value.author = ''
  isAddShow.value = false
}



const getArticles = async () => {
  const { data } = await axios.get('https://touching-backend.vercel.app/api/articles')
  articleList.value = data.data
  console.log(data)
}
const getCategories = async () => {
  const { data } = await axios.get('https://touching-backend.vercel.app/api/categories')
  categoryList.value = data.data
  console.log(data)
}

const categoryList = ref<{
  _id: string
  title: string
}[]>([])

const articleList = ref([])

const categoryFilter = (categoryId: string) => {
  return categoryList.value.find(i => i._id === categoryId)?.title ?? '-'
}

const isAddShow = ref(false)

const showAddArticleDialog = () => {
  ruleForm.value.categoryId = categoryList.value[0]._id
  isAddShow.value = true
  console.log(ruleForm)
}


onMounted(() => {getArticles()
  getCategories()})

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

 

</script>

<template>
  <el-dialog v-model="isAddShow" title="新增文章" width="960px" align-top :before-close="clear">
    <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    label-width="120px"
    status-icon
  >
    <el-form-item label="作者" prop="author">
      <el-input v-model="ruleForm.author" />
    </el-form-item>
    <el-form-item label="標題" prop="title">
      <el-input v-model="ruleForm.title" />
    </el-form-item>

    <el-form-item label="標籤" prop="categoryId">
      <el-radio-group v-model="ruleForm.categoryId">
        <el-radio :key="i._id" :label="i._id" v-for="i in categoryList">{{ i.title }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="種類" prop="type">
      <el-radio-group v-model="ruleForm.type">
        <el-radio label="news">新聞文章</el-radio>
        <el-radio label="knowledge">知識文章</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="內容" prop="content">
      <QuillEditor :modules="modules" class="w-full" toolbar="full" :placeholder="'請輸入文章內容'" v-model:content="ruleForm.content" :contentType="'html'"/>
    </el-form-item>
    
    <el-form-item class="mt-40">
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        新增
      </el-button>
      <el-button @click="resetForm(ruleFormRef)">清空</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
  <el-button :icon="Plus" class="mb-10" type="primary" @click="showAddArticleDialog">新增文章</el-button>
  <el-table :data="articleList">
    <el-table-column prop="created_at" label="創建日期" width="180">
      <template #default="scope">
      {{ dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    </el-table-column>
    <el-table-column prop="author" label="作者" width="180" />
    <el-table-column prop="title" label="標題" width="180" />
    <el-table-column prop="type" label="類型" width="100" />
    <el-table-column prop="content" label="內容" />
    <el-table-column prop="categoryId" label="標籤" width="100">
      <template #default="scope">
      <el-tag>{{ categoryFilter(scope.row.categoryId) }}</el-tag>
    </template>
    </el-table-column>
  </el-table>

  <!-- <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    class="mt-10 bg-gray-100 py-10 px-10 rounded-lg shadow w-[520px] mx-auto"
    :size="formSize"
    status-icon
  >

      <h1 class="text-4xl font-bold text-main text-center w-full mb-6">踏取文章後台系統</h1>

    <el-form-item label="帳號" prop="username">
      <el-input v-model="ruleForm.username" />
    </el-form-item>
    <el-form-item label="密碼" prop="password">
      <el-input v-model="ruleForm.password" type="password" />
    </el-form-item>


      <el-button type="primary" class="mx-auto w-full h-10" @click="submitForm(ruleFormRef)">
        登入
      </el-button>
     

  </el-form> -->
</template>

<style scoped>
.logo {
  height: 6em;
  pPlusing: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
