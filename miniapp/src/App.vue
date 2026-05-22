<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import "uni.scss";

page {
  background-color: $bg-primary;
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
}

/* 全局容器（为自定义 tabBar 预留底部空间） */
.container {
  padding: 20rpx;
  padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
  background-color: $bg-primary;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-hero {
  background: linear-gradient(180deg, rgba(157, 41, 51, 0.06) 0%, transparent 100%);
  border-radius: 24rpx;
  margin-bottom: 24rpx;
}

/* 卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 标题 */
.heading-serif {
  font-weight: 700;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

/* 文本 */
.text-primary { color: $color-primary; }
.text-secondary { color: $color-secondary; }
.text-muted { color: $text-muted; }
.text-dark { color: $text-primary; }

/* 按钮 */
.btn-primary {
  background: linear-gradient(135deg, $color-primary, darken($color-primary, 10%));
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.btn-primary::after {
  border: none;
}

.btn-primary:active {
  opacity: 0.85;
}

.btn-outline {
  background: transparent;
  border: 2rpx solid $border-color;
  color: $text-primary;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.btn-outline::after {
  border: none;
}

.btn-outline:active {
  background: $bg-muted;
}

.chip {
  padding: 14rpx 26rpx;
  background: #fff;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: $text-secondary;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid $border-color;
}

.chip:active,
.chip--active {
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  border-color: rgba($color-primary, 0.25);
}

.confidence-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.confidence-badge--high {
  background: rgba($color-secondary, 0.12);
  color: $color-secondary;
}

.confidence-badge--medium {
  background: rgba($color-accent, 0.2);
  color: #8b6914;
}

.confidence-badge--low {
  background: $bg-muted;
  color: $text-muted;
}

/* 标签 */
.tag {
  display: inline-flex;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.tag-primary {
  background: rgba($color-primary, 0.1);
  color: $color-primary;
}

.tag-secondary {
  background: rgba($color-secondary, 0.1);
  color: $color-secondary;
}

.tag-amber {
  background: rgba(217, 119, 6, 0.1);
  color: #D97706;
}

.tag-sky {
  background: rgba(14, 165, 233, 0.1);
  color: #0EA5E9;
}

/* 间距 */
.mt-1 { margin-top: 10rpx; }
.mt-2 { margin-top: 20rpx; }
.mt-3 { margin-top: 30rpx; }
.mb-1 { margin-bottom: 10rpx; }
.mb-2 { margin-bottom: 20rpx; }
.mb-3 { margin-bottom: 30rpx; }

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

/* 搜索结果高亮 */
.highlight {
  background: rgba($color-primary, 0.15);
  color: $color-primary;
  border-radius: 4rpx;
  padding: 0 4rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba($color-primary, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  font-size: 60rpx;
}

.empty-text {
  color: $text-muted;
  font-size: 28rpx;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  gap: 16rpx;
}

.search-icon {
  font-size: 32rpx;
  color: $text-muted;
}

.search-input {
  flex: 1;
  border: none;
  font-size: 28rpx;
  color: $text-primary;
  background: transparent;
}

.search-input::placeholder {
  color: #B8B3AB;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;
  border-radius: 16rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 16rpx;
}

/* 列表项 */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.list-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.list-item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

/* 关系链展示 */
.relation-chain {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.relation-chain-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.relation-chain-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: $color-primary;
}

.relation-chain-arrow {
  color: $text-muted;
  font-size: 24rpx;
}

/* 表格 */
.data-table {
  width: 100%;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.data-table-header {
  display: flex;
  background: rgba($color-primary, 0.05);
  padding: 20rpx 16rpx;
  font-weight: 600;
  font-size: 24rpx;
  color: $text-primary;
}

.data-table-row {
  display: flex;
  padding: 20rpx 16rpx;
  border-top: 1rpx solid #F0EBE3;
  font-size: 26rpx;
  color: $text-secondary;
}

.data-table-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $color-primary;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba($color-primary, 0.3);
  z-index: 100;
}

.fab::after {
  border: none;
}

.fab:active {
  transform: scale(0.92);
}

/* 族谱节点 */
.tree-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.tree-node-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  border: 4rpx solid;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.tree-node-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
