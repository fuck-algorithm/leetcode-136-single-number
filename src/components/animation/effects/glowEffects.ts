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
  
  // 创建效果
  const svg = d3.select(element.node()?.ownerSVGElement);
  createBreathingBorderEffect(svg, id, baseColor);
  
  // 为元素应用边框和过滤器
  element
    .attr('stroke', `url(#${id}-gradient)`)
    .attr('stroke-width', initialStrokeWidth)
    .style('filter', `url(#${id}-filter)`);
  
  // 设置边框宽度的呼吸动画
  function animateBorder() {
    element
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth * 3)
      .transition()
      .duration(1000)
      .attr('stroke-width', initialStrokeWidth)
      .on('end', animateBorder);
  }
  
  // 开始动画
  animateBorder();
}; 