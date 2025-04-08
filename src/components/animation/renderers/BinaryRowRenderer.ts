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
 */
export const renderBinaryRow = (
  svg: d3.Selection<any, unknown, null, undefined>,
  binary: string, 
  startX: number, 
  y: number, 
  digitWidth: number,
  color: string,
  animate: boolean = false,
  isResult: boolean = false
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
  
  // 渲染每个二进制位
  for (let i = 0; i < binary.length; i++) {
    const digit = binary[i];
    const x = startX + i * spacing;
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
        
        rect.transition()
          .duration(500)
          .attr('transform', 'scale(1.1)')
          .transition()
          .duration(500)
          .attr('transform', 'scale(1)');
          
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
 * 创建流星动画效果 - 改进版
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
    
    // 只为值为1的位创建完整动画
    const isOne = source.value === '1';
    
    // 计算动画参数
    const delay = Math.min(i * 20, 300); // 稍微错开动画开始时间
    const distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
    const actualDuration = Math.min(duration, Math.max(500, distance * 1.5)); // 根据距离调整实际动画时间
    
    // 创建流星组
    const meteorGroup = svg.append('g')
      .attr('class', 'meteor')
      .style('opacity', 0);
    
    // 计算流星头部大小
    const meteorSize = Math.max(digitWidth * 0.6, 8); // 流星大小
    const tailLength = isOne ? meteorSize * 4 : meteorSize * 2; // 尾巴长度
    
    // 计算流星轨迹：添加弧线效果
    // 获取控制点，在源和目标之间的中点上方或下方
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    // 向上偏移一个随机量，添加曲线效果
    const offsetY = (source.y < target.y) ? -distance / 3 : distance / 3;
    const controlX = midX;
    const controlY = midY + offsetY * (Math.random() * 0.4 + 0.8); // 随机化曲线程度
    
    // 为二次贝塞尔曲线计算路径点
    const numPoints = 100; // 路径点数量
    const pathPoints: { x: number, y: number }[] = [];
    
    for (let t = 0; t <= 1; t += 1/numPoints) {
      // 二次贝塞尔曲线公式: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
      const x = Math.pow(1-t, 2) * source.x + 2 * (1-t) * t * controlX + Math.pow(t, 2) * target.x;
      const y = Math.pow(1-t, 2) * source.y + 2 * (1-t) * t * controlY + Math.pow(t, 2) * target.y;
      pathPoints.push({ x, y });
    }
    
    // 创建流星头部（圆形）
    const meteorHead = meteorGroup.append('circle')
      .attr('cx', source.x)
      .attr('cy', source.y)
      .attr('r', meteorSize / 2)
      .attr('fill', isOne ? resultColor : '#adb5bd');
    
    // 创建流星尾巴
    let meteorTail: d3.Selection<SVGPathElement, unknown, null, undefined> | undefined;
    
    if (isOne) {
      // 使用路径而不是矩形，让尾巴能沿曲线
      meteorTail = meteorGroup.append('path')
        .attr('d', `M ${source.x} ${source.y} L ${source.x} ${source.y}`) // 初始状态为一个点
        .attr('stroke', `url(#${gradientId})`)
        .attr('stroke-width', meteorSize)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none');
    }
    
    // 在流星头部添加数字
    const meteorText = meteorGroup.append('text')
      .attr('x', source.x)
      .attr('y', source.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Math.max(10, digitWidth * 0.7))
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(source.value);
    
    // 显示流星
    meteorGroup.transition()
      .duration(100)
      .style('opacity', 1)
      .on('end', () => {
        // 使用自定义计时器执行动画
        let start: number | null = null;
        let previousTimestamp: number | null = null;
        let tailPoints: {x: number, y: number}[] = [];
        const maxTailPoints = 10; // 尾巴的最大点数
        
        function step(timestamp: number) {
          if (!start) start = timestamp;
          
          // 计算动画进度 (0-1)
          const elapsed = timestamp - start;
          const progress = Math.min(1, elapsed / actualDuration);
          
          // 获取当前路径点
          const currentIndex = Math.min(Math.floor(progress * (pathPoints.length - 1)), pathPoints.length - 1);
          const currentPoint = pathPoints[currentIndex];
          
          // 更新流星头部位置
          meteorHead
            .attr('cx', currentPoint.x)
            .attr('cy', currentPoint.y);
            
          // 更新文本位置
          meteorText
            .attr('x', currentPoint.x)
            .attr('y', currentPoint.y);
          
          // 更新尾巴 (仅对值为1的位)
          if (isOne && meteorTail) {
            // 添加当前点到尾巴点数组
            tailPoints.unshift(currentPoint);
            
            // 限制尾巴长度
            if (tailPoints.length > maxTailPoints) {
              tailPoints = tailPoints.slice(0, maxTailPoints);
            }
            
            // 如果有足够的点，绘制尾巴路径
            if (tailPoints.length > 1) {
              const tailPath = `M ${currentPoint.x} ${currentPoint.y}`;
              const tailCurve = tailPoints.map((p, i) => {
                // 根据点在尾巴中的位置计算透明度
                const opacity = 1 - (i / tailPoints.length);
                // 返回带有透明度的路径点
                return `L ${p.x} ${p.y}`;
              }).join(' ');
              
              meteorTail.attr('d', tailPath + ' ' + tailCurve);
            }
          }
          
          // 如果动画未完成，继续下一帧
          if (progress < 1) {
            previousTimestamp = timestamp;
            requestAnimationFrame(step);
          } else {
            // 动画完成，淡出流星
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