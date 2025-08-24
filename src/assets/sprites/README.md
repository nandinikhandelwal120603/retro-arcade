# Custom Sprites Guide

Place your custom pixel-art sprites in this directory:

## File Structure
```
src/assets/sprites/
├── characters/     # Player sprites, NPCs
├── objects/        # Items, collectibles
├── effects/        # Explosions, particles
├── vehicles/       # Cars, ships, etc.
└── tiles/          # Background tiles
```

## Supported Formats
- PNG (recommended for pixel art)
- JPG/JPEG  
- WebP
- SVG

## Naming Convention
- Use descriptive names: `player_walk_01.png`
- Animation frames: `explosion_frame_01.png`, `explosion_frame_02.png`
- Different states: `car_blue.png`, `car_red.png`

## Usage in Code
```typescript
// Import sprite
import playerSprite from '@/assets/sprites/characters/player_idle.png';

// Load in canvas context
const img = new Image();
img.src = playerSprite;
img.onload = () => {
  ctx.drawImage(img, x, y, width, height);
};
```

## Animation Example
```typescript
// Animation class
class SpriteAnimation {
  constructor(frames: string[], frameRate: number) {
    this.frames = frames.map(frame => {
      const img = new Image();
      img.src = frame;
      return img;
    });
    this.frameRate = frameRate;
    this.currentFrame = 0;
  }
  
  update(deltaTime: number) {
    this.currentFrame = Math.floor(Date.now() / this.frameRate) % this.frames.length;
  }
  
  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.drawImage(this.frames[this.currentFrame], x, y);
  }
}
```