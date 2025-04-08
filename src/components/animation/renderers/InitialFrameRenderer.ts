import * as d3 from 'd3';
import { createGlowFilter } from '../effects/glowEffects';

/**
 * 获取数字的颜色
 * @param num 数字
 * @returns 对应的颜色
 */
export const getColorForNumber = (num: number): string => {
  const colors = [
    '#4dabf7', // 蓝色
    '#ff6b6b', // 红色
    '#ffd43b', // 黄色
    '#40c057', // 绿色
    '#9775fa', // 紫色
    '#f783ac'  // 粉色
  ];
  
  // 使用数字的绝对值对颜色数组长度取模，确保每个数字都有对应颜色
  return colors[Math.abs(num) % colors.length];
};

/**
 * 渲染初始帧
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 */
export const renderInitialFrame = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  width: number, 
  numbers: number[]
): void => {
  // 添加科技风格的背景
  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', '#f8f9fa')
    .attr('opacity', 0.7);
    
  // 添加网格线背景
  for (let i = 0; i < width; i += 30) {
    svg.append('line')
      .attr('x1', i)
      .attr('y1', 0)
      .attr('x2', i)
      .attr('y2', 300)
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);
      
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', i)
      .attr('x2', width)
      .attr('y2', i)
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);
  }

  // 确保发光效果的滤镜存在
  createGlowFilter(svg);

  // 添加标题和描述文本
  renderTitleAndDescriptions(svg, width, numbers);
    
  // 添加初始的数字可视化
  renderInitialNumbers(svg, width, numbers);
};

/**
 * 渲染标题和描述
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 */
const renderTitleAndDescriptions = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  width: number, 
  numbers: number[]
): void => {
  svg.append('text')
    .attr('class', 'title-text')
    .attr('x', width / 2)
    .attr('y', 40)
    .text('LeetCode 136：找出只出现一次的数字')
    .style('filter', 'url(#glow)');
  
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 80)
    .text('使用异或运算可以找出数组中只出现一次的数字')
    .style('opacity', 0)
    .transition()
    .duration(500)
    .style('opacity', 1);
    
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 120)
    .text(`输入数组: [${numbers.join(', ')}]`)
    .style('opacity', 0)
    .transition()
    .delay(300)
    .duration(500)
    .style('opacity', 1);
    
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 160)
    .text('异或特性: x ^ x = 0 和 x ^ 0 = x')
    .style('opacity', 0)
    .transition()
    .delay(600)
    .duration(500)
    .style('opacity', 1);
    
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 200)
    .text('初始值: result = 0')
    .style('opacity', 0)
    .transition()
    .delay(900)
    .duration(500)
    .style('opacity', 1);
    
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 240)
    .text('点击播放按钮开始动画演示')
    .style('opacity', 0)
    .transition()
    .delay(1200)
    .duration(500)
    .style('opacity', 1)
    .style('font-weight', 'bold');
};

/**
 * 渲染初始数字数组
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 */
const renderInitialNumbers = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
  width: number, 
  numbers: number[]
): void => {
  // 基于数组大小动态调整元素大小和位置
  const maxElements = Math.max(numbers.length, 1);
  const padding = 40; // 左右两侧留出的空间
  const availableWidth = width - (padding * 2);
  
  // 根据元素数量动态计算每个元素的宽度
  const numWidth = Math.min(40, availableWidth / maxElements);
  
  // 每个元素的宽度加上间距，但确保有一定距离
  const elementSpacing = Math.max(numWidth, numWidth + 2);
  
  // 计算起始X位置，确保居中对齐
  const startX = (width - (maxElements * elementSpacing)) / 2 + (elementSpacing / 2);
  
  // 基于元素数量动态调整Y位置，确保永远在底部但不会太靠下
  const baseY = 280;
  const numY = baseY - (maxElements > 10 ? 10 : 0); // 元素较多时略微上移
  
  // 动态调整字体大小，基于元素数量
  const fontSize = Math.max(8, Math.min(12, 16 - maxElements / 5)); // 元素越多，字体越小，但不小于8px
  
  numbers.forEach((num, i) => {
    const x = startX + i * elementSpacing;
    const color = getColorForNumber(num);
    
    // 根据元素数量调整矩形大小
    const rectSize = Math.max(numWidth - 6, 20);
    
    svg.append('rect')
      .attr('x', x - rectSize/2)
      .attr('y', numY - rectSize - 5) // 调整Y位置确保文本居中
      .attr('width', rectSize)
      .attr('height', rectSize)
      .attr('rx', 4)
      .attr('fill', color)
      .attr('opacity', 0)
      .transition()
      .delay(1500 + i * 100)
      .duration(300)
      .attr('opacity', 0.8);
      
    svg.append('text')
      .attr('x', x)
      .attr('y', numY - rectSize/2 - 5) // 文本垂直居中于矩形
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle') // 垂直居中对齐
      .attr('fill', 'white')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', 'bold')
      .text(num)
      .attr('opacity', 0)
      .transition()
      .delay(1500 + i * 100)
      .duration(300)
      .attr('opacity', 1);
  });
}; 