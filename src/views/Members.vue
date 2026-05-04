<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import http from "../request/http";
import dayjs from "dayjs";
import { usePageStore } from "../store/page";

interface Member {
  _id: string;
  email: string;
  name: string;
  username: string;
  birthday: string;
  city: string;
  mobile: string;
  gender: string;
  avatar: string;
  subscribe: boolean;
  created_at: string;
}

const { setLoading } = usePageStore();

const memberList = ref<Member[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

const getMembers = async () => {
  setLoading(true);
  const { data } = await http.get("/members", {
    params: {
      page: currentPage.value,
      limit: pageSize.value,
      sort: "-created_at",
    },
  });
  memberList.value = data.data ?? [];
  total.value = data.total ?? 0;
  setLoading(false);
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getMembers();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getMembers();
};

const genderLabel = (val: string) => {
  const map: Record<string, string> = { male: "男", female: "女", other: "其他" };
  return map[val] ?? val ?? "-";
};

onMounted(() => {
  getMembers();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-800">會員列表</h2>
      <span class="text-sm text-gray-500">共 {{ total }} 位會員</span>
    </div>

    <el-table :data="memberList" stripe class="w-full" empty-text="暫無會員資料">
      <el-table-column label="大頭貼" width="80" align="center">
        <template #default="{ row }">
          <el-avatar
            v-if="row.avatar"
            :src="row.avatar"
            :size="36"
          />
          <el-avatar v-else :size="36">
            {{ (row.name || row.username || "?").charAt(0) }}
          </el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="姓名" min-width="100" show-overflow-tooltip />
      <el-table-column prop="username" label="帳號" min-width="120" show-overflow-tooltip />
      <el-table-column prop="email" label="Email" min-width="180" show-overflow-tooltip />
      <el-table-column prop="mobile" label="手機" min-width="130" show-overflow-tooltip />
      <el-table-column prop="city" label="城市" min-width="100" show-overflow-tooltip />

      <el-table-column label="性別" width="80" align="center">
        <template #default="{ row }">
          {{ genderLabel(row.gender) }}
        </template>
      </el-table-column>

      <el-table-column label="生日" width="120" align="center">
        <template #default="{ row }">
          {{ row.birthday ? dayjs(row.birthday).format("YYYY-MM-DD") : "-" }}
        </template>
      </el-table-column>

      <el-table-column label="訂閱" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.subscribe ? 'success' : 'info'" size="small">
            {{ row.subscribe ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="加入時間" width="120" align="center">
        <template #default="{ row }">
          {{ row.created_at ? dayjs(row.created_at).format("YYYY-MM-DD") : "-" }}
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-6">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
