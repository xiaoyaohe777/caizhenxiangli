import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 必须加这行：静态资源改为相对路径，部署 OSS 不会报错
  base: './'
})