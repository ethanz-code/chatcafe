// vite.config.ts
import process3 from "node:process";
import { URL, fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/vite@5.2.10_@types+node@20.12.7_sass@1.75.0/node_modules/vite/dist/node/index.js";
import dayjs from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/dayjs@1.11.10/node_modules/dayjs/dayjs.min.js";

// build/plugins/index.ts
import vue from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@vitejs+plugin-vue@5.0.4_vite@5.2.10_@types+node@20.12.7_sass@1.75.0__vue@3.4.25_typescript@5.4.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@5.2.10_@types+node@20.12.7_sass@1.75.0__vue@3.4.25_typescript@5.4.5_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import progress from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/vite-plugin-progress@0.0.7_vite@5.2.10_@types+node@20.12.7_sass@1.75.0_/node_modules/vite-plugin-progress/dist/index.mjs";

// build/plugins/router.ts
import ElegantVueRouter from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@elegant-router+vue@0.3.6/node_modules/@elegant-router/vue/dist/vite.mjs";
function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: "src/layouts/base-layout/index.vue",
      blank: "src/layouts/blank-layout/index.vue"
    },
    customRoutes: {
      names: [
        "exception_403",
        "exception_404",
        "exception_500",
        "document_project",
        "document_project-link",
        "document_vue",
        "document_vite",
        "document_unocss",
        "document_naive",
        "document_antd"
      ]
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName;
      if (key === "login") {
        const modules = ["pwd-login", "code-login", "register", "reset-pwd", "bind-wechat"];
        const moduleReg = modules.join("|");
        return `/login/:module(${moduleReg})?`;
      }
      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName;
      const constantRoutes = ["login", "403", "404", "500"];
      const meta = {
        title: key,
        i18nKey: `route.${key}`
      };
      if (key === "usage") {
        meta.icon = "carbon:chart-line-data";
        meta.order = 5;
      }
      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }
      return meta;
    }
  });
}

// build/plugins/unocss.ts
import process from "node:process";
import path from "node:path";
import unocss from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@unocss+vite@0.59.4_rollup@4.62.0_vite@5.2.10_@types+node@20.12.7_sass@1.75.0_/node_modules/@unocss/vite/dist/index.mjs";
import presetIcons from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@unocss+preset-icons@0.59.4/node_modules/@unocss/preset-icons/dist/index.mjs";
import { FileSystemIconLoader } from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/@iconify+utils@2.3.0/node_modules/@iconify/utils/lib/loader/node-loaders.mjs";
function setupUnocss(viteEnv) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
  const localIconPath = path.join(process.cwd(), "src/assets/svg-icon");
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");
  return unocss({
    presets: [
      presetIcons({
        prefix: `${VITE_ICON_PREFIX}-`,
        scale: 1,
        extraProperties: {
          display: "inline-block"
        },
        collections: {
          [collectionName]: FileSystemIconLoader(
            localIconPath,
            (svg) => svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          )
        },
        warn: true
      })
    ]
  });
}

// build/plugins/unplugin.ts
import process2 from "node:process";
import path2 from "node:path";
import Icons from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/unplugin-icons@0.18.5_@vue+compiler-sfc@3.5.38_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/unplugin-icons@0.18.5_@vue+compiler-sfc@3.5.38_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/resolver.js";
import Components from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/unplugin-vue-components@0.26.0_@babel+parser@7.29.7_rollup@4.62.0_vue@3.4.25_typescript@5.4.5_/node_modules/unplugin-vue-components/dist/vite.js";
import { AntDesignVueResolver, NaiveUiResolver } from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/unplugin-vue-components@0.26.0_@babel+parser@7.29.7_rollup@4.62.0_vue@3.4.25_typescript@5.4.5_/node_modules/unplugin-vue-components/dist/resolvers.js";
import { FileSystemIconLoader as FileSystemIconLoader2 } from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/unplugin-icons@0.18.5_@vue+compiler-sfc@3.5.38_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/loaders.js";
import { createSvgIconsPlugin } from "file:///Users/mac/workspace/active/chatcafe/admin/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.2.10_@types+node@20.12.7_sass@1.75.0_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
function setupUnplugin(viteEnv) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
  const localIconPath = path2.join(process2.cwd(), "src/assets/svg-icon");
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");
  const plugins = [
    Icons({
      compiler: "vue3",
      customCollections: {
        [collectionName]: FileSystemIconLoader2(
          localIconPath,
          (svg) => svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
        )
      },
      scale: 1,
      defaultClass: "inline-block"
    }),
    Components({
      dts: "src/typings/components.d.ts",
      types: [{ from: "vue-router", names: ["RouterLink", "RouterView"] }],
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        }),
        NaiveUiResolver(),
        IconsResolver({ customCollections: [collectionName], componentPrefix: VITE_ICON_PREFIX })
      ]
    }),
    createSvgIconsPlugin({
      iconDirs: [localIconPath],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: "body-last",
      customDomId: "__SVG_ICON_LOCAL__"
    })
  ];
  return plugins;
}

// build/plugins/index.ts
function setupVitePlugins(viteEnv) {
  const plugins = [
    vue({
      script: {
        defineModel: true
      }
    }),
    vueJsx(),
    setupElegantRouter(),
    setupUnocss(viteEnv),
    ...setupUnplugin(viteEnv),
    progress()
  ];
  return plugins;
}

// src/utils/service.ts
function createServiceConfig(env) {
  const { VITE_SERVICE_BASE_URL, VITE_OTHER_SERVICE_BASE_URL } = env;
  let other = {};
  try {
    other = JSON.parse(VITE_OTHER_SERVICE_BASE_URL);
  } catch (error) {
    console.error("VITE_OTHER_SERVICE_BASE_URL is not a valid JSON string");
  }
  const httpConfig = {
    baseURL: VITE_SERVICE_BASE_URL,
    other
  };
  const otherHttpKeys = Object.keys(httpConfig.other);
  const otherConfig = otherHttpKeys.map((key) => {
    return {
      key,
      baseURL: httpConfig.other[key],
      proxyPattern: createProxyPattern(key)
    };
  });
  const config = {
    baseURL: httpConfig.baseURL,
    proxyPattern: createProxyPattern(),
    other: otherConfig
  };
  return config;
}
function createProxyPattern(key) {
  if (!key) {
    return "/proxy-default";
  }
  return `/proxy-${key}`;
}

// build/config/proxy.ts
function createViteProxy(env, isDev) {
  const isEnableHttpProxy = isDev && env.VITE_HTTP_PROXY === "Y";
  if (!isEnableHttpProxy)
    return void 0;
  const { baseURL, proxyPattern, other } = createServiceConfig(env);
  const proxy = createProxyItem({ baseURL, proxyPattern });
  other.forEach((item) => {
    Object.assign(proxy, createProxyItem(item));
  });
  return proxy;
}
function createProxyItem(item) {
  const proxy = {};
  proxy[item.proxyPattern] = {
    target: item.baseURL,
    changeOrigin: true,
    rewrite: (path3) => path3.replace(new RegExp(`^${item.proxyPattern}`), "")
  };
  return proxy;
}

// vite.config.ts
var __vite_injected_original_import_meta_url = "file:///Users/mac/workspace/active/chatcafe/admin/vite.config.ts";
var vite_config_default = defineConfig((configEnv) => {
  const viteEnv = loadEnv(configEnv.mode, process3.cwd());
  const buildTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.log(viteEnv.VITE_BASE_URL);
  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./", __vite_injected_original_import_meta_url)),
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: setupVitePlugins(viteEnv),
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    server: {
      host: "0.0.0.0",
      port: 8e3,
      open: true,
      proxy: createViteProxy(viteEnv, configEnv.command === "serve"),
      fs: {
        cachedChecks: false
      }
    },
    preview: {
      port: 8e3
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === "Y",
      commonjsOptions: {
        ignoreTryCatch: false
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvcGx1Z2lucy9pbmRleC50cyIsICJidWlsZC9wbHVnaW5zL3JvdXRlci50cyIsICJidWlsZC9wbHVnaW5zL3Vub2Nzcy50cyIsICJidWlsZC9wbHVnaW5zL3VucGx1Z2luLnRzIiwgInNyYy91dGlscy9zZXJ2aWNlLnRzIiwgImJ1aWxkL2NvbmZpZy9wcm94eS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgeyBVUkwsIGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCBkYXlqcyBmcm9tICdkYXlqcyc7XG5pbXBvcnQgeyBzZXR1cFZpdGVQbHVnaW5zIH0gZnJvbSAnLi9idWlsZC9wbHVnaW5zJztcbmltcG9ydCB7IGNyZWF0ZVZpdGVQcm94eSB9IGZyb20gJy4vYnVpbGQvY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGNvbmZpZ0VudiA9PiB7XG4gIGNvbnN0IHZpdGVFbnYgPSBsb2FkRW52KGNvbmZpZ0Vudi5tb2RlLCBwcm9jZXNzLmN3ZCgpKSBhcyB1bmtub3duIGFzIEVudi5JbXBvcnRNZXRhO1xuXG4gIGNvbnN0IGJ1aWxkVGltZSA9IGRheWpzKCkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gIGNvbnNvbGUubG9nKHZpdGVFbnYuVklURV9CQVNFX1VSTCk7XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiB2aXRlRW52LlZJVEVfQkFTRV9VUkwsXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ34nOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQHVzZSBcIi4vc3JjL3N0eWxlcy9zY3NzL2dsb2JhbC5zY3NzXCIgYXMgKjtgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IHNldHVwVml0ZVBsdWdpbnModml0ZUVudiksXG4gICAgZGVmaW5lOiB7XG4gICAgICBCVUlMRF9USU1FOiBKU09OLnN0cmluZ2lmeShidWlsZFRpbWUpXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIHBvcnQ6IDgwMDAsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgcHJveHk6IGNyZWF0ZVZpdGVQcm94eSh2aXRlRW52LCBjb25maWdFbnYuY29tbWFuZCA9PT0gJ3NlcnZlJyksXG4gICAgICBmczoge1xuICAgICAgICBjYWNoZWRDaGVja3M6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBwb3J0OiA4MDAwXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgICAgc291cmNlbWFwOiB2aXRlRW52LlZJVEVfU09VUkNFX01BUCA9PT0gJ1knLFxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgIGlnbm9yZVRyeUNhdGNoOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFjL3dvcmtzcGFjZS9hY3RpdmUvY2hhdGNhZmUvYWRtaW4vYnVpbGQvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL3BsdWdpbnMvaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL3BsdWdpbnMvaW5kZXgudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBwcm9ncmVzcyBmcm9tICd2aXRlLXBsdWdpbi1wcm9ncmVzcyc7XG5pbXBvcnQgeyBzZXR1cEVsZWdhbnRSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgeyBzZXR1cFVub2NzcyB9IGZyb20gJy4vdW5vY3NzJztcbmltcG9ydCB7IHNldHVwVW5wbHVnaW4gfSBmcm9tICcuL3VucGx1Z2luJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVml0ZVBsdWdpbnModml0ZUVudjogRW52LkltcG9ydE1ldGEpIHtcbiAgY29uc3QgcGx1Z2luczogUGx1Z2luT3B0aW9uID0gW1xuICAgIHZ1ZSh7XG4gICAgICBzY3JpcHQ6IHtcbiAgICAgICAgZGVmaW5lTW9kZWw6IHRydWVcbiAgICAgIH1cbiAgICB9KSxcbiAgICB2dWVKc3goKSxcbiAgICBzZXR1cEVsZWdhbnRSb3V0ZXIoKSxcbiAgICBzZXR1cFVub2Nzcyh2aXRlRW52KSxcbiAgICAuLi5zZXR1cFVucGx1Z2luKHZpdGVFbnYpLFxuICAgIHByb2dyZXNzKClcbiAgXTtcblxuICByZXR1cm4gcGx1Z2lucztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi9idWlsZC9wbHVnaW5zL3JvdXRlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFjL3dvcmtzcGFjZS9hY3RpdmUvY2hhdGNhZmUvYWRtaW4vYnVpbGQvcGx1Z2lucy9yb3V0ZXIudHNcIjtpbXBvcnQgdHlwZSB7IFJvdXRlTWV0YSB9IGZyb20gJ3Z1ZS1yb3V0ZXInO1xuaW1wb3J0IEVsZWdhbnRWdWVSb3V0ZXIgZnJvbSAnQGVsZWdhbnQtcm91dGVyL3Z1ZS92aXRlJztcbmltcG9ydCB0eXBlIHsgUm91dGVLZXkgfSBmcm9tICdAZWxlZ2FudC1yb3V0ZXIvdHlwZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBFbGVnYW50Um91dGVyKCkge1xuICByZXR1cm4gRWxlZ2FudFZ1ZVJvdXRlcih7XG4gICAgbGF5b3V0czoge1xuICAgICAgYmFzZTogJ3NyYy9sYXlvdXRzL2Jhc2UtbGF5b3V0L2luZGV4LnZ1ZScsXG4gICAgICBibGFuazogJ3NyYy9sYXlvdXRzL2JsYW5rLWxheW91dC9pbmRleC52dWUnXG4gICAgfSxcbiAgICBjdXN0b21Sb3V0ZXM6IHtcbiAgICAgIG5hbWVzOiBbXG4gICAgICAgICdleGNlcHRpb25fNDAzJyxcbiAgICAgICAgJ2V4Y2VwdGlvbl80MDQnLFxuICAgICAgICAnZXhjZXB0aW9uXzUwMCcsXG4gICAgICAgICdkb2N1bWVudF9wcm9qZWN0JyxcbiAgICAgICAgJ2RvY3VtZW50X3Byb2plY3QtbGluaycsXG4gICAgICAgICdkb2N1bWVudF92dWUnLFxuICAgICAgICAnZG9jdW1lbnRfdml0ZScsXG4gICAgICAgICdkb2N1bWVudF91bm9jc3MnLFxuICAgICAgICAnZG9jdW1lbnRfbmFpdmUnLFxuICAgICAgICAnZG9jdW1lbnRfYW50ZCdcbiAgICAgIF1cbiAgICB9LFxuICAgIHJvdXRlUGF0aFRyYW5zZm9ybWVyKHJvdXRlTmFtZSwgcm91dGVQYXRoKSB7XG4gICAgICBjb25zdCBrZXkgPSByb3V0ZU5hbWUgYXMgUm91dGVLZXk7XG5cbiAgICAgIGlmIChrZXkgPT09ICdsb2dpbicpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlczogVW5pb25LZXkuTG9naW5Nb2R1bGVbXSA9IFsncHdkLWxvZ2luJywgJ2NvZGUtbG9naW4nLCAncmVnaXN0ZXInLCAncmVzZXQtcHdkJywgJ2JpbmQtd2VjaGF0J107XG5cbiAgICAgICAgY29uc3QgbW9kdWxlUmVnID0gbW9kdWxlcy5qb2luKCd8Jyk7XG5cbiAgICAgICAgcmV0dXJuIGAvbG9naW4vOm1vZHVsZSgke21vZHVsZVJlZ30pP2A7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3V0ZVBhdGg7XG4gICAgfSxcbiAgICBvblJvdXRlTWV0YUdlbihyb3V0ZU5hbWUpIHtcbiAgICAgIGNvbnN0IGtleSA9IHJvdXRlTmFtZSBhcyBSb3V0ZUtleTtcblxuICAgICAgY29uc3QgY29uc3RhbnRSb3V0ZXM6IFJvdXRlS2V5W10gPSBbJ2xvZ2luJywgJzQwMycsICc0MDQnLCAnNTAwJ107XG5cbiAgICAgIGNvbnN0IG1ldGE6IFBhcnRpYWw8Um91dGVNZXRhPiA9IHtcbiAgICAgICAgdGl0bGU6IGtleSxcbiAgICAgICAgaTE4bktleTogYHJvdXRlLiR7a2V5fWAgYXMgQXBwLkkxOG4uSTE4bktleVxuICAgICAgfTtcblxuICAgICAgaWYgKGtleSA9PT0gJ3VzYWdlJykge1xuICAgICAgICBtZXRhLmljb24gPSAnY2FyYm9uOmNoYXJ0LWxpbmUtZGF0YSc7XG4gICAgICAgIG1ldGEub3JkZXIgPSA1O1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uc3RhbnRSb3V0ZXMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICBtZXRhLmNvbnN0YW50ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1ldGE7XG4gICAgfVxuICB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi9idWlsZC9wbHVnaW5zL3Vub2Nzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFjL3dvcmtzcGFjZS9hY3RpdmUvY2hhdGNhZmUvYWRtaW4vYnVpbGQvcGx1Z2lucy91bm9jc3MudHNcIjtpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB1bm9jc3MgZnJvbSAnQHVub2Nzcy92aXRlJztcbmltcG9ydCBwcmVzZXRJY29ucyBmcm9tICdAdW5vY3NzL3ByZXNldC1pY29ucyc7XG5pbXBvcnQgeyBGaWxlU3lzdGVtSWNvbkxvYWRlciB9IGZyb20gJ0BpY29uaWZ5L3V0aWxzL2xpYi9sb2FkZXIvbm9kZS1sb2FkZXJzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVW5vY3NzKHZpdGVFbnY6IEVudi5JbXBvcnRNZXRhKSB7XG4gIGNvbnN0IHsgVklURV9JQ09OX1BSRUZJWCwgVklURV9JQ09OX0xPQ0FMX1BSRUZJWCB9ID0gdml0ZUVudjtcblxuICBjb25zdCBsb2NhbEljb25QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL3N2Zy1pY29uJyk7XG5cbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBsb2NhbCBpY29uIGNvbGxlY3Rpb24gKi9cbiAgY29uc3QgY29sbGVjdGlvbk5hbWUgPSBWSVRFX0lDT05fTE9DQUxfUFJFRklYLnJlcGxhY2UoYCR7VklURV9JQ09OX1BSRUZJWH0tYCwgJycpO1xuXG4gIHJldHVybiB1bm9jc3Moe1xuICAgIHByZXNldHM6IFtcbiAgICAgIHByZXNldEljb25zKHtcbiAgICAgICAgcHJlZml4OiBgJHtWSVRFX0lDT05fUFJFRklYfS1gLFxuICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgZXh0cmFQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaydcbiAgICAgICAgfSxcbiAgICAgICAgY29sbGVjdGlvbnM6IHtcbiAgICAgICAgICBbY29sbGVjdGlvbk5hbWVdOiBGaWxlU3lzdGVtSWNvbkxvYWRlcihsb2NhbEljb25QYXRoLCBzdmcgPT5cbiAgICAgICAgICAgIHN2Zy5yZXBsYWNlKC9ePHN2Z1xccy8sICc8c3ZnIHdpZHRoPVwiMWVtXCIgaGVpZ2h0PVwiMWVtXCIgJylcbiAgICAgICAgICApXG4gICAgICAgIH0sXG4gICAgICAgIHdhcm46IHRydWVcbiAgICAgIH0pXG4gICAgXVxuICB9KTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi9idWlsZC9wbHVnaW5zL3VucGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi9idWlsZC9wbHVnaW5zL3VucGx1Z2luLnRzXCI7aW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnO1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgeyBBbnREZXNpZ25WdWVSZXNvbHZlciwgTmFpdmVVaVJlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcbmltcG9ydCB7IEZpbGVTeXN0ZW1JY29uTG9hZGVyIH0gZnJvbSAndW5wbHVnaW4taWNvbnMvbG9hZGVycyc7XG5pbXBvcnQgeyBjcmVhdGVTdmdJY29uc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFVucGx1Z2luKHZpdGVFbnY6IEVudi5JbXBvcnRNZXRhKSB7XG4gIGNvbnN0IHsgVklURV9JQ09OX1BSRUZJWCwgVklURV9JQ09OX0xPQ0FMX1BSRUZJWCB9ID0gdml0ZUVudjtcblxuICBjb25zdCBsb2NhbEljb25QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL3N2Zy1pY29uJyk7XG5cbiAgLyoqIFRoZSBuYW1lIG9mIHRoZSBsb2NhbCBpY29uIGNvbGxlY3Rpb24gKi9cbiAgY29uc3QgY29sbGVjdGlvbk5hbWUgPSBWSVRFX0lDT05fTE9DQUxfUFJFRklYLnJlcGxhY2UoYCR7VklURV9JQ09OX1BSRUZJWH0tYCwgJycpO1xuXG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbk9wdGlvbltdID0gW1xuICAgIEljb25zKHtcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXG4gICAgICBjdXN0b21Db2xsZWN0aW9uczoge1xuICAgICAgICBbY29sbGVjdGlvbk5hbWVdOiBGaWxlU3lzdGVtSWNvbkxvYWRlcihsb2NhbEljb25QYXRoLCBzdmcgPT5cbiAgICAgICAgICBzdmcucmVwbGFjZSgvXjxzdmdcXHMvLCAnPHN2ZyB3aWR0aD1cIjFlbVwiIGhlaWdodD1cIjFlbVwiICcpXG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgICBzY2FsZTogMSxcbiAgICAgIGRlZmF1bHRDbGFzczogJ2lubGluZS1ibG9jaydcbiAgICB9KSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGR0czogJ3NyYy90eXBpbmdzL2NvbXBvbmVudHMuZC50cycsXG4gICAgICB0eXBlczogW3sgZnJvbTogJ3Z1ZS1yb3V0ZXInLCBuYW1lczogWydSb3V0ZXJMaW5rJywgJ1JvdXRlclZpZXcnXSB9XSxcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBBbnREZXNpZ25WdWVSZXNvbHZlcih7XG4gICAgICAgICAgaW1wb3J0U3R5bGU6IGZhbHNlXG4gICAgICAgIH0pLFxuICAgICAgICBOYWl2ZVVpUmVzb2x2ZXIoKSxcbiAgICAgICAgSWNvbnNSZXNvbHZlcih7IGN1c3RvbUNvbGxlY3Rpb25zOiBbY29sbGVjdGlvbk5hbWVdLCBjb21wb25lbnRQcmVmaXg6IFZJVEVfSUNPTl9QUkVGSVggfSlcbiAgICAgIF1cbiAgICB9KSxcbiAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XG4gICAgICBpY29uRGlyczogW2xvY2FsSWNvblBhdGhdLFxuICAgICAgc3ltYm9sSWQ6IGAke1ZJVEVfSUNPTl9MT0NBTF9QUkVGSVh9LVtkaXJdLVtuYW1lXWAsXG4gICAgICBpbmplY3Q6ICdib2R5LWxhc3QnLFxuICAgICAgY3VzdG9tRG9tSWQ6ICdfX1NWR19JQ09OX0xPQ0FMX18nXG4gICAgfSlcbiAgXTtcblxuICByZXR1cm4gcGx1Z2lucztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL3NyYy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL3NyYy91dGlscy9zZXJ2aWNlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYWMvd29ya3NwYWNlL2FjdGl2ZS9jaGF0Y2FmZS9hZG1pbi9zcmMvdXRpbHMvc2VydmljZS50c1wiOy8qKlxuICogQ3JlYXRlIHNlcnZpY2UgY29uZmlnIGJ5IGN1cnJlbnQgZW52XG4gKlxuICogQHBhcmFtIGVudiBUaGUgY3VycmVudCBlbnZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlcnZpY2VDb25maWcoZW52OiBFbnYuSW1wb3J0TWV0YSkge1xuICBjb25zdCB7IFZJVEVfU0VSVklDRV9CQVNFX1VSTCwgVklURV9PVEhFUl9TRVJWSUNFX0JBU0VfVVJMIH0gPSBlbnY7XG5cbiAgbGV0IG90aGVyID0ge30gYXMgUmVjb3JkPEFwcC5TZXJ2aWNlLk90aGVyQmFzZVVSTEtleSwgc3RyaW5nPjtcbiAgdHJ5IHtcbiAgICBvdGhlciA9IEpTT04ucGFyc2UoVklURV9PVEhFUl9TRVJWSUNFX0JBU0VfVVJMKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoJ1ZJVEVfT1RIRVJfU0VSVklDRV9CQVNFX1VSTCBpcyBub3QgYSB2YWxpZCBKU09OIHN0cmluZycpO1xuICB9XG5cbiAgY29uc3QgaHR0cENvbmZpZzogQXBwLlNlcnZpY2UuU2ltcGxlU2VydmljZUNvbmZpZyA9IHtcbiAgICBiYXNlVVJMOiBWSVRFX1NFUlZJQ0VfQkFTRV9VUkwsXG4gICAgb3RoZXJcbiAgfTtcblxuICBjb25zdCBvdGhlckh0dHBLZXlzID0gT2JqZWN0LmtleXMoaHR0cENvbmZpZy5vdGhlcikgYXMgQXBwLlNlcnZpY2UuT3RoZXJCYXNlVVJMS2V5W107XG5cbiAgY29uc3Qgb3RoZXJDb25maWc6IEFwcC5TZXJ2aWNlLk90aGVyU2VydmljZUNvbmZpZ0l0ZW1bXSA9IG90aGVySHR0cEtleXMubWFwKGtleSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtleSxcbiAgICAgIGJhc2VVUkw6IGh0dHBDb25maWcub3RoZXJba2V5XSxcbiAgICAgIHByb3h5UGF0dGVybjogY3JlYXRlUHJveHlQYXR0ZXJuKGtleSlcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBjb25maWc6IEFwcC5TZXJ2aWNlLlNlcnZpY2VDb25maWcgPSB7XG4gICAgYmFzZVVSTDogaHR0cENvbmZpZy5iYXNlVVJMLFxuICAgIHByb3h5UGF0dGVybjogY3JlYXRlUHJveHlQYXR0ZXJuKCksXG4gICAgb3RoZXI6IG90aGVyQ29uZmlnXG4gIH07XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuLyoqXG4gKiBnZXQgYmFja2VuZCBzZXJ2aWNlIGJhc2UgdXJsXG4gKlxuICogQHBhcmFtIGVudiAtIHRoZSBjdXJyZW50IGVudlxuICogQHBhcmFtIGlzUHJveHkgLSBpZiB1c2UgcHJveHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZpY2VCYXNlVVJMKGVudjogRW52LkltcG9ydE1ldGEsIGlzUHJveHk6IGJvb2xlYW4pIHtcbiAgY29uc3QgeyBiYXNlVVJMLCBvdGhlciB9ID0gY3JlYXRlU2VydmljZUNvbmZpZyhlbnYpO1xuXG4gIGNvbnN0IG90aGVyQmFzZVVSTCA9IHt9IGFzIFJlY29yZDxBcHAuU2VydmljZS5PdGhlckJhc2VVUkxLZXksIHN0cmluZz47XG5cbiAgb3RoZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICBvdGhlckJhc2VVUkxbaXRlbS5rZXldID0gaXNQcm94eSA/IGl0ZW0ucHJveHlQYXR0ZXJuIDogaXRlbS5iYXNlVVJMO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGJhc2VVUkw6IGlzUHJveHkgPyBjcmVhdGVQcm94eVBhdHRlcm4oKSA6IGJhc2VVUkwsXG4gICAgb3RoZXJCYXNlVVJMXG4gIH07XG59XG5cbi8qKlxuICogR2V0IHByb3h5IHBhdHRlcm4gb2YgYmFja2VuZCBzZXJ2aWNlIGJhc2UgdXJsXG4gKlxuICogQHBhcmFtIGtleSBJZiBub3Qgc2V0LCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBrZXlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUHJveHlQYXR0ZXJuKGtleT86IEFwcC5TZXJ2aWNlLk90aGVyQmFzZVVSTEtleSkge1xuICBpZiAoIWtleSkge1xuICAgIHJldHVybiAnL3Byb3h5LWRlZmF1bHQnO1xuICB9XG5cbiAgcmV0dXJuIGAvcHJveHktJHtrZXl9YDtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hYy93b3Jrc3BhY2UvYWN0aXZlL2NoYXRjYWZlL2FkbWluL2J1aWxkL2NvbmZpZy9wcm94eS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFjL3dvcmtzcGFjZS9hY3RpdmUvY2hhdGNhZmUvYWRtaW4vYnVpbGQvY29uZmlnL3Byb3h5LnRzXCI7aW1wb3J0IHR5cGUgeyBQcm94eU9wdGlvbnMgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZVNlcnZpY2VDb25maWcgfSBmcm9tICcuLi8uLi9zcmMvdXRpbHMvc2VydmljZSc7XG5cbi8qKlxuICogU2V0IGh0dHAgcHJveHlcbiAqXG4gKiBAcGFyYW0gZW52IC0gVGhlIGN1cnJlbnQgZW52XG4gKiBAcGFyYW0gaXNEZXYgLSBJcyBkZXZlbG9wbWVudCBlbnZpcm9ubWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVml0ZVByb3h5KGVudjogRW52LkltcG9ydE1ldGEsIGlzRGV2OiBib29sZWFuKSB7XG4gIGNvbnN0IGlzRW5hYmxlSHR0cFByb3h5ID0gaXNEZXYgJiYgZW52LlZJVEVfSFRUUF9QUk9YWSA9PT0gJ1knO1xuXG4gIGlmICghaXNFbmFibGVIdHRwUHJveHkpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3QgeyBiYXNlVVJMLCBwcm94eVBhdHRlcm4sIG90aGVyIH0gPSBjcmVhdGVTZXJ2aWNlQ29uZmlnKGVudik7XG5cbiAgY29uc3QgcHJveHk6IFJlY29yZDxzdHJpbmcsIFByb3h5T3B0aW9ucz4gPSBjcmVhdGVQcm94eUl0ZW0oeyBiYXNlVVJMLCBwcm94eVBhdHRlcm4gfSk7XG5cbiAgb3RoZXIuZm9yRWFjaChpdGVtID0+IHtcbiAgICBPYmplY3QuYXNzaWduKHByb3h5LCBjcmVhdGVQcm94eUl0ZW0oaXRlbSkpO1xuICB9KTtcblxuICByZXR1cm4gcHJveHk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb3h5SXRlbShpdGVtOiBBcHAuU2VydmljZS5TZXJ2aWNlQ29uZmlnSXRlbSkge1xuICBjb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgUHJveHlPcHRpb25zPiA9IHt9O1xuXG4gIHByb3h5W2l0ZW0ucHJveHlQYXR0ZXJuXSA9IHtcbiAgICB0YXJnZXQ6IGl0ZW0uYmFzZVVSTCxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgcmV3cml0ZTogcGF0aCA9PiBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7aXRlbS5wcm94eVBhdHRlcm59YCksICcnKVxuICB9O1xuXG4gIHJldHVybiBwcm94eTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1QsT0FBT0EsY0FBYTtBQUNwVSxTQUFTLEtBQUsscUJBQXFCO0FBQ25DLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVzs7O0FDRmxCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxjQUFjOzs7QUNGckIsT0FBTyxzQkFBc0I7QUFHdEIsU0FBUyxxQkFBcUI7QUFDbkMsU0FBTyxpQkFBaUI7QUFBQSxJQUN0QixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osT0FBTztBQUFBLFFBQ0w7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EscUJBQXFCLFdBQVcsV0FBVztBQUN6QyxZQUFNLE1BQU07QUFFWixVQUFJLFFBQVEsU0FBUztBQUNuQixjQUFNLFVBQWtDLENBQUMsYUFBYSxjQUFjLFlBQVksYUFBYSxhQUFhO0FBRTFHLGNBQU0sWUFBWSxRQUFRLEtBQUssR0FBRztBQUVsQyxlQUFPLGtCQUFrQixTQUFTO0FBQUEsTUFDcEM7QUFFQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsZUFBZSxXQUFXO0FBQ3hCLFlBQU0sTUFBTTtBQUVaLFlBQU0saUJBQTZCLENBQUMsU0FBUyxPQUFPLE9BQU8sS0FBSztBQUVoRSxZQUFNLE9BQTJCO0FBQUEsUUFDL0IsT0FBTztBQUFBLFFBQ1As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LFdBQU8sT0FBTyxPQUFPLGdCQUFnQixJQUFJLENBQUM7QUFBQSxFQUM1QyxDQUFDO0FBRUQsU0FBTztBQUNUO0FBRUEsU0FBUyxnQkFBZ0IsTUFBcUM7QUFDNUQsUUFBTSxRQUFzQyxDQUFDO0FBRTdDLFFBQU0sS0FBSyxZQUFZLElBQUk7QUFBQSxJQUN6QixRQUFRLEtBQUs7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLFNBQVMsQ0FBQUMsVUFBUUEsTUFBSyxRQUFRLElBQUksT0FBTyxJQUFJLEtBQUssWUFBWSxFQUFFLEdBQUcsRUFBRTtBQUFBLEVBQ3ZFO0FBRUEsU0FBTztBQUNUOzs7QU5uQzRMLElBQU0sMkNBQTJDO0FBTzdPLElBQU8sc0JBQVEsYUFBYSxlQUFhO0FBQ3ZDLFFBQU0sVUFBVSxRQUFRLFVBQVUsTUFBTUMsU0FBUSxJQUFJLENBQUM7QUFFckQsUUFBTSxZQUFZLE1BQU0sRUFBRSxPQUFPLHFCQUFxQjtBQUN0RCxVQUFRLElBQUksUUFBUSxhQUFhO0FBRWpDLFNBQU87QUFBQSxJQUNMLE1BQU0sUUFBUTtBQUFBLElBQ2QsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxNQUFNLHdDQUFlLENBQUM7QUFBQSxRQUNqRCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxpQkFBaUIsT0FBTztBQUFBLElBQ2pDLFFBQVE7QUFBQSxNQUNOLFlBQVksS0FBSyxVQUFVLFNBQVM7QUFBQSxJQUN0QztBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTyxnQkFBZ0IsU0FBUyxVQUFVLFlBQVksT0FBTztBQUFBLE1BQzdELElBQUk7QUFBQSxRQUNGLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxzQkFBc0I7QUFBQSxNQUN0QixXQUFXLFFBQVEsb0JBQW9CO0FBQUEsTUFDdkMsaUJBQWlCO0FBQUEsUUFDZixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicHJvY2VzcyIsICJwcm9jZXNzIiwgInBhdGgiLCAiRmlsZVN5c3RlbUljb25Mb2FkZXIiLCAicGF0aCIsICJwcm9jZXNzIiwgIkZpbGVTeXN0ZW1JY29uTG9hZGVyIiwgInBhdGgiLCAicHJvY2VzcyJdCn0K
