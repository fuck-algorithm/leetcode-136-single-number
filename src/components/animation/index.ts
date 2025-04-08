// 主组件
export { default as AnimationRenderer } from './AnimationRenderer';

// 渲染器
export { renderInitialFrame, getColorForNumber } from './renderers/InitialFrameRenderer';
export { renderBinaryXorOperation } from './renderers/BinaryXorRenderer';
export { renderBinaryRow } from './renderers/BinaryRowRenderer';
export { renderXorFrame } from './renderers/XorFrameRenderer';
export { renderResultFrame } from './renderers/ResultFrameRenderer';

// 效果
export { createGlowFilter, startGlowingEffect, startPulseEffect } from './effects/glowEffects';
export { addParticleEffect, addRadialEffect } from './effects/particleEffects';
export { addDynamicBackground, create3DGradient } from './effects/backgroundEffects';

// Hooks
export { useAudio } from './hooks/useAudio'; 