import * as d3 from 'd3';
import { addDynamicBackground } from '../effects/backgroundEffects';
import { renderBinaryRow } from './BinaryRowRenderer';
import { startGlowingEffect } from '../effects/glowEffects';

/**
 * 渲染二进制异或操作
 * @param svg D3 SVG选择器 
 * @param width 宽度
 * @param firstBinary 第一个操作数二进制表示
 * @param secondBinary 第二个操作数二进制表示
 * @param resultBinary 结果二进制表示
 */
export const renderBinaryXorOperation = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  firstBinary: string,
  secondBinary: string,
  resultBinary: string
): void => {
  const binY = 150;
  const maxLength = Math.max(firstBinary.length, secondBinary.length, resultBinary.length);
  
  // 动态调整位宽度，确保能够在屏幕中显示
  const padding = 80; // 增加左侧留出的空间以放置十进制标签
  const availableWidth = width - (padding * 2);
  const digitWidth = Math.min(20, Math.max(10, availableWidth / maxLength));
  
  // 确保位之间有足够的间距
  const bitSpacing = Math.max(digitWidth, digitWidth * 1.1);
  
  // 计算起始X位置，确保居中对齐
  const startX = (width - (maxLength * bitSpacing)) / 2 + (bitSpacing / 2);
  
  // 添加动态背景
  addDynamicBackground(svg, width);
  
  // 计算十进制值（用于显示在左侧）
  const firstDecimal = parseInt(firstBinary, 2);
  const secondDecimal = parseInt(secondBinary, 2);
  const resultDecimal = parseInt(resultBinary, 2);
  
  // 第一行：添加十进制值标签和第一个操作数的二进制
  addDecimalLabel(svg, firstDecimal, startX - 50, binY - 15, '#4dabf7');
  renderBinaryRow(svg, firstBinary, startX, binY - 15, digitWidth, '#4dabf7', true);

  // XOR 符号
  const xorSymbol = svg.append('text')
    .attr('class', 'xor-symbol')
    .attr('x', width / 2)
    .attr('y', binY + 20)
    .text('^')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .style('fill', '#ff6b6b');
    
  // 添加闪烁效果
  startGlowingEffect(xorSymbol);
  
  // 第二行：添加十进制值标签和第二个操作数的二进制
  addDecimalLabel(svg, secondDecimal, startX - 50, binY + 30, '#ff6b6b');
  renderBinaryRow(svg, secondBinary, startX, binY + 30, digitWidth, '#ff6b6b', true);

  // = 符号
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', binY + 65)
    .text('=')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .style('fill', '#40c057');
  
  // 第三行：添加十进制值标签和结果的二进制
  addDecimalLabel(svg, resultDecimal, startX - 50, binY + 75, '#40c057');
  renderBinaryRow(svg, resultBinary, startX, binY + 75, digitWidth, '#40c057', false, true);
};

/**
 * 添加十进制值标签
 * @param svg D3 SVG选择器
 * @param value 十进制值
 * @param x X坐标
 * @param y Y坐标
 * @param color 颜色
 */
const addDecimalLabel = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  value: number,
  x: number,
  y: number,
  color: string
): void => {
  // 添加十进制数值标签
  svg.append('text')
    .attr('x', x)
    .attr('y', y + 10) // 垂直居中对齐
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')
    .attr('fill', color)
    .text(value)
    .transition()
    .duration(500)
    .attr('opacity', 1);
}; 