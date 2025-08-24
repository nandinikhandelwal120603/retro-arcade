import { useEffect, useRef, useState, useCallback } from 'react';

export const BreakoutGame = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    paddleX: 350,
    ballX: 400,
    ballY: 500,
    ballVelX: 4,
    ballVelY: -4,
    bricks: [] as Array<{ x: number; y: number; color: string; visible: boolean }>,
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    keys: new Set<string>(),
    lastTime: 0
  });

  const [gameStarted, setGameStarted] = useState(false);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const ballRadius = 8;
  const brickWidth = 75;
  const brickHeight = 20;
  const brickRows = 8;
  const brickCols = 10;

  const initializeBricks = useCallback(() => {
    const state = gameStateRef.current;
    state.bricks = [];
    const colors = [
      'var(--arcade-red-1)',
      'var(--arcade-red-2)',
      'var(--arcade-orange-1)',
      'var(--arcade-orange-2)',
      'var(--arcade-yellow-1)',
      'var(--arcade-yellow-2)',
      'var(--arcade-green-2)',
      'var(--arcade-green-3)'
    ];

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        state.bricks.push({
          x: col * (brickWidth + 5) + 35,
          y: row * (brickHeight + 5) + 60,
          color: colors[row],
          visible: true
        });
      }
    }
  }, []);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.paddleX = 350;
    state.ballX = 400;
    state.ballY = 500;
    state.ballVelX = 4;
    state.ballVelY = -4;
    state.score = 0;
    state.lives = 3;
    state.gameOver = false;
    state.won = false;
    initializeBricks();
  }, [initializeBricks]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameStateRef.current.gameOver) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;
    const deltaTime = currentTime - state.lastTime;
    state.lastTime = currentTime;

    // Handle input
    const paddleSpeed = 0.5 * deltaTime;
    
    if (state.keys.has('ArrowLeft') && state.paddleX > 0) {
      state.paddleX -= paddleSpeed;
    }
    if (state.keys.has('ArrowRight') && state.paddleX < canvas.width - paddleWidth) {
      state.paddleX += paddleSpeed;
    }

    // Gamepad support
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];
    if (gamepad) {
      if (gamepad.axes[0] < -0.3 && state.paddleX > 0) {
        state.paddleX -= paddleSpeed;
      }
      if (gamepad.axes[0] > 0.3 && state.paddleX < canvas.width - paddleWidth) {
        state.paddleX += paddleSpeed;
      }
    }

    // Ball movement
    state.ballX += state.ballVelX * deltaTime * 0.1;
    state.ballY += state.ballVelY * deltaTime * 0.1;

    // Ball collision with walls
    if (state.ballX <= ballRadius || state.ballX >= canvas.width - ballRadius) {
      state.ballVelX = -state.ballVelX;
    }
    if (state.ballY <= ballRadius) {
      state.ballVelY = -state.ballVelY;
    }

    // Ball collision with paddle
    if (state.ballY >= canvas.height - 60 &&
        state.ballY <= canvas.height - 40 &&
        state.ballX >= state.paddleX &&
        state.ballX <= state.paddleX + paddleWidth) {
      state.ballVelY = -Math.abs(state.ballVelY);
      // Add spin based on where ball hits paddle
      const hitPos = (state.ballX - state.paddleX) / paddleWidth - 0.5;
      state.ballVelX += hitPos * 2;
    }

    // Ball collision with bricks
    state.bricks.forEach(brick => {
      if (!brick.visible) return;
      
      if (state.ballX >= brick.x && 
          state.ballX <= brick.x + brickWidth &&
          state.ballY >= brick.y && 
          state.ballY <= brick.y + brickHeight) {
        brick.visible = false;
        state.score += 10;
        state.ballVelY = -state.ballVelY;
      }
    });

    // Check win condition
    if (state.bricks.every(brick => !brick.visible)) {
      state.won = true;
      state.gameOver = true;
    }

    // Ball falls off screen
    if (state.ballY > canvas.height) {
      state.lives--;
      if (state.lives <= 0) {
        state.gameOver = true;
      } else {
        state.ballX = 400;
        state.ballY = 500;
        state.ballVelX = 4;
        state.ballVelY = -4;
      }
    }

    // Clear canvas
    ctx.fillStyle = `hsl(var(--arcade-gray-4))`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    state.bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = `hsl(${brick.color})`;
        ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        ctx.strokeStyle = `hsl(var(--arcade-yellow-1))`;
        ctx.strokeRect(brick.x, brick.y, brickWidth, brickHeight);
      }
    });

    // Draw paddle
    ctx.fillStyle = `hsl(var(--arcade-blue-2))`;
    ctx.fillRect(state.paddleX, canvas.height - 40, paddleWidth, paddleHeight);

    // Draw ball
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw UI
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${state.score}`, 20, 35);
    ctx.fillText(`LIVES: ${state.lives}`, 600, 35);

    requestAnimationFrame(gameLoop);
  }, [gameStarted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape'].includes(event.key)) {
        event.preventDefault();
      }
      
      gameStateRef.current.keys.add(event.key);
      
      if (event.key === 'Escape') {
        onExit();
      }
      if (event.key === ' ') {
        if (!gameStarted) {
          setGameStarted(true);
          resetGame();
        } else if (gameStateRef.current.gameOver) {
          resetGame();
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
        <h2 className="font-arcade text-4xl text-primary mb-2">BREAKOUT</h2>
        {!gameStarted && (
          <p className="font-arcade text-lg insert-coin">PRESS SPACE TO START</p>
        )}
        {state.gameOver && (
          <div className="font-arcade text-lg">
            {state.won ? (
              <p className="text-accent">YOU WIN!</p>
            ) : (
              <p className="text-destructive">GAME OVER!</p>
            )}
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
        <p>← → ARROWS TO MOVE • SPACE TO START/RESTART • ESC TO EXIT</p>
        <p>GAMEPAD: LEFT STICK TO MOVE</p>
      </div>
    </div>
  );
};