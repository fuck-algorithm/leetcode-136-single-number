import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { toBinaryString } from './utils/BinaryUtils';
import { renderAllBinaryXorOperation } from './renderers/BinaryAllXorRenderer';
import { renderResultFrame } from './renderers/ResultFrameRenderer';
import { useAudio } from './hooks/useAudio';

interface AnimationRendererProps {
  width: number;
  height: number;
  numbers: number[];
  currentFrame: number;
  totalFrames: number;
  onPlaySound?: (type: 'xor' | 'result') => void;
  result?: number | null;
}

/**
 * 计算XOR结果
 */
const calculateXorResult = (numbers: number[]): number => {
  return numbers.reduce((result, num) => result ^ num, 0);
};

/**
 * 动画渲染器组件
 */
export const AnimationRenderer: React.FC<AnimationRendererProps> = ({
  width,
  height,
  numbers,
  currentFrame,
  totalFrames,
  onPlaySound,
  result
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 单次模式：通过一次性展示所有元素的XOR和最终结果来简化动画
  useEffect(() => {
    if (!svgRef.current || numbers.length === 0) return;
    
    // 清除SVG内容
    d3.select(svgRef.current).selectAll('*').remove();
    
    // 计算最终结果
    const result = calculateXorResult(numbers);
    
    // 调试信息
    console.log("渲染帧:", { 
      currentFrame, 
      totalFrames,
      numbers, 
      result 
    });
    
    // 根据当前帧决定渲染内容
    if (currentFrame === 0) {
      // 帧0：渲染所有数组元素
      renderAllBinaryXorOperation(
        d3.select(svgRef.current),
        numbers,
        width,
        height,
        30, // 增加digitWidth值，使二进制表示更宽
        true // 显示十进制值
      );
      
      // 播放XOR音效
      onPlaySound?.('xor');
    } else {
      // 帧1：渲染最终结果
      renderResultFrame(
        d3.select(svgRef.current),
        width,
        numbers,
        result,
        toBinaryString
      );
      
      // 播放结果音效
      onPlaySound?.('result');
    }
  }, [width, height, numbers, currentFrame, totalFrames, onPlaySound]);
  
  return (
    <svg 
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`} // 去掉额外的宽度，使用原始宽度
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden', // 改回hidden防止溢出
        margin: 0, // 移除所有边距
        padding: 0, // 确保无padding
        display: 'block', // 使用块级元素
        maxWidth: '100%' // 确保不超过父容器宽度
      }}
      preserveAspectRatio="xMinYMid meet" // 使用meet不要用slice
    />
  );
};

export default AnimationRenderer; 