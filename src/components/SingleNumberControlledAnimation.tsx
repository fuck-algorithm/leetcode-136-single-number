import React, { useEffect } from 'react';
import AnimationRenderer from './animation/AnimationRenderer';
import { useAnimation } from './animation/hooks/useAnimation';
import './SingleNumberControlledAnimation.css';

interface SingleNumberControlledAnimationProps {
  numbers: number[];
}

const SingleNumberControlledAnimation: React.FC<SingleNumberControlledAnimationProps> = ({ numbers }) => {
  const { 
    currentFrame,
    totalFrames,
    result,
    resetAnimation
  } = useAnimation({ numbers });

  // 确保组件加载时显示第0帧
  useEffect(() => {
    resetAnimation();
    console.log("重置动画，当前数组:", numbers);
  }, [numbers, resetAnimation]);

  return (
    <div className="controlled-animation-container">
      <div className="animation-stage">
        <AnimationRenderer 
          numbers={numbers}
          currentFrame={currentFrame}
          totalFrames={totalFrames}
          result={result}
          width={1000}
          height={600}
        />
      </div>
    </div>
  );
};

export default SingleNumberControlledAnimation; 