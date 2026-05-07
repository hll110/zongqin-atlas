<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <text class="header-title heading-serif">可视化族谱图谱</text>
      <text class="header-desc">拖拽移动，双指缩放，点击节点查看详情</text>
    </view>

    <!-- Category Filter -->
    <scroll-view class="filter-bar" scroll-x show-scrollbar="false">
      <view class="filter-list">
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          class="filter-chip"
          :class="{ active: activeCategory === cat.id }"
          :style="activeCategory === cat.id ? { background: cat.color, color: '#fff' } : {}"
          @tap="setCategory(cat.id)"
        >
          <text>{{ cat.emoji }} {{ cat.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Tree Canvas -->
    <view class="tree-container">
      <canvas 
        type="2d" 
        id="treeCanvas" 
        class="tree-canvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @tap="handleTap"
      ></canvas>
      
      <!-- Node Detail Popup -->
      <view v-if="selectedNode" class="node-popup animate-fade-in">
        <view class="node-popup-content">
          <view class="node-popup-header">
            <text class="node-popup-title heading-serif">{{ selectedNode.title }}</text>
            <button class="node-popup-close" @tap="closePopup">✕</button>
          </view>
          <view class="node-popup-body">
            <view class="node-info-row">
              <text class="node-info-label">关系：</text>
              <text class="node-info-value">{{ selectedNode.title }}</text>
            </view>
            <view class="node-info-row">
              <text class="node-info-label">类别：</text>
              <text class="node-info-value">{{ getCategoryLabel(selectedNode.category) }}</text>
            </view>
            <view class="node-info-row">
              <text class="node-info-label">辈分：</text>
              <text class="node-info-value">{{ getGenerationLabel(selectedNode.generation) }}</text>
            </view>
            <view class="node-info-row">
              <text class="node-info-label">性别：</text>
              <text class="node-info-value">{{ getGenderLabel(selectedNode.gender) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Controls -->
    <view class="controls">
      <button class="control-btn" @tap="zoomIn">🔍+</button>
      <button class="control-btn" @tap="zoomOut">🔍-</button>
      <button class="control-btn" @tap="resetView">↺</button>
    </view>

    <!-- Legend -->
    <view class="legend">
      <view v-for="cat in categories.slice(0, 4)" :key="cat.id" class="legend-item">
        <view class="legend-dot" :style="{ background: cat.color }"></view>
        <text class="legend-text">{{ cat.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onReady } from 'vue';

const categories = [
  { id: 'all', label: '全部', emoji: '🌈', color: '#9D2933' },
  { id: 'paternal', label: '父系', emoji: '🔴', color: '#DC2626' },
  { id: 'maternal', label: '母系', emoji: '🔵', color: '#2563EB' },
  { id: 'spouse', label: '配偶', emoji: '💜', color: '#9333EA' },
  { id: 'affinity', label: '姻亲', emoji: '🟠', color: '#EA580C' }
];

const activeCategory = ref('all');
const selectedNode = ref(null);

// Tree data
const treeData = {
  id: 'self',
  label: '我',
  title: '自己',
  x: 375,
  y: 600,
  generation: 0,
  category: 'self',
  gender: 'unisex',
  children: [
    {
      id: 'father',
      label: '父',
      title: '父亲',
      x: 250,
      y: 450,
      generation: -1,
      category: 'paternal',
      gender: 'male',
      children: [
        { id: 'grandfather-p', label: '祖父', title: '祖父', x: 180, y: 300, generation: -2, category: 'paternal', gender: 'male' },
        { id: 'grandmother-p', label: '祖母', title: '祖母', x: 320, y: 300, generation: -2, category: 'paternal', gender: 'female' },
        { id: 'uncle1', label: '伯', title: '伯父', x: 80, y: 450, generation: -1, category: 'paternal', gender: 'male' },
        { id: 'uncle2', label: '叔', title: '叔父', x: 420, y: 450, generation: -1, category: 'paternal', gender: 'male' },
        { id: 'aunt-p', label: '姑', title: '姑母', x: 500, y: 450, generation: -1, category: 'paternal', gender: 'female' }
      ]
    },
    {
      id: 'mother',
      label: '母',
      title: '母亲',
      x: 500,
      y: 450,
      generation: -1,
      category: 'maternal',
      gender: 'female',
      children: [
        { id: 'grandfather-m', label: '外祖', title: '外祖父', x: 430, y: 300, generation: -2, category: 'maternal', gender: 'male' },
        { id: 'grandmother-m', label: '外祖母', title: '外祖母', x: 570, y: 300, generation: -2, category: 'maternal', gender: 'female' },
        { id: 'uncle-m', label: '舅', title: '舅父', x: 620, y: 450, generation: -1, category: 'maternal', gender: 'male' },
        { id: 'aunt-m', label: '姨', title: '姨母', x: 700, y: 450, generation: -1, category: 'maternal', gender: 'female' }
      ]
    },
    {
      id: 'spouse-m',
      label: '夫',
      title: '丈夫',
      x: 500,
      y: 600,
      generation: 0,
      category: 'spouse',
      gender: 'male'
    },
    {
      id: 'spouse-f',
      label: '妻',
      title: '妻子',
      x: 250,
      y: 600,
      generation: 0,
      category: 'spouse',
      gender: 'female'
    },
    {
      id: 'brother1',
      label: '兄',
      title: '哥哥',
      x: 120,
      y: 600,
      generation: 0,
      category: 'paternal',
      gender: 'male'
    },
    {
      id: 'brother2',
      label: '弟',
      title: '弟弟',
      x: 630,
      y: 600,
      generation: 0,
      category: 'paternal',
      gender: 'male'
    },
    {
      id: 'son',
      label: '子',
      title: '儿子',
      x: 300,
      y: 750,
      generation: 1,
      category: 'paternal',
      gender: 'male'
    },
    {
      id: 'daughter',
      label: '女',
      title: '女儿',
      x: 450,
      y: 750,
      generation: 1,
      category: 'paternal',
      gender: 'female'
    }
  ]
};

const categoryColors = {
  paternal: '#DC2626',
  maternal: '#2563EB',
  spouse: '#9333EA',
  affinity: '#EA580C',
  self: '#16A34A',
  collateral: '#64748B'
};

let canvas = null;
let ctx = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastTouch = null;
let nodes = [];

function getAllNodes(node) {
  const result = [node];
  if (node.children) {
    node.children.forEach(child => {
      result.push(...getAllNodes(child));
    });
  }
  return result;
}

function getAllEdges(node) {
  const edges = [];
  if (node.children) {
    node.children.forEach(child => {
      edges.push({ from: node, to: child });
      edges.push(...getAllEdges(child));
    });
  }
  return edges;
}

function drawTree() {
  if (!ctx) return;
  
  const dpr = uni.getSystemInfoSync().pixelRatio;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  
  const allNodes = getAllNodes(treeData);
  const allEdges = getAllEdges(treeData);
  
  // Draw edges
  ctx.strokeStyle = '#E8E2D6';
  ctx.lineWidth = 2;
  allEdges.forEach(edge => {
    ctx.beginPath();
    ctx.moveTo(edge.from.x, edge.from.y);
    ctx.lineTo(edge.to.x, edge.to.y);
    ctx.stroke();
  });
  
  // Draw nodes
  allNodes.forEach(node => {
    if (activeCategory.value !== 'all' && node.category !== activeCategory.value && node.id !== 'self') return;
    
    const color = categoryColors[node.category] || '#64748B';
    const isSelf = node.id === 'self';
    const radius = isSelf ? 36 : 32;
    
    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isSelf ? color : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelf ? 3 : 2;
    ctx.stroke();
    
    // Label
    ctx.fillStyle = isSelf ? '#FFFFFF' : color;
    ctx.font = `bold ${isSelf ? 16 : 14}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
    
    // Title below
    ctx.fillStyle = '#8B8680';
    ctx.font = '12px sans-serif';
    ctx.fillText(node.title, node.x, node.y + radius + 15);
  });
  
  ctx.restore();
}

onReady(() => {
  const query = uni.createSelectorQuery();
  query.select('#treeCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (res[0]) {
        canvas = res[0].node;
        ctx = canvas.getContext('2d');
        const dpr = uni.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        drawTree();
      }
    });
});

function setCategory(cat) {
  activeCategory.value = cat;
  drawTree();
}

function zoomIn() {
  scale = Math.min(3, scale * 1.2);
  drawTree();
}

function zoomOut() {
  scale = Math.max(0.3, scale / 1.2);
  drawTree();
}

function resetView() {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  drawTree();
}

function handleTouchStart(e) {
  const touch = e.touches[0];
  lastTouch = { x: touch.x, y: touch.y };
  isDragging = true;
}

function handleTouchMove(e) {
  if (!isDragging || !lastTouch) return;
  const touch = e.touches[0];
  const dx = touch.x - lastTouch.x;
  const dy = touch.y - lastTouch.y;
  offsetX += dx;
  offsetY += dy;
  lastTouch = { x: touch.x, y: touch.y };
  drawTree();
}

function handleTouchEnd() {
  isDragging = false;
  lastTouch = null;
}

function handleTap(e) {
  const touch = e.touches[0] || e.detail;
  const allNodes = getAllNodes(treeData);
  
  for (const node of allNodes.reverse()) {
    const dx = (touch.x - offsetX) / scale - node.x;
    const dy = (touch.y - offsetY) / scale - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 36) {
      selectedNode.value = node;
      return;
    }
  }
}

function closePopup() {
  selectedNode.value = null;
}

function getCategoryLabel(cat) {
  const map = { paternal: '父系亲属', maternal: '母系亲属', spouse: '夫妻亲属', affinity: '姻亲', self: '自己', collateral: '旁系亲属' };
  return map[cat] || cat;
}

function getGenerationLabel(gen) {
  const map = { '-2': '祖辈', '-1': '父辈', 0: '平辈', 1: '子辈', 2: '孙辈', '-3': '高祖辈' };
  return map[gen] || gen;
}

function getGenderLabel(g) {
  const map = { male: '男性', female: '女性', unisex: '不限' };
  return map[g] || g;
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: $bg-primary;
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
  font-size: 24rpx;
  color: $text-muted;
}

.filter-bar {
  margin-bottom: 20rpx;
  white-space: nowrap;
}

.filter-list {
  display: flex;
  gap: 16rpx;
  padding: 0 10rpx;
}

.filter-chip {
  padding: 12rpx 24rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-secondary;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.filter-chip.active {
  font-weight: 600;
}

.tree-container {
  position: relative;
  height: 700rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.tree-canvas {
  width: 100%;
  height: 100%;
}

.node-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.node-popup-content {
  animation: slideUp 0.3s ease;
}

.node-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.node-popup-title {
  font-size: 36rpx;
}

.node-popup-close {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $bg-muted;
  color: $text-muted;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.node-popup-close::after {
  border: none;
}

.node-popup-body {
  space-y: 16rpx;
}

.node-info-row {
  display: flex;
  padding: 12rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.node-info-label {
  width: 120rpx;
  font-size: 28rpx;
  color: $text-muted;
}

.node-info-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.controls {
  position: fixed;
  right: 30rpx;
  bottom: 160rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  z-index: 50;
}

.control-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn::after {
  border: none;
}

.control-btn:active {
  background: $bg-muted;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 20rpx;
  margin-top: 20rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}

.legend-text {
  font-size: 24rpx;
  color: $text-secondary;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
