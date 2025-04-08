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
  const leftLabelWidth = 100; // 增加左侧标签所需宽度
  const rightMargin = 30; // 右侧边距
  
  // 计算整个内容的宽度，包括标签和二进制表示
  const contentWidth = width - leftLabelWidth - rightMargin;
  
  // 调整数字宽度以适应屏幕
  const adjustedDigitWidth = Math.min(
    digitWidth,
    contentWidth / maxLength
  );
  
  // 确保整个内容居中
  const startX = leftLabelWidth + (contentWidth - adjustedDigitWidth * maxLength) / 2;
  
  // 创建数字到颜色的映射，相同数字使用相同颜色
  const numberColorMap = new Map<number, string>();
  const uniqueNumbers = [...new Set(numbers)];
  uniqueNumbers.forEach((num, index) => {
    numberColorMap.set(num, getColorByIndex(index));
  });
  
  // 保存源和目标位置
  const sourcePositions: Array<{ x: number; y: number; value: string; color: string }> = [];
  const targetPositions: Array<{ x: number; y: number }> = [];
  
  // 渲染输入的二进制表示
  binaryStrings.forEach((binary, index) => {
    // 计算每行的中心Y坐标 - 用于对齐所有元素
    const rowCenterY = index * (rowHeight + verticalSpacing) + rowHeight / 2;
    
    // 获取当前数字对应的颜色
    const color = numberColorMap.get(numbers[index]) || '#228be6'; // 默认蓝色
    
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
        // 动画完成后渲染结果行
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

// 添加createMeteorAnimation函数
function createMeteorAnimation(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  sourcePositions: Array<{ x: number; y: number; value: string; color: string }>,
  targetPositions: Array<{ x: number; y: number }>,
  duration: number,
  digitWidth: number,
  color: string,
  onComplete: () => void
): void {
  // 如果没有源或目标，直接完成
  if (sourcePositions.length === 0 || targetPositions.length === 0) {
    onComplete();
    return;
  }

  // 为每个源创建一个meteor
  let animationsCompleted = 0;
  const totalAnimations = Math.min(sourcePositions.length, targetPositions.length);

  // 创建目标位置的索引映射
  const remainingTargets = [...targetPositions];

  // 为每个源位置创建一个动画
  sourcePositions.forEach((source, index) => {
    // 如果没有更多的目标位置，退出
    if (remainingTargets.length === 0) return;

    // 选择最近的目标
    let nearestTargetIndex = 0;
    let minDistance = Number.MAX_VALUE;
    
    remainingTargets.forEach((target, targetIndex) => {
      const dist = Math.sqrt(
        Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestTargetIndex = targetIndex;
      }
    });

    const target = remainingTargets[nearestTargetIndex];
    
    // 移除使用过的目标
    remainingTargets.splice(nearestTargetIndex, 1);

    // 创建meteor元素
    const meteor = svg
      .append('circle')
      .attr('cx', source.x)
      .attr('cy', source.y)
      .attr('r', digitWidth / 3)
      .attr('fill', source.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#glow)')
      .style('opacity', 0.8);

    // 创建发光滤镜
    const defs = svg.append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 添加轨迹
    const trail = svg
      .append('line')
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', source.x)
      .attr('y2', source.y)
      .attr('stroke', source.color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    // 动画
    meteor
      .transition()
      .duration(duration)
      .attr('cx', target.x)
      .attr('cy', target.y)
      .attr('fill', color)
      .style('opacity', 1)
      .on('end', function () {
        // 创建爆炸效果
        const explosion = svg
          .append('circle')
          .attr('cx', target.x)
          .attr('cy', target.y)
          .attr('r', digitWidth / 3)
          .attr('fill', color)
          .attr('opacity', 1);

        explosion
          .transition()
          .duration(300)
          .attr('r', digitWidth)
          .style('opacity', 0)
          .on('end', function () {
            explosion.remove();
            meteor.remove();
            trail.remove();
            
            // 检查是否所有动画都完成了
            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
              onComplete();
            }
          });
      });

    // 动画轨迹
    trail
      .transition()
      .duration(duration)
      .attr('x2', target.x)
      .attr('y2', target.y);
  });

  // 如果没有动画（源少于目标），直接调用完成回调
  if (totalAnimations === 0) {
    onComplete();
  }
} 