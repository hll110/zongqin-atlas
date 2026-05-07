<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="header-badge">
        <text class="header-badge-text">✨ AI 智能解析</text>
      </view>
      <text class="header-title heading-serif">亲属称呼智能查询</text>
      <text class="header-desc">用自然语言描述关系，自动输出标准称呼</text>
    </view>

    <!-- Search Box -->
    <view class="search-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="例如：我是女生，该怎么称呼爸爸的弟弟的儿子？"
          v-model="query"
          @confirm="handleSearch"
        />
        <button v-if="query" class="clear-btn" @tap="clearQuery">✕</button>
      </view>
      <button class="btn-primary search-btn" @tap="handleSearch" :disabled="!query.trim() || isLoading">
        <text v-if="isLoading">⏳ 解析中...</text>
        <text v-else>📤 查询</text>
      </button>
    </view>

    <!-- Examples -->
    <view v-if="!hasSearched" class="examples-section">
      <text class="examples-title">试试这些例子</text>
      <view class="examples-list">
        <view v-for="(q, i) in examples" :key="i" class="example-chip" @tap="useExample(q)">
          <text>{{ q }}</text>
        </view>
      </view>
    </view>

    <!-- Loading -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-icon">
        <text class="loading-emoji">✨</text>
      </view>
      <text class="loading-text">正在解析关系...</text>
    </view>

    <!-- Results -->
    <view v-if="result && !isLoading" class="results-section">
      <!-- Parsed Info -->
      <view class="parsed-card card">
        <view class="parsed-header">
          <text class="parsed-icon">✨</text>
          <view>
            <text class="parsed-label">关系链解析</text>
            <text class="parsed-chain">{{ result.parsed.keywords.join(' → ') }}</text>
          </view>
        </view>
        <text v-if="result.explanation" class="parsed-explanation">{{ result.explanation }}</text>
      </view>

      <!-- Result Cards -->
      <view v-for="(item, index) in result.results" :key="item.id" class="result-card card animate-slide-up" :style="{ animationDelay: index * 0.1 + 's' }">
        <view class="result-header">
          <text class="result-title heading-serif">{{ item.formalTitle }}</text>
          <view class="result-tags">
            <text class="tag tag-primary">{{ generationMap[item.generationLevel] }}</text>
            <text class="tag tag-secondary">{{ categoryMap[item.category]?.label }}</text>
          </view>
        </view>

        <view class="result-body">
          <view class="result-grid">
            <view class="result-item">
              <text class="result-item-label">📖 书面语</text>
              <text class="result-item-value">{{ item.formalTitle }}</text>
            </view>
            <view class="result-item">
              <text class="result-item-label">👤 口语</text>
              <text class="result-item-value">{{ item.informalTitle }}</text>
            </view>
            <view class="result-item">
              <text class="result-item-label">🗺️ 地域差异</text>
              <view>
                <text class="region-north">北：{{ item.northernTitle }}</text>
                <text class="region-divider"> | </text>
                <text class="region-south">南：{{ item.southernTitle }}</text>
              </view>
            </view>
          </view>

          <view class="result-path">
            <text class="result-path-label">关系路径：</text>
            <text class="result-path-value">{{ item.relationPath }}</text>
          </view>

          <view v-if="item.description" class="result-desc">
            <text>{{ item.description }}</text>
          </view>

          <view v-if="item.usageNotes" class="result-notes">
            <text>{{ item.usageNotes }}</text>
          </view>

          <view v-if="item.otherVariants" class="result-variants">
            <text class="result-variants-label">其他叫法：</text>
            <text v-for="(v, i) in item.otherVariants" :key="i" class="variant-tag">{{ v }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-if="hasSearched && !isLoading && (!result || result.results.length === 0)" class="empty-state">
      <view class="empty-icon">🔍</view>
      <text class="empty-title">未找到匹配结果</text>
      <text class="empty-text">请尝试用更简单的表达，如"爸爸的哥哥"、"妻子的弟弟"等</text>
      <button class="btn-outline retry-btn" @tap="clearAll">重新查询</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { naturalQuery, CATEGORY_MAP, GENERATION_MAP } from '@/common/data.js';

const query = ref('');
const isLoading = ref(false);
const hasSearched = ref(false);
const result = ref(null);

const examples = [
  "我是女生，该怎么称呼爸爸的弟弟的儿子",
  "妻子的姐姐的丈夫叫什么",
  "我该怎么称呼妈妈的哥哥",
  "老公的弟弟的老婆我应该叫什么",
  "爸爸的爸爸的哥哥怎么称呼",
  "我女儿的丈夫的父母我怎么称呼"
];

const categoryMap = CATEGORY_MAP;
const generationMap = GENERATION_MAP;

onMounted(() => {
  const pending = uni.getStorageSync('pendingQuery');
  if (pending) {
    query.value = pending;
    uni.removeStorageSync('pendingQuery');
    handleSearch();
  }
});

function handleSearch() {
  if (!query.value.trim()) return;
  isLoading.value = true;
  hasSearched.value = true;
  result.value = null;

  // Simulate async for smooth UX
  setTimeout(() => {
    result.value = naturalQuery(query.value);
    isLoading.value = false;
  }, 600);
}

function useExample(q) {
  query.value = q;
  handleSearch();
}

function clearQuery() {
  query.value = '';
}

function clearAll() {
  query.value = '';
  hasSearched.value = false;
  result.value = null;
}
</script>

<style lang="scss" scoped>
.header {
  text-align: center;
  padding: 40rpx 20rpx;
}

.header-badge {
  display: inline-flex;
  padding: 10rpx 20rpx;
  background: rgba($color-primary, 0.1);
  border-radius: 30rpx;
  margin-bottom: 20rpx;
}

.header-badge-text {
  font-size: 24rpx;
  color: $color-primary;
}

.header-title {
  font-size: 40rpx;
  display: block;
  margin-bottom: 12rpx;
}

.header-desc {
  font-size: 26rpx;
  color: $text-muted;
}

.search-section {
  margin-bottom: 30rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  border: none;
  font-size: 28rpx;
  color: $text-primary;
  background: transparent;
  height: 48rpx;
}

.search-input::placeholder {
  color: #B8B3AB;
}

.clear-btn {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  color: $text-muted;
  background: none;
}

.clear-btn::after {
  border: none;
}

.search-btn {
  width: 100%;
}

.examples-section {
  margin-bottom: 30rpx;
}

.examples-title {
  font-size: 28rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 20rpx;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.example-chip {
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: $text-secondary;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.example-chip:active {
  background: rgba($color-primary, 0.1);
  color: $color-primary;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx;
}

.loading-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.loading-emoji {
  font-size: 48rpx;
}

.loading-text {
  font-size: 28rpx;
  color: $text-muted;
}

.results-section {
  animation: fadeIn 0.4s ease;
}

.parsed-card {
  background: rgba($color-primary, 0.05);
  border: 2rpx solid rgba($color-primary, 0.15);
}

.parsed-header {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.parsed-icon {
  font-size: 36rpx;
}

.parsed-label {
  font-size: 24rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 8rpx;
}

.parsed-chain {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.parsed-explanation {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
  white-space: pre-line;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid rgba($color-primary, 0.1);
}

.result-card {
  margin-bottom: 24rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.result-title {
  font-size: 36rpx;
}

.result-tags {
  display: flex;
  gap: 12rpx;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.result-item {
  padding: 20rpx;
  background: $bg-muted;
  border-radius: 12rpx;
  text-align: center;
}

.result-item-label {
  font-size: 22rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 8rpx;
}

.result-item-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.region-north {
  color: $color-north;
  font-weight: 500;
}

.region-south {
  color: $color-south;
  font-weight: 500;
}

.region-divider {
  color: $text-muted;
}

.result-path {
  padding: 16rpx;
  background: rgba($color-primary, 0.03);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.result-path-label {
  font-size: 24rpx;
  color: $text-muted;
}

.result-path-value {
  font-size: 26rpx;
  color: $text-primary;
}

.result-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.result-notes {
  font-size: 26rpx;
  color: $color-primary;
  background: rgba($color-primary, 0.05);
  padding: 16rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.result-variants {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
}

.result-variants-label {
  font-size: 24rpx;
  color: $text-muted;
}

.variant-tag {
  padding: 8rpx 16rpx;
  background: $bg-muted;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: $text-secondary;
}

.retry-btn {
  margin-top: 30rpx;
  padding: 20rpx 60rpx;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
