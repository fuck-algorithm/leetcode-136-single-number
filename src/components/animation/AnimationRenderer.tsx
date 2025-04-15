import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { renderXorFrame } from './renderers/XorFrameRenderer';
import { renderResultFrame } from './renderers/ResultFrameRenderer';
import { renderAllBinaryXorOperation } from './renderers/BinaryAllXorRenderer';
import { calculateXorSteps } from './utils/XorUtils';
import { toBinaryString } from './utils/BinaryUtils';
import { useTranslation } from 'react-i18next';

/**
 * 动画渲染器的属性接口
 */
interface AnimationRendererProps {
  numbers: number[];
  width?: number;
  height?: number;
  currentFrame: number;
  totalFrames: number;
  onSoundEffect?: (type: 'init' | 'xor' | 'result') => void;
}

/**
 * 动画渲染器组件
 * 根据当前帧渲染适当的动画内容
 */
const AnimationRenderer: React.FC<AnimationRendererProps> = ({ 
  numbers, 
  width = 900, 
  height = 500, 
  currentFrame, 
  totalFrames,
  onSoundEffect
}) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const didMountRef = useRef(false);
  const renderAttemptRef = useRef(0);
  const maxRenderAttempts = 3;

  /**
   * 计算数组中所有元素的异或结果
   */
  const calculateXorResult = (nums: number[]): number => {
    return nums.reduce((result, num) => result ^ num, 0);
  };

  // 组件挂载时初始化SVG
  useEffect(() => {
    console.log("AnimationRenderer挂载, SVG引用:", svgRef.current);
    
    if (svgRef.current) {
      didMountRef.current = true;
      console.log("SVG元素已初始化");
    }
    
    return () => {
      didMountRef.current = false;
      console.log("AnimationRenderer卸载");
    };
  }, []);

  /**
   * 渲染当前帧
   */
  const renderFrame = () => {
    if (!svgRef.current || numbers.length === 0) {
      console.error("无法渲染: SVG元素不存在或数字数组为空");
      return;
    }

    try {
      renderAttemptRef.current += 1;
      console.log(`尝试渲染第${currentFrame}帧，第${renderAttemptRef.current}次尝试`);
      
      // 清除SVG内容
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      
      // 初始化帧
      if (currentFrame === 0) {
        if (onSoundEffect) onSoundEffect('init');
        // 初始帧可以显示"开始"或其他初始信息
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '24px')
          .attr('fill', '#333')
          .text(t('animation.initialFrame'));
          
        console.log("初始帧渲染完成");
      } 
      // 异或操作帧
      else if (currentFrame > 0 && currentFrame < totalFrames - 1) {
        if (onSoundEffect) onSoundEffect('xor');
        // 渲染异或操作
        renderXorFrame(svg, width, numbers, currentFrame - 1);
        console.log(`异或操作帧${currentFrame}渲染完成`);
      } 
      // 结果帧
      else if (currentFrame === totalFrames - 1) {
        if (onSoundEffect) onSoundEffect('result');
        // 渲染最终结果
        const result = calculateXorResult(numbers);
        renderResultFrame(svg, width, numbers, result, toBinaryString);
        console.log("结果帧渲染完成");
      }
      
      // 重置尝试计数
      renderAttemptRef.current = 0;
    } catch (error) {
      console.error('渲染错误:', error);
      
      // 如果多次尝试渲染失败，显示错误信息
      if (renderAttemptRef.current >= maxRenderAttempts) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '18px')
          .attr('fill', 'red')
          .text(t('animation.error.renderError'));
      }
    }
  };

  // 当帧变化时重新渲染
  useEffect(() => {
    if (didMountRef.current) {
      console.log(`帧变化, 当前帧: ${currentFrame}, 总帧数: ${totalFrames}`);
      renderFrame();
    }
  }, [currentFrame, numbers, width, height, totalFrames]);

  // 组件卸载时停止所有动画
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').interrupt();
      }
    };
  }, []);

  return (
    <div className="animation-container" style={{ width: `${width}px`, height: `${height}px` }}>
      {numbers.length === 0 ? (
        <div className="empty-array-message">
          {t('animation.error.emptyArray')}
        </div>
      ) : (
        <svg 
          ref={svgRef} 
          className="animation-svg"
          width={width} 
          height={height}
          style={{ border: '1px solid #ddd', borderRadius: '4px' }}
        ></svg>
      )}
    </div>
  );
};

export default AnimationRenderer; 