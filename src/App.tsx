import { useState, useEffect } from 'react'
import SingleNumberControlledAnimation from './components/SingleNumberControlledAnimation'
import SingleNumberVisualizer from './components/SingleNumberVisualizer'
import './styles/theme.css'
import './App.css'

function App() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visualizer' | 'controlledAnimation'>('controlledAnimation');
  const [error, setError] = useState<string | null>(null);

  // 生成随机数组的函数
  const generateRandomArray = () => {
    // 生成1-8个随机数字对，再加上一个单独的数字，确保总长度不超过20
    const maxPairs = Math.min(8, 9); // 最多9对+1个单数 = 19
    const length = Math.floor(Math.random() * maxPairs) + 1; // 1-8/9之间的随机数
    
    // 使用较大的随机数范围，在0到2^32之间随机生成
    const MAX_RANDOM = Math.pow(2, 32); // 0到2^32之间
    // 生成较大的随机数
    const generateLargeRandom = () => {
      // 生成0到2^32-1之间的随机数
      return Math.floor(Math.random() * MAX_RANDOM);
    };
    
    const singleNumber = generateLargeRandom();
    
    // 生成随机数对
    const pairs: number[] = [];
    for (let i = 0; i < length; i++) {
      const num = generateLargeRandom();
      // 确保随机生成的数不是单独的数字
      if (num !== singleNumber) {
        pairs.push(num, num); // 添加两次相同的数字
      } else {
        // 如果随机到了单独数字，则再随机一次
        const newNum = (num === MAX_RANDOM - 1) ? num - 1 : num + 1;
        pairs.push(newNum, newNum);
      }
    }
    
    // 加入单独的数字
    pairs.push(singleNumber);
    
    // 打乱数组
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    
    return shuffled;
  };

  // 页面初始化时生成随机数组
  useEffect(() => {
    const initialArray = generateRandomArray();
    setNumbers(initialArray);
    setInputValue(initialArray.join(','));
  }, []);

  // 验证输入
  const validateInput = (input: string): string | null => {
    // 空输入或只有逗号和空格的输入是有效的
    if (!input.trim() || /^[\s,]*$/.test(input)) return null;
    
    // 分割并清理输入，但保留每个部分的原始文本以便显示错误
    const parts = input.split(',');
    const validParts = parts.map(p => p.trim()).filter(p => p !== '');
    
    // 首先检查数组长度
    if (validParts.length < 1) {
      return '数组长度不能小于1';
    }
    if (validParts.length > 20) {
      return '数组长度不能超过20，否则可视化效果不佳';
    }
    
    // 检查每个部分是否为有效数字
    let invalidParts: string[] = [];
    let outOfRangeParts: string[] = [];
    
    const MAX_VALUE = Math.pow(2, 32);
    
    for (let part of parts) {
      const trimmed = part.trim();
      // 跳过空部分
      if (trimmed === '') continue;
      
      // 检查是否为有效数字
      if (!/^(0|[1-9]\d*)$/.test(trimmed)) {
        invalidParts.push(`<strong>${part}</strong>`);
        continue;
      }
      
      // 检查范围
      const numValue = Number(trimmed);
      if (numValue < 0 || numValue > MAX_VALUE || isNaN(numValue)) {
        outOfRangeParts.push(`<strong>${part}</strong>`);
      }
    }
    
    if (invalidParts.length > 0) {
      return `输入包含非法值: ${invalidParts.join(', ')}，请输入有效的整数`;
    }
    
    if (outOfRangeParts.length > 0) {
      return `数值超出范围: ${outOfRangeParts.join(', ')}，每个值必须在0和2^32之间`;
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // 对任何输入内容都进行校验，包括空内容
    const validationError = validateInput(newValue);
    setError(validationError);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    const validationError = validateInput(inputValue);
    setError(validationError);
    if (validationError) {
      return;
    }
    
    // 解析为数字数组，使用Number而不是parseInt以支持大整数
    const parsedNumbers = inputValue
      .split(',')
      .map(num => num.trim())
      .filter(num => num !== '')
      .map(num => Number(num));
    
    // 所有验证已通过，直接更新数组
    setNumbers(parsedNumbers);
  };

  // 用于随机按钮的处理函数
  const handleRandomClick = () => {
    const randomArray = generateRandomArray();
    // 随机生成的数组已经确保长度在范围内，直接更新状态
    setNumbers(randomArray);
    setInputValue(randomArray.join(','));
    // 清除错误状态
    setError(null);
  };

  return (
    <div className="app">
      <h1 className="main-title">
        <a href="https://leetcode.cn/problems/single-number/" target="_blank" rel="noopener noreferrer">
          LeetCode 136: 只出现一次的数字
        </a>
        <a 
          href="https://github.com/fuck-algorithm/leetcode-136-single-number" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-button"
          aria-label="View source on GitHub"
          title="查看源代码"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="rgba(0, 0, 0, 0.6)" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </h1>
      <div className="input-section">
        <form onSubmit={handleSubmit}>
          <label htmlFor="numbers">输入数组（用逗号分隔）：</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="numbers"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="例如：4,1,2,1,2"
              className={error ? 'input-error' : ''}
            />
            <button 
              type="button" 
              className="random-button" 
              onClick={handleRandomClick}
              title="随机生成数据"
            >
              🎲
            </button>
            <button type="submit" className="primary start-button">开始</button>
          </div>
        </form>
        {error && (
          <div 
            className="error-message"
            dangerouslySetInnerHTML={{ __html: error }}
          />
        )}
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'visualizer' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('visualizer')}
        >
          题目描述
        </button>
        <button 
          className={activeTab === 'controlledAnimation' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('controlledAnimation')}
        >
          动画演示
        </button>
      </div>

      <div className="content">
        {activeTab === 'visualizer' ? (
          <SingleNumberVisualizer numbers={numbers} />
        ) : (
          <SingleNumberControlledAnimation numbers={numbers} />
        )}
      </div>
    </div>
  )
}

export default App 