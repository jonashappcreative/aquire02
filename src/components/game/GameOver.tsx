import { PlayerState, GameState } from '@/types/game';
import { calculateFinalScores, getPlayerNetWorth } from '@/utils/gameLogic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Medal, RefreshCw, Crown } from 'lucide-react';

interface GameOverProps {
  gameState: GameState;
  onNewGame: () => void;
}

export const GameOver = ({ gameState, onNewGame }: GameOverProps) => {
  const finalScores = calculateFinalScores(gameState);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-lg w-full animate-slide-up shadow-2xl border border-border">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cash-neutral/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-cash-neutral" />
          </div>
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <p className="text-muted-foreground">Final standings</p>
        </div>

        <div className="space-y-3 mb-6">
          {finalScores.map((player, index) => {
            const isWinner = index === 0;
            const icons = [Crown, Medal, Medal, Medal];
            const Icon = icons[index];

            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  isWinner 
                    ? "bg-cash-neutral/10 ring-2 ring-cash-neutral" 
                    : "bg-muted/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isWinner ? "bg-cash-neutral text-background" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    isWinner && "text-cash-neutral"
                  )}>
                    {player.name}
                    {isWinner && <span className="ml-2">🏆</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{index + 1} Place
                  </p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "font-mono text-lg font-bold",
                    isWinner ? "cash-display" : "text-foreground"
                  )}>
                    ${player.cash.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onNewGame}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>
    </div>
  );
};
