<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="header-top">
        <view>
          <text class="header-title heading-serif">亲属关系速查表</text>
          <text class="header-desc">常用称谓对照，长按可复制</text>
        </view>
        <button class="capture-btn" @tap="showCaptureTips">
          <text>📸</text>
        </button>
      </view>

      <!-- Category Filter -->
      <view class="filter-chips">
        <view 
          class="filter-chip"
          :class="{ active: activeTable === null }"
          @tap="setTable(null)"
        >
          <text>全部</text>
        </view>
        <view 
          v-for="(table, index) in REFERENCE_TABLES" 
          :key="index"
          class="filter-chip"
          :class="{ active: activeTable === index }"
          @tap="setTable(index)"
        >
          <text>{{ table.title }}</text>
        </view>
      </view>
    </view>

    <!-- Tables -->
    <view class="tables">
      <view 
        v-for="(table, tIndex) in visibleTables" 
        :key="tIndex"
        class="table-section"
      >
        <view class="table-header-bar">
          <text class="table-title">{{ table.title }}</text>
          <text class="table-count">{{ table.rows.length }}条</text>
        </view>
        
        <view class="table-card card">
          <view class="ref-table">
            <view class="ref-header">
              <text class="ref-cell" style="flex: 1.5;">关系</text>
              <text class="ref-cell">书面语</text>
              <text class="ref-cell">口语</text>
              <text class="ref-cell north-header">北方</text>
              <text class="ref-cell south-header">南方</text>
            </view>
            <view 
              v-for="(row, rIndex) in table.rows" 
              :key="rIndex"
              class="ref-row"
              @longpress="copyRow(row)"
            >
              <text class="ref-cell" style="flex: 1.5; font-weight: 500;">{{ row.relation }}</text>
              <text class="ref-cell" style="color: #9D2933; font-weight: 500;">{{ row.formal }}</text>
              <text class="ref-cell">{{ row.informal }}</text>
              <text class="ref-cell" style="color: #0EA5E9;">{{ row.northern }}</text>
              <text class="ref-cell" style="color: #D97706;">{{ row.southern }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Tips -->
    <view class="tips">
      <text class="tips-text">💡 长按任意行可复制该称谓信息</text>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text>中华宗亲称谓图谱 | 传承千年礼仪文化</text>
      <text>数据仅供参考，各地习俗可能存在差异</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { REFERENCE_TABLES } from '@/common/data.js';
import { useTabBar } from '@/composables/useTabBar.js';

useTabBar(4);

const activeTable = ref(null);

const visibleTables = computed(() => {
  if (activeTable.value === null) return REFERENCE_TABLES;
  return [REFERENCE_TABLES[activeTable.value]];
});

function setTable(index) {
  activeTable.value = activeTable.value === index ? null : index;
}

function copyRow(row) {
  const text = `${row.relation}：书面语"${row.formal}"，口语"${row.informal}"，北方叫"${row.northern}"，南方叫"${row.southern}"`;
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    }
  });
}

function showCaptureTips() {
  uni.showModal({
    title: '截图提示',
    content: '请使用手机的截图功能（通常是电源键+音量键）来保存速查表。截图后可以在相册中查看和分享。',
    showCancel: false
  });
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.header {
  margin-bottom: 20rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.capture-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  padding: 0;
}

.capture-btn::after {
  border: none;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-chip {
  padding: 12rpx 24rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.filter-chip.active {
  background: $color-primary;
  color: #FFFFFF;
}

.tables {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.table-section {
  animation: fadeIn 0.4s ease;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 0 10rpx;
}

.table-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.table-count {
  font-size: 24rpx;
  color: $text-muted;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.ref-table {
  width: 100%;
}

.ref-header {
  display: flex;
  padding: 20rpx 16rpx;
  background: rgba($color-primary, 0.05);
  font-weight: 600;
  font-size: 24rpx;
  color: $text-primary;
}

.ref-row {
  display: flex;
  padding: 20rpx 16rpx;
  border-top: 2rpx solid $border-color;
  font-size: 26rpx;
  color: $text-secondary;
}

.ref-row:active {
  background: rgba($color-primary, 0.03);
}

.ref-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4rpx;
}

.north-header {
  color: #0EA5E9;
}

.south-header {
  color: #D97706;
}

.tips {
  text-align: center;
  padding: 40rpx 20rpx;
}

.tips-text {
  font-size: 26rpx;
  color: $text-muted;
}

.footer {
  text-align: center;
  padding: 40rpx 20rpx;
  border-top: 2rpx solid $border-color;
  margin-top: 20rpx;
}

.footer text {
  display: block;
  font-size: 22rpx;
  color: $text-muted;
  margin-bottom: 8rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
