import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Game Template - Copy this file to create new games
 * 
 * Instructions:
 * 1. Copy this file and rename it (e.g., SpaceInvadersGame.tsx)
 * 2. Update the component name and export
 * 3. Implement your game logic in the gameLoop function
 * 4. Add the game to the games array in src/pages/Index.tsx
 */

export const GameTemplate = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    // Add your game state here
    player: { x: 400, y: 300 },
    score: 0,
    gameOver: false,
    keys: new Set<string>(),
    lastTime: 0
  });

  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game - called when game starts
  const initializeGame = useCallback(() => {
    const state = gameStateRef.current;
    state.player = { x: 400, y: 300 };
    state.score = 0;
    state.gameOver = false;
  }, []);

  // Main game loop - called every frame
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameStateRef.current.gameOver) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;
    const deltaTime = currentTime - state.lastTime;
    state.lastTime = currentTime;

    // Clear canvas with background color
    ctx.fillStyle = `hsl(var(--arcade-blue-4))`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle input
    const moveSpeed = 0.3 * deltaTime;
    
    if (state.keys.has('ArrowLeft') && state.player.x > 0) {
      state.player.x -= moveSpeed;
    }
    if (state.keys.has('ArrowRight') && state.player.x < canvas.width - 50) {
      state.player.x += moveSpeed;
    }
    if (state.keys.has('ArrowUp') && state.player.y > 0) {
      state.player.y -= moveSpeed;
    }
    if (state.keys.has('ArrowDown') && state.player.y < canvas.height - 50) {
      state.player.y += moveSpeed;
    }

    // Gamepad support
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];
    if (gamepad) {
      if (gamepad.axes[0] < -0.3 && state.player.x > 0) {
        state.player.x -= moveSpeed;
      }
      if (gamepad.axes[0] > 0.3 && state.player.x < canvas.width - 50) {
        state.player.x += moveSpeed;
      }
      if (gamepad.axes[1] < -0.3 && state.player.y > 0) {
        state.player.y -= moveSpeed;
      }
      if (gamepad.axes[1] > 0.3 && state.player.y < canvas.height - 50) {
        state.player.y += moveSpeed;
      }
    }

    // Game logic goes here
    // Update enemies, check collisions, etc.

    // Draw player (simple rectangle for template)
    ctx.fillStyle = `hsl(var(--arcade-blue-1))`;
    ctx.fillRect(state.player.x, state.player.y, 50, 50);

    // Draw score
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${state.score}`, 20, 40);

    requestAnimationFrame(gameLoop);
  }, [gameStarted]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      gameStateRef.current.keys.add(event.key);
      
      if (event.key === 'Escape') {
        onExit();
      }
      if (event.key === ' ') {
        if (!gameStarted) {
          setGameStarted(true);
          initializeGame();
        } else if (gameStateRef.current.gameOver) {
          initializeGame();
          setGameStarted(true);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      gameStateRef.current.keys.delete(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit, gameStarted, initializeGame]);

  // Start game loop when game starts
  useEffect(() => {
    if (gameStarted) {
      requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameLoop]);

  const state = gameStateRef.current;

  return (
    <div className="min-h-screen crt-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="scanline"></div>
      
      <div className="text-center mb-8">
        <h2 className="font-arcade text-4xl text-primary mb-2">GAME TEMPLATE</h2>
        {!gameStarted && (
          <p className="font-arcade text-lg insert-coin">PRESS SPACE TO START</p>
        )}
        {state.gameOver && (
          <div className="font-arcade text-lg text-destructive">
            <p>GAME OVER!</p>
            <p className="text-sm mt-2">SPACE TO RESTART</p>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas pixel-art"
      />

      <div className="mt-8 text-center font-arcade text-sm opacity-60">
        <p>ARROW KEYS TO MOVE • SPACE TO START/RESTART • ESC TO EXIT</p>
        <p>GAMEPAD: LEFT STICK TO MOVE • A TO START</p>
      </div>
    </div>
  );
};