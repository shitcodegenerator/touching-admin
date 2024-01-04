<script setup lang="ts">
import { onMounted, reactive , ref} from 'vue';
import {ElMessage} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router';
const router = useRouter()


const login = async() => {
  try {
    const data = await axios.post('https://touching-backend.vercel.app/api/auth/login/admin', ruleForm)
    localStorage.setItem('token', data.data.token)
    ElMessage.success('登入成功')
    router.push({name: 'home'})
  } catch (err) {
    ElMessage.error(err?.response?.data.error ?? '錯誤')
  }
}



interface RuleForm {
  username: string
  password: string
}

const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  username: '',
  password: ''
})

const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' }
  ],

})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      login()
    } 
  })
}

const isLogin = ref(false)



</script>

<template>

  <el-form
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
     

  </el-form>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
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
