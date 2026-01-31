
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // শুধুমাত্র প্রয়োজনীয় ভ্যারিয়েবলগুলো পাস করা হচ্ছে যাতে বিল্ড এরর না হয়
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
