/**
 * LeetCode 136 - 只出现一次的数字算法工具
 */

/**
 * 查找数组中只出现一次的数字
 * @param numbers 输入数组
 * @returns 只出现一次的数字
 */
export const findSingleNumber = (numbers: number[]): number => {
  return numbers.reduce((result, num) => result ^ num, 0);
};

/**
 * 将数字转换为二进制表示
 * @param num 要转换的数字
 * @param padLength 补零的长度
 * @returns 二进制字符串
 */
export const toBinaryString = (num: number, padLength: number = 8): string => {
  return num.toString(2).padStart(padLength, '0');
};

/**
 * 计算数组中每个元素的异或步骤结果
 * @param numbers 输入数组
 * @returns 每一步的异或结果
 */
export const calculateXorSteps = (numbers: number[]): number[] => {
  const results: number[] = [0]; // 初始值为0
  
  for (let i = 0; i < numbers.length; i++) {
    results.push(results[results.length - 1] ^ numbers[i]);
  }
  
  return results;
};

/**
 * 获取数字到颜色的映射
 * @param value 要映射的数字
 * @returns 对应的16进制颜色值
 */
export const getColorForValue = (value: number): string => {
  const colors = ['#4dabf7', '#ff6b6b', '#ffd43b', '#40c057', '#9775fa', '#f783ac'];
  return colors[Math.abs(value) % colors.length];
}; 