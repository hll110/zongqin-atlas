import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getMpWeixinOutDir() {
  return process.env.UNI_OUTPUT_DIR
    ? path.resolve(process.env.UNI_OUTPUT_DIR)
    : path.resolve(__dirname, "dist/dev/mp-weixin");
}

/** 微信自定义 tabBar 必须使用原生 wxml/js/wxss/json，复制到编译输出 */
function copyWeixinCustomTabBar() {
  return {
    name: "copy-weixin-custom-tab-bar",
    closeBundle() {
      if (process.env.UNI_PLATFORM !== "mp-weixin") return;

      const srcDir = path.resolve(__dirname, "src/custom-tab-bar");
      const outRoot = getMpWeixinOutDir();
      const destDir = path.join(outRoot, "custom-tab-bar");

      if (!fs.existsSync(srcDir)) return;

      fs.mkdirSync(destDir, { recursive: true });
      for (const file of ["index.js", "index.json", "index.wxml", "index.wxss"]) {
        const from = path.join(srcDir, file);
        if (fs.existsSync(from)) {
          fs.copyFileSync(from, path.join(destDir, file));
        }
      }
      const staleVue = path.join(destDir, "index.vue");
      if (fs.existsSync(staleVue)) fs.unlinkSync(staleVue);
    },
  };
}

/** 确保编译产物 app.json 启用按需注入（requiredComponents） */
function patchAppJsonLazyLoad() {
  return {
    name: "patch-app-json-lazy-load",
    closeBundle() {
      if (process.env.UNI_PLATFORM !== "mp-weixin") return;

      const appJsonPath = path.join(getMpWeixinOutDir(), "app.json");
      if (!fs.existsSync(appJsonPath)) return;

      const app = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
      app.lazyCodeLoading = "requiredComponents";
      if (app.usingComponents && Object.keys(app.usingComponents).length === 0) {
        delete app.usingComponents;
      }
      fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2));
    },
  };
}

export default defineConfig({
  plugins: [uni(), copyWeixinCustomTabBar(), patchAppJsonLazyLoad()],
});
