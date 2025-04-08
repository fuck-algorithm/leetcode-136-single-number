import { useState, useEffect, useRef } from 'react';
import { findSingleNumber } from '../../../utils/算法工具';

type SpeedType = 'slow' | 'medium' | 'fast';

// 动画速度映射（毫秒）
const SPEED_MAP = {
  slow: 2000,
  medium: 1000,
  fast: 500
};

interface UseAnimationProps {
  numbers: number[];
}

interface UseAnimationReturn {
  currentFrame: number;
  totalFrames: number;
  result: number | null;
  isAutoPlaying: boolean;
  animationSpeed: SpeedType;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  goToNextFrame: () => void;
  goToPrevFrame: () => void;
  resetAnimation: () => void;
  changeSpeed: (speed: SpeedType) => void;
}

// 使用一次性模式 - 只显示初始帧和结果帧
const USE_ONE_SHOT_MODE = true;

export const useAnimation = ({ numbers }: UseAnimationProps): UseAnimationReturn => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState<SpeedType>('medium');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const animationTimerRef = useRef<number | null>(null);
  
  // 计算总帧数和结果
  useEffect(() => {
    if (!numbers.length) return;
    
    // 根据模式设置总帧数
    if (USE_ONE_SHOT_MODE) {
      // 一次性模式：只有两个帧 - 初始帧(0)和结果帧(1)
      setTotalFrames(2);
    } else {
      // 传统模式：每个元素一帧 + 1（结果帧）
      setTotalFrames(numbers.length + 1);
    }
    
    // 计算单一数字
    const singleNumber = findSingleNumber(numbers);
    setResult(singleNumber);
    
    // 重置动画状态
    setCurrentFrame(0);
    stopAutoPlay();
  }, [numbers]);
  
  // 清除计时器
  const stopAutoPlay = () => {
    if (animationTimerRef.current) {
      window.clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setIsAutoPlaying(false);
  };
  
  // 自动播放逻辑
  const startAutoPlay = () => {
    if (isAutoPlaying) return;
    
    if (currentFrame >= totalFrames - 1) {
      setCurrentFrame(0);
    }
    
    setIsAutoPlaying(true);
    animationTimerRef.current = window.setInterval(() => {
      setCurrentFrame(prevFrame => {
        if (prevFrame >= totalFrames - 1) {
          stopAutoPlay();
          return totalFrames - 1;
        }
        return prevFrame + 1;
      });
    }, SPEED_MAP[animationSpeed]);
  };
  
  // 手动控制
  const goToNextFrame = () => {
    stopAutoPlay();
    if (currentFrame < totalFrames - 1) {
      setCurrentFrame(currentFrame + 1);
    }
  };
  
  const goToPrevFrame = () => {
    stopAutoPlay();
    if (currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  };
  
  const resetAnimation = () => {
    stopAutoPlay();
    setCurrentFrame(0);
  };
  
  // 改变速度
  const changeSpeed = (speed: SpeedType) => {
    setAnimationSpeed(speed);
    if (isAutoPlaying) {
      stopAutoPlay();
      startAutoPlay();
    }
  };
  
  // 组件卸载时清除计时器
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        window.clearInterval(animationTimerRef.current);
      }
    };
  }, []);
  
  return {
    currentFrame,
    totalFrames,
    result,
    isAutoPlaying,
    animationSpeed,
    startAutoPlay,
    stopAutoPlay,
    goToNextFrame,
    goToPrevFrame,
    resetAnimation,
    changeSpeed
  };
}; 