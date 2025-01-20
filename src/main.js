// main.js
import './assets/main.css'
import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

createApp(App)
    .use(router)  // Используем маршрутизатор
    .mount('#app');
