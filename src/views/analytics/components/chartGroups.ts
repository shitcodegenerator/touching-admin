export interface IndicatorConfig {
  /** DB index (1-based)，對應後端 indicator.index */
  dbIndex: number;
  label: string;
  type: "bar" | "line";
  yAxisIndex: number;
}

/** 各指標的資料來源超連結，key = dbIndex */
export const indicatorSourceUrls: Record<number, string> = {
  1: "https://www.cbc.gov.tw/tw/cp-528-1079-B4682-1.html",
  2: "https://www.cbc.gov.tw/tw/cp-528-1079-B4682-1.html",
  3: "https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=234953",
  4: "https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=234953",
  5: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  6: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  7: "https://nstatdb.dgbas.gov.tw/dgbasAll/webMain.aspx?sys=100&funid=dgmaind",
  8: "https://nstatdb.dgbas.gov.tw/dgbasAll/webMain.aspx?sys=100&funid=dgmaind",
  9: "https://www.twse.com.tw/zh/trading/statistics/index01.html",
  10: "http://rcted.ncu.edu.tw/cci.asp",
  11: "https://www.stat.gov.tw/cp.aspx?n=2665",
  12: "https://www.stat.gov.tw/cp.aspx?n=2665",
  13: "https://nstatdb.dgbas.gov.tw/dgbasAll/webMain.aspx?sys=100&funid=dgmaind",
  15: "https://index.ndc.gov.tw/n/zh_tw",
  16: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  17: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  18: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  19: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  20: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  21: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  23: "http://rcted.ncu.edu.tw/cci.asp",
  24: "https://lr.land.gov.taipei/st/RealtyReg.aspx",
  26: "https://lr.land.gov.taipei/st/RealtyReg.aspx",
  31: "https://i.land.ntpc.gov.tw/iland/index.php/info/land-value",
  33: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  44: "https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=234953",
  45: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  46: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  47: "https://statis.moi.gov.tw/micst/webMain.aspx?k=menum",
  52: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  53: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  54: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  55: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  56: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  57: "https://pip.moi.gov.tw/Publicize/Info/E4010",
  58: "https://twur.nlma.gov.tw/zh/urban/statistics",
  59: "https://twur.nlma.gov.tw/zh/urban/statistics",
  60: "https://twur.nlma.gov.tw/zh/urban/statistics",
  61: "https://twur.nlma.gov.tw/zh/urban/statistics",
  62: "https://twur.nlma.gov.tw/zh/urban/statistics",
  63: "https://twur.nlma.gov.tw/zh/urban/statistics",
};

export interface YAxisConfig {
  name: string;
  position: "left" | "right";
}

export interface ChartGroup {
  key: string;
  title: string;
  /** 標題超連結，點擊標題可前往外部資料來源 */
  link?: string;
  indicators: IndicatorConfig[];
  yAxis: YAxisConfig[];
  /** X 軸使用非日期標籤（如行政區名稱），跳過年月格式過濾 */
  useRawLabels?: boolean;
  /** 各區時間序列模式：日期格式為 "YYY/M/行政區"，用 DistrictEditTable 編輯 */
  isDistrictTimeSeries?: boolean;
  /** isDistrictTimeSeries 時的行政區列表 */
  districts?: string[];
}

/**
 * 圖表分組設定，與前台 publication 頁面對齊。
 * dbIndex 對應後端 DB 的 indicator.index（1-based，有跳號）。
 *
 * DB index 對照：
 *   1-13: 經濟金融指標
 *   14: GDP名目值（未在圖表中獨立使用）
 *   15: 景氣燈號
 *   16-21: 老宅數量（季度資料）
 *   52-57: 老宅佔全市比例（季度資料）
 *   23: 耐久財貨時機指數
 *   24,26,28-30: 台北市房市（25,27 已合併至 24,26）
 *   31,33,35-37: 新北市房市（32,34 已合併至 31,33）
 *   38-43: 各區買賣移轉
 *   44-47: 營造/建照/使照（48-51 已棄用，今年vs去年由前端從 45/46 推導）
 */
export const chartGroups: ChartGroup[] = [
  {
    key: "loan",
    title: "五大銀行新承做購屋貸款金額與利率統計表",
    indicators: [
      { dbIndex: 1, label: "購屋貸款金額", type: "bar", yAxisIndex: 0 },
      { dbIndex: 2, label: "購屋貸款利率", type: "line", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "新台幣百萬元", position: "left" },
      { name: "年息百分比率", position: "right" },
    ],
  },
  {
    key: "economy-overview",
    title: "台灣總體經濟 與 不動產綜合指標",
    indicators: [
      { dbIndex: 3, label: "出口貿易總額", type: "line", yAxisIndex: 0 },
      { dbIndex: 4, label: "進口貿易總額", type: "line", yAxisIndex: 0 },
      {
        dbIndex: 5,
        label: "所有權第一次登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 6,
        label: "買賣移轉登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 7,
        label: "國內生產毛額GDP",
        type: "bar",
        yAxisIndex: 0,
      },
      { dbIndex: 8, label: "美台匯率(月平均)", type: "line", yAxisIndex: 1 },
      { dbIndex: 9, label: "台股市場股價指數", type: "line", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "百萬元/棟", position: "left" },
      { name: "匯率/指數", position: "right" },
    ],
  },
  {
    key: "trade",
    title: "進出口貿易總額",
    indicators: [
      { dbIndex: 3, label: "出口貿易總額", type: "line", yAxisIndex: 0 },
      { dbIndex: 4, label: "進口貿易總額", type: "line", yAxisIndex: 0 },
    ],
    yAxis: [{ name: "百萬美元", position: "left" }],
  },
  {
    key: "building-registration",
    title: "建物登記（第一次登記 vs 買賣移轉）",
    indicators: [
      {
        dbIndex: 5,
        label: "所有權第一次登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 6,
        label: "買賣移轉登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "棟", position: "left" }],
  },
  {
    key: "economy",
    title: "經濟指標（GDP / 匯率 / 股價）",
    indicators: [
      { dbIndex: 7, label: "國內生產毛額GDP", type: "bar", yAxisIndex: 0 },
      { dbIndex: 8, label: "美台匯率(月平均)", type: "line", yAxisIndex: 1 },
      { dbIndex: 9, label: "台股市場股價指數", type: "line", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "百萬元", position: "left" },
      { name: "指數/匯率", position: "right" },
    ],
  },
  {
    key: "consumer",
    title: "消費者指標",
    indicators: [
      {
        dbIndex: 10,
        label: "未來半年是否為購買房地產好時機(指數)",
        type: "line",
        yAxisIndex: 0,
      },
      { dbIndex: 11, label: "物價類房租指數", type: "line", yAxisIndex: 0 },
      {
        dbIndex: 12,
        label: "消費者物價指數(CPI)",
        type: "line",
        yAxisIndex: 0,
      },
      {
        dbIndex: 23,
        label: "未來半年購買耐久財貨時機(指數)",
        type: "line",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "指數", position: "left" }],
  },
  {
    key: "gdp-growth",
    title: "經濟成長率與景氣燈號",
    indicators: [
      { dbIndex: 13, label: "經濟成長率(季)", type: "line", yAxisIndex: 0 },
      { dbIndex: 15, label: "景氣燈號", type: "bar", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "%", position: "left" },
      { name: "分數", position: "right" },
    ],
  },
  {
    key: "taipei-transfer",
    title: "台北市買賣移轉與成交概況",
    indicators: [
      { dbIndex: 24, label: "台北市買賣移轉棟數", type: "bar", yAxisIndex: 0 },
      {
        dbIndex: 26,
        label: "台北市第一次移轉棟數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "棟", position: "left" }],
  },
  {
    key: "taipei-price",
    title: "台北市預售屋成交量與均價",
    link: "https://docs.google.com/document/d/1VkvclL9oAzC7FRCNZmnbqN0SczYEgLGyY3Klcd2OSjY/edit?usp=sharing",
    indicators: [
      { dbIndex: 28, label: "台北市成交量(筆)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 29, label: "台北市單坪均價(萬)", type: "line", yAxisIndex: 1 },
      { dbIndex: 30, label: "台北市成交均價(萬)", type: "line", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "筆", position: "left" },
      { name: "萬元", position: "right" },
    ],
  },
  {
    key: "newtaipei-transfer",
    title: "新北市買賣移轉與成交概況",
    indicators: [
      { dbIndex: 31, label: "新北市買賣移轉棟數", type: "bar", yAxisIndex: 0 },
      {
        dbIndex: 33,
        label: "新北市第一次移轉棟數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "棟", position: "left" }],
  },
  {
    key: "newtaipei-price",
    title: "新北市預售屋成交量與均價",
    indicators: [
      { dbIndex: 35, label: "新北市成交量(筆)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 36, label: "新北市單坪均價(萬)", type: "line", yAxisIndex: 1 },
      { dbIndex: 37, label: "新北市成交均價(萬)", type: "line", yAxisIndex: 1 },
    ],
    yAxis: [
      { name: "筆", position: "left" },
      { name: "萬元", position: "right" },
    ],
  },
  {
    key: "taipei-district",
    title: "台北市各區買賣移轉棟數",
    indicators: [
      {
        dbIndex: 38,
        label: "台北市各區買賣移轉棟數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "棟", position: "left" }],
    isDistrictTimeSeries: true,
    districts: [
      "松山",
      "信義",
      "大安",
      "中山",
      "中正",
      "大同",
      "萬華",
      "文山",
      "南港",
      "內湖",
      "士林",
      "北投",
    ],
  },
  {
    key: "newtaipei-district",
    title: "新北市各區買賣移轉棟數",
    indicators: [
      {
        dbIndex: 41,
        label: "新北市各區買賣移轉棟數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "棟", position: "left" }],
    isDistrictTimeSeries: true,
    districts: [
      "板橋",
      "土城",
      "中和",
      "永和",
      "新莊",
      "泰山",
      "五股",
      "林口",
      "三重",
      "蘆洲",
      "新店",
      "深坑",
      "石碇",
      "坪林",
      "烏來",
      "樹林",
      "三峽",
      "鶯歌",
      "汐止",
      "金山",
      "萬里",
      "淡水",
      "三芝",
      "石門",
      "八里",
      "瑞芳",
      "平溪",
      "雙溪",
      "貢寮",
    ],
  },
  {
    key: "license-and-construct",
    title: "建使照核發量與買賣關係",
    indicators: [
      {
        dbIndex: 5,
        label: "所有權第一次登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 6,
        label: "買賣移轉登記(住宅H-2類)",
        type: "bar",
        yAxisIndex: 0,
      },
      { dbIndex: 44, label: "營造工程物價指數", type: "line", yAxisIndex: 1 },
      { dbIndex: 45, label: "核發建築物建造執照", type: "line", yAxisIndex: 1 },
      { dbIndex: 46, label: "核發建築物使用執照", type: "line", yAxisIndex: 1 },
      {
        dbIndex: 47,
        label: "開工宅數(住宅H-2類)",
        type: "line",
        yAxisIndex: 1,
      },
    ],
    yAxis: [
      { name: "所有權/買賣登記件數", position: "left" },
      { name: "核發執照件/開工宅數", position: "right" },
    ],
  },
  {
    key: "taipei-old-house",
    title: "台北市老屋(30年以上)數量趨勢",
    indicators: [
      { dbIndex: 16, label: "台北市30~40年(宅)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 17, label: "台北市40~50年(宅)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 18, label: "台北市50年以上(宅)", type: "bar", yAxisIndex: 0 },
    ],
    yAxis: [{ name: "棟數", position: "left" }],
  },
  {
    key: "newtaipei-old-house",
    title: "新北市老屋(30年以上)數量趨勢",
    indicators: [
      { dbIndex: 19, label: "新北市30~40年(宅)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 20, label: "新北市40~50年(宅)", type: "bar", yAxisIndex: 0 },
      { dbIndex: 21, label: "新北市50年以上(宅)", type: "bar", yAxisIndex: 0 },
    ],
    yAxis: [{ name: "棟數", position: "left" }],
  },
  {
    key: "taipei-old-house-proportion",
    title: "台北市老屋佔全市房屋比例(%)",
    indicators: [
      { dbIndex: 52, label: "台北市30~40年宅佔比", type: "bar", yAxisIndex: 0 },
      { dbIndex: 53, label: "台北市40~50年宅佔比", type: "bar", yAxisIndex: 0 },
      {
        dbIndex: 54,
        label: "台北市50年以上宅佔比",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "%", position: "left" }],
  },
  {
    key: "newtaipei-old-house-proportion",
    title: "新北市老屋佔全市房屋比例(%)",
    indicators: [
      { dbIndex: 55, label: "新北市30~40年宅佔比", type: "bar", yAxisIndex: 0 },
      { dbIndex: 56, label: "新北市40~50年宅佔比", type: "bar", yAxisIndex: 0 },
      {
        dbIndex: 57,
        label: "新北市50年以上宅佔比",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "%", position: "left" }],
  },
  {
    key: "taipei-danger-old",
    title: "台北市危老統計件數",
    indicators: [
      {
        dbIndex: 58,
        label: "台北市危老重建申請件數",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 59,
        label: "台北市危老重建核准件數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "件", position: "left" }],
    useRawLabels: true,
  },
  {
    key: "newtaipei-danger-old",
    title: "新北市危老統計件數",
    indicators: [
      {
        dbIndex: 60,
        label: "新北市危老重建申請件數",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 61,
        label: "新北市危老重建核准件數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "件", position: "left" }],
    useRawLabels: true,
  },
  {
    key: "urban-renewal",
    title: "雙北都市更新「核定」案件數",
    indicators: [
      {
        dbIndex: 62,
        label: "台北市都市更新核定案件數",
        type: "bar",
        yAxisIndex: 0,
      },
      {
        dbIndex: 63,
        label: "新北市都市更新核定案件數",
        type: "bar",
        yAxisIndex: 0,
      },
    ],
    yAxis: [{ name: "件", position: "left" }],
    useRawLabels: true,
  },
];
