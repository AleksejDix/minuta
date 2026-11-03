import './assets/main.css'
// oxlint-disable-next-line import/no-unassigned-import -- installs Temporal before anything below computes
import './temporal-ready'

import App from './App.vue'
import { createApp } from 'vue'

createApp(App).mount('#app')
