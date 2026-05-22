import { kinshipRelations } from './kinshipData.js';
import {
  runNaturalQuery,
  buildRelationPath,
  parseQueryMeta,
  searchKinshipRelations,
} from './intelligence.js';

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

// 搜索（智能排序）
export function searchRelations(query) {
  if (!query || !query.trim()) return [];
  return searchKinshipRelations(kinshipRelations, query.trim());
}

// 智能查询（关系链推理 + 评分排序）
export function naturalQuery(query) {
  return runNaturalQuery(kinshipRelations, query.trim());
}

export { buildRelationPath, parseQueryMeta };

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
