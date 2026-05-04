<template>
  <div class="p-6">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <el-skeleton :rows="6" animated class="w-full max-w-4xl" />
    </div>
    <template v-else>
      <el-card
        v-for="group in displayGroups"
        :key="group.key"
        class="mb-6"
      >
        <template #header>
          <a
            v-if="group.link"
            :href="group.link"
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-blue-600 hover:underline"
          >{{ group.title }}</a>
          <span v-else class="font-bold">{{ group.title }}</span>
        </template>
        <DistrictEditTable
          v-if="group.isDistrictTimeSeries"
          :indicator-map="indicatorMap"
          :db-index="group.indicators[0].dbIndex"
          :districts="group.districts ?? []"
          @saved="fetchData"
        />
        <DataEditTable
          v-else
          :indicator-map="indicatorMap"
          :indicators="group.indicators"
          :use-raw-labels="group.useRawLabels"
          @saved="fetchData"
        />
      </el-card>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import http from '../../request/http'
import DataEditTable from './components/DataEditTable.vue'
import DistrictEditTable from './components/DistrictEditTable.vue'
import { chartGroups } from './components/chartGroups'

/**
 * V2 API 回傳格式：
 * [{ index: 1, values: [{ date: "113/1", value: 12414 }, ...] }]
 *
 * 轉換為前端元件需要的格式：
 * indicatorMap: { [dbIndex: number]: { dates: string[], values: number[] } }
 */
export interface IndicatorV2Item {
  index: number
  values: { date: string; value: number }[]
}

export interface IndicatorFlat {
  dates: string[]
  values: (number | null)[]
}

const loading = ref(true)

// key = DB index (1-based)，value = 排序好的日期和數值
const indicatorMap = ref<Record<number, IndicatorFlat>>({})

const displayGroups = chartGroups

const parseDate = (d: string) => {
  // 支援複合日期如 "113/8/松山"（取前兩段排序）
  const monthMatch = d.match(/^(\d{3})\/(\d{1,2})(?:\/.*)?$/)
  if (monthMatch) return { year: +monthMatch[1], period: +monthMatch[2] }
  const quarterMatch = d.match(/^(\d{3})Q(\d)$/)
  if (quarterMatch) return { year: +quarterMatch[1], period: +quarterMatch[2] }
  return { year: 0, period: 0 }
}

const sortByDate = (a: { date: string }, b: { date: string }) => {
  const pa = parseDate(a.date)
  const pb = parseDate(b.date)
  return pa.year !== pb.year ? pa.year - pb.year : pa.period - pb.period
}

const fetchData = async () => {
  loading.value = true
  const res = await http.get('/indicator/v2/list')
  const rawData: IndicatorV2Item[] = res.data?.data ?? []

  const newMap: Record<number, IndicatorFlat> = {}

  for (const item of rawData) {
    const sorted = [...item.values].sort(sortByDate)
    newMap[item.index] = {
      dates: sorted.map((v) => v.date),
      values: sorted.map((v) => v.value),
    }
  }

  indicatorMap.value = newMap

  loading.value = false
}

onMounted(fetchData)
</script>
