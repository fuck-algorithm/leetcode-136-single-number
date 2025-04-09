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
  // 确保有滤镜 - 只创建一次
  createGlowFilter(svg);
  
  // 获取或创建渐变ID - 使用缓存避免重复创建相同的渐变
  const oneGradientId = `row-gradient-one-${color.replace('#', '')}`;
  const zeroGradientId = `row-gradient-zero`;
  
  // 如果渐变不存在才创建
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  
  // 检查1的渐变是否已存在
  if (defs.select(`#${oneGradientId}`).empty()) {
    // 提取颜色亮色和暗色版本
    const baseRGB = d3.rgb(color);
    const lightColor = d3.rgb(
      Math.min(255, baseRGB.r + 50),
      Math.min(255, baseRGB.g + 50),
      Math.min(255, baseRGB.b + 50)
    ).toString();
    const darkColor = d3.rgb(
      Math.max(0, baseRGB.r - 30),
      Math.max(0, baseRGB.g - 30),
      Math.max(0, baseRGB.b - 30)
    ).toString();
    
    // 1的渐变 - 使用简化的渐变效果
    const gradient1 = defs.append('linearGradient')
      .attr('id', oneGradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    // 添加简化的渐变 (只使用两个颜色点)
    gradient1.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', lightColor);
    
    gradient1.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', darkColor);
  }
  
  // 检查0的渐变是否已存在
  if (defs.select(`#${zeroGradientId}`).empty()) {
    // 0的渐变 - 使用简化的灰度渐变
    const gradient0 = defs.append('linearGradient')
      .attr('id', zeroGradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    // 简化为两个颜色点
    gradient0.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f8f9fa');
    
    gradient0.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#dee2e6');
  }
  
  // 简化阴影滤镜 - 只创建一次，并且降低复杂度
  const shadowFilterId = 'simple-shadow';
  if (svg.select(`#${shadowFilterId}`).empty()) {
    const shadowFilter = defs.append('filter')
      .attr('id', shadowFilterId)
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    
    // 创建简单阴影 - 只使用模糊
    shadowFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '1')
      .attr('result', 'blur');
    
    // 简化合成过程
    const feMerge = shadowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }
  
  // 根据二进制长度和每个位的宽度自动调整尺寸
  
  // 计算字体大小，根据数字宽度动态调整
  const fontSize = Math.max(8, Math.min(14, digitWidth * 0.7));
  
  // 计算合适的间距，确保视觉效果平衡
  const spacing = Math.max(digitWidth * 1.05, 10); // 间距略大于宽度，至少10px
  
  // 计算方块尺寸，保持适当的宽高比
  // 对于更长的二进制，适当减小尺寸以适应空间
  const scaleMultiplier = binary.length > 16 ? 0.85 : (binary.length > 8 ? 0.9 : 1);
  const rectWidth = Math.max(digitWidth * 0.8 * scaleMultiplier, 8);
  const rectHeight = Math.max(rectWidth * 0.9, 8);
  
  // 记录方块起始位置，确保垂直居中
  const rectStartY = y - rectHeight / 2;
  
  // 计算右对齐的起始偏移量
  const alignOffset = maxLength !== undefined ? spacing * (maxLength - binary.length) : 0;
  
  // 创建一个组（g元素）来包含整行的元素 - 减少DOM操作
  const rowGroup = svg.append('g')
    .attr('class', 'binary-row');
  
  // 减少主循环中的计算和特效
  // 渲染每个二进制位
  for (let i = 0; i < binary.length; i++) {
    const digit = binary[i];
    const x = startX + alignOffset + i * spacing + spacing / 2;
    const isOne = digit === '1';
    
    // 简化圆角 - 使用固定值
    const cornerRadius = Math.max(1, rectWidth * 0.15);
    
    // 背景方块 - 简化属性设置
    const rect = rowGroup.append('rect')
      .attr('x', x - rectWidth / 2)
      .attr('y', rectStartY)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', isOne ? `url(#${oneGradientId})` : `url(#${zeroGradientId})`)
      .attr('stroke', isOne ? '#adb5bd' : '#ced4da') // 简化边框颜色
      .attr('stroke-width', binary.length > 24 ? 0.5 : 0.8) // 简化边框宽度计算
      .attr('rx', cornerRadius)
      .attr('ry', cornerRadius);
    
    // 只对1的方块添加阴影效果，减少滤镜应用数量
    if (isOne) {
      rect.style('filter', `url(#${shadowFilterId})`);
    }
    
    // 只为结果行的1添加呼吸边框效果，其他位置不添加，减少动画数量
    if (isOne && isResult) {
      // 简化边框动画参数
      const borderWidth = binary.length > 24 ? 0.8 : 1.2;
      addBreathingBorder(rect, color, borderWidth);
      
      // 只在结果行中添加放射状光效
      if (animate) {
        const effectRadius = Math.min(15, rectWidth * 1.5);
        addRadialEffect(svg, x, y, color, effectRadius);
      }
    }
    
    // 简化动画逻辑 - 只在必要时应用动画
    if (animate) {
      const animationDelay = Math.min(i * 50, 300); // 定义与矩形相同的延迟
      
      rect.style('opacity', 0)
        .transition()
        .delay(animationDelay)
        .duration(200) // 减少动画时间
        .style('opacity', isOne ? 1 : 0.9);
    }
      
    // 数字文本 - 简化样式
    const text = rowGroup.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', isOne ? 'bold' : 'normal')
      .attr('fill', isOne ? 'white' : '#495057')
      .text(digit);
    
    // 简化文字动画
    if (animate) {
      const animationDelay = Math.min(i * 50, 300); // 定义与矩形相同的延迟
      text.style('opacity', 0)
        .transition()
        .delay(animationDelay)
        .duration(200) // 减少动画时间
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
  duration: number = 50000,
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

  // 获取列的数量和位置
  const columns: { x: number, yPositions: { y: number, value: string, color: string }[] }[] = [];
  
  // 整理数据，按列分组
  sourcePositions.forEach(source => {
    // 查找现有列或创建新列
    let column = columns.find(col => Math.abs(col.x - source.x) < 1);
    if (!column) {
      column = { x: source.x, yPositions: [] };
      columns.push(column);
    }
    column.yPositions.push({ y: source.y, value: source.value, color: source.color });
  });
  
  // 按y坐标排序每列中的位置（从上到下）
  columns.forEach(column => {
    column.yPositions.sort((a, b) => a.y - b.y);
  });

  // 创建计数器跟踪完成的动画数量
  let completedAnimations = 0;
  const totalAnimations = columns.length;
  
  // 为每列创建流星动画
  columns.forEach((column, columnIndex) => {
    const positions = column.yPositions;
    if (positions.length === 0) return;
    
    // 找到对应的目标位置
    const target = targetPositions.find(t => Math.abs(t.x - column.x) < 1);
    if (!target) return;
    
    // 计算X坐标：应该与目标X坐标相同（确保垂直下落）
    const dropX = target.x;
    
    // 流星初始值为0（用于与运算）
    let meteorValue = '0';
    
    // 计算动画参数
    const delay = Math.min(columnIndex * 1000, 5000);
    const startY = positions[0].y - digitWidth * 2; // 从第一个位置上方开始
    const distance = Math.abs(target.y - startY);
    const actualDuration = Math.min(duration, Math.max(50000, distance));
    
    // 创建流星组
    const meteorGroup = svg.append('g')
      .attr('class', 'meteor')
      .style('opacity', 0);
    
    // 计算流星头部大小
    const meteorSize = Math.max(digitWidth * 0.8, 10); 
    
    // 创建流星头部（正方形带圆角）
    const meteorHead = meteorGroup.append('rect')
      .attr('x', dropX - meteorSize / 2)
      .attr('y', startY - meteorSize / 2)
      .attr('width', meteorSize)
      .attr('height', meteorSize)
      .attr('rx', meteorSize * 0.2)
      .attr('ry', meteorSize * 0.2)
      .attr('fill', '#6c757d')
      .attr('stroke', '#495057')
      .attr('stroke-width', 1);
    
    // 创建流星尾巴（垂直向上）
    const meteorTail = meteorGroup.append('path')
      .attr('d', `M ${dropX} ${startY} L ${dropX} ${startY - meteorSize * 2}`)
      .attr('stroke', `url(#${gradientId})`)
      .attr('stroke-width', meteorSize * 0.6)
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none');
    
    // 在流星头部添加数字
    const meteorText = meteorGroup.append('text')
      .attr('x', dropX)
      .attr('y', startY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Math.max(10, digitWidth * 0.7))
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(meteorValue);
    
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
        let currentPositionIndex = -1; // 当前位置索引，-1表示还未到达任何位置
        let lastAndsTime = 0; // 上次进行与运算的时间戳
        const andsInterval = 1000; // 增加与运算的最小间隔到1秒
        
        function step(timestamp: number) {
          if (!start) start = timestamp;
          
          // 计算动画进度 (0-1)
          const elapsed = timestamp - start;
          let progress = Math.min(1, elapsed / actualDuration);
          
          // 使用缓动函数模拟重力加速度 - 开始慢，结束快
          // 减小加速度，使下落更加平缓
          const easedProgress = progress * (0.5 * progress);
          
          // 计算当前Y位置（垂直下落）
          const currentY = startY + (target!.y - startY) * easedProgress;
          
          // 检查是否到达新的位置
          if (positions.length > 0) {
            // 找到当前应该检查的位置索引（基于当前Y坐标）
            let newPositionIndex = -1;
            for (let i = 0; i < positions.length; i++) {
              if (currentY >= positions[i].y && (i === positions.length - 1 || currentY < positions[i + 1].y)) {
                newPositionIndex = i;
                break;
              }
            }
            
            // 如果到达了新位置且与上次不同，执行与运算
            if (newPositionIndex !== -1 && newPositionIndex !== currentPositionIndex && 
                timestamp - lastAndsTime > andsInterval) {
              currentPositionIndex = newPositionIndex;
              lastAndsTime = timestamp;
              
              // 进行与运算并更新值
              const currentBit = positions[currentPositionIndex].value;
              meteorValue = (parseInt(meteorValue, 2) & parseInt(currentBit, 2)).toString();
              
              // 更新文本值
              meteorText.text(meteorValue);
              
              // 更新流星颜色（如果结果为1，则使用绿色；否则保持灰色）
              const newColor = meteorValue === '1' ? resultColor : '#6c757d';
              meteorHead.attr('fill', newColor);
              
              // 添加碰撞效果
              createMiniImpactEffect(svg, dropX, currentY, meteorSize * 0.8, positions[currentPositionIndex].color);
            }
          }
          
          // 更新流星头部位置
          meteorHead
            .attr('x', dropX - meteorSize / 2)
            .attr('y', currentY - meteorSize / 2);
            
          // 更新文本位置
          meteorText
            .attr('y', currentY);
          
          // 更新尾巴
          const tailLength = meteorSize * 2 * (1 + progress);
          meteorTail.attr('d', `M ${dropX} ${currentY} L ${dropX} ${currentY - tailLength}`);
          
          // 在特定进度点添加粒子
          if (progress > 0.1 && progress < 0.9 && Math.random() > 0.8) {
            createParticle(particleGroup, dropX, currentY, meteorSize * 0.6, meteorValue === '1' ? resultColor : '#6c757d');
          }
          
          // 如果动画未完成，继续下一帧
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // 动画完成，添加碰撞粒子效果
            createImpactEffect(svg, dropX, target!.y, meteorSize * 1.5, meteorValue === '1' ? resultColor : '#6c757d');
            
            // 淡出流星
            meteorGroup.transition()
              .duration(300)
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

/**
 * 创建小型碰撞效果（用于与运算时）
 */
function createMiniImpactEffect(
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
    .attr('r', size * 0.6)
    .attr('fill', 'white')
    .style('opacity', 0.7)
    .style('filter', 'url(#glow)');
  
  flash.transition()
    .duration(100)
    .attr('r', size)
    .style('opacity', 0)
    .on('end', () => flash.remove());
  
  // 创建少量散射粒子
  const particleCount = Math.floor(Math.random() * 3) + 3;
  const impactGroup = svg.append('g');
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = size * (Math.random() * 0.3 + 0.3);
    const particleSize = Math.random() * (size / 4) + (size / 8);
    
    // 粒子的终点位置
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    // 创建粒子
    const particle = impactGroup.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', particleSize)
      .attr('fill', color)
      .style('opacity', 0.6);
    
    // 粒子动画 - 快速出现然后减速
    particle.transition()
      .duration(150)
      .ease(d3.easeCubicOut)
      .attr('cx', endX)
      .attr('cy', endY)
      .transition()
      .duration(100)
      .style('opacity', 0)
      .on('end', () => particle.remove());
  }
  
  // 清理整个群组
  setTimeout(() => {
    impactGroup.remove();
  }, 300);
} 