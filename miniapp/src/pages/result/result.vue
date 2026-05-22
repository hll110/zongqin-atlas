<template>
  <view class="container">
    <view v-if="data" class="detail-card card animate-slide-up">
      <!-- Header -->
      <view class="detail-header">
        <text class="detail-title heading-serif">{{ data.formalTitle }}</text>
        <view class="detail-tags">
          <text class="tag" :style="{ background: getGenColor(data.generationLevel) }">{{ generationMap[data.generationLevel] }}</text>
          <text class="tag" :style="{ background: getCatColor(data.category) }">{{ categoryMap[data.category]?.label }}</text>
          <text class="tag" :style="{ background: getGenderColor(data.gender) }">{{ genderMap[data.gender] }}</text>
        </view>
      </view>

      <!-- Main Info -->
      <view class="info-section">
        <view class="info-row">
          <text class="info-label">📖 书面语</text>
          <text class="info-value primary">{{ data.formalTitle }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">👤 口语</text>
          <text class="info-value">{{ data.informalTitle }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">🗺️ 北方叫法</text>
          <text class="info-value" style="color: #0EA5E9;">{{ data.northernTitle }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">🗺️ 南方叫法</text>
          <text class="info-value" style="color: #D97706;">{{ data.southernTitle }}</text>
        </view>
      </view>

      <!-- Path -->
      <view class="path-section">
        <text class="path-label">关系路径</text>
        <text class="path-value">{{ data.relationPath }}</text>
      </view>

      <!-- Chain -->
      <view v-if="data.relationshipChain && data.relationshipChain.length > 0" class="chain-section">
        <text class="chain-label">关系链</text>
        <view class="chain-flow">
          <view v-for="(step, i) in data.relationshipChain" :key="i" class="chain-step">
            <text class="chain-dot">•</text>
            <text class="chain-text">{{ step }}</text>
            <text v-if="i < data.relationshipChain.length - 1" class="chain-arrow">→</text>
          </view>
        </view>
      </view>

      <!-- Description -->
      <view v-if="data.description" class="desc-section">
        <text class="desc-label">说明</text>
        <text class="desc-text">{{ data.description }}</text>
      </view>

      <!-- Notes -->
      <view v-if="data.usageNotes" class="notes-section">
        <text class="notes-label">💡 备注</text>
        <text class="notes-text">{{ data.usageNotes }}</text>
      </view>

      <!-- Variants -->
      <view v-if="data.otherVariants && data.otherVariants.length > 0" class="variants-section">
        <text class="variants-label">其他叫法</text>
        <view class="variants-list">
          <text v-for="(v, i) in data.otherVariants" :key="i" class="variant-chip">{{ v }}</text>
        </view>
      </view>

      <!-- Actions -->
      <view class="actions">
        <button class="btn-primary action-btn" @tap="copyInfo">
          <text>📋 复制信息</text>
        </button>
        <button class="btn-outline action-btn" @tap="goBack">
          <text>↩ 返回</text>
        </button>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无数据</text>
      <button class="btn-outline" @tap="goBack">返回</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { GENERATION_MAP, GENDER_MAP, CATEGORY_MAP } from '@/common/data.js';

const data = ref(null);
const generationMap = GENERATION_MAP;
const genderMap = GENDER_MAP;
const categoryMap = CATEGORY_MAP;

onMounted(() => {
  const stored = uni.getStorageSync('detailData');
  if (!stored) return;
  if (typeof stored === 'object') {
    data.value = stored;
    return;
  }
  try {
    data.value = JSON.parse(stored);
  } catch {
    data.value = stored;
  }
});

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

function getCatColor(cat) {
  const colors = {
    paternal: '#FEF2F2',
    maternal: '#EFF6FF',
    spouse: '#FDF4FF',
    affinity: '#FFF7ED',
    collateral: '#F8FAFC'
  };
  return colors[cat] || '#F8FAFC';
}

function getGenderColor(g) {
  const colors = {
    male: '#DBEAFE',
    female: '#FCE7F3',
    unisex: '#F3F4F6'
  };
  return colors[g] || '#F3F4F6';
}

function copyInfo() {
  if (!data.value) return;
  const text = `${data.value.relationPath}：书面语"${data.value.formalTitle}"，口语"${data.value.informalTitle}"，北方叫"${data.value.northernTitle}"，南方叫"${data.value.southernTitle}"`;
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    }
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.detail-card {
  padding: 40rpx;
}

.detail-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid $border-color;
}

.detail-title {
  font-size: 48rpx;
  display: block;
  margin-bottom: 20rpx;
}

.detail-tags {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.info-section {
  margin-bottom: 30rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid $border-color;
}

.info-label {
  font-size: 28rpx;
  color: $text-muted;
}

.info-value {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.info-value.primary {
  color: $color-primary;
  font-size: 34rpx;
}

.path-section {
  background: $bg-muted;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.path-label {
  font-size: 24rpx;
  color: $text-muted;
  display: block;
  margin-bottom: 10rpx;
}

.path-value {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.chain-section {
  margin-bottom: 30rpx;
}

.chain-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 16rpx;
}

.chain-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.chain-step {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.chain-dot {
  font-size: 40rpx;
  color: $color-primary;
  line-height: 1;
}

.chain-text {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
  padding: 12rpx 20rpx;
  background: $bg-muted;
  border-radius: 30rpx;
}

.chain-arrow {
  font-size: 28rpx;
  color: $text-muted;
}

.desc-section, .notes-section {
  margin-bottom: 30rpx;
}

.desc-label, .notes-label, .variants-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.desc-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
}

.notes-section {
  background: rgba($color-primary, 0.05);
  padding: 24rpx;
  border-radius: 16rpx;
}

.notes-text {
  font-size: 28rpx;
  color: $color-primary;
  line-height: 1.6;
}

.variants-section {
  margin-bottom: 40rpx;
}

.variants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.variant-chip {
  padding: 12rpx 24rpx;
  background: $bg-muted;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
}

.actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
}

.btn-outline {
  background: transparent;
  border: 2rpx solid $border-color;
  color: $text-primary;
  border-radius: 40rpx;
  padding: 24rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-outline::after {
  border: none;
}
</style>
