import { useEffect, useRef } from 'react';

/**
 * 音频管理Hook，用于播放动画音效
 * @returns 音频播放函数
 */
export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // 创建音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * 播放音效
   * @param frequency 频率
   * @param duration 持续时间
   * @param type 波形类型
   */
  const playSound = (frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.value = 0.1;
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  };

  /**
   * 播放结果帧音效
   */
  const playResultSound = () => {
    // 播放上升的音阶表示完成
    setTimeout(() => playSound(330, 0.1, 'triangle'), 0);
    setTimeout(() => playSound(392, 0.1, 'triangle'), 150);
    setTimeout(() => playSound(440, 0.1, 'triangle'), 300);
    setTimeout(() => playSound(523, 0.3, 'triangle'), 450);
  };

  return { playSound, playResultSound };
}; 