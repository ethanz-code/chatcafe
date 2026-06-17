import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/integrated.js'
import { usePersist } from 'pinia-use-persist'

import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

// import VConsole from 'vconsole'
// new VConsole()
import lazyPlugin from 'vue3-lazy'

const app = createApp(App)
const pinia = createPinia()
pinia.use(usePersist)

app.use(pinia)
app.use(router)
app.use(autoAnimatePlugin)

app.use(lazyPlugin, {
  loading: '/res/loading.gif',
  error: '/res/error.png'
})

app.mount('#app')
