<template>
  <view class="container">
    <view class="header page-hero">
      <text class="header-title heading-serif">智能称呼查询</text>
      <text class="header-desc">支持「爸爸的弟弟的儿子」或「妻子弟弟」等说法</text>
    </view>

    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          placeholder="例如：我是女生，怎么称呼爸爸的弟弟的儿子？"
          v-model="query"
          confirm-type="search"
          @confirm="handleSearch"
          @input="onInput"
        />
        <text v-if="query" class="clear-btn" @tap="clearQuery">✕</text>
      </view>
      <button class="btn-primary search-btn" @tap="handleSearch" :disabled="!query.trim()">
        智能解析
      </button>
    </view>

    <view v-if="previewSegments.length && !hasSearched" class="preview-card card">
      <text class="preview-label">识别关系链</text>
      <view class="segment-flow">
        <text
          v-for="(seg, i) in previewSegments"
          :key="i"
          class="segment-chip"
        >{{ seg }}<text v-if="i < previewSegments.length - 1" class="segment-arrow">→</text></text>
      </view>
    </view>

    <view v-if="!hasSearched" class="examples-section">
      <text class="examples-title">试试这些</text>
      <view class="examples-list">
        <view v-for="(q, i) in examples" :key="i" class="chip" @tap="useExample(q)">
          <text>{{ q }}</text>
        </view>
      </view>
    </view>

    <view v-if="result && hasSearched" class="results-section">
      <view class="parsed-card card">
        <view class="parsed-top">
          <view class="parsed-main">
            <text class="parsed-label">解析结果</text>
            <text class="parsed-chain">{{ displayChain }}</text>
          </view>
          <view
            class="confidence-badge"
            :class="'confidence-badge--' + (result.parsed.confidence || 'low')"
          >
            <text>{{ confidenceLabel }}</text>
          </view>
        </view>
        <text v-if="result.explanation" class="parsed-explanation">{{ result.explanation }}</text>
      </view>

      <view v-if="result.topResult" class="best-card card" @tap="openDetail(result.topResult)">
        <view class="best-badge">最佳匹配</view>
        <text class="best-title heading-serif">{{ result.topResult.formalTitle }}</text>
        <text class="best-informal">口语：{{ result.topResult.informalTitle }}</text>
        <view class="best-region">
          <text class="north">北 {{ result.topResult.northernTitle }}</text>
          <text class="south">南 {{ result.topResult.southernTitle }}</text>
        </view>
        <text class="best-path">{{ result.topResult.relationPath }}</text>
      </view>

      <view v-if="otherResults.length" class="more-section">
        <text class="more-title">其他相关称谓（{{ otherResults.length }}）</text>
        <view
          v-for="(item, index) in otherResults"
          :key="item.relationPath + index"
          class="result-card card"
          @tap="openDetail(item)"
        >
          <view class="result-header">
            <text class="result-title">{{ item.formalTitle }}</text>
            <text class="tag tag-primary">{{ generationMap[item.generationLevel] }}</text>
          </view>
          <text class="result-path">{{ item.relationPath }}</text>
        </view>
      </view>
    </view>

    <view v-if="hasSearched && (!result || !result.results.length)" class="empty-state">
      <view class="empty-icon">🔍</view>
      <text class="empty-title">暂未找到精确匹配</text>
      <text class="empty-text">可尝试下方推荐，或缩短关系描述</text>
      <view v-if="result?.suggestions?.length" class="suggest-list">
        <view
          v-for="(s, i) in result.suggestions"
          :key="i"
          class="chip"
          @tap="useExample(s)"
        >
          <text>{{ s }}</text>
        </view>
      </view>
      <button class="btn-outline retry-btn" @tap="clearAll">重新输入</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { naturalQuery, CATEGORY_MAP, GENERATION_MAP } from "@/common/data.js";
import { extractSegments } from "@/common/intelligence.js";
import { useTabBar } from "@/composables/useTabBar.js";

useTabBar(2);

const query = ref("");
const hasSearched = ref(false);
const result = ref(null);
const previewSegments = ref([]);

const examples = [
  "爸爸的弟弟的儿子",
  "我是女生怎么称呼妈妈的哥哥",
  "妻子的姐姐的丈夫",
  "老公的弟弟的老婆",
  "堂哥的女儿怎么叫",
];

const categoryMap = CATEGORY_MAP;
const generationMap = GENERATION_MAP;

const displayChain = computed(() => {
  if (!result.value) return "—";
  const p = result.value.parsed;
  return p.relationPath || p.keywords?.join(" → ") || "—";
});

const confidenceLabel = computed(() => {
  const c = result.value?.parsed?.confidence;
  if (c === "high") return "高匹配";
  if (c === "medium") return "中匹配";
  return "关键词";
});

const otherResults = computed(() => {
  if (!result.value?.results?.length) return [];
  return result.value.results.slice(1);
});

onMounted(() => {
  const pending = uni.getStorageSync("pendingQuery");
  if (pending) {
    query.value = pending;
    uni.removeStorageSync("pendingQuery");
    handleSearch();
  }
});

function onInput() {
  previewSegments.value = extractSegments(query.value);
}

function handleSearch() {
  if (!query.value.trim()) return;
  hasSearched.value = true;
  result.value = naturalQuery(query.value);
  previewSegments.value = result.value.parsed.keywords || [];
  saveHistory(query.value.trim());
}

function saveHistory(q) {
  const key = "queryHistory";
  let list = uni.getStorageSync(key) || [];
  if (!Array.isArray(list)) list = [];
  list = [q, ...list.filter((x) => x !== q)].slice(0, 5);
  uni.setStorageSync(key, list);
}

function useExample(q) {
  query.value = q;
  previewSegments.value = extractSegments(q);
  handleSearch();
}

function clearQuery() {
  query.value = "";
  previewSegments.value = [];
}

function clearAll() {
  query.value = "";
  previewSegments.value = [];
  hasSearched.value = false;
  result.value = null;
}

function openDetail(item) {
  uni.setStorageSync("detailData", item);
  uni.navigateTo({ url: "/pages/result/result" });
}
</script>

<style lang="scss" scoped>
.header {
  text-align: center;
  padding: 32rpx 20rpx;
  margin-bottom: 8rpx;
}

.header-title {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.header-desc {
  font-size: 24rpx;
  color: $text-muted;
}

.search-section {
  margin-bottom: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 48rpx;
  padding: 22rpx 28rpx;
  box-shadow: $shadow-soft;
  margin-bottom: 16rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  height: 48rpx;
}

.clear-btn {
  padding: 8rpx 16rpx;
  color: $text-muted;
}

.search-btn {
  width: 100%;
}

.preview-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: rgba($color-secondary, 0.06);
}

.preview-label {
  font-size: 22rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 12rpx;
}

.segment-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
}

.segment-chip {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-secondary;
}

.segment-arrow {
  margin: 0 8rpx;
  color: $text-muted;
  font-weight: 400;
}

.examples-section {
  margin-bottom: 24rpx;
}

.examples-title {
  font-size: 26rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 14rpx;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.parsed-card {
  margin-bottom: 20rpx;
}

.parsed-top {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.parsed-label {
  font-size: 22rpx;
  color: $text-muted;
  display: block;
}

.parsed-chain {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.parsed-explanation {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.65;
  white-space: pre-line;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.best-card {
  margin-bottom: 24rpx;
  border: 2rpx solid rgba($color-primary, 0.25);
  background: linear-gradient(135deg, rgba($color-primary, 0.06), #fff);
  padding: 32rpx;
}

.best-badge {
  display: inline-block;
  font-size: 22rpx;
  color: #fff;
  background: $color-primary;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.best-title {
  font-size: 48rpx;
  display: block;
  margin-bottom: 8rpx;
}

.best-informal {
  font-size: 28rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: 16rpx;
}

.best-region {
  display: flex;
  gap: 24rpx;
  margin-bottom: 12rpx;
  font-size: 26rpx;

  .north {
    color: $color-north;
  }
  .south {
    color: $color-south;
  }
}

.best-path {
  font-size: 24rpx;
  color: $text-muted;
}

.more-title {
  font-size: 28rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 16rpx;
}

.result-card {
  margin-bottom: 16rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: 600;
}

.result-path {
  font-size: 24rpx;
  color: $text-muted;
}

.suggest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
  margin: 24rpx 0;
}

.retry-btn {
  margin-top: 16rpx;
}
</style>
