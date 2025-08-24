import { useEffect, useRef, useState, useCallback } from 'react';

// Tetris pieces
const PIECES = [
  { // I-piece
    shape: [[1, 1, 1, 1]],
    color: 'var(--arcade-blue-2)'
  },
  { // O-piece
    shape: [[1, 1], [1, 1]],
    color: 'var(--arcade-yellow-1)'
  },
  { // T-piece
    shape: [[0, 1, 0], [1, 1, 1]],
    color: 'var(--arcade-red-2)'
  },
  { // S-piece
    shape: [[0, 1, 1], [1, 1, 0]],
    color: 'var(--arcade-green-2)'
  },
  { // Z-piece
    shape: [[1, 1, 0], [0, 1, 1]],
    color: 'var(--arcade-orange-2)'
  },
  { // J-piece
    shape: [[1, 0, 0], [1, 1, 1]],
    color: 'var(--arcade-blue-3)'
  },
  { // L-piece
    shape: [[0, 0, 1], [1, 1, 1]],
    color: 'var(--arcade-orange-1)'
  }
];

export const TetrisGame = ({ onExit }: { onExit: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    board: Array(20).fill(null).map(() => Array(10).fill(0)),
    currentPiece: null as any,
    currentX: 0,
    currentY: 0,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    lastTime: 0,
    dropTime: 500,
    keys: new Set<string>(),
    lastKeyTime: 0
  });

  const [gameStarted, setGameStarted] = useState(false);
  const blockSize = 30;

  const createPiece = useCallback(() => {
    const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      shape: piece.shape,
      color: piece.color,
      x: Math.floor((10 - piece.shape[0].length) / 2),
      y: 0
    };
  }, []);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.board = Array(20).fill(null).map(() => Array(10).fill(0));
    state.currentPiece = createPiece();
    state.currentX = state.currentPiece.x;
    state.currentY = state.currentPiece.y;
    state.score = 0;
    state.level = 1;
    state.lines = 0;
    state.gameOver = false;
    state.dropTime = 500;
  }, [createPiece]);

  const isValidMove = useCallback((piece: any, x: number, y: number) => {
    const state = gameStateRef.current;
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const newX = x + px;
          const newY = y + py;
          if (newX < 0 || newX >= 10 || newY >= 20 || 
              (newY >= 0 && state.board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback((piece: any) => {
    const rotated = piece.shape[0].map((_: any, i: number) =>
      piece.shape.map((row: any) => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const clearLines = useCallback(() => {
    const state = gameStateRef.current;
    let linesCleared = 0;
    
    for (let y = 19; y >= 0; y--) {
      if (state.board[y].every(cell => cell !== 0)) {
        state.board.splice(y, 1);
        state.board.unshift(Array(10).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }
    
    if (linesCleared > 0) {
      state.lines += linesCleared;
      state.score += linesCleared * 100 * state.level;
      state.level = Math.floor(state.lines / 10) + 1;
      state.dropTime = Math.max(50, 500 - (state.level - 1) * 50);
    }
  }, []);

  const placePiece = useCallback(() => {
    const state = gameStateRef.current;
    const piece = state.currentPiece;
    
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const boardY = state.currentY + py;
          const boardX = state.currentX + px;
          if (boardY >= 0) {
            state.board[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    clearLines();
    
    state.currentPiece = createPiece();
    state.currentX = state.currentPiece.x;
    state.currentY = state.currentPiece.y;
    
    if (!isValidMove(state.currentPiece, state.currentX, state.currentY)) {
      state.gameOver = true;
    }
  }, [createPiece, isValidMove, clearLines]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameStateRef.current.gameOver) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;
    
    // Handle automatic dropping
    if (currentTime - state.lastTime >= state.dropTime) {
      if (isValidMove(state.currentPiece, state.currentX, state.currentY + 1)) {
        state.currentY++;
      } else {
        placePiece();
      }
      state.lastTime = currentTime;
    }

    // Handle key input with timing
    if (currentTime - state.lastKeyTime >= 100) {
      // Gamepad support
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];
      
      if (state.keys.has('ArrowLeft') || 
          (gamepad && (gamepad.axes[0] < -0.5 || gamepad.buttons[14]?.pressed))) {
        if (isValidMove(state.currentPiece, state.currentX - 1, state.currentY)) {
          state.currentX--;
          state.lastKeyTime = currentTime;
        }
      }
      if (state.keys.has('ArrowRight') || 
          (gamepad && (gamepad.axes[0] > 0.5 || gamepad.buttons[15]?.pressed))) {
        if (isValidMove(state.currentPiece, state.currentX + 1, state.currentY)) {
          state.currentX++;
          state.lastKeyTime = currentTime;
        }
      }
      if (state.keys.has('ArrowDown') || 
          (gamepad && (gamepad.axes[1] > 0.5 || gamepad.buttons[13]?.pressed))) {
        if (isValidMove(state.currentPiece, state.currentX, state.currentY + 1)) {
          state.currentY++;
          state.lastKeyTime = currentTime;
        }
      }
      if (state.keys.has('ArrowUp') || 
          (gamepad && (gamepad.buttons[12]?.pressed || gamepad.buttons[0]?.pressed))) {
        const rotated = rotatePiece(state.currentPiece);
        if (isValidMove(rotated, state.currentX, state.currentY)) {
          state.currentPiece = rotated;
          state.lastKeyTime = currentTime;
        }
      }
    }

    // Clear canvas
    ctx.fillStyle = `hsl(var(--arcade-gray-4))`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (state.board[y][x]) {
          ctx.fillStyle = `hsl(${state.board[y][x]})`;
          ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
        }
      }
    }

    // Draw current piece
    if (state.currentPiece) {
      ctx.fillStyle = `hsl(${state.currentPiece.color})`;
      for (let py = 0; py < state.currentPiece.shape.length; py++) {
        for (let px = 0; px < state.currentPiece.shape[py].length; px++) {
          if (state.currentPiece.shape[py][px]) {
            const x = (state.currentX + px) * blockSize;
            const y = (state.currentY + py) * blockSize;
            ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
          }
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = `hsl(var(--arcade-gray-2))`;
    ctx.lineWidth = 1;
    for (let x = 0; x <= 10; x++) {
      ctx.beginPath();
      ctx.moveTo(x * blockSize, 0);
      ctx.lineTo(x * blockSize, 20 * blockSize);
      ctx.stroke();
    }
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * blockSize);
      ctx.lineTo(10 * blockSize, y * blockSize);
      ctx.stroke();
    }

    // Draw UI
    ctx.fillStyle = `hsl(var(--arcade-yellow-1))`;
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${state.score}`, 320, 30);
    ctx.fillText(`LEVEL: ${state.level}`, 320, 60);
    ctx.fillText(`LINES: ${state.lines}`, 320, 90);

    requestAnimationFrame(gameLoop);
  }, [gameStarted, isValidMove, placePiece, rotatePiece]);

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
        <h2 className="font-arcade text-4xl text-primary mb-2">TETRIS</h2>
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
        width={500}
        height={600}
        className="game-canvas pixel-art"
      />

      <div className="mt-8 text-center font-arcade text-sm opacity-60">
        <p>ARROWS TO MOVE/ROTATE • SPACE TO START/RESTART • ESC TO EXIT</p>
        <p>GAMEPAD: D-PAD TO MOVE • A TO ROTATE</p>
      </div>
    </div>
  );
};