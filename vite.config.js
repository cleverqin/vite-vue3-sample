import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
const resolve = (dir) => path.resolve(__dirname, dir)
export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': resolve('src') },
    extensions: ['.js', '.vue']
  },
  plugins: [
    vue(),
    nodePolyfills({
      // 你可以选择只包含需要的模块，或者全部包含
      include: ['util', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/icons/svg')],
      symbolId: 'icon-[name]'
    })
  ],
  css: { preprocessorOptions: { scss: {} } }
})
