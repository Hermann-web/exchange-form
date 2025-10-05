import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      // handling dark mode: https://primevue.org/theming/styled/
      // darkModeSelector: 'system',
      darkModeSelector: '.my-app-dark',
      cssLayer: false,
    },
  },
});
app.mount('#app');
