<template>
  <view class="container">
    <view class="hero page-hero animate-slide-up">
      <view class="hero-badge">
        <text class="hero-badge-text">🏮 已收录 {{ stats.total }} 条称谓</text>
      </view>
      <text class="hero-title heading-serif">中华宗亲\n称谓图谱</text>
      <text class="hero-desc">自然语言问称呼，关系链智能解析，南北差异一目了然</text>

      <view class="hero-search" @tap="goToQuery">
        <text class="hero-search-icon">🔍</text>
        <text class="hero-search-placeholder">试试：爸爸的弟弟的儿子叫什么？</text>
      </view>

      <view class="hero-actions">
        <button class="btn-primary hero-btn" @tap="goToQuery">
          <text>智能查询</text>
        </button>
        <button class="btn-outline hero-btn" @tap="goToTree">
          <text>族谱图谱</text>
        </button>
      </view>
    </view>

    <view class="quick-row">
      <view
        v-for="item in quickEntries"
        :key="item.label"
        class="quick-item card card-hover"
        @tap="item.action"
      >
        <text class="quick-emoji">{{ item.emoji }}</text>
        <text class="quick-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title heading-serif">数据概览</text>
      <view class="stats-card card">
        <view class="stats-row">
          <view class="stats-item">
            <text class="stats-num heading-serif">{{ stats.total }}</text>
            <text class="stats-label">称谓条目</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif">{{ stats.categories }}</text>
            <text class="stats-label">分类模块</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif">16</text>
            <text class="stats-label">南北对照</text>
          </view>
          <view class="stats-item">
            <text class="stats-num heading-serif">6</text>
            <text class="stats-label">方言区域</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title heading-serif">热门查询</text>
      <view class="example-list">
        <view
          v-for="(q, i) in examples"
          :key="i"
          class="chip"
          @tap="goToQueryWith(q)"
        >
          <text>{{ q }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title heading-serif">使用指南</text>
      <view class="guide-card card">
        <view class="guide-step" v-for="(step, i) in steps" :key="i">
          <view class="guide-num">{{ i + 1 }}</view>
          <view>
            <text class="guide-title">{{ step.title }}</text>
            <text class="guide-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getStats } from "@/common/data.js";
import { smartNavigate, goQuery } from "@/utils/nav.js";
import { useTabBar } from "@/composables/useTabBar.js";

useTabBar(0);

const stats = ref({ total: 0, categories: 0 });

const quickEntries = [
  { label: "分类", emoji: "📂", action: () => uni.switchTab({ url: "/pages/categories/categories" }) },
  { label: "族谱", emoji: "🌳", action: () => uni.switchTab({ url: "/pages/tree/tree" }) },
  { label: "速查", emoji: "📋", action: () => uni.switchTab({ url: "/pages/quickref/quickref" }) },
  { label: "地域", emoji: "🗺️", action: () => smartNavigate("/pages/regional/regional") },
];

const examples = [
  "爸爸的哥哥叫什么",
  "妈妈的弟弟的儿子",
  "妻子的姐姐的丈夫",
  "老公的弟弟的老婆",
  "女儿的丈夫的父母",
];

const steps = [
  { title: "描述关系", desc: "用「的」连接，如「爸爸的弟弟的儿子」" },
  { title: "智能解析", desc: "自动推导关系链，匹配标准称谓" },
  { title: "查看结果", desc: "书面语、口语、南北差异一次呈现" },
];

onMounted(() => {
  const s = getStats();
  stats.value = { total: s.total, categories: Object.keys(s.byCategory).length };
});

function goToQuery() {
  uni.switchTab({ url: "/pages/query/query" });
}

function goToTree() {
  uni.switchTab({ url: "/pages/tree/tree" });
}

function goToQueryWith(query) {
  goQuery(query);
}
</script>

<style lang="scss" scoped>
.hero {
  text-align: center;
  padding: 48rpx 28rpx 36rpx;
}

.hero-badge {
  display: inline-flex;
  padding: 12rpx 24rpx;
  background: rgba($color-primary, 0.1);
  border-radius: 40rpx;
  margin-bottom: 24rpx;
}

.hero-badge-text {
  font-size: 24rpx;
  color: $color-primary;
  font-weight: 500;
}

.hero-title {
  font-size: 52rpx;
  line-height: 1.35;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.hero-desc {
  font-size: 26rpx;
  color: $text-muted;
  line-height: 1.6;
  display: block;
  margin-bottom: 28rpx;
}

.hero-search {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 48rpx;
  padding: 22rpx 32rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  text-align: left;
}

.hero-search-icon {
  font-size: 32rpx;
}

.hero-search-placeholder {
  font-size: 26rpx;
  color: #b8b3ab;
  flex: 1;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.hero-btn {
  padding: 22rpx 44rpx;
  font-size: 28rpx;
}

.quick-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 8rpx;
  gap: 8rpx;
}

.quick-emoji {
  font-size: 40rpx;
}

.quick-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.section {
  margin-bottom: 36rpx;
}

.section-title {
  font-size: 34rpx;
  color: $text-primary;
  display: block;
  margin-bottom: 20rpx;
}

.stats-card {
  padding: 36rpx 16rpx;
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
  font-size: 44rpx;
  font-weight: 700;
  color: $color-primary;
}

.stats-label {
  font-size: 22rpx;
  color: $text-muted;
  margin-top: 6rpx;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.guide-card {
  padding: 32rpx;
}

.guide-step {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.guide-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.12);
  color: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.guide-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 6rpx;
}

.guide-desc {
  font-size: 24rpx;
  color: $text-muted;
  line-height: 1.5;
}
</style>
