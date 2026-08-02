import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  // 只有VITE_前缀的变量会被识别，而这种变量不需要其他操作即可通过import.meta.env来访问，loadEnv只是在node环境下读取变量
  // const env = loadEnv(mode, process.cwd())
  // console.log(env)

  return {
    plugins: [
      vue(),
      Components({
        resolvers: [VantResolver()]
      }),
      AutoImport({
        resolvers: [VantResolver()]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        $root: fileURLToPath(new URL('/', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:9091',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/media': {
          target: 'http://localhost:9091',
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            vant: ['vant'],
            markdown: ['marked', 'marked-highlight', 'highlight.js', 'dompurify'],
            crypto: ['crypto-js'],
            axios: ['axios']
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  }
})
