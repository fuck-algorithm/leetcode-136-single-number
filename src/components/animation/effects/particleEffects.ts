import * as d3 from 'd3';

/**
 * 添加粒子爆炸效果
 * @param svg D3 SVG选择器
 * @param x 中心X坐标
 * @param y 中心Y坐标
 * @param color 粒子颜色
 * @param particleCount 粒子数量
 */
export const addParticleEffect = (
  svg: d3.Selection<any, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  particleCount: number = 20
): void => {
  // 创建随机粒子
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30 + 20;
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 1000 + 1000;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    const particle = svg.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size)
      .attr('fill', color)
      .attr('opacity', 0.7);
      
    // 粒子动画
    particle.transition()
      .duration(duration)
      .attr('cx', endX)
      .attr('cy', endY)
      .attr('r', 0)
      .attr('opacity', 0)
      .on('end', function() {
        d3.select(this).remove();
      });
  }
};

/**
 * 添加放射状光效
 * @param svg D3 SVG选择器
 * @param x 中心X坐标
 * @param y 中心Y坐标
 * @param color 光效颜色
 * @param radius 最终半径
 * @param duration 动画持续时间(毫秒)
 */
export const addRadialEffect = (
  svg: d3.Selection<any, unknown, null, undefined>,
  x: number,
  y: number,
  color: string,
  radius: number = 100,
  duration: number = 1500
): void => {
  const defs = svg.select('defs');
  // 如果defs不存在，创建它
  const defsSelection = defs.empty() ? svg.append('defs') : defs;
  
  // 为每个效果创建唯一的渐变ID
  const gradientId = `radial-gradient-${Math.random().toString(36).substring(2, 15)}`;
  
  const radialGradient = defsSelection.append('radialGradient')
    .attr('id', gradientId)
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%')
    .attr('fx', '50%')
    .attr('fy', '50%');
    
  radialGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.8);
    
  radialGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0);
    
  // 添加放射圆
  const circle = svg.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 0)
    .attr('fill', `url(#${gradientId})`)
    .attr('opacity', 0.7);
    
  // 动画效果
  circle.transition()
    .duration(duration)
    .attr('r', radius)
    .attr('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
      radialGradient.remove();
    });
}; 