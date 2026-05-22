<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <text class="header-title heading-serif">亲属分类图谱</text>
      <text class="header-desc">五大模块分类浏览所有亲属称谓</text>
    </view>

    <!-- Category Tabs -->
    <view class="category-tabs">
      <view 
        v-for="cat in categories" 
        :key="cat.id"
        class="category-tab"
        :class="{ active: activeCategory === cat.id }"
        :style="activeCategory === cat.id ? { background: cat.color, color: '#fff' } : {}"
        @tap="setCategory(cat.id)"
      >
        <text class="tab-emoji">{{ cat.emoji }}</text>
        <text class="tab-label">{{ cat.label }}</text>
        <text class="tab-count">{{ getCount(cat.id) }}条</text>
      </view>
    </view>

    <!-- Generation Filter -->
    <scroll-view class="gen-filter" scroll-x show-scrollbar="false">
      <view class="gen-list">
        <view 
          class="gen-chip"
          :class="{ active: activeGeneration === null }"
          @tap="setGeneration(null)"
        >
          <text>全部辈分</text>
        </view>
        <view 
          v-for="gen in generations" 
          :key="gen.id"
          class="gen-chip"
          :class="{ active: activeGeneration === gen.id }"
          @tap="setGeneration(gen.id)"
        >
          <text>{{ gen.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Results -->
    <view class="results">
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>
      
      <view v-else-if="results.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">该分类下暂无数据</text>
      </view>
      
      <view v-else class="card-list">
        <view 
          v-for="(item, index) in results" 
          :key="item.id"
          class="card result-card animate-slide-up"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @tap="goToDetail(item)"
        >
          <view class="result-header">
            <view>
              <text class="result-title heading-serif">{{ item.formalTitle }}</text>
              <text class="result-path">{{ item.relationPath }}</text>
            </view>
            <view class="result-tags">
              <text class="tag" :style="{ background: getGenColor(item.generationLevel) }">{{ generationMap[item.generationLevel] }}</text>
              <text class="tag" :style="{ background: getGenderColor(item.gender) }">{{ genderMap[item.gender] }}</text>
            </view>
          </view>
          
          <view class="result-grid">
            <view class="result-cell">
              <text class="cell-label">书面</text>
              <text class="cell-value">{{ item.formalTitle }}</text>
            </view>
            <view class="result-cell">
              <text class="cell-label">口语</text>
              <text class="cell-value">{{ item.informalTitle }}</text>
            </view>
            <view class="result-cell">
              <text class="cell-label">北方</text>
              <text class="cell-value" style="color: #0EA5E9;">{{ item.northernTitle }}</text>
            </view>
          </view>
          
          <view v-if="item.southernTitle !== item.northernTitle" class="south-tag">
            <text>南方叫法：{{ item.southernTitle }}</text>
          </view>
          
          <view v-if="item.description" class="result-desc">
            <text>{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getByCategory, getStats, GENERATION_MAP, GENDER_MAP, CATEGORY_MAP } from '@/common/data.js';
import { useTabBar } from '@/composables/useTabBar.js';

useTabBar(1);

const categories = [
  { id: 'paternal', label: '父系亲属', emoji: '👨‍👩‍👧', color: '#DC2626' },
  { id: 'maternal', label: '母系亲属', emoji: '👨‍👩‍👦', color: '#2563EB' },
  { id: 'spouse', label: '夫妻亲属', emoji: '💑', color: '#9333EA' },
  { id: 'affinity', label: '姻亲', emoji: '💒', color: '#EA580C' },
  { id: 'collateral', label: '旁系亲属', emoji: '🌿', color: '#64748B' }
];

const generations = [
  { id: 'ancestor', label: '祖辈' },
  { id: 'elder', label: '父辈' },
  { id: 'peer', label: '平辈' },
  { id: 'junior', label: '子辈' },
  { id: 'descendant', label: '孙辈' }
];

const activeCategory = ref('paternal');
const activeGeneration = ref(null);
const loading = ref(false); // 保留占位，列表为同步计算

const generationMap = GENERATION_MAP;
const genderMap = GENDER_MAP;

const stats = computed(() => getStats());

const results = computed(() => {
  return getByCategory(activeCategory.value, activeGeneration.value);
});

function getCount(cat) {
  const s = getStats();
  return s.byCategory[cat] || 0;
}

function setCategory(cat) {
  activeCategory.value = cat;
  activeGeneration.value = null;
}

function setGeneration(gen) {
  activeGeneration.value = gen;
}

function getGenColor(gen) {
  const colors = {
    ancestor: '#FEF2F2',
    elder: '#FFF7ED',
    peer: '#F0FDF4',
    junior: '#EFF6FF',
    descendant: '#FDF4FF'
  };
  return colors[gen] || '#F8FAFC';
}

function getGenderColor(g) {
  const colors = {
    male: '#DBEAFE',
    female: '#FCE7F3',
    unisex: '#F3F4F6'
  };
  return colors[g] || '#F3F4F6';
}

function goToDetail(item) {
  uni.setStorageSync('detailData', item);
  uni.navigateTo({ url: '/pages/result/result' });
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 36rpx;
  display: block;
  margin-bottom: 10rpx;
}

.header-desc {
  font-size: 26rpx;
  color: $text-muted;
}

.category-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.category-tab.active {
  transform: scale(0.98);
}

.tab-emoji {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.tab-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.tab-count {
  font-size: 22rpx;
  color: $text-muted;
}

.gen-filter {
  margin-bottom: 24rpx;
}

.gen-list {
  display: flex;
  gap: 16rpx;
  padding: 0 10rpx;
}

.gen-chip {
  padding: 12rpx 28rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.gen-chip.active {
  background: $color-primary;
  color: #FFFFFF;
}

.results {
  min-height: 400rpx;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-card {
  padding: 24rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 32rpx;
  display: block;
  margin-bottom: 8rpx;
}

.result-path {
  font-size: 24rpx;
  color: $text-muted;
}

.result-tags {
  display: flex;
  gap: 10rpx;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.result-cell {
  padding: 16rpx;
  background: $bg-muted;
  border-radius: 12rpx;
  text-align: center;
}

.cell-label {
  font-size: 22rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 6rpx;
}

.cell-value {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

.south-tag {
  padding: 12rpx 16rpx;
  background: rgba(217, 119, 6, 0.1);
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: #D97706;
  text-align: center;
}

.result-desc {
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx;
  gap: 20rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid $border-color;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
