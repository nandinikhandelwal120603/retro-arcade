import { useState, useEffect } from 'react';
import { ArcadeMenu } from '@/components/ArcadeMenu';
import { PongGame } from '@/components/games/PongGame';
import { SnakeGame } from '@/components/games/SnakeGame';
import { BreakoutGame } from '@/components/games/BreakoutGame';
import { TetrisGame } from '@/components/games/TetrisGame';
import arcadeHero from '@/assets/arcade-hero.jpg';

// Placeholder components for remaining games
const SpaceInvadersGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">SPACE INVADERS</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const AsteroidsGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">ASTEROIDS</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const FlappyGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">FLAPPY</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const PacManGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">PAC-MAN</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const FroggerGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">FROGGER</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const RacingGame = ({ onExit }: { onExit: () => void }) => (
  <div className="min-h-screen crt-screen flex items-center justify-center">
    <div className="text-center font-arcade">
      <h2 className="text-4xl text-primary mb-4">RACING</h2>
      <p className="text-lg mb-4">Coming Soon...</p>
      <button onClick={onExit} className="arcade-button px-6 py-3">ESC TO EXIT</button>
    </div>
  </div>
);

const games = [
  { id: 'pong', title: 'PONG', description: 'Classic paddle game', component: PongGame },
  { id: 'snake', title: 'SNAKE', description: 'Eat and grow', component: SnakeGame },
  { id: 'breakout', title: 'BREAKOUT', description: 'Break all bricks', component: BreakoutGame },
  { id: 'tetris', title: 'TETRIS', description: 'Falling blocks', component: TetrisGame },
  { id: 'space-invaders', title: 'SPACE INVADERS', description: 'Shoot the aliens', component: SpaceInvadersGame },
  { id: 'asteroids', title: 'ASTEROIDS', description: 'Space shooter', component: AsteroidsGame },
  { id: 'flappy', title: 'FLAPPY BIRD', description: 'Fly through pipes', component: FlappyGame },
  { id: 'pacman', title: 'PAC-MAN', description: 'Eat the dots', component: PacManGame },
  { id: 'frogger', title: 'FROGGER', description: 'Cross the road', component: FroggerGame },
  { id: 'racing', title: 'RACING', description: 'Top-down racer', component: RacingGame },
];

const Index = () => {
  const [currentGame, setCurrentGame] = useState<typeof games[0] | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && !showMenu && !currentGame) {
        event.preventDefault();
        setShowMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, currentGame]);

  if (currentGame) {
    const GameComponent = currentGame.component;
    return <GameComponent onExit={() => setCurrentGame(null)} />;
  }

  if (showMenu) {
    return <ArcadeMenu games={games} onSelectGame={setCurrentGame} onBack={() => setShowMenu(false)} />;
  }

  return (
    <div className="min-h-screen crt-screen flex items-center justify-center bg-cover bg-center relative"
         style={{ backgroundImage: `url(${arcadeHero})` }}>
      <div className="scanline"></div>
      <div className="absolute inset-0 bg-background/70"></div>
      <div className="relative z-10 text-center">
        <h1 className="font-arcade text-8xl text-primary mb-6 drop-shadow-2xl">
          RETRO ARCADE
        </h1>
        <p className="font-arcade text-2xl text-accent mb-8">
          Classic Games Collection
        </p>
        <div className="insert-coin font-arcade text-xl">
          PRESS SPACE TO ENTER
        </div>
      </div>
    </div>
  );
};

export default Index;
