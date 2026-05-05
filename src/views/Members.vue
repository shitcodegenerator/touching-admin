<script setup lang="ts">
import { onMounted, ref } from "vue";
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
  avatar: string;
  visits: { title: string; date: string; duration: number; url: string }[];
  created_at: string;
  lastVisitAt: string | null;
  visitCount: number;
}

const sortOptions = [
  { label: "加入時間（新→舊）", value: "-created_at" },
  { label: "加入時間（舊→新）", value: "created_at" },
  { label: "最後訪問時間（新→舊）", value: "-lastVisitAt" },
  { label: "最後訪問時間（舊→新）", value: "lastVisitAt" },
  { label: "訪問次數（多→少）", value: "-visitCount" },
  { label: "訪問次數（少→多）", value: "visitCount" },
] as const;

const { setLoading } = usePageStore();

const memberList = ref<Member[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const currentSort = ref("-created_at");

const getMembers = async () => {
  setLoading(true);
  const { data } = await http.get("/members", {
    params: {
      page: currentPage.value,
      limit: pageSize.value,
      sort: currentSort.value,
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

const handleSortChange = (val: string) => {
  currentSort.value = val;
  currentPage.value = 1;
  getMembers();
};

onMounted(() => {
  getMembers();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-800">會員列表</h2>
      <div class="flex items-center gap-3">
        <el-select
          :model-value="currentSort"
          placeholder="排序方式"
          style="width: 220px"
          @change="handleSortChange"
        >
          <el-option
            v-for="opt in sortOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <span class="text-sm text-gray-500">共 {{ total }} 位會員</span>
      </div>
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

      <el-table-column label="生日" width="120" align="center">
        <template #default="{ row }">
          {{ row.birthday ? dayjs(row.birthday).format("YYYY-MM-DD") : "-" }}
        </template>
      </el-table-column>

      <el-table-column label="造訪次數" width="100" align="center">
        <template #default="{ row }">
          <el-tooltip v-if="row.visits?.length" placement="top">
            <template #content>
              <div v-for="(v, i) in row.visits" :key="i" class="whitespace-nowrap">
                {{ dayjs(v.date).format("YYYY-MM-DD HH:mm") }} — {{ v.title }}
              </div>
            </template>
            <span class="cursor-pointer underline decoration-dashed">
              {{ row.visits.length }}
            </span>
          </el-tooltip>
          <span v-else>0</span>
        </template>
      </el-table-column>

      <el-table-column label="最後訪問" width="160" align="center">
        <template #default="{ row }">
          {{ row.lastVisitAt ? dayjs(row.lastVisitAt).format("YYYY-MM-DD HH:mm") : "-" }}
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
