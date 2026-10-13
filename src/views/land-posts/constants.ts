export const typeMap: Record<string, string> = {
  sell: '出售',
  rent: '出租',
  buy: '土地購入',
  joint_development: '合建',
  asset_lease: '承租資產',
  hotel_building_sale: '飯店/建物整棟出售',
  other: '其他或複合性開發使用',
}

export const landTypeMap: Record<string, string> = {
  farmland: '農地',
  building: '建地',
  residential: '住宅用地',
  commercial: '商業用地',
  industrial: '工業用地',
  forest: '林地',
  slope: '山坡地',
  road: '道路用地',
  public_facility: '公保地',
  other: '其他',
}

export const areaUnitMap: Record<string, string> = {
  ping: '坪',
  sqm: '平方公尺',
  hectare: '公頃',
}

export const visibilityMap: Record<string, string> = {
  platform_public: '公開於踏取平台',
  internal_only: '僅內部可見',
}

export const statusMap: Record<string, string> = {
  pending: '待審核',
  approved: '已核准',
  rejected: '已駁回',
}

// 編輯差異紀錄的欄位中文名稱（對應後端 EDITABLE_FIELDS）
export const fieldLabelMap: Record<string, string> = {
  type: '案件類型',
  landType: '土地類型',
  contactName: '聯絡人',
  city: '縣市',
  district: '行政區',
  section: '地段',
  landNumbers: '地號',
  approximateLocation: '概略位置',
  landArea: '面積',
  landAreaUnit: '面積單位',
  landShareNumerator: '持分（分子）',
  landShareDenominator: '持分（分母）',
  landOwnerCount: '地主人數',
  floorAreaRatio: '容積率（%）',
  buildingCoverageRatio: '建蔽率（%）',
  frontageWidth: '面寬（米）',
  lotDepth: '縱深（米）',
  roadCondition: '臨路條件',
  landCondition: '土地現況',
  description: '案件描述',
  priceBudget: '開價（總）',
  unitPrice: '單價（萬元/坪）',
  hasAuthorizationLetter: '委託（授權）書',
  directOwnerContact: '直接對所有權人/買方',
  visibility: '可見度',
  contactPhone: '聯絡電話',
  contactLine: 'LINE',
}

// 列舉欄位的值 → 中文，供差異紀錄顯示
const enumValueMaps: Record<string, Record<string, string>> = {
  type: typeMap,
  landType: landTypeMap,
  landAreaUnit: areaUnitMap,
  visibility: visibilityMap,
}

export const formatChangeValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '（空）'
  if (typeof value === 'boolean') return value ? '是' : '否'
  const map = enumValueMaps[field]
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => map?.[String(v)] ?? String(v)).join('、') : '（空）'
  }
  return map?.[String(value)] ?? String(value)
}
