import React from 'react';
import { findSingleNumber } from '../utils/算法工具';
import './SingleNumberVisualizer.css';

interface SingleNumberVisualizerProps {
  numbers: number[];
}

const SingleNumberVisualizer: React.FC<SingleNumberVisualizerProps> = ({ numbers }) => {
  const result = findSingleNumber(numbers);

  return (
    <div className="visualizer">
      <div className="problem-description">
        <p>给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。</p>
        <p>说明：你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？</p>
      </div>
      <div className="result">
        <h3>计算结果</h3>
        <p>输入数组: [{numbers.join(', ')}]</p>
        <p>只出现一次的数字是: <span className="highlight">{result}</span></p>
      </div>
    </div>
  );
};

export default SingleNumberVisualizer; 