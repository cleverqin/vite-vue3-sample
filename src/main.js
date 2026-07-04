import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/style.css'
import App from './App.vue'
const pinia = createPinia()
import 'virtual:svg-icons-register'
createApp(App).use(pinia).mount('#app')
