import React from 'react';

interface AnimationControlsProps {
  currentFrame: number;
  totalFrames: number;
  isAutoPlaying: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast';
  hasNumbers: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: 'slow' | 'medium' | 'fast') => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  currentFrame,
  totalFrames,
  isAutoPlaying,
  animationSpeed,
  hasNumbers,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onChangeSpeed
}) => {
  // 计算进度百分比
  const progressPercentage = totalFrames > 1 
    ? (currentFrame / (totalFrames - 1)) * 100 
    : 0;

  return (
    <>
      <div className="animation-progress">
        <div className="progress-bar">
          <div 
            className="progress-filled" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="control-panel">
        <button 
          className="control-button" 
          onClick={onPrev}
          disabled={currentFrame === 0 || !hasNumbers}
        >
          上一步
        </button>
        
        <button 
          className="control-button" 
          onClick={isAutoPlaying ? onPause : onPlay}
          disabled={!hasNumbers}
        >
          {isAutoPlaying ? '暂停' : '自动播放'}
        </button>
        
        <button 
          className="control-button" 
          onClick={onNext}
          disabled={currentFrame >= totalFrames - 1 || !hasNumbers}
        >
          下一步
        </button>
        
        <button 
          className="control-button" 
          onClick={onReset}
          disabled={currentFrame === 0 || !hasNumbers}
        >
          重置
        </button>
        
        <div className="speed-controls">
          <span>速度:</span>
          <button 
            className={`speed-button ${animationSpeed === 'slow' ? 'active' : ''}`}
            onClick={() => onChangeSpeed('slow')}
          >
            慢
          </button>
          <button 
            className={`speed-button ${animationSpeed === 'medium' ? 'active' : ''}`}
            onClick={() => onChangeSpeed('medium')}
          >
            中
          </button>
          <button 
            className={`speed-button ${animationSpeed === 'fast' ? 'active' : ''}`}
            onClick={() => onChangeSpeed('fast')}
          >
            快
          </button>
        </div>
      </div>
    </>
  );
};

export default AnimationControls; 