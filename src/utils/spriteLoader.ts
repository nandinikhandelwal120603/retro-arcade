/**
 * Sprite Loading and Animation Utilities
 * 
 * Use these utilities to load and animate sprites in your games
 */

export interface SpriteFrame {
  image: HTMLImageElement;
  duration: number; // in milliseconds
}

export class SpriteSheet {
  private image: HTMLImageElement;
  private frameWidth: number;
  private frameHeight: number;
  private cols: number;
  private rows: number;

  constructor(
    imageSrc: string, 
    frameWidth: number, 
    frameHeight: number, 
    cols: number, 
    rows: number
  ) {
    this.image = new Image();
    this.image.src = imageSrc;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.cols = cols;
    this.rows = rows;
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    x: number,
    y: number,
    scale: number = 1
  ) {
    const col = frameIndex % this.cols;
    const row = Math.floor(frameIndex / this.cols);
    
    ctx.drawImage(
      this.image,
      col * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      this.frameWidth * scale,
      this.frameHeight * scale
    );
  }

  isLoaded(): boolean {
    return this.image.complete;
  }
}

export class SpriteAnimation {
  private frames: SpriteFrame[];
  private currentFrameIndex: number = 0;
  private elapsed: number = 0;
  private isPlaying: boolean = false;
  private loop: boolean = true;

  constructor(frames: SpriteFrame[], loop: boolean = true) {
    this.frames = frames;
    this.loop = loop;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.elapsed = 0;
  }

  update(deltaTime: number) {
    if (!this.isPlaying || this.frames.length === 0) return;

    this.elapsed += deltaTime;
    const currentFrame = this.frames[this.currentFrameIndex];
    
    if (this.elapsed >= currentFrame.duration) {
      this.elapsed = 0;
      this.currentFrameIndex++;
      
      if (this.currentFrameIndex >= this.frames.length) {
        if (this.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = this.frames.length - 1;
          this.isPlaying = false;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) {
    if (this.frames.length === 0) return;
    
    const currentFrame = this.frames[this.currentFrameIndex];
    const img = currentFrame.image;
    
    if (img.complete) {
      ctx.drawImage(
        img, 
        x, 
        y, 
        img.width * scale, 
        img.height * scale
      );
    }
  }

  getCurrentFrame(): SpriteFrame | null {
    return this.frames[this.currentFrameIndex] || null;
  }

  isAnimating(): boolean {
    return this.isPlaying;
  }
}

export async function loadSprite(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadSpriteFrames(
  sources: string[], 
  frameDuration: number = 100
): Promise<SpriteFrame[]> {
  const images = await Promise.all(sources.map(loadSprite));
  return images.map(image => ({ image, duration: frameDuration }));
}

// Example animations you can use
export const createExplosionAnimation = async () => {
  // Replace with your explosion sprite paths
  const explosionFrames = [
    '/sprites/effects/explosion_01.png',
    '/sprites/effects/explosion_02.png',
    '/sprites/effects/explosion_03.png',
    '/sprites/effects/explosion_04.png'
  ];
  
  try {
    const frames = await loadSpriteFrames(explosionFrames, 100);
    return new SpriteAnimation(frames, false); // Don't loop explosion
  } catch (error) {
    console.warn('Could not load explosion animation:', error);
    return null;
  }
};

export const createWalkAnimation = async () => {
  // Replace with your walking sprite paths
  const walkFrames = [
    '/sprites/characters/walk_01.png',
    '/sprites/characters/walk_02.png',
    '/sprites/characters/walk_03.png',
    '/sprites/characters/walk_04.png'
  ];
  
  try {
    const frames = await loadSpriteFrames(walkFrames, 150);
    return new SpriteAnimation(frames, true); // Loop walking
  } catch (error) {
    console.warn('Could not load walk animation:', error);
    return null;
  }
};