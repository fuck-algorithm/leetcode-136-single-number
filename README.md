# LeetCode 136: 只出现一次的数字 - 可视化解决方案

## 项目介绍

这是LeetCode第136题"只出现一次的数字"的交互式可视化解决方案。该题目要求在一个非空整数数组中找出只出现一次的元素，其余每个元素均出现两次。

## 在线演示

**[点击这里查看在线演示](https://fuck-algorithm.github.io/leetcode-136-single-number/)**

## 算法思路

本项目通过动画可视化展示了使用异或(XOR)操作解决此问题的过程：

- 相同的数字进行XOR操作会得到0
- 任何数字与0进行XOR操作会得到该数字本身
- 因此，对数组中所有元素进行XOR操作，最终结果就是只出现一次的数字

## 技术栈

- React 19
- TypeScript
- Vite
- D3.js (数据可视化)
- GSAP (动画效果)

## 本地运行

```bash
# 克隆仓库
git clone https://github.com/fuck-algorithm/leetcode-136-single-number.git
cd leetcode-136-single-number

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 本地预览生产版本
npm run preview
```

## 部署

本项目使用GitHub Pages部署。运行以下命令进行部署：

```bash
npm run deploy
```

## 许可证

MIT
