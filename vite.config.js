import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 打包关键配置：强制相对路径，避免部署/本地运行404
  base: './',
  // 优化打包速度（可选）
  build: {
    outDir: 'dist', // 打包输出目录（默认就是dist，可省略）
    assetsDir: 'assets' // 静态资源目录（css/js/img等）
  }
})