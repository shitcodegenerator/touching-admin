import { createApp } from "vue";
import ElementPlus from "element-plus";
import "./index.css";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);

app.component("QuillEditor", QuillEditor);
app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
