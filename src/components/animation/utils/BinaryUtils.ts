/**
 * 将数字转换为二进制字符串
 * @param num 要转换的数字
 * @param padLength 可选的填充长度
 * @returns 二进制字符串
 */
export const toBinaryString = (num: number, padLength?: number): string => {
  // 对于负数或0，特殊处理
  if (num === 0) return '0';
  
  // 转换为无符号32位整数的二进制表示
  const binary = (num >>> 0).toString(2);
  
  // 如果指定了填充长度，则左侧填充0
  if (padLength !== undefined) {
    return binary.padStart(padLength, '0');
  }
  
  return binary;
};

/**
 * 获取两个二进制字符串最大长度
 * @param binary1 第一个二进制字符串
 * @param binary2 第二个二进制字符串
 * @returns 最大长度
 */
export const getMaxBinaryLength = (binary1: string, binary2: string): number => {
  return Math.max(binary1.length, binary2.length);
};

/**
 * 对齐两个二进制字符串的长度
 * @param binary1 第一个二进制字符串
 * @param binary2 第二个二进制字符串
 * @returns 对齐后的二进制字符串数组 [binary1, binary2]
 */
export const alignBinaryStrings = (binary1: string, binary2: string): [string, string] => {
  const maxLength = getMaxBinaryLength(binary1, binary2);
  return [
    binary1.padStart(maxLength, '0'),
    binary2.padStart(maxLength, '0')
  ];
};

/**
 * 将一组数字转换为二进制字符串数组，并确保所有字符串长度一致
 * @param numbers 数字数组
 * @returns 二进制字符串数组
 */
export const numbersToBinaryStrings = (numbers: number[]): string[] => {
  if (numbers.length === 0) return [];
  
  // 转换为二进制
  const binaryStrings = numbers.map(num => toBinaryString(num));
  
  // 找出最长的二进制长度
  const maxLength = Math.max(...binaryStrings.map(bin => bin.length));
  
  // 填充所有二进制字符串到相同长度
  return binaryStrings.map(bin => bin.padStart(maxLength, '0'));
}; 