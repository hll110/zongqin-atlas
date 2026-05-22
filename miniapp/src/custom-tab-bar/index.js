Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "🏠",
      },
      {
        pagePath: "/pages/categories/categories",
        text: "分类",
        icon: "📂",
      },
      {
        pagePath: "/pages/query/query",
        text: "查询",
        icon: "🔍",
        center: true,
      },
      {
        pagePath: "/pages/tree/tree",
        text: "族谱",
        icon: "🌳",
      },
      {
        pagePath: "/pages/quickref/quickref",
        text: "速查",
        icon: "📋",
      },
    ],
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.list[index];
      if (!item) return;
      this.setData({ selected: index });
      wx.switchTab({ url: item.pagePath });
    },
  },
});
