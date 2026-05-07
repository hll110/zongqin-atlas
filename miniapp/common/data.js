import { kinshipRelations } from './kinshipData.js';

// 分类映射
const CATEGORY_MAP = {
  paternal: { label: '父系亲属', color: '#DC2626', bg: '#FEF2F2' },
  maternal: { label: '母系亲属', color: '#2563EB', bg: '#EFF6FF' },
  spouse: { label: '夫妻亲属', color: '#9333EA', bg: '#FDF4FF' },
  affinity: { label: '姻亲', color: '#EA580C', bg: '#FFF7ED' },
  collateral: { label: '旁系亲属', color: '#64748B', bg: '#F8FAFC' }
};

const GENERATION_MAP = {
  ancestor: '祖辈',
  elder: '父辈',
  peer: '平辈',
  junior: '子辈',
  descendant: '孙辈'
};

const GENDER_MAP = {
  male: '男',
  female: '女',
  unisex: '通用'
};

// 获取分类统计
export function getStats() {
  const stats = {
    total: kinshipRelations.length,
    byCategory: {},
    byGeneration: {}
  };
  kinshipRelations.forEach(item => {
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    stats.byGeneration[item.generationLevel] = (stats.byGeneration[item.generationLevel] || 0) + 1;
  });
  return stats;
}

// 按分类筛选
export function getByCategory(category, generationLevel = null) {
  return kinshipRelations.filter(item => {
    if (item.category !== category) return false;
    if (generationLevel && item.generationLevel !== generationLevel) return false;
    return true;
  });
}

// 搜索功能
export function searchRelations(query) {
  if (!query || query.trim() === '') return [];
  const q = query.toLowerCase().trim();
  return kinshipRelations.filter(item => {
    return item.relationPath.includes(q) ||
           item.formalTitle.includes(q) ||
           item.informalTitle.includes(q) ||
           item.northernTitle.includes(q) ||
           item.southernTitle.includes(q) ||
           (item.description && item.description.includes(q));
  }).slice(0, 15);
}

// 自然语言解析
export function parseNaturalQuery(query) {
  const q = query.toLowerCase().trim();
  const keywords = [];
  let gender = 'unisex';

  // 性别识别
  if (q.includes('男') || q.includes('公的')) gender = 'male';
  if (q.includes('女') || q.includes('母的')) gender = 'female';

  // 关键词提取
  const patterns = [
    { pattern: /爸爸|父亲|爹/, keyword: '父亲' },
    { pattern: /妈妈|母亲|娘/, keyword: '母亲' },
    { pattern: /爷爷|祖父/, keyword: '祖父' },
    { pattern: /奶奶|祖母/, keyword: '祖母' },
    { pattern: /外公|外祖父/, keyword: '外祖父' },
    { pattern: /外婆|外祖母/, keyword: '外祖母' },
    { pattern: /伯伯|伯父/, keyword: '伯父' },
    { pattern: /叔叔|叔父/, keyword: '叔父' },
    { pattern: /姑姑|姑母/, keyword: '姑母' },
    { pattern: /舅舅|舅父/, keyword: '舅父' },
    { pattern: /舅妈|舅母/, keyword: '舅母' },
    { pattern: /姨妈|姨母/, keyword: '姨母' },
    { pattern: /姨夫|姨父|姨丈/, keyword: '姨丈' },
    { pattern: /姑父|姑丈/, keyword: '姑丈' },
    { pattern: /哥哥|兄/, keyword: '哥哥' },
    { pattern: /弟弟|弟/, keyword: '弟弟' },
    { pattern: /姐姐|姐/, keyword: '姐姐' },
    { pattern: /妹妹|妹/, keyword: '妹妹' },
    { pattern: /老公|丈夫/, keyword: '丈夫' },
    { pattern: /老婆|妻子/, keyword: '妻子' },
    { pattern: /公公/, keyword: '公公' },
    { pattern: /婆婆/, keyword: '婆婆' },
    { pattern: /岳父/, keyword: '岳父' },
    { pattern: /岳母/, keyword: '岳母' },
    { pattern: /大伯子/, keyword: '大伯子' },
    { pattern: /小叔子/, keyword: '小叔子' },
    { pattern: /大姑子/, keyword: '大姑子' },
    { pattern: /小姑子/, keyword: '小姑子' },
    { pattern: /大舅子/, keyword: '大舅子' },
    { pattern: /小舅子/, keyword: '小舅子' },
    { pattern: /大姨子/, keyword: '大姨子' },
    { pattern: /小姨子/, keyword: '小姨子' },
    { pattern: /侄子/, keyword: '侄子' },
    { pattern: /侄女/, keyword: '侄女' },
    { pattern: /外甥/, keyword: '外甥' },
    { pattern: /外甥女/, keyword: '外甥女' },
    { pattern: /孙子/, keyword: '孙子' },
    { pattern: /孙女/, keyword: '孙女' },
    { pattern: /外孙/, keyword: '外孙' },
    { pattern: /外孙女/, keyword: '外孙女' },
    { pattern: /堂哥|堂兄/, keyword: '堂兄' },
    { pattern: /堂弟/, keyword: '堂弟' },
    { pattern: /堂姐/, keyword: '堂姐' },
    { pattern: /堂妹/, keyword: '堂妹' },
    { pattern: /表哥|表兄/, keyword: '表兄' },
    { pattern: /表弟/, keyword: '表弟' },
    { pattern: /表姐/, keyword: '表姐' },
    { pattern: /表妹/, keyword: '表妹' },
    { pattern: /嫂子/, keyword: '嫂子' },
    { pattern: /弟媳/, keyword: '弟媳' },
    { pattern: /姐夫/, keyword: '姐夫' },
    { pattern: /妹夫/, keyword: '妹夫' },
    { pattern: /儿媳|儿媳妇/, keyword: '儿媳' },
    { pattern: /女婿/, keyword: '女婿' },
    { pattern: /亲家公/, keyword: '亲家公' },
    { pattern: /亲家母/, keyword: '亲家母' },
    { pattern: /太爷爷/, keyword: '太爷爷' },
    { pattern: /太奶奶/, keyword: '太奶奶' },
    { pattern: /伯祖父/, keyword: '伯祖父' },
    { pattern: /叔祖父/, keyword: '叔祖父' },
    { pattern: /姑祖母/, keyword: '姑祖母' },
    { pattern: /舅祖父/, keyword: '舅祖父' },
    { pattern: /姨祖母/, keyword: '姨祖母' }
  ];

  for (const { pattern, keyword } of patterns) {
    if (pattern.test(q)) keywords.push(keyword);
  }

  return {
    originalQuery: query,
    keywords: [...new Set(keywords)],
    gender,
    relationshipChain: [...new Set(keywords)]
  };
}

// AI查询
export function naturalQuery(query) {
  const parsed = parseNaturalQuery(query);
  const results = searchRelations(query);

  return {
    parsed,
    results,
    explanation: generateExplanation(parsed, results[0])
  };
}

function generateExplanation(parsed, result) {
  if (!result) {
    return `抱歉，暂时无法理解"${parsed.originalQuery}"这个关系。请尝试用更简单的表达，如"爸爸的哥哥"、"妻子的弟弟"等。`;
  }

  const parts = [
    `您查询的是："${parsed.originalQuery}"`,
    `关系链：${result.relationPath}`,
    `标准称呼：${result.formalTitle}（书面语）、${result.informalTitle}（口语）`
  ];

  if (result.northernTitle !== result.southernTitle) {
    parts.push(`地域差异：北方叫"${result.northernTitle}"，南方叫"${result.southernTitle}"`);
  }
  if (result.usageNotes) {
    parts.push(`备注：${result.usageNotes}`);
  }

  return parts.join('\n');
}

// 地域差异数据
export const REGION_COMPARISONS = [
  { relation: "父亲的哥哥", northern: "大爷", southern: "伯伯", standard: "伯父", notes: "北方多用'大爷'，南方多用'伯伯'" },
  { relation: "父亲的弟弟", northern: "叔叔", southern: "阿叔", standard: "叔父", notes: "北方称'叔叔'，粤语区常称'阿叔'" },
  { relation: "父亲的姐妹", northern: "姑姑", southern: "阿姑", standard: "姑母", notes: "北方多用'姑姑'，南方部分地区用'阿姑'" },
  { relation: "母亲的兄弟", northern: "舅舅", southern: "阿舅", standard: "舅父", notes: "普遍称'舅舅'，粤语区称'阿舅'" },
  { relation: "母亲的姐妹", northern: "姨妈", southern: "阿姨", standard: "姨母", notes: "北方多用'姨妈'，上海等地常用'阿姨'" },
  { relation: "祖父", northern: "爷爷", southern: "阿爷", standard: "祖父", notes: "北方多用'爷爷'，粤语区称'阿爷'" },
  { relation: "祖母", northern: "奶奶", southern: "阿嬷", standard: "祖母", notes: "北方多用'奶奶'，闽南地区称'阿嬷'" },
  { relation: "外祖父", northern: "姥爷", southern: "外公", standard: "外祖父", notes: "东北、华北多称'姥爷'，南方多称'外公'" },
  { relation: "外祖母", northern: "姥姥", southern: "外婆", standard: "外祖母", notes: "东北、华北多称'姥姥'，南方多称'外婆'" },
  { relation: "丈夫", northern: "老公", southern: "先生", standard: "丈夫", notes: "普遍称'老公'，部分南方地区也用'先生'" },
  { relation: "妻子", northern: "老婆", southern: "太太", standard: "妻子", notes: "普遍称'老婆'，港澳地区常用'太太'" },
  { relation: "伯父的妻子", northern: "大娘", southern: "伯母", standard: "伯母", notes: "北方多用'大娘'，南方多用'伯母'" },
  { relation: "叔父的妻子", northern: "婶婶", southern: "阿婶", standard: "婶母", notes: "北方多用'婶婶'，粤语区称'阿婶'" },
  { relation: "舅父的妻子", northern: "舅妈", southern: "舅母", standard: "舅母", notes: "北方多用'舅妈'，潮汕地区称'妗子'" },
  { relation: "姨母的丈夫", northern: "姨父", southern: "姨丈", standard: "姨丈", notes: "北方多用'姨父'，南方多用'姨丈'" },
  { relation: "姑母的丈夫", northern: "姑父", southern: "姑丈", standard: "姑丈", notes: "北方多用'姑父'，南方多用'姑丈'" }
];

// 方言区数据
export const DIALECT_REGIONS = [
  {
    region: "粤语区（广东、香港）",
    features: ["祖父称'阿爷'", "祖母称'阿嫲'", "父亲称'老豆'", "母亲称'老母'", "伯父称'大伯'", "舅父称'舅父'", "丈夫的父亲称'老爷'"]
  },
  {
    region: "闽南语区（福建、台湾）",
    features: ["祖父称'阿公'", "祖母称'阿嫲'", "父亲称'老父'", "母亲称'老母'", "哥哥称'阿兄'", "姐姐称'阿姊'"]
  },
  {
    region: "吴语区（上海、江浙）",
    features: ["祖父称'阿爷'", "祖母称'阿娘'", "父亲称'阿爸'", "母亲称'姆妈'", "舅舅称'娘舅'", "姑姑称'孃孃'"]
  },
  {
    region: "西南官话区（四川、重庆）",
    features: ["父亲称'老汉儿'", "母亲称'老妈子'", "祖母称'婆婆'", "伯父称'大爸'", "丈夫称'男人家'", "妻子称'婆娘'"]
  },
  {
    region: "东北官话区",
    features: ["父亲称'爹'", "祖父称'老爷子'", "祖母称'老太太'", "伯父称'大爷'", "外祖父称'姥爷'", "外祖母称'姥姥'"]
  },
  {
    region: "湘语区（湖南）",
    features: ["父亲称'爷老子'", "母亲称'娘老子'", "祖母称'娭毑'", "伯父称'大伯伯'", "姑姑称'姑妈'"]
  }
];

// 速查表数据
export const REFERENCE_TABLES = [
  {
    title: "父系亲属速查",
    category: "paternal",
    rows: [
      { relation: "父亲的父亲", formal: "祖父", informal: "爷爷", northern: "爷爷", southern: "阿爷" },
      { relation: "父亲的母亲", formal: "祖母", informal: "奶奶", northern: "奶奶", southern: "阿嬷" },
      { relation: "父亲的哥哥", formal: "伯父", informal: "伯伯", northern: "大爷", southern: "伯伯" },
      { relation: "父亲的弟弟", formal: "叔父", informal: "叔叔", northern: "叔叔", southern: "叔叔" },
      { relation: "父亲的姐妹", formal: "姑母", informal: "姑姑", northern: "姑姑", southern: "阿姑" },
      { relation: "哥哥", formal: "兄", informal: "哥哥", northern: "哥哥", southern: "哥哥" },
      { relation: "弟弟", formal: "弟", informal: "弟弟", northern: "弟弟", southern: "弟弟" },
      { relation: "姐姐", formal: "姐", informal: "姐姐", northern: "姐姐", southern: "姐姐" },
      { relation: "妹妹", formal: "妹", informal: "妹妹", northern: "妹妹", southern: "妹妹" },
      { relation: "兄弟的儿子", formal: "侄子", informal: "侄子", northern: "侄子", southern: "侄" },
      { relation: "兄弟的女儿", formal: "侄女", informal: "侄女", northern: "侄女", southern: "侄女" },
      { relation: "姐妹的儿子", formal: "外甥", informal: "外甥", northern: "外甥", southern: "外甥" },
      { relation: "姐妹的女儿", formal: "外甥女", informal: "外甥女", northern: "外甥女", southern: "外甥女" }
    ]
  },
  {
    title: "母系亲属速查",
    category: "maternal",
    rows: [
      { relation: "母亲的父亲", formal: "外祖父", informal: "外公", northern: "姥爷", southern: "外公" },
      { relation: "母亲的母亲", formal: "外祖母", informal: "外婆", northern: "姥姥", southern: "外婆" },
      { relation: "母亲的哥哥", formal: "舅父", informal: "舅舅", northern: "舅舅", southern: "阿舅" },
      { relation: "母亲的弟弟", formal: "舅父", informal: "舅舅", northern: "舅舅", southern: "阿舅" },
      { relation: "母亲的姐妹", formal: "姨母", informal: "姨妈", northern: "姨妈", southern: "姨妈" },
      { relation: "舅父的儿子", formal: "表兄", informal: "表哥", northern: "表哥", southern: "表兄" },
      { relation: "舅父的女儿", formal: "表姐", informal: "表姐", northern: "表姐", southern: "表姐" },
      { relation: "姨母的儿子", formal: "表兄", informal: "表哥", northern: "表哥", southern: "表兄" },
      { relation: "姨母的女儿", formal: "表姐", informal: "表姐", northern: "表姐", southern: "表姐" }
    ]
  },
  {
    title: "夫妻亲属速查",
    category: "spouse",
    rows: [
      { relation: "丈夫", formal: "丈夫", informal: "老公", northern: "老公", southern: "老公" },
      { relation: "妻子", formal: "妻子", informal: "老婆", northern: "老婆", southern: "老婆" },
      { relation: "丈夫的父亲", formal: "公公", informal: "公公", northern: "公公", southern: "家公" },
      { relation: "丈夫的母亲", formal: "婆婆", informal: "婆婆", northern: "婆婆", southern: "家婆" },
      { relation: "妻子的父亲", formal: "岳父", informal: "岳父", northern: "岳父", southern: "丈人" },
      { relation: "妻子的母亲", formal: "岳母", informal: "岳母", northern: "岳母", southern: "丈母娘" },
      { relation: "丈夫的哥哥", formal: "大伯子", informal: "大伯", northern: "大伯", southern: "大伯" },
      { relation: "丈夫的弟弟", formal: "小叔子", informal: "小叔", northern: "小叔", southern: "小叔" },
      { relation: "妻子的哥哥", formal: "大舅子", informal: "大舅哥", northern: "大舅哥", southern: "大舅" },
      { relation: "妻子的弟弟", formal: "小舅子", informal: "小舅子", northern: "小舅子", southern: "小舅" }
    ]
  },
  {
    title: "姻亲速查",
    category: "affinity",
    rows: [
      { relation: "哥哥的妻子", formal: "嫂子", informal: "嫂子", northern: "嫂子", southern: "阿嫂" },
      { relation: "弟弟的妻子", formal: "弟媳", informal: "弟媳", northern: "弟妹", southern: "弟媳" },
      { relation: "姐姐的丈夫", formal: "姐夫", informal: "姐夫", northern: "姐夫", southern: "姐夫" },
      { relation: "妹妹的丈夫", formal: "妹夫", informal: "妹夫", northern: "妹夫", southern: "妹夫" },
      { relation: "儿子的妻子", formal: "儿媳", informal: "儿媳妇", northern: "儿媳妇", southern: "新妇" },
      { relation: "女儿的丈夫", formal: "女婿", informal: "女婿", northern: "女婿", southern: "女婿" },
      { relation: "堂兄的妻子", formal: "堂嫂", informal: "堂嫂", northern: "堂嫂", southern: "堂嫂" },
      { relation: "表兄的妻子", formal: "表嫂", informal: "表嫂", northern: "表嫂", southern: "表嫂" },
      { relation: "亲家公", formal: "亲家公", informal: "亲家公", northern: "亲家公", southern: "亲家" },
      { relation: "亲家母", formal: "亲家母", informal: "亲家母", northern: "亲家母", southern: "亲家" }
    ]
  }
];

export { CATEGORY_MAP, GENERATION_MAP, GENDER_MAP };
