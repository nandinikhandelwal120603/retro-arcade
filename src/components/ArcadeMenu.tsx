import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Game {
  id: string;
  title: string;
  description: string;
  component: ({ onExit }: { onExit: () => void }) => JSX.Element;
}

interface ArcadeMenuProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onBack: () => void;
}

export const ArcadeMenu = ({ games, onSelectGame, onBack }: ArcadeMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1));
          break;
        case 'ArrowDown':
          setSelectedIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0));
          break;
        case ' ': // Space - Insert Coin
          event.preventDefault();
          setCredits((prev) => prev + 1);
          break;
        case 'Enter':
          if (credits >= 2) {
            setCredits((prev) => prev - 2);
            onSelectGame(games[selectedIndex]);
          }
          break;
        case 'Escape':
          onBack();
          break;
      }
    };

    // Gamepad support
    const handleGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];
      
      if (gamepad) {
        // D-pad or analog stick
        if (gamepad.axes[1] < -0.5 || gamepad.buttons[12]?.pressed) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1));
        } else if (gamepad.axes[1] > 0.5 || gamepad.buttons[13]?.pressed) {
          setSelectedIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0));
        }

        // Button A (insert coin)
        if (gamepad.buttons[0]?.pressed) {
          setCredits((prev) => prev + 1);
        }

        // Button B (start game)
        if (gamepad.buttons[1]?.pressed && credits >= 2) {
          setCredits((prev) => prev - 2);
          onSelectGame(games[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const gamepadInterval = setInterval(handleGamepad, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gamepadInterval);
    };
  }, [games, selectedIndex, credits, onSelectGame]);

  return (
    <div className="min-h-screen crt-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="scanline"></div>
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-arcade text-6xl mb-4 text-primary drop-shadow-lg">
          RETRO ARCADE
        </h1>
        <div className="text-2xl font-arcade mb-8">
          <span className="insert-coin">INSERT COIN</span>
        </div>
        <div className="text-xl font-arcade text-accent">
          CREDITS: {credits}
        </div>
      </div>

      {/* Game List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {games.map((game, index) => (
          <div
            key={game.id}
            className={`
              arcade-button p-6 text-center cursor-pointer font-arcade text-sm
              ${index === selectedIndex ? 'ring-4 ring-accent' : ''}
            `}
            onClick={() => {
              setSelectedIndex(index);
              if (credits >= 2) {
                setCredits((prev) => prev - 2);
                onSelectGame(game);
              }
            }}
          >
            <div className="mb-2 text-lg">{game.title}</div>
            <div className="text-xs opacity-80">{game.description}</div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center font-arcade text-sm opacity-60">
        <p>↑ ↓ ARROWS TO SELECT • SPACE TO INSERT COIN • ENTER TO START (2 COINS)</p>
        <p className="mt-2">GAMEPAD: D-PAD TO SELECT • A TO INSERT COIN • B TO START</p>
        <p className="mt-2">ESC TO GO BACK TO TITLE SCREEN</p>
      </div>
    </div>
  );
};