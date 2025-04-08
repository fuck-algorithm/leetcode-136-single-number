import * as d3 from 'd3';

/**
 * 添加动态网格背景
 * @param svg D3 SVG选择器
 * @param width 宽度
 * @param gridSize 网格大小
 * @param gridOpacity 网格不透明度
 */
export const addDynamicBackground = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  gridSize: number = 20,
  gridOpacity: number = 0.1
): void => {
  // 创建渐变背景
  const defs = svg.select('defs');
  const defsSelection = defs.empty() ? svg.append('defs') : defs;
  
  // 检查渐变是否已存在
  if (defsSelection.select('#background-gradient').empty()) {
    const gradient = defsSelection.append('linearGradient')
      .attr('id', 'background-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#121212')
      .attr('stop-opacity', 0.05);
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#232323')
      .attr('stop-opacity', 0.1);
  }
  
  // 添加背景矩形
  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'url(#background-gradient)')
    .attr('opacity', 0.5);
    
  // 添加网格线
  for (let i = 0; i < width; i += gridSize) {
    svg.append('line')
      .attr('x1', i)
      .attr('y1', 0)
      .attr('x2', i)
      .attr('y2', 300)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('opacity', gridOpacity);
      
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', i)
      .attr('x2', width)
      .attr('y2', i)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('opacity', gridOpacity);
  }
};

/**
 * 创建3D效果的渐变
 * @param svg D3 SVG选择器
 * @param id 渐变ID
 * @param baseColor 基础颜色
 */
export const create3DGradient = (
  svg: d3.Selection<any, unknown, null, undefined>,
  id: string,
  baseColor: string
): void => {
  const defs = svg.select('defs');
  const defsSelection = defs.empty() ? svg.append('defs') : defs;
  
  // 检查渐变是否已存在
  if (defsSelection.select(`#${id}`).empty()) {
    const gradient = defsSelection.append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.rgb(baseColor).brighter(1.5).toString());
      
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', baseColor);
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb(baseColor).darker(1.5).toString());
  }
}; 