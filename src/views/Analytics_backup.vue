<template>
  <div class="p-6">
    <el-card class="w-full max-w-md mx-auto mb-6">
      <template #header>
        <div class="text-lg font-bold">新增指標資料</div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="指標 Index" prop="index">
          <el-select v-model="form.index" placeholder="請選擇指標">
            <el-option
              v-for="item in indicatorOptions"
              :key="item.index"
              :label="item.label"
              :value="item.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="年月 (例: 113/1)" prop="date">
          <el-input v-model="form.date" placeholder="格式：113/1"></el-input>
        </el-form-item>

        <el-form-item label="數值" prop="value">
          <el-input
            v-model.number="form.value"
            placeholder="請輸入數值"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit">送出</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="message"
        :title="message"
        type="success"
        class="mt-4"
        show-icon
      />
    </el-card>

    <el-card class="w-full max-w-4xl mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="text-lg font-bold">查詢指標資料</div>

          <el-button type="primary" @click="fetchIndicatorData">搜尋</el-button>
        </div>
      </template>

      <el-table :data="tableData">
        <el-table-column prop="label" label="指標名稱" fixed />
        <el-table-column
          v-for="month in months"
          :key="month"
          :prop="month"
          :label="month"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import http from "../request/http";

interface IndicatorForm {
  index: number | null;
  date: string;
  value: number | null;
}

interface TableItem {
  date: string;
  value: number;
}

const form = reactive<IndicatorForm>({
  index: null,
  date: "113/",
  value: null,
});

const indicatorOptions = [
  { index: 1, label: "購屋貸款金額" },
  { index: 2, label: "購屋貸款利率" },
  { index: 3, label: "出口貿易總額" },
  { index: 4, label: "進口貿易總額" },
  { index: 5, label: "建物所有權第一次登記- 住宅(H-2類)" },
  { index: 6, label: "建物買賣移轉登記- 住宅(H-2類)" },
  { index: 7, label: "國內生產毛額GDP" },
  { index: 8, label: "美台匯率(月平均)" },
  { index: 9, label: "台股市場股價指數" },
  { index: 10, label: "未來半年是否為購買房地產好時機(指數)" },
  { index: 11, label: "物價類房租指數" },
  { index: 12, label: "消費者物價指數(CPI)" },
  { index: 13, label: "經濟成長率(季)" },
  { index: 14, label: "國內生產毛額GDP(名目值,百萬元)" },
  { index: 15, label: "景氣燈號" },
  { index: 16, label: "台北市30-40年宅" },
  { index: 17, label: "台北市40-50年宅" },
  { index: 18, label: "台北市50年以上宅" },
  { index: 19, label: "新北市30-40年宅" },
  { index: 20, label: "新北市40-50年宅" },
  { index: 21, label: "新北市50年以上宅" },
  { index: 22, label: "新北市50年以上宅" },
];

const rules = {
  index: [
    { required: true, message: "請輸入指標 index", trigger: "blur" },
    { type: "number", message: "必須是數字" },
  ],
  date: [
    { required: true, message: "請輸入年月", trigger: "blur" },
    { pattern: /^\d{3}\/\d{1,2}$/, message: "格式應為 113/1" },
  ],
  value: [
    { required: true, message: "請輸入數值", trigger: "blur" },
    { type: "number", message: "必須是數字" },
  ],
};

const extractMonths = (data: Array<Record<string, any>>) => {
  const monthSet = new Set<string>();

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (/^\d{3}\/\d{1,2}$/.test(key)) {
        monthSet.add(key);
      }
    });
  });

  // 排序：先比年再比月
  return Array.from(monthSet).sort((a, b) => {
    const [y1, m1] = a.split("/").map(Number);
    const [y2, m2] = b.split("/").map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });
};

const formRef = ref<FormInstance>();
const message = ref("");
const tableData = ref<TableItem[]>([]);

const addIndicator = async () => {
  await http.post("/indicator", form);
  ElMessage.success("新增成功");
};

const submit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      await addIndicator();
      fetchIndicatorData();
      message.value = "新增成功！";
      ElMessage.success("新增成功");
    } catch (error) {
      ElMessage.error("新增失敗，請檢查伺服器");
    }
  });
};

const reset = () => {
  form.index = null;
  form.date = "";
  form.value = null;
  message.value = "";
};
const months = ref<string[]>([]);

const fetchIndicatorData = async () => {
  try {
    const res = await http.get(`/indicator`);
    const values = res.data.data;
    months.value = extractMonths(values);
    // const mapped = values.map((value: number, i: number) => ({
    //   date: `第 ${i + 1} 筆`,
    //   value,
    // }));
    tableData.value = values;
  } catch (err) {
    ElMessage.error("查詢失敗");
  }
};
</script>

<style scoped></style>
