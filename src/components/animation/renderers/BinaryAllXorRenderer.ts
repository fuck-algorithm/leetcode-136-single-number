import * as d3 from 'd3';
import { renderBinaryRow } from './BinaryRowRenderer';

/**
 * 渲染全部数字异或操作的二进制表示动画
 * @param svg SVG元素
 * @param width SVG宽度 
 * @param numbers 数字数组
 * @param resultValue XOR结果值
 * @param toBinaryStringFn 二进制转换函数(可选)
 */
export function renderAllBinaryXorOperation(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  numbers: number[],
  width: number,
  height: number,
  digitWidth: number,
  showDecimal: boolean = true
): void {
  svg.selectAll('*').remove();
  
  if (numbers.length === 0) return;
  
  // 计算最大二进制长度
  const binaryStrings = numbers.map(n => convertToBinary(n));
  const resultBinary = convertToBinary(
    numbers.reduce((acc, curr) => acc ^ curr, 0)
  );
  const maxLength = Math.max(
    ...binaryStrings.map(b => b.length),
    resultBinary.length
  );
  
  // 行高和间距
  const rowHeight = 22;
  const verticalSpacing = 2;
  const totalInputHeight = numbers.length * (rowHeight + verticalSpacing);
  const extraSpaceForResult = rowHeight + 15;
  
  // 计算SVG的总高度
  const totalHeight = totalInputHeight + extraSpaceForResult;
  svg.attr('viewBox', `0 0 ${width} ${totalHeight}`);
  
  // 计算左右边距和标签位置，使内容居中
  const leftLabelWidth = 150; // 增加左侧标签所需宽度，为连线提供更多空间
  const rightMargin = -50; // 使用负边距强制内容扩展到右侧
  
  // 计算整个内容的宽度，包括标签和二进制表示
  const contentWidth = width - leftLabelWidth - rightMargin;
  
  // 调整数字宽度以适应屏幕，确保不会太小
  const adjustedDigitWidth = Math.max(
    digitWidth,
    Math.min(40, contentWidth / maxLength) // 增加最小宽度，同时设置上限
  );
  
  // 确保整个内容居中
  const startX = leftLabelWidth + (contentWidth - adjustedDigitWidth * maxLength) / 2;
  
  // 创建数字到颜色的映射，相同数字使用相同颜色
  const numberColorMap = new Map<number, string>();
  const uniqueNumbers = [...new Set(numbers)];
  uniqueNumbers.forEach((num, index) => {
    numberColorMap.set(num, getColorByIndex(index));
  });
  
  // 为连接线创建一个单独的组，确保它们绘制在数字下面
  const lineGroup = svg.append('g').attr('class', 'connection-lines');
  
  // 创建一个记录相同数字行索引的映射
  const numberRowMap = new Map<number, number[]>();
  numbers.forEach((num, index) => {
    if (!numberRowMap.has(num)) {
      numberRowMap.set(num, []);
    }
    numberRowMap.get(num)?.push(index);
  });
  
  // 保存源和目标位置
  const sourcePositions: Array<{ x: number; y: number; value: string; color: string }> = [];
  const targetPositions: Array<{ x: number; y: number }> = [];
  
  // 保存每个数字行的左侧位置，用于连线
  const numberRowPositions: Array<{ num: number, y: number, paired: boolean }> = [];
  
  // 渲染输入的二进制表示
  binaryStrings.forEach((binary, index) => {
    // 计算每行的中心Y坐标 - 用于对齐所有元素
    const rowCenterY = index * (rowHeight + verticalSpacing) + rowHeight / 2;
    
    // 获取当前数字对应的颜色
    const color = numberColorMap.get(numbers[index]) || '#228be6'; // 默认蓝色
    
    // 记录数字行位置信息
    numberRowPositions.push({ 
      num: numbers[index], 
      y: rowCenterY, 
      paired: false 
    });
    
    // 渲染每一行的二进制表示
    renderBinaryRow(
      svg,
      binary,
      startX,
      rowCenterY, // 使用中心坐标
      adjustedDigitWidth,
      color,
      false,
      false
    );
    
    // 显示十进制值 - 确保与二进制方格垂直对齐
    if (showDecimal) {
      // 直接使用当前行的中心Y坐标 - 确保完全水平对齐
      renderNumberLabel(svg, numbers[index], startX - 10, rowCenterY, color);
    }
    
    // 收集源位置 - 1的位置
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '1') {
        sourcePositions.push({
          x: startX + i * adjustedDigitWidth + adjustedDigitWidth / 2,
          y: rowCenterY, // 使用同一个中心坐标
          value: '1',
          color: color
        });
      }
    }
  });
  
  // 绘制相同数字之间的连接线
  numberRowMap.forEach((rowIndices, num) => {
    // 仅对出现偶数次的数字进行两两配对
    const color = numberColorMap.get(num) || '#228be6';
    
    // 两两配对
    for (let i = 0; i < rowIndices.length; i += 2) {
      // 如果只剩下单个元素就跳过（这是只出现一次的数字）
      if (i + 1 >= rowIndices.length) continue;
      
      const row1 = rowIndices[i];
      const row2 = rowIndices[i + 1];
      
      const y1 = numberRowPositions[row1].y;
      const y2 = numberRowPositions[row2].y;
      
      // 标记这两行已配对
      numberRowPositions[row1].paired = true;
      numberRowPositions[row2].paired = true;
      
      // 绘制连接线
      const lineX = 50; // 增加左侧连线的X坐标，给连线留出更多空间
      
      // 创建路径 - 使用贝塞尔曲线使连线更平滑
      const path = lineGroup.append('path')
        .attr('d', `M ${lineX} ${y1} C ${lineX - 30} ${(y1 + y2) / 2}, ${lineX - 30} ${(y1 + y2) / 2}, ${lineX} ${y2}`)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.7)
        .attr('stroke-dasharray', '4,2')
        .style('pointer-events', 'none');
      
      // 添加连线动画
      path.style('stroke-dashoffset', 100)
        .transition()
        .duration(500)
        .style('stroke-dashoffset', 0);
      
      // 添加指示配对的小圆圈
      lineGroup.append('circle')
        .attr('cx', lineX)
        .attr('cy', y1)
        .attr('r', 3)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
      
      lineGroup.append('circle')
        .attr('cx', lineX)
        .attr('cy', y2)
        .attr('r', 3)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    }
  });
  
  // 突出显示单独出现的数字行
  const singleNumber = numberRowPositions.find(item => 
    !item.paired && numberRowMap.get(item.num)?.length === 1
  );
  
  if (singleNumber) {
    const color = numberColorMap.get(singleNumber.num) || '#228be6';
    const singleLineX = 50; // 与连线X坐标保持一致
    
    // 不显示文本标记，只保留高亮指示器
    // 添加高亮指示器
    const highlight = lineGroup.append('circle')
      .attr('cx', singleLineX)
      .attr('cy', singleNumber.y)
      .attr('r', 5)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);
    
    // 添加脉动动画
    highlight.transition()
      .duration(1000)
      .attr('r', 8)
      .attr('opacity', 0.6)
      .transition()
      .duration(1000)
      .attr('r', 5)
      .attr('opacity', 1)
      .on('end', function repeat() {
        d3.select(this)
          .transition()
          .duration(1000)
          .attr('r', 8)
          .attr('opacity', 0.6)
          .transition()
          .duration(1000)
          .attr('r', 5)
          .attr('opacity', 1)
          .on('end', repeat);
      });
  }
  
  // 结果行的Y坐标 - 也使用中心点计算
  const resultY = totalInputHeight;
  const resultCenterY = resultY + rowHeight / 2;
  
  // 为结果创建目标位置 - 结果中1的位置
  for (let i = 0; i < resultBinary.length; i++) {
    if (resultBinary[i] === '1') {
      targetPositions.push({
        x: startX + i * adjustedDigitWidth + adjustedDigitWidth / 2,
        y: resultCenterY // 使用中心坐标
      });
    }
  }
  
  // 添加"Result:"标签 - 与结果行垂直对齐
  svg
    .append('text')
    .attr('x', 50) // 固定在左侧位置
    .attr('y', resultCenterY) // 使用结果行的中心Y坐标
    .attr('dominant-baseline', 'middle') // 确保垂直居中
    .attr('text-anchor', 'end') // 水平右对齐
    .attr('fill', '#40c057')
    .text('Result:');
  
  // 显示十进制结果值 - 与结果行垂直对齐
  if (showDecimal) {
    const result = numbers.reduce((acc, curr) => acc ^ curr, 0);
    // 将数值放在标签右侧的固定位置
    renderNumberLabel(svg, result, 90, resultCenterY, '#40c057');
  }
  
  // 使用动画
  const animate = true;
  if (animate) {
    createMeteorAnimation(
      svg,
      sourcePositions,
      targetPositions,
      800,
      adjustedDigitWidth,
      '#40c057',
      () => {
        // 仅在动画完成后渲染结果
        renderBinaryRow(
          svg,
          resultBinary,
          startX,
          resultCenterY,
          adjustedDigitWidth,
          '#40c057',
          false,  // 不需要入场动画
          true    // 是结果行
        );
      }
    );
  } else {
    // 如果不使用动画，直接渲染结果
    renderBinaryRow(
      svg,
      resultBinary,
      startX,
      resultCenterY, // 使用中心坐标
      adjustedDigitWidth,
      '#40c057',
      false,
      true
    );
  }
}

// 新函数：渲染数字标签 - 简化标签渲染逻辑并确保对齐
function renderNumberLabel(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  value: number,
  x: number,
  y: number, // 直接使用中心Y坐标
  color: string
): void {
  // 转换为十进制字符串
  const displayValue = value.toString();
  
  // 根据数字长度动态计算字体大小
  let fontSize = 14; // 默认字体大小
  if (displayValue.length > 8) {
    fontSize = Math.max(14 - (displayValue.length - 8) * 0.5, 7);
  }
  
  svg
    .append('text')
    .attr('x', x)
    .attr('y', y) // 直接使用传入的中心Y坐标
    .attr('font-size', `${fontSize}px`)
    .attr('dominant-baseline', 'middle') // 确保垂直居中
    .attr('text-anchor', 'end') // 右对齐
    .attr('fill', color)
    .text(displayValue);
}

/**
 * 根据索引获取一个颜色
 * @param index 索引
 * @returns 16进制颜色字符串
 */
function getColorByIndex(index: number): string {
  const colors = [
    '#4dabf7', // 蓝色
    '#f783ac', // 粉色
    '#a9e34b', // 浅绿色
    '#ffa94d', // 橙色
    '#9775fa', // 紫色
    '#63e6be', // 青色
    '#ff8787', // 红色
    '#ffd43b', // 黄色
    '#748ffc', // 靛青色
    '#69db7c'  // 绿色
  ];
  
  // 返回对应索引的颜色，如果索引超出范围则循环使用
  return colors[index % colors.length];
}

/**
 * 创建闪光效果
 */
const createFlashEffect = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  // 创建闪光圆形
  const flash = svg.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 0)
    .attr('fill', color)
    .attr('fill-opacity', 0.8);
  
  // 闪光动画
  flash.transition()
    .duration(300)
    .attr('r', radius)
    .attr('fill-opacity', 0.6)
    .transition()
    .duration(200)
    .attr('r', radius * 0.8)
    .attr('fill-opacity', 0)
    .remove();
};

/**
 * 创建粒子效果
 */
const createParticleEffect = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  particleCount: number = 8
) => {
  // 为每个粒子创建随机方向
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 10 + Math.random() * 10;
    
    const particle = svg.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 2)
      .attr('fill', color)
      .attr('fill-opacity', 0.8);
    
    particle.transition()
      .duration(400 + Math.random() * 300)
      .attr('cx', x + Math.cos(angle) * distance)
      .attr('cy', y + Math.sin(angle) * distance)
      .attr('r', 0.5)
      .attr('fill-opacity', 0)
      .remove();
  }
};

// 添加convertToBinary函数
function convertToBinary(n: number): string {
  // 获取数字的二进制表示
  // 对于负数，使用无符号右移0位操作，强制转换为32位无符号整数表示
  // 这样可以得到正确的二进制补码表示，不会有负号出现
  const binary = (n >>> 0).toString(2);
  
  // 确保二进制位数至少为32位或与当前最长的二进制位数一致
  // 这样所有数字都能完整显示所有有效位
  return binary.padStart(Math.max(32, binary.length), '0');
}

// 替换createMeteorAnimation函数
function createMeteorAnimation(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  sourcePositions: Array<{ x: number; y: number; value: string; color: string }>,
  targetPositions: Array<{ x: number; y: number }>,
  duration: number,
  digitWidth: number,
  color: string,
  onComplete: () => void
): void {
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
    .attr('stop-color', color)
    .attr('stop-opacity', 1);

  gradient.append('stop')
    .attr('offset', '50%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.7);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0);

  // 创建计数器跟踪完成的动画数量
  let completedAnimations = 0;
  const totalAnimations = Math.min(sourcePositions.length, targetPositions.length);
  
  // 按列索引对源位置进行分组，确保每列只有一个流星
  const columnMap = new Map<number, {source: typeof sourcePositions[0], index: number}>();
  
  // 收集每列的源位置，使用x坐标作为键（确保每列只保留一个值为1的位置）
  sourcePositions.forEach((source, index) => {
    // 四舍五入x坐标到最近的列位置，防止浮点数比较问题
    const columnKey = Math.round(source.x);
    
    // 如果这列还没有源位置，或当前源位置是1（优先使用值为1的位）
    if (!columnMap.has(columnKey) || source.value === '1') {
      columnMap.set(columnKey, {source, index});
    }
  });
  
  // 使用分组后的位置创建流星
  let animationCount = 0;
  columnMap.forEach(({source, index}, columnKey) => {
    if (index >= targetPositions.length) return;
    const target = targetPositions[index];
    
    // 确保流星X坐标与列完全对齐
    const dropX = target.x;
    
    // 只为值为1的位创建完整动画
    const isOne = source.value === '1';
    
    // 计算动画参数
    const delay = Math.min(animationCount * 50, 400); // 稍微错开动画开始时间
    animationCount++; // 增加计数器以确保动画时间错开
    
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
      .attr('fill', isOne ? source.color : '#adb5bd')
      .attr('filter', 'url(#glow)');
    
    // 创建流星尾巴（垂直向上）
    let meteorTail = isOne ? meteorGroup.append('path')
      .attr('d', `M ${dropX} ${source.y} L ${dropX} ${source.y - meteorSize * 3}`)
      .attr('stroke', `url(#${gradientId})`)
      .attr('stroke-width', meteorSize * 0.8)
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none') : null;
    
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
            createParticleForMeteor(particleGroup, dropX, currentY, meteorSize, source.color);
          }
          
          // 如果动画未完成，继续下一帧
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // 动画完成，添加碰撞粒子效果
            if (isOne) {
              createImpactEffectForMeteor(svg, dropX, target.y, meteorSize * 1.5, color);
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
                if (completedAnimations >= animationCount && onComplete) {
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
  if (animationCount === 0 && onComplete) {
    onComplete();
  }
}

/**
 * 为流星创建单个粒子
 */
function createParticleForMeteor(
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
 * 为流星创建碰撞效果
 */
function createImpactEffectForMeteor(
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