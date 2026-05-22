<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <text class="header-emoji">🗺️</text>
      <text class="header-title heading-serif">南北地域称呼差异</text>
      <text class="header-desc">对比北方、南方及标准叫法</text>
    </view>

    <!-- Search -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input 
        class="search-input" 
        placeholder="搜索亲属关系..."
        v-model="searchTerm"
      />
    </view>

    <!-- Comparison Table -->
    <view class="section">
      <text class="section-title">📊 南北称呼对照表</text>
      <view class="table-card card">
        <view class="table-header">
          <text class="table-cell" style="flex: 1.2;">关系</text>
          <text class="table-cell north-cell">北方</text>
          <text class="table-cell south-cell">南方</text>
          <text class="table-cell" style="flex: 1;">标准</text>
        </view>
        <view 
          v-for="(item, index) in filteredComparisons" 
          :key="index"
          class="table-row"
        >
          <text class="table-cell" style="flex: 1.2; font-weight: 500;">{{ item.relation }}</text>
          <view class="table-cell north-cell">
            <text class="region-badge north-badge">{{ item.northern }}</text>
          </view>
          <view class="table-cell south-cell">
            <text class="region-badge south-badge">{{ item.southern }}</text>
          </view>
          <text class="table-cell" style="flex: 1; color: #9D2933; font-weight: 500;">{{ item.standard }}</text>
        </view>
      </view>
    </view>

    <!-- Dialect Regions -->
    <view class="section">
      <text class="section-title">🎭 方言区特色称谓</text>
      <view class="dialect-grid">
        <view 
          v-for="(region, index) in DIALECT_REGIONS" 
          :key="index"
          class="dialect-card card"
          :class="{ expanded: expandedRegion === index }"
          @tap="toggleRegion(index)"
        >
          <view class="dialect-header">
            <text class="dialect-title">{{ region.region }}</text>
            <text class="dialect-toggle">{{ expandedRegion === index ? '收起' : '展开' }}</text>
          </view>
          <view class="dialect-features">
            <view 
              v-for="(feature, i) in visibleFeatures(region, index)" 
              :key="i"
              class="feature-item"
            >
              <text class="feature-dot">•</text>
              <text class="feature-text">{{ feature }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { REGION_COMPARISONS, DIALECT_REGIONS } from '@/common/data.js';

const searchTerm = ref('');
const expandedRegion = ref(null);

const filteredComparisons = computed(() => {
  if (!searchTerm.value) return REGION_COMPARISONS;
  const q = searchTerm.value.toLowerCase();
  return REGION_COMPARISONS.filter(item => 
    item.relation.includes(q) || 
    item.northern.includes(q) || 
    item.southern.includes(q)
  );
});

function toggleRegion(index) {
  expandedRegion.value = expandedRegion.value === index ? null : index;
}

function visibleFeatures(region, index) {
  if (expandedRegion.value === index) return region.features;
  return region.features.slice(0, 4);
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

.header-emoji {
  font-size: 48rpx;
  display: block;
  margin-bottom: 10rpx;
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

.search-box {
  margin-bottom: 30rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 20rpx;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.table-header {
  display: flex;
  padding: 20rpx 16rpx;
  background: rgba($color-primary, 0.05);
  font-weight: 600;
  font-size: 24rpx;
  color: $text-primary;
}

.table-row {
  display: flex;
  padding: 20rpx 16rpx;
  border-top: 2rpx solid $border-color;
  font-size: 26rpx;
  color: $text-secondary;
}

.table-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.north-cell {
  color: #0EA5E9;
}

.south-cell {
  color: #D97706;
}

.region-badge {
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.north-badge {
  background: rgba(14, 165, 233, 0.1);
  color: #0EA5E9;
}

.south-badge {
  background: rgba(217, 119, 6, 0.1);
  color: #D97706;
}

.dialect-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dialect-card {
  padding: 24rpx;
}

.dialect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.dialect-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.dialect-toggle {
  font-size: 24rpx;
  color: $color-primary;
}

.dialect-features {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.feature-dot {
  font-size: 32rpx;
  color: $color-primary;
  line-height: 1;
}

.feature-text {
  font-size: 26rpx;
  color: $text-secondary;
}
</style>
