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