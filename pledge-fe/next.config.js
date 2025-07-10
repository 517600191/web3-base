/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    swcFileReading: true, // 启用 SWC 文件读取优化
    concurrentFeatures: true, // 启用并行特性
  },
  // 开启静态生成（SSG）
  // trailingSlash: true, // 添加尾随斜杠
  webpack: (config, { dev }) => {
    if (dev) {
      // 确保 config.entry 是一个数组
      if (Array.isArray(config.entry)) {
        config.entry = config.entry.filter(entry => !entry.includes('webpack-dev-server'));
      } else if (typeof config.entry === 'object') {
        // 如果 config.entry 是对象形式，逐个遍历它的条目
        Object.keys(config.entry).forEach(key => {
          config.entry[key] = config.entry[key].filter(entry => !entry.includes('webpack-dev-server'));
        });
      }
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src/'), // 关键配置
    };

    return config;
  },
};

module.exports = nextConfig;
