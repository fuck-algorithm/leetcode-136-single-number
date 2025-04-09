import * as d3 from 'd3';

/**
 * 创建和应用SVG发光滤镜
 * @param svg D3 SVG选择器
 * @param filterId 滤镜ID
 * @param stdDeviation 模糊程度 
 */
export const createGlowFilter = (
  svg: d3.Selection<any, unknown, null, undefined>,
  filterId: string = 'glow',
  stdDeviation: number = 3
): void => {
  // 检查滤镜是否已存在
  if (svg.select(`#${filterId}`).empty()) {
    const defs = svg.select('defs');
    // 如果defs不存在，创建它
    const defsSelection = defs.empty() ? svg.append('defs') : defs;
    
    const filter = defsSelection.append('filter')
      .attr('id', filterId)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', stdDeviation)
      .attr('result', 'blur');
      
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');
  }
};

/**
 * 启动元素的发光效果动画
 * @param selection 要添加效果的D3选择器
 * @param duration 动画持续时间(毫秒)
 */
export const startGlowingEffect = (
  selection: d3.Selection<any, unknown, null, undefined>,
  duration: number = 800
): void => {
  selection
    .transition()
    .duration(duration)
    .attr('opacity', 0.7)
    .transition()
    .duration(duration)
    .attr('opacity', 1)
    .on('end', function() {
      startGlowingEffect(d3.select(this) as any, duration);
    });
};

/**
 * 启动脉冲效果
 * @param selection 要添加效果的D3选择器
 * @param duration 动画持续时间(毫秒)
 */
export const startPulseEffect = (
  selection: d3.Selection<any, unknown, null, undefined>,
  duration: number = 1000
): void => {
  selection
    .transition()
    .duration(duration)
    .attr('opacity', 0.7)
    .transition()
    .duration(duration)
    .attr('opacity', 1)
    .on('end', function() {
      startPulseEffect(d3.select(this) as any, duration);
    });
};

/**
 * 创建带呼吸效果的渐变发光边框
 * @param svg D3 SVG选择器
 * @param id 渐变ID
 * @param baseColor 基础颜色
 */
export const createBreathingBorderEffect = (
  svg: d3.Selection<any, unknown, null, undefined>,
  id: string = 'breathing-border',
  baseColor: string = '#0288D1'
): void => {
  // 确保defs存在
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  
  // 创建两个渐变，一个用于边框颜色渐变，一个用于发光效果
  // 边框颜色渐变
  const borderGradient = defs.append('linearGradient')
    .attr('id', `${id}-gradient`)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '100%');
    
  // 提取基础颜色的RGB值
  const baseRGB = d3.rgb(baseColor);
  // 创建边框的浅色版本和深色版本
  const lightColor = d3.rgb(
    Math.min(255, baseRGB.r + 70),
    Math.min(255, baseRGB.g + 70),
    Math.min(255, baseRGB.b + 70)
  ).toString();
  const darkColor = d3.rgb(
    Math.max(0, baseRGB.r - 40),
    Math.max(0, baseRGB.g - 40),
    Math.max(0, baseRGB.b - 40)
  ).toString();
  
  // 添加渐变的颜色停止点
  borderGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', lightColor);
    
  borderGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', darkColor);
    
  // 创建发光效果滤镜
  const filter = defs.append('filter')
    .attr('id', `${id}-filter`)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');
    
  filter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', '2')
    .attr('result', 'blur');
    
  filter.append('feComposite')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'blur')
    .attr('operator', 'over');
  
  // 创建动画元素
  const animateElement = defs.append('animate')
    .attr('id', `${id}-animate`)
    .attr('attributeName', 'stdDeviation')
    .attr('values', '2;4;2')
    .attr('dur', '2s')
    .attr('repeatCount', 'indefinite');
  
  // 使用 animateElement
  defs.select(`#${id}-filter-blur`).append(() => animateElement.node());
};

/**
 * 给元素添加呼吸发光边框效果
 * @param element 要添加效果的D3选择器
 * @param baseColor 基础颜色
 * @param initialStrokeWidth 初始边框宽度
 */
export const addBreathingBorder = (
  element: d3.Selection<any, unknown, null, undefined>,
  baseColor: string,
  initialStrokeWidth: number = 1
): void => {
  // 为每个元素创建唯一ID
  const id = `breathing-border-${Math.random().toString(36).substr(2, 9)}`;
  
  // 创建效果 - 但使用更简单的效果
  const svg = d3.select(element.node()?.ownerSVGElement);
  
  // 检查是否已经有类似颜色的渐变，避免创建过多类似的渐变
  const existingGradients = svg.selectAll('linearGradient').nodes();
  let existingGradientId: string | null = null;
  
  // 查找相似颜色的渐变
  for (const node of existingGradients) {
    const gradient = d3.select(node);
    const gradientId = gradient.attr('id');
    
    // 如果渐变ID以'breathing-border-'开头
    if (gradientId && gradientId.startsWith('breathing-border-')) {
      // 检查渐变的颜色
      const stopColor = gradient.select('stop').attr('stop-color');
      if (stopColor && isColorSimilar(stopColor, baseColor)) {
        existingGradientId = gradientId;
        break;
      }
    }
  }
  
  // 如果找到类似颜色的渐变，直接使用它
  if (existingGradientId) {
    element
      .attr('stroke', `url(#${existingGradientId})`)
      .attr('stroke-width', initialStrokeWidth);
      
    // 简化的呼吸效果 - 只有一次扩张和收缩，不是无限循环
    element
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth * 2) // 减少扩张范围
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth);
  } else {
    // 创建简化的渐变，而不是完整的效果
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
    
    // 创建简单的渐变
    const borderGradient = defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    // 使用基础颜色
    borderGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', baseColor);
      
    borderGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb(baseColor).darker(0.5).toString());
    
    // 为元素应用边框
    element
      .attr('stroke', `url(#${id})`)
      .attr('stroke-width', initialStrokeWidth);
      
    // 简化的呼吸效果 - 只有一次扩张和收缩，不是无限循环
    element
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth * 2) // 减少扩张范围
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth);
  }
};

/**
 * 判断两个颜色是否相似
 * @param color1 颜色1
 * @param color2 颜色2
 * @returns 是否相似
 */
function isColorSimilar(color1: string, color2: string): boolean {
  try {
    const rgb1 = d3.rgb(color1);
    const rgb2 = d3.rgb(color2);
    
    // 计算RGB值差异
    const diff = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    // 如果差异小于某个阈值，认为是相似的
    return diff < 30;
  } catch (e) {
    // 处理颜色解析错误
    return false;
  }
} 