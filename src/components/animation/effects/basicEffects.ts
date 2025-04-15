import * as d3 from 'd3';
import { BaseType } from 'd3';

/**
 * 创建SVG滤镜以产生发光效果
 * @param svg SVG元素
 * @param stdDeviation 模糊标准差
 * @returns 滤镜ID
 */
export const createGlowFilter = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  stdDeviation: number = 3
): string => {
  const filterId = "glow-effect";
  
  // 检查是否已存在相同ID的滤镜
  const existingFilter = svg.select(`#${filterId}`);
  if (!existingFilter.empty()) {
    return filterId; // 如果已存在则直接返回ID
  }
  
  // 获取或创建defs
  let defs = svg.select<SVGDefsElement>('defs');
  if (defs.empty()) {
    defs = svg.append<SVGDefsElement>('defs');
  }
  
  // 创建滤镜
  const filter = defs
    .append('filter')
    .attr('id', filterId)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');
  
  // 添加高斯模糊
  filter
    .append('feGaussianBlur')
    .attr('stdDeviation', stdDeviation)
    .attr('result', 'blur');
  
  // 添加颜色矩阵以增强发光效果
  filter
    .append('feColorMatrix')
    .attr('in', 'blur')
    .attr('mode', 'matrix')
    .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7')
    .attr('result', 'colorMatrix');
  
  // 合并原始图像和发光效果
  filter
    .append('feComposite')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'colorMatrix')
    .attr('operator', 'over');
  
  return filterId;
};

/**
 * 开始发光效果动画
 * @param element D3选择的元素
 * @param duration 动画持续时间（毫秒）
 * @param maxOpacity 最大不透明度
 */
export const startGlowingEffect = (
  element: d3.Selection<BaseType, unknown, null, undefined>,
  duration: number = 1000,
  maxOpacity: number = 1
): void => {
  // 保存原始样式
  const originalOpacity = element.style('opacity') || '1';
  const originalFilter = element.style('filter') || '';
  
  // 应用滤镜
  element
    .style('filter', `url(#glow-effect)`)
    .transition()
    .duration(duration / 2)
    .style('opacity', maxOpacity.toString())
    .transition()
    .duration(duration / 2)
    .style('opacity', originalOpacity)
    .style('filter', originalFilter)
    .on('end', () => {
      // 清理，恢复原始状态
      element
        .style('filter', originalFilter);
    });
};

/**
 * 开始脉冲效果动画
 * @param element D3选择的元素
 * @param duration 动画持续时间（毫秒）
 * @param scale 缩放强度
 */
export const startPulseEffect = (
  element: d3.Selection<BaseType, unknown, null, undefined>,
  duration: number = 1000,
  scale: number = 1.2
): void => {
  // 保存原始变换
  const originalTransform = element.attr('transform') || '';
  
  // 获取元素边界框
  const bbox = (element.node() as SVGGraphicsElement).getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  
  // 执行脉冲动画
  element
    .transition()
    .duration(duration / 2)
    .attr('transform', `${originalTransform} translate(${centerX}, ${centerY}) scale(${scale}) translate(${-centerX}, ${-centerY})`)
    .transition()
    .duration(duration / 2)
    .attr('transform', originalTransform)
    .on('end', () => {
      // 清理，恢复原始状态
      element.attr('transform', originalTransform);
    });
}; 