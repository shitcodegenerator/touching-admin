import { createRouter, createWebHashHistory } from "vue-router";
import Login from "../views/Login.vue";
import Articles from "../views/Articles.vue";
import Analytics from "../views/analytics/index.vue";
import Members from "../views/Members.vue";

const routes = [
  { path: "/login", component: Login, name: "login" },
  { path: "/", redirect: "/analytics" },
  { path: "/articles", component: Articles, name: "articles" },
  { path: "/analytics", component: Analytics, name: "analytics" },
  { path: "/members", component: Members, name: "members" },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守衛：未登入導向 login
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  if (to.path !== "/login" && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
