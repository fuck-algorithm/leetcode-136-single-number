import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AnimationRenderer from './animation/AnimationRenderer';
import './SingleNumberControlledAnimation.css';

interface SingleNumberControlledAnimationProps {
  numbers: number[];
  width?: number;
  height?: number;
}

/**
 * 单个数字的可控动画组件
 */
const SingleNumberControlledAnimation: React.FC<SingleNumberControlledAnimationProps> = ({
  numbers,
  width = 800,
  height = 600
}) => {
  const { t } = useTranslation();
  const isMounted = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  
  const totalFrames = numbers.length + 1; // 最后一帧是结果帧
  
  // 检查和记录DOM元素状态
  useEffect(() => {
    console.log("组件挂载, 检查DOM元素:");
    console.log("containerRef:", containerRef.current);
    console.log("svgRef:", svgRef.current);
    
    // 确保组件已经挂载后再设置isLoading状态
    // 将延迟减少到100ms，使加载状态更快消失
    setTimeout(() => {
      if (containerRef.current) {
        setIsLoading(false);
        console.log("组件挂载完成，加载状态设为false");
      }
    }, 100);
    
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // 重置动画
  const resetAnimation = useCallback(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
    setHasPlayedSound(false);
    setError(null);
    
    console.log("动画已重置");
    // 避免立即检查DOM元素，给一点时间让DOM更新
    setTimeout(() => {
      console.log("重置后检查DOM元素:");
      console.log("Animation SVG元素:", document.querySelectorAll('svg.animation-svg'));
      console.log("动画容器元素:", document.querySelectorAll('.animation-container'));
    }, 100);
  }, []);
  
  // 当numbers变化时重置动画
  useEffect(() => {
    console.log("Numbers变化，重置动画:", numbers);
    resetAnimation();
  }, [numbers, resetAnimation]);
  
  // 播放声音
  const playSound = useCallback((type: 'init' | 'xor' | 'result') => {
    if (hasPlayedSound) return;
    
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    if (type === 'xor') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, context.currentTime);
    } else if (type === 'result') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
    } else if (type === 'init') {
      // 初始化时可以不播放声音或播放特殊提示音
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(330, context.currentTime);
    }
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 1);
    
    setHasPlayedSound(true);
  }, [hasPlayedSound]);
  
  // 前进到下一帧
  const advanceFrame = useCallback(() => {
    if (currentFrame < totalFrames - 1) {
      setCurrentFrame(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentFrame, totalFrames]);
  
  // 处理播放/暂停
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  // 控制自动播放
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (isPlaying) {
      timeoutRef.current = window.setTimeout(() => {
        advanceFrame();
      }, 2000); // 每帧2秒
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, advanceFrame]);
  
  // 捕获渲染错误
  const handleRenderError = useCallback((errorMessage: string) => {
    console.error("渲染错误:", errorMessage);
    setError(t('animation.error.message', { message: errorMessage }));
    setIsLoading(false);
  }, [t]);
  
  // 检查numbers是否为空
  useEffect(() => {
    if (numbers.length === 0) {
      handleRenderError(t('animation.error.emptyArray'));
    }
  }, [numbers, handleRenderError, t]);
  
  // 渲染内容
  return (
    <div className="controlled-animation" ref={containerRef}>
      {isLoading ? (
        <div className="loading-container">
          <p>{t('animation.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={resetAnimation}>{t('animation.error.retry')}</button>
        </div>
      ) : (
        <>
          <div className="animation-container">
            <AnimationRenderer
              numbers={numbers}
              width={width}
              height={height}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              onSoundEffect={playSound}
            />
          </div>
          <div className="animation-controls">
            <button onClick={resetAnimation}>{t('animation.controls.reset')}</button>
            <button onClick={togglePlay}>
              {isPlaying ? t('animation.controls.pause') : t('animation.controls.play')}
            </button>
            <button 
              onClick={advanceFrame}
              disabled={currentFrame >= totalFrames - 1 || isPlaying}
            >
              {t('animation.controls.next')}
            </button>
            <div className="frame-indicator">
              {t('animation.controls.frame', { current: currentFrame + 1, total: totalFrames })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SingleNumberControlledAnimation; 