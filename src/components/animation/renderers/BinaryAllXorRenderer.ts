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
  
  // 验证数据是否符合"一个元素出现一次，其他元素都出现两次"的条件
  const validationResult = validateSingleNumberData(numbers);
  
  // 如果验证失败，显示错误信息
  if (!validationResult.valid) {
    renderValidationError(svg, width, height, validationResult.errorMessage);
    return;
  }
  
  // 二进制位最大显示数量限制 - 防止显示太多位导致溢出
  const maxDisplayDigits = 32; // 限制最大显示的二进制位数
  
  // 计算最大二进制长度
  let binaryStrings = numbers.map(n => convertToBinary(n));
  
  // 修复：使用无符号32位整数操作计算异或结果
  let resultBinary = convertToBinary(
    numbers.reduce((acc, curr) => {
      // 使用无符号右移0位来确保以32位无符号整数方式处理
      return (acc >>> 0) ^ (curr >>> 0);
    }, 0) >>> 0 // 确保最终结果也被视为无符号整数
  );
  
  // 如果二进制位数太多，截取最后的N位
  if (Math.max(...binaryStrings.map(b => b.length), resultBinary.length) > maxDisplayDigits) {
    binaryStrings = binaryStrings.map(b => b.slice(-maxDisplayDigits)); // 取最后32位
    // 结果二进制也需要截取
    resultBinary = resultBinary.slice(-maxDisplayDigits);
  }
  
  const maxLength = Math.min(
    Math.max(...binaryStrings.map(b => b.length), resultBinary.length),
    maxDisplayDigits
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
  const leftLabelWidth = 300; // 进一步增加左侧标签所需宽度，为连线提供更多空间
  const rightMargin = 5; // 保持较小的右侧边距
  
  // 计算整个内容的宽度，包括标签和二进制表示
  const contentWidth = width - leftLabelWidth - rightMargin;
  
  // 精确计算每个数字位的宽度，确保填满但不溢出
  const calculatedDigitWidth = contentWidth / maxLength;
  
  // 调整数字宽度以适应屏幕，但设置上限以防止过大
  const adjustedDigitWidth = Math.min(
    Math.max(calculatedDigitWidth, 15), // 至少15px宽，但不要比计算值小
    25 // 最大宽度上限
  );
  
  // 考虑到调整后的宽度可能导致总宽度变化，重新计算起始点
  const totalContentWidth = adjustedDigitWidth * maxLength;
  // 减少居中偏移量，使内容更靠右显示
  const startX = leftLabelWidth + (contentWidth - totalContentWidth) / 2 + 20;
  
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
  
  // 保存每个数字行的位置信息，用于连线
  const numberRowPositions: Array<{ 
    num: number, 
    y: number, 
    paired: boolean, 
    labelX: number,    // 标签右侧位置
    labelLeftX: number // 添加标签左侧位置
  }> = [];
  
  // 渲染输入的二进制表示
  binaryStrings.forEach((binary, index) => {
    // 计算每行的中心Y坐标 - 用于对齐所有元素
    const rowCenterY = index * (rowHeight + verticalSpacing) + rowHeight / 2;
    
    // 获取当前数字对应的颜色
    const color = numberColorMap.get(numbers[index]) || '#228be6'; // 默认蓝色
    
    // 记录数字行位置信息 - 包括标签的X坐标
    const labelX = startX - 10; // 标签右侧位于二进制表示左侧
    const numValue = numbers[index].toString();
    
    // 根据数字长度估算文本宽度
    let fontSize = 14; // 默认字体大小
    if (numValue.length > 8) {
      fontSize = Math.max(14 - (numValue.length - 8) * 0.5, 7);
    }
    // 估算文本宽度 (每个数字约7px宽度，根据字体大小调整)
    const estimatedTextWidth = numValue.length * (fontSize * 0.6);
    const labelLeftX = labelX - estimatedTextWidth; // 估算文本左侧位置
    
    numberRowPositions.push({ 
      num: numbers[index], 
      y: rowCenterY, 
      paired: false,
      labelX: labelX,
      labelLeftX: labelLeftX
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
      false,
      maxLength // 传入最大长度参数，确保所有行右对齐
    );
    
    // 在第一行上方添加位索引标记
    if (index === 0) {
      // 计算位索引的Y坐标 - 位于第一行二进制位的上方
      const indexY = rowCenterY - rowHeight/2 - 10;
      renderBitIndices(svg, startX, indexY, maxLength, adjustedDigitWidth);
    }
    
    // 显示十进制值 - 确保与二进制方格垂直对齐
    if (showDecimal) {
      // 直接使用当前行的中心Y坐标 - 确保完全水平对齐
      renderNumberLabel(svg, numbers[index], startX - 10, rowCenterY, color, leftLabelWidth);
    }
    
    // 收集源位置 - 1的位置
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '1') {
        // 计算与二进制位相同的X坐标，包含右对齐偏移量和spacing/2
        const spacing = binary.length > 20 
          ? Math.max(adjustedDigitWidth * 0.9, 8) 
          : Math.max(adjustedDigitWidth, 10);
        const alignOffset = maxLength !== undefined ? spacing * (maxLength - binary.length) : 0;
        const xPos = startX + alignOffset + i * spacing + spacing / 2;
        
        sourcePositions.push({
          x: xPos,
          y: rowCenterY, // 使用同一个中心坐标
          value: '1',
          color: color
        });
      }
    }
  });
  
  // 创建映射以跟踪每个数字对已使用的垂直偏移量
  const numberOffsetMap = new Map<number, number[]>();
  
  // 用于跟踪已经创建的连接线方向
  const connectionDirections: Array<{
    y1: number,
    y2: number,
    direction: 'left' | 'right',
    curvature: number
  }> = [];
  
  // 绘制相同数字之间的连接线
  numberRowMap.forEach((rowIndices, num) => {
    // 仅对出现偶数次的数字进行两两配对
    const color = numberColorMap.get(num) || '#228be6';
    
    // 初始化此数字的偏移量记录
    numberOffsetMap.set(num, []);
    
    // 随机化配对顺序以避免总是连接相邻的行
    const shuffledIndices = [...rowIndices].sort(() => Math.random() - 0.5);
    
    // 两两配对
    for (let i = 0; i < shuffledIndices.length; i += 2) {
      // 如果只剩下单个元素就跳过（这是只出现一次的数字）
      if (i + 1 >= shuffledIndices.length) continue;
      
      const row1 = shuffledIndices[i];
      const row2 = shuffledIndices[i + 1];
      
      const pos1 = numberRowPositions[row1];
      const pos2 = numberRowPositions[row2];
      
      const y1 = pos1.y;
      const y2 = pos2.y;
      
      // 标记这两行已配对
      numberRowPositions[row1].paired = true;
      numberRowPositions[row2].paired = true;
      
      // 使用标签左侧位置而不是右侧位置
      const leftX1 = pos1.labelLeftX;
      const leftX2 = pos2.labelLeftX;
      
      // 获取已用偏移量并计算新偏移
      const usedOffsets = numberOffsetMap.get(num) || [];
      let offset = 15; // 基本偏移增大，提供更多空间
      
      // 找到一个未被使用的偏移量
      while (usedOffsets.includes(offset)) {
        offset += 10; // 增加偏移直到找到未使用的值，使用更大的增量
      }
      usedOffsets.push(offset);
      
      // 使用这个数字的偏移量创建连接点 - 使用左侧位置加偏移
      const connectorX1 = leftX1 - offset;
      const connectorX2 = leftX2 - offset;
      
      // 计算垂直距离和索引差异
      const verticalDistance = Math.abs(y2 - y1);
      
      // 固定方向为左侧，避免向右弯曲遮挡数字
      const direction: 'left' | 'right' = 'left';
      
      // 根据垂直距离和行索引计算曲率 - 距离越大曲率越小，保持优雅
      // 基本曲率在0.15-0.6范围内变化
      const baseCurvature = Math.min(0.6, Math.max(0.15, 1 / (verticalDistance / 100 + 1)));
      
      // 根据位置略微变化曲率以避免重叠
      // 使用行号的模作为随机因子
      const rowVariance = ((row1 + row2) % 7) / 10; // -0.3到0.3的变化，增大变化范围
      const curvature = baseCurvature + rowVariance;
      
      // 记录这条连接线的信息
      connectionDirections.push({
        y1: Math.min(y1, y2),
        y2: Math.max(y1, y2),
        direction,
        curvature
      });
      
      // 根据方向计算控制点偏移
      const controlPointOffset = verticalDistance * curvature;
      // 方向固定为左侧
      const directionMultiplier = -1; // 始终向左弯曲
      
      // 计算两个控制点，使曲线更平滑
      const controlX1 = connectorX1 + (controlPointOffset * directionMultiplier);
      const controlY1 = y1 + (y2 - y1) / 4; // 第一个控制点位于曲线1/4处
      
      const controlX2 = connectorX2 + (controlPointOffset * directionMultiplier);
      const controlY2 = y1 + 3 * (y2 - y1) / 4; // 第二个控制点位于曲线3/4处
      
      // 创建路径 - 使用贝塞尔曲线使连线更平滑
      const path = lineGroup.append('path')
        .attr('d', `M ${connectorX1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${connectorX2} ${y2}`)
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
        .attr('cx', connectorX1)
        .attr('cy', y1)
        .attr('r', 3)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
      
      lineGroup.append('circle')
        .attr('cx', connectorX2)
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
    // 使用标签左侧位置，减小偏移量使小球更靠近数字
    const singleLineX = singleNumber.labelLeftX - 10; 
    
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
      // 计算与二进制位相同的X坐标，确保与源位置计算一致
      const spacing = resultBinary.length > 20 
        ? Math.max(adjustedDigitWidth * 0.9, 8) 
        : Math.max(adjustedDigitWidth, 10);
      const alignOffset = maxLength !== undefined ? spacing * (maxLength - resultBinary.length) : 0;
      const xPos = startX + alignOffset + i * spacing + spacing / 2;
      
      targetPositions.push({
        x: xPos,
        y: resultCenterY // 使用中心坐标
      });
    }
  }
  
  // 添加"Result:"标签 - 与结果行垂直对齐
  svg
    .append('text')
    .attr('x', leftLabelWidth - 40) // 根据新的左侧宽度调整位置
    .attr('y', resultCenterY) // 使用结果行的中心Y坐标
    .attr('dominant-baseline', 'middle') // 确保垂直居中
    .attr('text-anchor', 'end') // 水平右对齐
    .attr('fill', '#40c057')
    .text('Result:');
  
  // 显示十进制结果值 - 与结果行垂直对齐
  if (showDecimal) {
    // 计算结果（使用前面已经计算好的resultBinary对应的值）
    const result = numbers.reduce((acc, curr) => {
      // 使用无符号右移0位来确保以32位无符号整数方式处理
      return (acc >>> 0) ^ (curr >>> 0);
    }, 0);
    
    // 确保最终结果也被视为无符号整数
    const unsignedResult = result >>> 0;
    
    // 将数值放在与其他行数字相同的位置
    renderNumberLabel(svg, unsignedResult, startX - 10, resultCenterY, '#40c057', leftLabelWidth);
  }
  
  // 使用动画
  const animate = true;
  if (animate) {
    // 调试打印
    console.log("动画准备:", {
      sourcePositions: sourcePositions.length,
      targetPositions: targetPositions.length,
    });
    
    createMeteorAnimation(
      svg,
      sourcePositions,
      targetPositions,
      800,
      adjustedDigitWidth,
      '#40c057',
      () => {
        console.log("动画完成回调被调用");
        
        // 仅在动画完成后渲染结果
        renderBinaryRow(
          svg,
          resultBinary,
          startX,
          resultCenterY,
          adjustedDigitWidth,
          '#40c057',
          true, // 添加动画
          true, // 标记为结果行
          maxLength // 传入最大长度参数，确保结果行也右对齐
        );
      }
    );
  } else {
    // 如果不使用动画，直接渲染结果
    renderBinaryRow(
      svg,
      resultBinary,
      startX,
      resultCenterY,
      adjustedDigitWidth,
      '#40c057',
      true, // 添加动画
      true, // 标记为结果行
      maxLength // 传入最大长度参数，确保结果行也右对齐
    );
  }
}

// 新函数：渲染数字标签 - 简化标签渲染逻辑并确保对齐
function renderNumberLabel(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  value: number,
  x: number,
  y: number, // 直接使用中心Y坐标
  color: string,
  labelAreaWidth: number = 150 // 默认标签区域宽度
): void {
  // 确保数值被视为无符号整数
  const unsignedValue = value >>> 0;
  
  // 转换为十进制字符串
  const displayValue = unsignedValue.toString();
  
  // 根据数字长度动态计算字体大小
  let fontSize = 14; // 默认字体大小
  if (displayValue.length > 8) {
    fontSize = Math.max(14 - (displayValue.length - 8) * 0.5, 7);
  }
  
  // 确保数字标签有足够空间显示
  const labelX = Math.max(x, labelAreaWidth - 50);
  
  svg
    .append('text')
    .attr('x', labelX)
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
  // 调试打印
  console.log("开始流星动画:", {
    sourcePositions: sourcePositions.length,
    targetPositions: targetPositions.length,
  });
  
  // 如果没有足够的位置数据，则不创建动画
  if (sourcePositions.length === 0 || targetPositions.length === 0) {
    console.log("位置数据不足，跳过动画");
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
  
  // 直接使用源位置和目标位置数组
  const numAnimations = Math.min(sourcePositions.length, targetPositions.length);
  console.log(`开始创建 ${numAnimations} 个流星动画`);
  
  // 为每个位创建流星动画
  for (let i = 0; i < numAnimations; i++) {
    const source = sourcePositions[i];
    const target = targetPositions[i];
    
    // 确保流星X坐标与目标位置对齐
    const dropX = target.x;
    
    // 只为值为1的位创建完整动画
    const isOne = source.value === '1';
    
    // 计算动画参数
    const delay = Math.min(i * 50, 400); // 稍微错开动画开始时间
    const distance = Math.abs(target.y - source.y);
    const actualDuration = Math.min(duration, Math.max(500, distance));
    
    console.log(`创建流星 #${i}: 从(${source.x}, ${source.y})到(${target.x}, ${target.y}), 值=${source.value}`);
    
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
      .attr('fill', isOne ? source.color : '#adb5bd');
    
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
        console.log(`流星 #${i} 开始动画`);
        
        // 使用自定义计时器执行动画
        let start: number | null = null;
        
        function step(timestamp: number) {
          if (!start) start = timestamp;
          
          // 计算动画进度 (0-1)
          const elapsed = timestamp - start;
          let progress = Math.min(1, elapsed / actualDuration);
          
          // 使用缓动函数模拟重力加速度 - 开始慢，结束快
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
            console.log(`流星 #${i} 动画完成`);
            
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
                console.log(`完成动画: ${completedAnimations}/${numAnimations}`);
                
                if (completedAnimations >= numAnimations && onComplete) {
                  console.log("所有动画完成，调用回调");
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
  }
  
  // 如果没有动画要执行，则立即调用完成回调
  if (numAnimations === 0 && onComplete) {
    console.log("没有动画可执行，直接调用回调");
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

/**
 * 验证输入数据是否满足"一个元素出现一次，其他元素都出现两次"的条件
 */
function validateSingleNumberData(numbers: number[]): { valid: boolean; errorMessage?: string } {
  // 统计每个数字出现的次数
  const countMap = new Map<number, number>();
  
  for (const num of numbers) {
    countMap.set(num, (countMap.get(num) || 0) + 1);
  }
  
  // 检查是否只有一个元素出现一次，其他元素都出现两次
  let singleElements: number[] = [];
  let invalidElements: string[] = [];
  
  for (const [num, count] of countMap.entries()) {
    if (count === 1) {
      singleElements.push(num);
    } else if (count !== 2) {
      invalidElements.push(`${num} (出现 ${count} 次)`);
    }
  }
  
  if (singleElements.length !== 1 || invalidElements.length > 0) {
    let errorMsg = '输入不符合要求: ';
    
    if (singleElements.length === 0) {
      errorMsg += '没有只出现一次的元素';
    } else if (singleElements.length > 1) {
      errorMsg += `有 ${singleElements.length} 个元素只出现一次: ${singleElements.join(', ')}`;
    }
    
    if (invalidElements.length > 0) {
      errorMsg += (singleElements.length !== 1 ? '，并且' : '') + `以下元素出现次数不是两次：${invalidElements.join(', ')}`;
    }
    
    return { valid: false, errorMessage: errorMsg };
  }
  
  return { valid: true };
}

/**
 * 在SVG上渲染验证错误信息
 */
function renderValidationError(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
  errorMessage: string = '数据验证失败'
): void {
  // 设置SVG的viewBox以确保错误信息能够正确显示
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  
  // 创建一个警告图标
  const warningIcon = svg.append('g')
    .attr('transform', `translate(${width / 2 - 100}, ${height / 3})`);
  
  // 画一个警告三角形
  warningIcon.append('path')
    .attr('d', 'M25,0 L50,45 L0,45 Z')
    .attr('fill', '#ffcc00')
    .attr('stroke', '#ff8800')
    .attr('stroke-width', '2');
  
  // 添加感叹号
  warningIcon.append('text')
    .attr('x', '25')
    .attr('y', '36')
    .attr('text-anchor', 'middle')
    .attr('font-size', '30')
    .attr('font-weight', 'bold')
    .attr('fill', '#000')
    .text('!');
  
  // 添加错误消息
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '16')
    .attr('fill', '#ff0000')
    .text(errorMessage);
  
  // 添加提示信息
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14')
    .attr('fill', '#666')
    .text('请提供符合"一个元素出现一次，其他元素都出现两次"的数据');
}

/**
 * 渲染二进制位索引
 * @param svg SVG元素
 * @param startX 起始X坐标
 * @param y Y坐标
 * @param length 二进制位长度
 * @param digitWidth 位宽度
 */
function renderBitIndices(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  startX: number,
  y: number,
  length: number,
  digitWidth: number
): void {
  // 创建一个组用于位索引
  // 计算与二进制位相同的间距逻辑
  const spacing = length > 20 
    ? Math.max(digitWidth * 0.9, 8) 
    : Math.max(digitWidth, 10);
  const indicesGroup = svg.append('g')
    .attr('class', 'bit-indices');
    
  // 先渲染二进制位格的位置指示线，确保对齐
  for (let i = 0; i < length; i++) {
    // 计算与二进制位格相同的X坐标
    
    const xPos = startX + i * spacing + spacing / 2;
    
    // 添加细微的垂直辅助线帮助确认对齐
    indicesGroup.append('line')
      .attr('x1', xPos)
      .attr('y1', y - 20)
      .attr('x2', xPos)
      .attr('y2', y - 1)
      .attr('stroke', '#e9ecef')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '1,1');
  }
  
  // 添加背景矩形
  indicesGroup.append('rect')
    .attr('x', startX)
    .attr('y', y - 20)
    .attr('width', length * spacing)
    .attr('height', 24)
    .attr('fill', '#f8f9fa')
    .attr('fill-opacity', 0.5)
    .attr('rx', 2);
  
  // 确定合适的字体大小，确保所有数字能正确对齐显示
  const fontSize = length > 28 ? 10 : length > 24 ? 12 : length > 20 ? 14 : 16;
  
  // 渲染每个位置的索引
  for (let i = 0; i < length; i++) {
    // 位索引（从右到左）
    const bitIndex = length - i - 1;
    
    // 使用与二进制位完全相同的X坐标计算
    
    const xPos = startX + i * spacing + spacing / 2;
    
    // 索引Y坐标
    const yPos = y - 10;
    
    // 根据索引位置的重要性选择不同的颜色
    const color = bitIndex % 8 === 0 ? '#525252' : 
                 bitIndex % 4 === 0 ? '#7a7a7a' : '#adb5bd';
    
    // 渲染数字，确保对齐和清晰
    indicesGroup.append('text')
      .attr('x', xPos)
      .attr('y', yPos)
      .attr('text-anchor', 'middle')  // 确保水平居中对齐
      .attr('alignment-baseline', 'middle') // 确保垂直居中对齐
      .attr('font-size', `${fontSize}px`)
      .attr('font-family', 'monospace')
      .attr('fill', color)
      .attr('style', 'letter-spacing: -1px; font-weight: normal;')
      .text(bitIndex);
  }
} 