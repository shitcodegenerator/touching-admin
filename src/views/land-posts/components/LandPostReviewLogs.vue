<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { fieldLabelMap, formatChangeValue } from '../constants'
import type { ReviewLog, VerificationState } from '../types'

const props = defineProps<{ logs?: ReviewLog[] }>()

// 新的紀錄排最前面
const sortedLogs = computed(() => [...(props.logs ?? [])].reverse())

const fmt = (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm')

const verificationStateText = (verified: boolean) => (verified ? '已確認' : '未確認')

const verificationChangeText = (log: ReviewLog) => {
  const before: VerificationState = log.before ?? {
    landNumberVerified: false,
    authorizationLetterVerified: false,
  }
  const after = log.after ?? before

  return [
    `地號：${verificationStateText(before.landNumberVerified)} → ${verificationStateText(after.landNumberVerified)}`,
    `委託／授權書：${verificationStateText(before.authorizationLetterVerified)} → ${verificationStateText(after.authorizationLetterVerified)}`,
  ].join('；')
}

const reviewLogText = (log: ReviewLog) => {
  if (log.action === 'approved') return `已核准案件：${verificationChangeText(log)}`
  if (log.action === 'rejected') return `已駁回案件：${verificationChangeText(log)}`
  if (log.action === 'content_edited') return `已編輯案件內容（${log.changes?.length ?? 0} 個欄位）`

  return `已更新官方核實標章：${verificationChangeText(log)}`
}
</script>

<template>
  <div v-if="sortedLogs.length" class="space-y-2">
    <div
      v-for="log in sortedLogs"
      :key="log.createdAt + '-' + log.action"
      class="rounded border border-slate-200 p-3"
    >
      <p class="text-xs text-slate-500">{{ log.operator.username }}　{{ fmt(log.createdAt) }}</p>
      <p class="mt-1 text-sm text-slate-700">{{ reviewLogText(log) }}</p>

      <table
        v-if="log.action === 'content_edited' && log.changes?.length"
        class="mt-2 w-full table-fixed border-collapse text-xs"
      >
        <thead>
          <tr class="bg-slate-50 text-left text-slate-500">
            <th class="w-28 border border-slate-200 px-2 py-1 font-medium">欄位</th>
            <th class="border border-slate-200 px-2 py-1 font-medium">修改前</th>
            <th class="border border-slate-200 px-2 py-1 font-medium">修改後</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="change in log.changes" :key="change.field" class="align-top">
            <td class="border border-slate-200 px-2 py-1 text-slate-600">
              {{ fieldLabelMap[change.field] ?? change.field }}
            </td>
            <td
              class="whitespace-pre-wrap break-words border border-slate-200 bg-red-50 px-2 py-1 text-red-700 line-through decoration-red-300"
            >
              {{ formatChangeValue(change.field, change.before) }}
            </td>
            <td
              class="whitespace-pre-wrap break-words border border-slate-200 bg-emerald-50 px-2 py-1 text-emerald-700"
            >
              {{ formatChangeValue(change.field, change.after) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <p v-else class="text-sm text-slate-400">目前尚無案件操作紀錄</p>
</template>
