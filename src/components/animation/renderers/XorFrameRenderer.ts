import * as d3 from 'd3';
import { createGlowFilter } from '../effects/glowEffects';
import { startGlowingEffect } from '../effects/glowEffects';
import { addParticleEffect } from '../effects/particleEffects';
import { renderBinaryXorOperation } from './BinaryXorRenderer';
import { getColorForNumber } from './InitialFrameRenderer';

/**
 * 渲染异或运算帧
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 * @param currentFrame 当前帧
 * @param toBinaryString 转换为二进制字符串的函数
 * @param calculatedSteps 预计算的异或步骤结果
 */
export const renderXorFrame = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  numbers: number[],
  currentFrame: number,
  toBinaryString: (num: number) => string,
  calculatedSteps: number[]
): void => {
  // 确保有发光滤镜
  createGlowFilter(svg);
  
  // 获取当前步骤的值
  const prevResult = calculatedSteps[currentFrame - 1];
  const currentNumber = numbers[currentFrame - 1];
  const currentResult = prevResult ^ currentNumber;
  
  // 清除之前渲染的虚线框和任何其他可能堆积的元素
  svg.selectAll('.highlight-box').remove();
  
  // 渲染步骤标题和描述
  renderStepTitle(svg, width, currentFrame, numbers.length);
  renderOperationDescription(svg, width, currentFrame, prevResult, currentNumber, currentResult);
  
  // 显示二进制表示并添加延迟
  setTimeout(() => {
    // 获取二进制表示
    const prevResultBinary = toBinaryString(prevResult);
    const currentNumberBinary = toBinaryString(currentNumber);
    const currentResultBinary = toBinaryString(currentResult);
    
    // 渲染二进制操作
    renderBinaryXorOperation(svg, width, prevResultBinary, currentNumberBinary, currentResultBinary);
    
    // 添加当前位的高亮虚线框，使用单独的类名便于后续移除
    addHighlightBox(svg, width, prevResultBinary, currentNumberBinary);
  }, 600);
  
  // 为当前操作的数字添加粒子效果
  addParticleEffect(svg, width / 2, 110, getColorForNumber(currentNumber));
};

/**
 * 添加位操作的高亮虚线框
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param firstBinary 第一个二进制字符串
 * @param secondBinary 第二个二进制字符串
 */
const addHighlightBox = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  firstBinary: string,
  secondBinary: string
): void => {
  // 寻找有差异的位
  const diffBits = findDiffBits(firstBinary, secondBinary);
  if (diffBits.length === 0) return;
  
  const binY = 150;
  const padding = 80;
  const maxLength = Math.max(firstBinary.length, secondBinary.length);
  const availableWidth = width - (padding * 2);
  const digitWidth = Math.min(20, Math.max(10, availableWidth / maxLength));
  const spacing = Math.max(digitWidth, digitWidth * 1.1);
  const startX = (width - (maxLength * spacing)) / 2 + (spacing / 2);
  
  // 为每个有差异的位添加高亮框
  diffBits.forEach(idx => {
    const x = startX + idx * spacing;
    
    // 高亮框
    svg.append('rect')
      .attr('class', 'highlight-box')
      .attr('x', x - digitWidth * 0.75)
      .attr('y', binY - 35)
      .attr('width', digitWidth * 1.5)
      .attr('height', 130)
      .attr('fill', 'none')
      .attr('stroke', '#fcc419')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')
      .attr('rx', 3)
      .attr('ry', 3)
      .style('opacity', 0.8);
  });
};

/**
 * 查找两个二进制数不同的位，只高亮显示差异位
 * @param firstBinary 第一个二进制数
 * @param secondBinary 第二个二进制数
 */
const findDiffBits = (firstBinary: string, secondBinary: string): number[] => {
  const diffIndices: number[] = [];
  const maxLength = Math.max(firstBinary.length, secondBinary.length);
  
  // 填充较短的二进制数，确保长度一致
  const first = firstBinary.padStart(maxLength, '0');
  const second = secondBinary.padStart(maxLength, '0');
  
  // 找出两个二进制数不同的位
  for (let i = 0; i < maxLength; i++) {
    if (first[i] !== second[i]) {
      diffIndices.push(i);
    }
  }
  return diffIndices;
};

/**
 * 渲染步骤标题
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param currentFrame 当前帧
 * @param totalFrames 总帧数
 */
const renderStepTitle = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  currentFrame: number,
  totalFrames: number
): void => {
  svg.append('text')
    .attr('class', 'title-text')
    .attr('x', width / 2)
    .attr('y', 40)
    .text(`步骤 ${currentFrame}/${totalFrames}`)
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#4dabf7')
    .style('opacity', 0)
    .transition()
    .duration(500)
    .style('opacity', 1);
};

/**
 * 渲染操作描述
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param currentFrame 当前帧
 * @param prevResult 前一步结果
 * @param currentNumber 当前操作数
 * @param currentResult 当前结果
 */
const renderOperationDescription = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  currentFrame: number,
  prevResult: number,
  currentNumber: number,
  currentResult: number
): void => {
  // 显示当前运算
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 80)
    .text(`result = result ^ array[${currentFrame - 1}]`)
    .style('opacity', 0)
    .transition()
    .delay(200)
    .duration(500)
    .style('opacity', 1);
    
  // 显示具体数值
  const opText = svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 110)
    .text(`${prevResult} ^ ${currentNumber} = ${currentResult}`)
    .style('font-weight', 'bold')
    .style('filter', 'url(#glow)')
    .style('opacity', 0)
    .transition()
    .delay(400)
    .duration(500)
    .style('opacity', 1);
  
  // 设置结束后添加闪烁效果
  opText.transition().on('end', function() {
    startGlowingEffect(d3.select(this) as any);
  });
}; 