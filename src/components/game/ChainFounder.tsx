import { ChainName, CHAINS, GameState, TileId } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface ChainFounderProps {
  availableChains: ChainName[];
  gameState: GameState;
  onSelectChain: (chain: ChainName) => void;
}

export const ChainFounder = ({ availableChains, gameState, onSelectChain }: ChainFounderProps) => {
  // Sort chains by tier for better UX
  const sortedChains = [...availableChains].sort((a, b) => {
    const tierOrder = { budget: 0, midrange: 1, premium: 2 };
    return tierOrder[CHAINS[a].tier] - tierOrder[CHAINS[b].tier];
  });

  const placedTile = gameState.lastPlacedTile;

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-primary/50 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Found a Hotel Chain!</h3>
          <p className="text-sm text-muted-foreground">
            Choose which chain to establish. You'll receive 1 bonus share.
          </p>
        </div>
      </div>

      {/* Tile visual - matching TileConfirmationModal style */}
      {placedTile && (
        <div className="flex items-center justify-center py-4 mb-4">
          <div className="w-20 h-16 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center font-mono text-2xl font-bold text-primary animate-pulse-subtle">
            {placedTile}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {sortedChains.map(chain => {
          const info = CHAINS[chain];
          const tierLabel = {
            budget: 'Budget • Lower prices, higher volatility',
            midrange: 'Mid-range • Balanced risk and reward',
            premium: 'Premium • Higher prices, stable growth',
          }[info.tier];

          return (
            <Button
              key={chain}
              variant="outline"
              className={cn(
                "h-auto p-4 justify-start gap-4",
                "hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => onSelectChain(chain)}
            >
              <div className={cn("w-6 h-6 rounded-full shrink-0", `chain-${chain}`)} />
              <div className="text-left">
                <p className="font-semibold">{info.displayName}</p>
                <p className="text-xs text-muted-foreground">{tierLabel}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
