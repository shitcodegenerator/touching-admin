import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import './index.css'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Login from './views/Login.vue'
import Articles from './views/Articles.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { createPinia } from 'pinia'

const routes = [
    { path: '/login', component: Login },
    { path: '/', component: Articles, name: 'home' },
  ]

  const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  })

const pinia = createPinia()
const app = createApp(App)



app.component('QuillEditor', QuillEditor)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')