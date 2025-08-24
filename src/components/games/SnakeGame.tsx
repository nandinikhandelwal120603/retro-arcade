import { useEffect, useRef, useState, useCallback } from 'react';

export const SnakeGame = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    gameOver: false,
    lastTime: 0,
    moveInterval: 150
  });

  const [gameStarted, setGameStarted] = useState(false);
  const gridSize = 20;
  const canvasWidth = 800;
  const canvasHeight = 600;

  const generateFood = useCallback(() => {
    const state = gameStateRef.current;
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (canvasWidth / gridSize)),
        y: Math.floor(Math.random() * (canvasHeight / gridSize))
      };
    } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    state.food = newFood;
  }, []);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.snake = [{ x: 10, y: 10 }];
    state.direction = { x: 1, y: 0 };
    state.score = 0;
    state.gameOver = false;
    generateFood();
  }, [generateFood]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameStateRef.current.gameOver) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;
    
    if (currentTime - state.lastTime >= state.moveInterval) {
      // Move snake
      const head = { ...state.snake[0] };
      head.x += state.direction.x;
      head.y += state.direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= canvasWidth / gridSize || 
          head.y < 0 || head.y >= canvasHeight / gridSize) {
        state.gameOver = true;
        return;
      }

      // Check self collision
      if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        state.gameOver = true;
        return;
      }

      state.snake.unshift(head);

      // Check food collision
      if (head.x === state.food.x && head.y === state.food.y) {
        state.score += 10;
        generateFood();
        state.moveInterval = Math.max(80, state.moveInterval - 2); // Speed up
      } else {
        state.snake.pop();
      }

      state.lastTime = currentTime;
    }

    // Clear canvas
    ctx.fillStyle = `hsl(var(--arcade-gray-4))`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = `hsl(var(--arcade-gray-3))`;
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw snake
    state.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? 
        `hsl(var(--arcade-green-1))` : 
        `hsl(var(--arcade-green-2))`;
      ctx.fillRect(
        segment.x * gridSize + 1, 
        segment.y * gridSize + 1, 
        gridSize - 2, 
        gridSize - 2
      );
    });

    // Draw food
    ctx.fillStyle = `hsl(var(--arcade-red-1))`;
    ctx.fillRect(
      state.food.x * gridSize + 1, 
      state.food.y * gridSize + 1, 
      gridSize - 2, 
      gridSize - 2
    );

    // Draw score
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${state.score}`, 20, 40);

    requestAnimationFrame(gameLoop);
  }, [gameStarted, generateFood]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape'].includes(event.key)) {
        event.preventDefault();
      }
      
      const state = gameStateRef.current;
      
      if (event.key === 'Escape') {
        onExit();
        return;
      }

      if (event.key === ' ') {
        if (!gameStarted) {
          setGameStarted(true);
          resetGame();
        } else if (state.gameOver) {
          resetGame();
          setGameStarted(true);
        }
        return;
      }

      if (!gameStarted || state.gameOver) return;

      // Prevent reverse direction
      switch (event.key) {
        case 'ArrowUp':
          if (state.direction.y === 0) state.direction = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (state.direction.y === 0) state.direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (state.direction.x === 0) state.direction = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (state.direction.x === 0) state.direction = { x: 1, y: 0 };
          break;
      }
    };

    // Gamepad support
    const handleGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];
      const state = gameStateRef.current;
      
      if (gamepad && gameStarted && !state.gameOver) {
        // D-pad or analog stick
        if ((gamepad.axes[1] < -0.5 || gamepad.buttons[12]?.pressed) && state.direction.y === 0) {
          state.direction = { x: 0, y: -1 };
        } else if ((gamepad.axes[1] > 0.5 || gamepad.buttons[13]?.pressed) && state.direction.y === 0) {
          state.direction = { x: 0, y: 1 };
        } else if ((gamepad.axes[0] < -0.5 || gamepad.buttons[14]?.pressed) && state.direction.x === 0) {
          state.direction = { x: -1, y: 0 };
        } else if ((gamepad.axes[0] > 0.5 || gamepad.buttons[15]?.pressed) && state.direction.x === 0) {
          state.direction = { x: 1, y: 0 };
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const gamepadInterval = setInterval(handleGamepad, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gamepadInterval);
    };
  }, [onExit, gameStarted, resetGame]);

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
        <h2 className="font-arcade text-4xl text-primary mb-2">SNAKE</h2>
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
        width={canvasWidth}
        height={canvasHeight}
        className="game-canvas pixel-art"
      />

      <div className="mt-8 text-center font-arcade text-sm opacity-60">
        <p>ARROW KEYS TO MOVE • SPACE TO START/RESTART • ESC TO EXIT</p>
        <p>GAMEPAD: D-PAD TO MOVE</p>
      </div>
    </div>
  );
};