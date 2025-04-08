import * as d3 from 'd3';
import { createGlowFilter } from '../effects/glowEffects';
import { startGlowingEffect, startPulseEffect } from '../effects/glowEffects';
import { addParticleEffect, addRadialEffect } from '../effects/particleEffects';
import { create3DGradient } from '../effects/backgroundEffects';

/**
 * 渲染结果帧
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 * @param result 计算结果
 * @param toBinaryString 转换为二进制字符串的函数
 */
export const renderResultFrame = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  numbers: number[],
  result: number | null,
  toBinaryString: (num: number) => string
): void => {
  // 添加SVG滤镜
  createGlowFilter(svg, 'glow', 5);
  
  // 渲染标题和输入数组
  renderTitleAndInput(svg, width, numbers);
  
  // 如果有结果，渲染结果展示
  if (result !== null) {
    renderResultBox(svg, width, result, toBinaryString);
  }
};

/**
 * 渲染标题和输入数组
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 */
const renderTitleAndInput = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  numbers: number[]
): void => {
  // 显示标题
  svg.append('text')
    .attr('class', 'title-text')
    .attr('x', width / 2)
    .attr('y', 40)
    .text('计算完成')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .style('fill', '#4dabf7')
    .style('filter', 'url(#glow)')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);
    
  // 显示输入数组
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 80)
    .text(`输入数组: [${numbers.join(', ')}]`)
    .style('opacity', 0)
    .transition()
    .delay(300)
    .duration(800)
    .style('opacity', 1);
};

/**
 * 渲染结果展示框
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param result 计算结果
 * @param toBinaryString 转换为二进制字符串的函数
 */
const renderResultBox = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  result: number,
  toBinaryString: (num: number) => string
): void => {
  // 创建3D渐变
  create3DGradient(svg, 'result-gradient', '#ff6b6b');
  
  // 创建3D舞台效果
  svg.append('ellipse')
    .attr('cx', width / 2)
    .attr('cy', 180)
    .attr('rx', 80)
    .attr('ry', 20)
    .attr('fill', '#adb5bd')
    .attr('opacity', 0.5)
    .style('filter', 'blur(2px)')
    .style('opacity', 0)
    .transition()
    .delay(600)
    .duration(800)
    .style('opacity', 0.5);
  
  // 结果框 - 使用3D效果
  const resultBox = svg.append('g')
    .attr('transform', `translate(${width/2}, 150) scale(0)`)
    .style('opacity', 0);
    
  resultBox.append('rect')
    .attr('x', -50)
    .attr('y', -25)
    .attr('width', 100)
    .attr('height', 50)
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('fill', 'url(#result-gradient)')
    .style('filter', 'url(#glow)');
    
  // 结果文字
  resultBox.append('text')
    .attr('x', 0)
    .attr('y', 5)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '24px')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
    .text(result);
    
  // 添加动画效果
  resultBox.transition()
    .delay(800)
    .duration(1000)
    .style('opacity', 1)
    .attr('transform', `translate(${width/2}, 150) scale(1) rotateY(0deg)`)
    .on('end', function() {
      // 添加特效
      addResultEffects(svg, width, resultBox);
      
      // 显示额外信息
      renderAdditionalInfo(svg, width, result, toBinaryString);
    });
};

/**
 * 添加结果特效
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param resultBox 结果框D3选择器
 */
const addResultEffects = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  resultBox: d3.Selection<SVGGElement, unknown, null, undefined>
): void => {
  // 添加粒子效果
  addParticleEffect(svg, width/2, 150, '#ff6b6b', 40);
  
  // 添加放射状光效
  addRadialEffect(svg, width/2, 150, '#ff6b6b');
  
  // 添加脉冲效果
  const rectElement = resultBox.select('rect');
  startPulseEffect(rectElement as any);
};

/**
 * 渲染额外的结果信息
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param result 计算结果
 * @param toBinaryString 转换为二进制字符串的函数
 */
const renderAdditionalInfo = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  result: number,
  toBinaryString: (num: number) => string
): void => {
  // 结果标签
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 200)
    .text('只出现一次的数字')
    .style('opacity', 0)
    .transition()
    .delay(400)
    .duration(800)
    .style('opacity', 1);
    
  // 显示二进制表示
  const binaryText = svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', 230)
    .text(`二进制表示: ${toBinaryString(result)}`)
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(800)
    .style('opacity', 1);
    
  // 给二进制表示添加发光效果
  setTimeout(() => {
    binaryText.style('filter', 'url(#glow)');
    startGlowingEffect(binaryText as any);
  }, 1600);
}; 