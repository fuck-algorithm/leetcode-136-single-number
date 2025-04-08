import * as d3 from 'd3';
import { create3DGradient } from '../effects/backgroundEffects';
import { addRadialEffect } from '../effects/particleEffects';
import { createGlowFilter, addBreathingBorder } from '../effects/glowEffects';

/**
 * 渲染单行二进制数（带流星效果）
 * @param svg D3 SVG选择器
 * @param binary 二进制字符串
 * @param startX 起始X坐标
 * @param y Y坐标
 * @param digitWidth 每个数字宽度
 * @param color 填充颜色
 * @param animate 是否添加动画
 * @param isResult 是否为结果行
 * @param maxLength 最大二进制长度，用于对齐
 */
export const renderBinaryRow = (
  svg: d3.Selection<any, unknown, null, undefined>,
  binary: string, 
  startX: number, 
  y: number, 
  digitWidth: number,
  color: string,
  animate: boolean = false,
  isResult: boolean = false,
  maxLength?: number
): void => {
  // 确保有滤镜
  createGlowFilter(svg);
  
  // 为每个1创建不同的渐变
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      create3DGradient(svg, `gradient-${i}-${color.replace('#', '')}`, color);
    }
  }
  
  // 根据二进制长度和每个位的宽度自动调整尺寸
  const binaryLength = binary.length;
  
  // 计算字体大小，根据数字宽度动态调整
  const fontSize = Math.max(8, Math.min(14, digitWidth * 0.7));
  
  // 计算合适的间距，确保视觉效果平衡
  const spacing = binary.length > 20 
    ? Math.max(digitWidth * 0.9, 8) 
    : Math.max(digitWidth, 10);
  
  // 计算方块尺寸，保持适当的宽高比
  // 对于更长的二进制，适当减小尺寸以适应空间
  const scaleMultiplier = binary.length > 16 ? 0.85 : (binary.length > 8 ? 0.9 : 1);
  const rectWidth = Math.max(digitWidth * 0.8 * scaleMultiplier, 8);
  const rectHeight = Math.max(rectWidth * 0.9, 8);
  
  // 记录方块起始位置，确保垂直居中
  const rectStartY = y - rectHeight / 2;
  
  // 计算右对齐的起始偏移量
  const alignOffset = maxLength !== undefined ? spacing * (maxLength - binary.length) : 0;
  
  // 渲染每个二进制位
  for (let i = 0; i < binary.length; i++) {
    const digit = binary[i];
    // 修改X坐标计算，确保与索引对齐
    const x = startX + alignOffset + i * spacing + spacing / 2;
    const isOne = digit === '1';
    const gradientId = `gradient-${i}-${color.replace('#', '')}`;
    
    // 背景方块
    const rect = svg.append('rect')
      .attr('x', x - rectWidth / 2)
      .attr('y', rectStartY)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', isOne ? `url(#${gradientId})` : '#e9ecef')
      .attr('stroke', '#adb5bd')
      .attr('stroke-width', binary.length > 24 ? 0.4 : (binary.length > 16 ? 0.7 : 1))
      .attr('rx', Math.max(1, rectWidth * 0.1))
      .attr('ry', Math.max(1, rectHeight * 0.1));
    
    // 添加光效和3D变换
    if (isOne) {
      rect.style('filter', 'url(#glow)')
        .attr('transform', 'translate(0, 0)');
      
      // 如果是结果行，添加特殊效果
      if (isResult) {
        // 为结果行添加呼吸发光边框效果
        addBreathingBorder(rect, color, binary.length > 24 ? 0.8 : (binary.length > 16 ? 1.2 : 1.5));
        
        // 添加放射状光效
        const effectRadius = Math.min(20, rectWidth * 1.8);
        addRadialEffect(svg, x, y, color, effectRadius);
      }
      // 如果不是结果行但需要特殊呼吸效果
      else if (animate) {
        // 为动画中的1添加呼吸发光边框效果，但使用较小的边框宽度
        addBreathingBorder(rect, color, binary.length > 24 ? 0.5 : (binary.length > 16 ? 0.8 : 1));
      }
      
      // 如果需要动画效果
      if (animate) {
        const animationDelay = Math.min(i * 70, 400);
          
        rect.style('opacity', 0)
          .transition()
          .delay(animationDelay)
          .duration(300)
          .style('opacity', 1)
          .attr('transform', 'translate(0, -1)')
          .transition()
          .duration(200)
          .attr('transform', 'translate(0, 0)');
      }
    }
      
    // 数字文本
    const text = svg.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', isOne ? 'bold' : 'normal')
      .attr('fill', isOne ? 'white' : '#495057')
      .text(digit);
    
    // 给数字1添加动画效果
    if (isOne && animate) {
      const animationDelay = Math.min(i * 70, 400);
        
      text.style('opacity', 0)
        .transition()
        .delay(animationDelay)
        .duration(300)
        .style('opacity', 1);
    }
  }
};

/**
 * 创建垂直砸落动画效果
 * @param svg D3 SVG选择器
 * @param sourcePositions 源位置（起点）数组
 * @param targetPositions 目标位置（终点）数组
 * @param duration 动画持续时间（毫秒）
 * @param digitWidth 数字宽度
 * @param resultColor 结果颜色
 * @param onComplete 动画完成回调
 */
export const createMeteorAnimation = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  sourcePositions: Array<{x: number, y: number, value: string, color: string}>,
  targetPositions: Array<{x: number, y: number}>,
  duration: number = 800,
  digitWidth: number = 20,
  resultColor: string = '#40c057',
  onComplete?: () => void
): void => {
  // 如果没有足够的位置数据，则不创建动画
  if (sourcePositions.length === 0 || targetPositions.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  // 创建一个defs元素来存放渐变等
  let defs = svg.select<SVGDefsElement>('defs');
  if (defs.empty()) {
    defs = svg.append<SVGDefsElement>('defs');
  }

  // 为流星效果创建渐变
  const gradientId = `meteor-gradient-${Math.random().toString(36).substring(2, 9)}`;
  const gradient = defs.append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', resultColor)
    .attr('stop-opacity', 1);

  gradient.append('stop')
    .attr('offset', '50%')
    .attr('stop-color', resultColor)
    .attr('stop-opacity', 0.7);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', resultColor)
    .attr('stop-opacity', 0);

  // 创建计数器跟踪完成的动画数量
  let completedAnimations = 0;
  const totalAnimations = Math.min(sourcePositions.length, targetPositions.length);
  
  // 为每个位创建流星动画
  sourcePositions.forEach((source, i) => {
    if (i >= targetPositions.length) return;
    const target = targetPositions[i];
    
    // 计算X坐标：应该与目标X坐标相同（确保垂直下落）
    const dropX = target.x;
    
    // 只为值为1的位创建完整动画
    const isOne = source.value === '1';
    
    // 计算动画参数
    const delay = Math.min(i * 50, 400); // 稍微错开动画开始时间
    const distance = Math.abs(target.y - source.y);
    const actualDuration = Math.min(duration, Math.max(500, distance)); // 根据距离调整实际动画时间
    
    // 创建流星组
    const meteorGroup = svg.append('g')
      .attr('class', 'meteor')
      .style('opacity', 0);
    
    // 计算流星头部大小
    const meteorSize = Math.max(digitWidth * 0.6, 8); 
    
    // 创建流星头部（圆形）
    const meteorHead = meteorGroup.append('circle')
      .attr('cx', dropX)
      .attr('cy', source.y)
      .attr('r', meteorSize / 2)
      .attr('fill', isOne ? resultColor : '#adb5bd');
    
    // 创建流星尾巴（垂直向上）
    let meteorTail: d3.Selection<SVGPathElement, unknown, null, undefined> | undefined;
    if (isOne) {
      meteorTail = meteorGroup.append('path')
        .attr('d', `M ${dropX} ${source.y} L ${dropX} ${source.y - meteorSize * 3}`)
        .attr('stroke', `url(#${gradientId})`)
        .attr('stroke-width', meteorSize * 0.8)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none');
    }
    
    // 在流星头部添加数字
    const meteorText = meteorGroup.append('text')
      .attr('x', dropX)
      .attr('y', source.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Math.max(10, digitWidth * 0.7))
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(source.value);
    
    // 创建粒子容器
    const particleGroup = meteorGroup.append('g')
      .attr('class', 'particles');
    
    // 显示流星
    meteorGroup.transition()
      .duration(100)
      .style('opacity', 1)
      .on('end', () => {
        // 使用自定义计时器执行动画
        let start: number | null = null;
        let previousTimestamp: number | null = null;
        
        function step(timestamp: number) {
          if (!start) start = timestamp;
          
          // 计算动画进度 (0-1)
          const elapsed = timestamp - start;
          let progress = Math.min(1, elapsed / actualDuration);
          
          // 使用缓动函数模拟重力加速度 - 开始慢，结束快
          // 使用基于物理的二次方程：d = 1/2 * g * t^2
          const easedProgress = progress * progress;
          
          // 计算当前Y位置（垂直下落）
          const currentY = source.y + (target.y - source.y) * easedProgress;
          
          // 更新流星头部位置
          meteorHead
            .attr('cy', currentY);
            
          // 更新文本位置
          meteorText
            .attr('y', currentY);
          
          // 更新尾巴 (仅对值为1的位)
          if (isOne && meteorTail) {
            // 尾巴始终在头部上方，长度随速度增加
            const tailLength = meteorSize * 3 * (1 + progress);
            meteorTail.attr('d', `M ${dropX} ${currentY} L ${dropX} ${currentY - tailLength}`);
          }
          
          // 在特定进度点添加粒子
          if (isOne && progress > 0.1 && progress < 0.9 && Math.random() > 0.7) {
            createParticle(particleGroup, dropX, currentY, meteorSize, resultColor);
          }
          
          // 如果动画未完成，继续下一帧
          if (progress < 1) {
            previousTimestamp = timestamp;
            requestAnimationFrame(step);
          } else {
            // 动画完成，添加碰撞粒子效果
            if (isOne) {
              createImpactEffect(svg, dropX, target.y, meteorSize * 1.5, resultColor);
            }
            
            // 淡出流星
            meteorGroup.transition()
              .duration(200)
              .style('opacity', 0)
              .on('end', () => {
                // 移除流星元素
                meteorGroup.remove();
                
                // 增加计数器并检查是否完成所有动画
                completedAnimations++;
                if (completedAnimations >= totalAnimations && onComplete) {
                  setTimeout(onComplete, 100);
                }
              });
          }
        }
        
        // 开始动画循环
        setTimeout(() => {
          requestAnimationFrame(step);
        }, delay);
      });
  });
  
  // 如果没有动画要执行，则立即调用完成回调
  if (totalAnimations === 0 && onComplete) {
    onComplete();
  }
};

/**
 * 创建单个粒子
 */
function createParticle(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  // 随机角度和速度
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 2 + 1;
  const particleSize = Math.random() * (size / 4) + (size / 8);
  
  // 初始位置偏移
  const offsetX = (Math.random() - 0.5) * size * 0.5;
  
  // 创建粒子
  const particle = container.append('circle')
    .attr('cx', x + offsetX)
    .attr('cy', y)
    .attr('r', particleSize)
    .attr('fill', color)
    .style('opacity', 0.8);
  
  // 粒子动画
  const duration = Math.random() * 300 + 200;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  // 使用自定义动画而不是d3.transition，更好地控制物理效果
  let startTime: number;
  
  function animateParticle(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / duration;
    
    if (progress < 1) {
      // 模拟重力和摩擦力
      const currentX = x + offsetX + vx * progress * size * 0.5;
      const currentY = y + vy * progress * size * 0.5 + 2 * progress * progress * size; // 加速下落
      
      particle
        .attr('cx', currentX)
        .attr('cy', currentY)
        .style('opacity', 0.8 - progress * 0.8);
      
      requestAnimationFrame(animateParticle);
    } else {
      particle.remove();
    }
  }
  
  requestAnimationFrame(animateParticle);
}

/**
 * 创建碰撞效果
 */
function createImpactEffect(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  // 碰撞闪光
  const flash = svg.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', size)
    .attr('fill', 'white')
    .style('opacity', 0.8)
    .style('filter', 'url(#glow)');
  
  flash.transition()
    .duration(150)
    .attr('r', size * 1.5)
    .style('opacity', 0)
    .on('end', () => flash.remove());
  
  // 创建多个散射粒子
  const particleCount = Math.floor(Math.random() * 6) + 8;
  const impactGroup = svg.append('g');
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = size * (Math.random() * 0.5 + 0.8);
    const particleSize = Math.random() * (size / 3) + (size / 6);
    
    // 粒子的终点位置
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    // 创建粒子
    const particle = impactGroup.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', particleSize)
      .attr('fill', color)
      .style('opacity', 0.8);
    
    // 粒子动画 - 快速出现然后减速
    particle.transition()
      .duration(300)
      .ease(d3.easeCubicOut) // 初始快速减速
      .attr('cx', endX)
      .attr('cy', endY)
      .transition()
      .duration(200)
      .style('opacity', 0)
      .on('end', () => particle.remove());
  }
  
  // 清理整个群组
  setTimeout(() => {
    impactGroup.remove();
  }, 600);
} 