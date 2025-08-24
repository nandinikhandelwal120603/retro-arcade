import { useEffect, useRef, useState, useCallback } from 'react';

export const PongGame = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    paddle1Y: 250,
    paddle2Y: 250,
    ballX: 400,
    ballY: 300,
    ballVelX: 5,
    ballVelY: 3,
    score1: 0,
    score2: 0,
    keys: new Set<string>(),
    lastTime: 0
  });

  const [gameStarted, setGameStarted] = useState(false);

  const resetBall = useCallback(() => {
    const state = gameStateRef.current;
    state.ballX = 400;
    state.ballY = 300;
    state.ballVelX = Math.random() > 0.5 ? 5 : -5;
    state.ballVelY = (Math.random() - 0.5) * 6;
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;
    const deltaTime = currentTime - state.lastTime;
    state.lastTime = currentTime;

    // Clear canvas
    ctx.fillStyle = `hsl(var(--arcade-gray-4))`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle input
    const paddleSpeed = 0.3 * deltaTime;
    
    // Player 1 (left paddle)
    if (state.keys.has('ArrowUp') && state.paddle1Y > 0) {
      state.paddle1Y -= paddleSpeed;
    }
    if (state.keys.has('ArrowDown') && state.paddle1Y < canvas.height - 100) {
      state.paddle1Y += paddleSpeed;
    }

    // Gamepad support
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];
    if (gamepad) {
      if (gamepad.axes[1] < -0.5 && state.paddle1Y > 0) {
        state.paddle1Y -= paddleSpeed;
      }
      if (gamepad.axes[1] > 0.5 && state.paddle1Y < canvas.height - 100) {
        state.paddle1Y += paddleSpeed;
      }
    }

    // Simple AI for player 2
    const paddle2Center = state.paddle2Y + 50;
    if (paddle2Center < state.ballY - 30) {
      state.paddle2Y += paddleSpeed * 0.7;
    } else if (paddle2Center > state.ballY + 30) {
      state.paddle2Y -= paddleSpeed * 0.7;
    }

    // Ball movement
    state.ballX += state.ballVelX * deltaTime * 0.1;
    state.ballY += state.ballVelY * deltaTime * 0.1;

    // Ball collision with top/bottom
    if (state.ballY <= 10 || state.ballY >= canvas.height - 10) {
      state.ballVelY = -state.ballVelY;
    }

    // Ball collision with paddles
    if (state.ballX <= 30 && 
        state.ballY >= state.paddle1Y && 
        state.ballY <= state.paddle1Y + 100) {
      state.ballVelX = Math.abs(state.ballVelX);
      const relativeY = (state.ballY - (state.paddle1Y + 50)) / 50;
      state.ballVelY = relativeY * 5;
    }

    if (state.ballX >= canvas.width - 30 && 
        state.ballY >= state.paddle2Y && 
        state.ballY <= state.paddle2Y + 100) {
      state.ballVelX = -Math.abs(state.ballVelX);
      const relativeY = (state.ballY - (state.paddle2Y + 50)) / 50;
      state.ballVelY = relativeY * 5;
    }

    // Scoring
    if (state.ballX < 0) {
      state.score2++;
      resetBall();
    } else if (state.ballX > canvas.width) {
      state.score1++;
      resetBall();
    }

    // Draw paddles
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.fillRect(10, state.paddle1Y, 10, 100);
    ctx.fillRect(canvas.width - 20, state.paddle2Y, 10, 100);

    // Draw ball
    ctx.fillStyle = `hsl(var(--arcade-red-1))`;
    ctx.fillRect(state.ballX - 5, state.ballY - 5, 10, 10);

    // Draw center line
    ctx.strokeStyle = `hsl(var(--arcade-gray-2))`;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw scores
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.font = '48px "Press Start 2P", monospace';
    ctx.fillText(state.score1.toString(), canvas.width / 4, 80);
    ctx.fillText(state.score2.toString(), (canvas.width * 3) / 4, 80);

    requestAnimationFrame(gameLoop);
  }, [gameStarted, resetBall]);

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
      if (event.key === ' ' && !gameStarted) {
        setGameStarted(true);
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
  }, [onExit, gameStarted]);

  useEffect(() => {
    if (gameStarted) {
      requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameLoop]);

  return (
    <div className="min-h-screen crt-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="scanline"></div>
      
      <div className="text-center mb-8">
        <h2 className="font-arcade text-4xl text-primary mb-2">PONG</h2>
        {!gameStarted && (
          <p className="font-arcade text-lg insert-coin">PRESS SPACE TO START</p>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas pixel-art"
      />

      <div className="mt-8 text-center font-arcade text-sm opacity-60">
        <p>↑ ↓ ARROWS TO MOVE • ESC TO EXIT</p>
        <p>GAMEPAD: LEFT STICK TO MOVE</p>
      </div>
    </div>
  );
};