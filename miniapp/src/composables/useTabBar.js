import { onShow } from "@dcloudio/uni-app";

/** 同步自定义 tabBar 选中态（兼容 uni-app 与微信原生 getTabBar） */
export function useTabBar(index) {
  onShow(() => {
    // #ifdef MP-WEIXIN
    try {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      const tabBar =
        (typeof page?.getTabBar === "function" && page.getTabBar()) ||
        (page?.$vm?.$mp?.page?.getTabBar && page.$vm.$mp.page.getTabBar());
      if (tabBar && typeof tabBar.setData === "function") {
        tabBar.setData({ selected: index });
      }
    } catch (e) {
      console.warn("[tabBar] sync selected failed", e);
    }
    // #endif
  });
}
