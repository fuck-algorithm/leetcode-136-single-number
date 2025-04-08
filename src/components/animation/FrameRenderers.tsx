import * as d3 from 'd3';
import { renderBinaryXorOperation } from './renderers/BinaryXorRenderer';
import { toBinaryString } from './utils/BinaryUtils';
import { calculateXorSteps, getColorForValue } from './utils/XorUtils';

/**
 * 渲染异或运算帧
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 * @param currentFrame 当前帧
 */
export const renderXorFrame = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  numbers: number[],
  currentFrame: number
): void => {
  // 计算每一步的异或结果
  const xorSteps = calculateXorSteps(numbers);
  const prevResult = xorSteps[currentFrame - 1];
  const currentNumber = numbers[currentFrame - 1];
  const currentResult = prevResult ^ currentNumber;
  
  // 添加SVG滤镜用于发光效果
  const defs = svg.append('defs');
  if (svg.select('#glow').empty()) {
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
      
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');
  }
  
  // 显示标题
  svg.append('text')
    .attr('class', 'title-text')
    .attr('x', width / 2)
    .attr('y', 40)
    .text(`步骤 ${currentFrame}/${numbers.length}`)
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#4dabf7')
    .style('opacity', 0)
    .transition()
    .duration(500)
    .style('opacity', 1);
    
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
    
  // 显示二进制表示
  const prevResultBinary = toBinaryString(prevResult);
  const currentNumberBinary = toBinaryString(currentNumber);
  const currentResultBinary = toBinaryString(currentResult);
  
  // 添加延迟后渲染二进制操作
  setTimeout(() => {
    renderBinaryXorOperation(svg, width, prevResultBinary, currentNumberBinary, currentResultBinary);
  }, 600);
  
  // 为当前操作的数字添加粒子效果
  addParticleEffect(svg, width / 2, 110, getColorForValue(currentNumber));
};

/**
 * 启动发光效果
 */
const startGlowingEffect = (selection: d3.Selection<any, unknown, null, undefined>): void => {
  selection
    .transition()
    .duration(800)
    .attr('opacity', 0.7)
    .transition()
    .duration(800)
    .attr('opacity', 1)
    .on('end', function() {
      startGlowingEffect(d3.select(this) as any);
    });
};

/**
 * 添加粒子效果
 */
const addParticleEffect = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  particleCount: number = 20
): void => {
  // 创建随机粒子
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30 + 20;
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 1000 + 1000;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    const particle = svg.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size)
      .attr('fill', color)
      .attr('opacity', 0.7);
      
    // 粒子动画
    particle.transition()
      .duration(duration)
      .attr('cx', endX)
      .attr('cy', endY)
      .attr('r', 0)
      .attr('opacity', 0)
      .on('end', function() {
        d3.select(this).remove();
      });
  }
};

/**
 * 渲染结果帧
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param numbers 输入数组
 * @param result 计算结果
 */
export const renderResultFrame = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  numbers: number[],
  result: number | null
): void => {
  // 添加SVG滤镜用于发光效果
  const defs = svg.append('defs');
  if (svg.select('#glow').empty()) {
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '5')
      .attr('result', 'blur');
      
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');
  }
  
  // 添加3D效果的渐变
  if (result !== null) {
    const resultGradient = defs.append('linearGradient')
      .attr('id', 'result-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    resultGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.rgb('#ff6b6b').brighter(1).toString());
      
    resultGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#ff6b6b');
      
    resultGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb('#ff6b6b').darker(1).toString());
  }
  
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
    
  // 绘制最终结果
  if (result !== null) {
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
        // 添加粒子效果
        addParticleEffect(svg, width/2, 150, '#ff6b6b', 40);
        
        // 添加放射状光效
        addRadialEffect(svg, width/2, 150, '#ff6b6b');
        
        // 添加脉冲效果
        const rectElement = d3.select(this).select('rect');
        startPulseEffect(rectElement as any);
      });
      
    // 结果标签
    svg.append('text')
      .attr('class', 'description-text')
      .attr('x', width / 2)
      .attr('y', 200)
      .text('只出现一次的数字')
      .style('opacity', 0)
      .transition()
      .delay(1800)
      .duration(800)
      .style('opacity', 1);
      
    // 显示二进制表示
    svg.append('text')
      .attr('class', 'description-text')
      .attr('x', width / 2)
      .attr('y', 230)
      .text(`二进制表示: ${toBinaryString(result)}`)
      .style('opacity', 0)
      .transition()
      .delay(2200)
      .duration(800)
      .style('opacity', 1);
      
    // 给二进制表示添加发光效果
    setTimeout(() => {
      const textElement = svg.select('text:nth-child(8)');
      if (!textElement.empty()) {
        textElement.style('filter', 'url(#glow)');
        startGlowingEffect(textElement as any);
      }
    }, 3000);
  }
};

/**
 * 开始脉冲效果
 */
const startPulseEffect = (selection: d3.Selection<any, unknown, null, undefined>): void => {
  selection
    .transition()
    .duration(1000)
    .attr('opacity', 0.7)
    .transition()
    .duration(1000)
    .attr('opacity', 1)
    .on('end', function() {
      startPulseEffect(d3.select(this) as any);
    });
};

/**
 * 添加放射状光效
 */
const addRadialEffect = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string
): void => {
  const defs = svg.select('defs');
  const gradientId = `radial-gradient-${Math.random().toString(36).substring(2, 15)}`;
  
  const radialGradient = defs.append('radialGradient')
    .attr('id', gradientId)
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%')
    .attr('fx', '50%')
    .attr('fy', '50%');
    
  radialGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.8);
    
  radialGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0);
    
  // 添加放射圆
  const circle = svg.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 0)
    .attr('fill', `url(#${gradientId})`)
    .attr('opacity', 0.7);
    
  // 动画效果
  circle.transition()
    .duration(1500)
    .attr('r', 100)
    .attr('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
      radialGradient.remove();
    });
}; 