# Adding New Games Guide

Follow these steps to add new games to the arcade system:

## Step 1: Create Game Component

1. Copy `GameTemplate.tsx` and rename it (e.g., `SpaceInvadersGame.tsx`)
2. Update the component name and export
3. Implement your game logic

## Step 2: Register Game in Index

Add your game to the `games` array in `src/pages/Index.tsx`:

```typescript
// Import your game
import { SpaceInvadersGame } from '@/components/games/SpaceInvadersGame';

// Add to games array
const games = [
  // ... existing games
  { 
    id: 'space-invaders', 
    title: 'SPACE INVADERS', 
    description: 'Shoot the aliens', 
    component: SpaceInvadersGame 
  },
];
```

## Step 3: Game Structure

Each game should follow this structure:

### Required Props
```typescript
interface GameProps {
  onExit: () => void; // Function to return to menu
}
```

### Game State Pattern
```typescript
const gameStateRef = useRef({
  // Player state
  player: { x: 0, y: 0, health: 100 },
  
  // Game objects
  enemies: [],
  bullets: [],
  powerups: [],
  
  // Game status
  score: 0,
  level: 1,
  gameOver: false,
  paused: false,
  
  // Input handling
  keys: new Set<string>(),
  
  // Timing
  lastTime: 0
});
```

### Input Handling
Support both keyboard and gamepad:

```typescript
// Keyboard
const handleKeyDown = (event: KeyboardEvent) => {
  gameStateRef.current.keys.add(event.key);
  
  // Standard controls
  if (event.key === 'Escape') onExit();
  if (event.key === ' ') handleAction();
};

// Gamepad
const handleGamepad = () => {
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[0];
  if (gamepad) {
    // Movement: axes[0] = left/right, axes[1] = up/down
    // Buttons: buttons[0] = A, buttons[1] = B, etc.
  }
};
```

### Canvas Rendering
Use semantic color tokens:

```typescript
// Background
ctx.fillStyle = `hsl(var(--arcade-blue-4))`;

// Player
ctx.fillStyle = `hsl(var(--arcade-blue-1))`;

// Enemies
ctx.fillStyle = `hsl(var(--arcade-red-1))`;

// UI Text
ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
ctx.font = '20px \"Press Start 2P\", monospace';
```

## Step 4: Game Examples

### Simple Shooter Pattern
```typescript
// Update bullets
state.bullets.forEach((bullet, index) => {
  bullet.y -= bullet.speed * deltaTime * 0.1;
  if (bullet.y < 0) {
    state.bullets.splice(index, 1);
  }
});

// Check bullet-enemy collisions
state.bullets.forEach((bullet, bulletIndex) => {
  state.enemies.forEach((enemy, enemyIndex) => {
    if (isColliding(bullet, enemy)) {
      state.bullets.splice(bulletIndex, 1);
      state.enemies.splice(enemyIndex, 1);
      state.score += 10;
    }
  });
});
```

### Collision Detection
```typescript
function isColliding(rect1: any, rect2: any): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
```

### Game Loop Timing
```typescript
const gameLoop = useCallback((currentTime: number) => {
  if (!gameStarted || state.gameOver) return;
  
  const deltaTime = currentTime - state.lastTime;
  state.lastTime = currentTime;
  
  // Update game objects
  updatePlayer(deltaTime);
  updateEnemies(deltaTime);
  updateBullets(deltaTime);
  
  // Check collisions
  checkCollisions();
  
  // Render everything
  render();
  
  requestAnimationFrame(gameLoop);
}, [gameStarted]);
```

## Available Color Tokens

Use these for consistent theming:

- `--arcade-red-1`, `--arcade-red-2`, `--arcade-red-3`
- `--arcade-orange-1`, `--arcade-orange-2`, `--arcade-orange-3`, `--arcade-orange-4`
- `--arcade-yellow-1`, `--arcade-yellow-2`, `--arcade-yellow-3`
- `--arcade-green-1`, `--arcade-green-2`, `--arcade-green-3`
- `--arcade-blue-1`, `--arcade-blue-2`, `--arcade-blue-3`, `--arcade-blue-4`
- `--arcade-gray-1`, `--arcade-gray-2`, `--arcade-gray-3`, `--arcade-gray-4`

## Game Requirements

✅ **Must Have:**
- Keyboard controls (Arrow keys, Space, Enter, Escape)
- Gamepad support via Gamepad API
- Canvas rendering at 800x600
- Pixel-perfect graphics
- Score system
- Game over/restart functionality
- ESC key exits to menu

✅ **Should Have:**
- Multiple levels/difficulty
- Sound effects (Web Audio API)
- Particle effects
- Smooth animations
- Collision detection

✅ **Nice to Have:**
- Power-ups
- Multiple game modes
- High score saving
- Custom sprites/animations
