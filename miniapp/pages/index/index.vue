<template>
  <view class="container">
    <!-- Hero Section -->
    <view class="hero animate-slide-up">
      <view class="hero-badge">
        <text class="hero-badge-text">🏮 已收录 {{ stats.total }}+ 条亲属称谓</text>
      </view>
      <text class="hero-title heading-serif">中华宗亲\n称谓图谱</text>
      <text class="hero-desc">传承千年礼仪文化，明晰血脉亲缘关系。可视化族谱、智能查询、地域差异对比。</text>
      
      <view class="hero-actions">
        <button class="btn-primary hero-btn" @tap="goToQuery">
          <text>🔍</text>
          <text>智能查询</text>
        </button>
        <button class="btn-outline hero-btn" @tap="goToTree">
          <text>🌳</text>
          <text>族谱图谱</text>
        </button>
      </view>
    </view>

    <!-- Features Grid -->
    <view class="section">
      <text class="section-title heading-serif">五大核心功能</text>
      <view class="feature-grid">
        <view v-for="(item, index) in features" :key="index" class="feature-card card card-hover" @tap="navigateTo(item.path)">
          <view class="feature-icon" :style="{ background: item.bg }">
            <text class="feature-emoji">{{ item.emoji }}</text>
          </view>
          <text class="feature-title">{{ item.title }}</text>
          <text class="feature-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- Stats -->
    <view class="section">
      <view class="stats-card card">
        <view class="stats-row">
          <view class="stats-item">
            <text class="stats-num heading-serif" style="color: #9D2933;">{{ stats.total }}</text>
            <text class="stats-label">收录称谓</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif" style="color: #4A5742;">{{ stats.categories }}</text>
            <text class="stats-label">分类模块</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif" style="color: #D97706;">5</text>
            <text class="stats-label">辈分层次</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif" style="color: #0EA5E9;">3</text>
            <text class="stats-label">地域对比</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Quick Start -->
    <view class="section">
      <text class="section-title heading-serif">如何称呼TA？</text>
      <view class="guide-card card">
        <view class="guide-step">
          <view class="guide-num">1</view>
          <view>
            <text class="guide-title">输入关系描述</text>
            <text class="guide-desc">例如："我是女生，该怎么称呼爸爸的弟弟的儿子？"</text>
          </view>
        </view>
        <view class="guide-step">
          <view class="guide-num">2</view>
          <view>
            <text class="guide-title">AI智能解析</text>
            <text class="guide-desc">系统自动解析关系链，计算正确称谓</text>
          </view>
        </view>
        <view class="guide-step">
          <view class="guide-num">3</view>
          <view>
            <text class="guide-title">查看完整结果</text>
            <text class="guide-desc">标准称呼 + 关系说明 + 辈分信息 + 地域差异</text>
          </view>
        </view>
        <button class="btn-primary guide-btn" @tap="goToQuery">
          <text>🔍 试试智能查询</text>
        </button>
      </view>
    </view>

    <!-- Example Queries -->
    <view class="section">
      <text class="section-title heading-serif">热门查询</text>
      <view class="example-list">
        <view v-for="(q, i) in examples" :key="i" class="example-tag" @tap="goToQueryWith(q)">
          <text>{{ q }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStats } from '@/common/data.js';

const stats = ref({ total: 0, categories: 0 });

const features = [
  { title: '族谱图谱', desc: '可拖拽缩放交互式族谱树', emoji: '🌳', bg: 'rgba(157,41,51,0.1)', path: '/pages/tree/tree' },
  { title: '智能查询', desc: '自然语言查询亲属称呼', emoji: '🔍', bg: 'rgba(74,87,66,0.1)', path: '/pages/query/query' },
  { title: '分类浏览', desc: '五大模块分类图谱', emoji: '📊', bg: 'rgba(217,119,6,0.1)', path: '/pages/categories/categories' },
  { title: '地域差异', desc: '南北称呼差异对比', emoji: '🗺️', bg: 'rgba(14,165,233,0.1)', path: '/pages/regional/regional' },
  { title: '速查表', desc: '常用称谓一键截图', emoji: '📋', bg: 'rgba(236,72,153,0.1)', path: '/pages/quickref/quickref' },
  { title: '更多功能', desc: '持续更新中', emoji: '✨', bg: 'rgba(139,92,246,0.1)', path: '/pages/categories/categories' }
];

const examples = [
  "爸爸的哥哥叫什么",
  "妻子的姐姐的丈夫",
  "妈妈的弟弟的儿子",
  "老公的弟弟的老婆",
  "爸爸的爷爷怎么叫",
  "女儿丈夫的父母"
];

onMounted(() => {
  const s = getStats();
  stats.value = {
    total: s.total,
    categories: Object.keys(s.byCategory).length
  };
});

function navigateTo(path) {
  uni.navigateTo({ url: path });
}

function goToQuery() {
  uni.switchTab({ url: '/pages/query/query' });
}

function goToTree() {
  uni.switchTab({ url: '/pages/tree/tree' });
}

function goToQueryWith(query) {
  uni.setStorageSync('pendingQuery', query);
  uni.switchTab({ url: '/pages/query/query' });
}
</script>

<style lang="scss" scoped>
.hero {
  text-align: center;
  padding: 60rpx 30rpx;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 24rpx;
  background: rgba($color-primary, 0.1);
  border-radius: 40rpx;
  margin-bottom: 30rpx;
}

.hero-badge-text {
  font-size: 24rpx;
  color: $color-primary;
  font-weight: 500;
}

.hero-title {
  font-size: 56rpx;
  line-height: 1.3;
  color: $text-primary;
  margin-bottom: 24rpx;
  display: block;
}

.hero-desc {
  font-size: 28rpx;
  color: $text-muted;
  line-height: 1.6;
  display: block;
  max-width: 600rpx;
  margin: 0 auto 40rpx;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.hero-btn {
  padding: 24rpx 40rpx;
  font-size: 28rpx;
}

.btn-outline {
  background: transparent;
  border: 2rpx solid $border-color;
  color: $text-primary;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.btn-outline::after {
  border: none;
}

.btn-outline:active {
  background: $bg-muted;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 36rpx;
  color: $text-primary;
  display: block;
  margin-bottom: 24rpx;
  padding-left: 10rpx;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30rpx;
}

.feature-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.feature-emoji {
  font-size: 36rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 10rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.4;
}

.stats-card {
  padding: 40rpx 20rpx;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 48rpx;
  font-weight: 700;
}

.stats-label {
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
}

.guide-card {
  padding: 40rpx;
}

.guide-step {
  display: flex;
  gap: 24rpx;
  margin-bottom: 30rpx;
}

.guide-num {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.guide-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.guide-desc {
  font-size: 26rpx;
  color: $text-muted;
  line-height: 1.5;
}

.guide-btn {
  margin-top: 20rpx;
  width: 100%;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.example-tag {
  padding: 16rpx 24rpx;
  background: $bg-muted;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: $text-secondary;
  transition: all 0.2s;
}

.example-tag:active {
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  transform: scale(0.95);
}
</style>
