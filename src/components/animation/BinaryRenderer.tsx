import * as d3 from 'd3';

/**
 * 渲染二进制异或操作
 * @param svg D3 SVG选择器 
 * @param width 宽度
 * @param firstBinary 第一个操作数二进制表示
 * @param secondBinary 第二个操作数二进制表示
 * @param resultBinary 结果二进制表示
 */
export const renderBinaryXorOperation = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  firstBinary: string,
  secondBinary: string,
  resultBinary: string
): void => {
  const binY = 150;
  const digitWidth = 20;
  const startX = width / 2 - (firstBinary.length * digitWidth) / 2;
  
  // 添加动态背景
  addDynamicBackground(svg, width);
  
  // 第一行：第一个操作数的二进制
  renderBinaryRow(svg, firstBinary, startX, binY - 15, digitWidth, '#4dabf7', true);

  // XOR 符号
  svg.append('text')
    .attr('class', 'xor-symbol')
    .attr('x', width / 2)
    .attr('y', binY + 20)
    .text('^')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#ff6b6b')
    // 添加闪烁效果
    .call(addGlowingEffect);
  
  // 第二行：第二个操作数的二进制
  renderBinaryRow(svg, secondBinary, startX, binY + 30, digitWidth, '#ff6b6b', true);

  // = 符号
  svg.append('text')
    .attr('class', 'description-text')
    .attr('x', width / 2)
    .attr('y', binY + 65)
    .text('=')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#40c057');
  
  // 第三行：结果的二进制
  renderBinaryRow(svg, resultBinary, startX, binY + 75, digitWidth, '#40c057', false, true);
};

/**
 * 添加动态背景
 */
const addDynamicBackground = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number
): void => {
  // 创建动态网格背景
  const gridSize = 20;
  const gridOpacity = 0.1;
  
  // 创建渐变背景
  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
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
 * 添加发光效果
 */
const addGlowingEffect = (selection: d3.Selection<any, unknown, null, undefined>): void => {
  selection
    .style('filter', 'url(#glow)')
    .transition()
    .duration(500)
    .attr('opacity', 0.7)
    .transition()
    .duration(500)
    .attr('opacity', 1)
    .on('end', function() {
      d3.select(this).call(addGlowingEffect);
    });
};

/**
 * 添加发散光效果
 */
const addRadialEffect = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  color: string
): void => {
  // 创建放射状渐变
  const defs = svg.select('defs');
  if (defs.empty()) {
    svg.append('defs');
  }
  
  const gradientId = `radial-gradient-${Math.random().toString(36).substring(2, 15)}`;
  
  const radialGradient = svg.select('defs').append('radialGradient')
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
    .attr('y', y)
    .attr('r', 0)
    .attr('fill', `url(#${gradientId})`)
    .attr('opacity', 0.7);
    
  // 动画效果
  circle.transition()
    .duration(1000)
    .attr('r', 50)
    .attr('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
      radialGradient.remove();
    });
};

/**
 * 渲染单行二进制数
 * @param svg D3 SVG选择器
 * @param binary 二进制字符串
 * @param startX 起始X坐标
 * @param y Y坐标
 * @param digitWidth 每个数字宽度
 * @param color 填充颜色
 * @param animate 是否添加动画
 * @param isResult 是否为结果行
 */
const renderBinaryRow = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  binary: string, 
  startX: number, 
  y: number, 
  digitWidth: number,
  color: string,
  animate: boolean = false,
  isResult: boolean = false
): void => {
  // 添加SVG滤镜用于发光效果
  const defs = svg.select('defs');
  if (defs.empty()) {
    svg.append('defs');
  }
  
  // 添加发光滤镜
  if (svg.select('#glow').empty()) {
    const filter = svg.select('defs').append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
      
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');
  }
  
  // 创建 3D 效果的渐变
  const createGradient = (id: string, baseColor: string) => {
    const gradient = svg.select('defs').append('linearGradient')
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
  };
  
  // 为每个1创建不同的渐变
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      createGradient(`gradient-${i}-${color.replace('#', '')}`, color);
    }
  }
  
  for (let i = 0; i < binary.length; i++) {
    const digit = binary[i];
    const x = startX + i * digitWidth;
    const isOne = digit === '1';
    const gradientId = `gradient-${i}-${color.replace('#', '')}`;
    
    // 背景方块
    const rect = svg.append('rect')
      .attr('x', x - digitWidth/2)
      .attr('y', y)
      .attr('width', digitWidth)
      .attr('height', digitWidth)
      .attr('fill', isOne ? `url(#${gradientId})` : '#e9ecef')
      .attr('stroke', '#adb5bd')
      .attr('stroke-width', 1)
      .attr('rx', 3)
      .attr('ry', 3);
    
    // 添加光效和3D变换
    if (isOne) {
      rect.style('filter', 'url(#glow)')
        .attr('transform', 'translate(0, 0)');
      
      // 如果是结果行，添加特殊效果
      if (isResult) {
        // 移除放大缩小效果
        // rect.transition()
        //  .duration(500)
        //  .attr('transform', 'scale(1.1)')
        //  .transition()
        //  .duration(500)
        //  .attr('transform', 'scale(1)');
          
        // 添加放射状光效
        addRadialEffect(svg, x, y + digitWidth/2, color);
      }
      
      // 如果需要动画效果
      if (animate) {
        rect.style('opacity', 0)
          .transition()
          .delay(i * 100)
          .duration(500)
          .style('opacity', 1)
          .attr('transform', 'translate(0, -3)')
          .transition()
          .duration(300)
          .attr('transform', 'translate(0, 0)');
      }
    }
      
    // 数字文本
    const text = svg.append('text')
      .attr('x', x)
      .attr('y', y + 15) // 调整Y位置到方块中央
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', isOne ? 'white' : '#495057')
      .text(digit);
    
    // 给数字1添加动画效果
    if (isOne && animate) {
      text.style('opacity', 0)
        .transition()
        .delay(i * 100)
        .duration(500)
        .style('opacity', 1);
    }
  }
}; 