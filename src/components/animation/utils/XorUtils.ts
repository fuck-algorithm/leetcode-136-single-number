/**
 * 计算XOR步骤结果序列
 * @param numbers 数字数组
 * @returns 每一步的异或结果
 */
export const calculateXorSteps = (numbers: number[]): number[] => {
  const results = [0]; // 初始值为0
  
  for (let i = 0; i < numbers.length; i++) {
    // 确保每一步都使用无符号32位整数处理
    results.push(((results[i] >>> 0) ^ (numbers[i] >>> 0)) >>> 0);
  }
  
  return results;
};

/**
 * 根据数值获取颜色
 * @param value 数值
 * @returns 颜色代码
 */
export const getColorForValue = (value: number): string => {
  // 使用数值的哈希值来生成不同的颜色
  const hue = (value * 137) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}; 