/** tabBar 页面路径 */
export const TAB_PAGES = new Set([
  "/pages/index/index",
  "/pages/categories/categories",
  "/pages/query/query",
  "/pages/tree/tree",
  "/pages/quickref/quickref",
]);

export function isTabPage(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return TAB_PAGES.has(normalized);
}

/** 智能跳转：tab 页用 switchTab，其余用 navigateTo */
export function smartNavigate(path) {
  const url = path.startsWith("/") ? path : `/${path}`;
  if (isTabPage(url)) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
}

export function goQuery(query) {
  if (query) uni.setStorageSync("pendingQuery", query);
  uni.switchTab({ url: "/pages/query/query" });
}
