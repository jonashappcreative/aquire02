import { PlayerState, ChainName, GameState, CHAINS } from '@/types/game';
import { getPlayerNetWorth, getStockPrice } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { User, Crown, Wifi, WifiOff } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerState;
  gameState: GameState;
  isCurrentTurn: boolean;
  isYou?: boolean;
  rank?: number;
}

export const PlayerCard = ({ player, gameState, isCurrentTurn, isYou, rank }: PlayerCardProps) => {
  const netWorth = getPlayerNetWorth(player, gameState.chains);
  
  const activeStocks = (Object.entries(player.stocks) as [ChainName, number][])
    .filter(([_, qty]) => qty > 0)
    .map(([chain, qty]) => ({
      chain,
      quantity: qty,
      value: gameState.chains[chain].isActive 
        ? getStockPrice(chain, gameState.chains[chain].tiles.length) * qty 
        : 0,
    }));

  return (
    <div className={cn(
      "player-card",
      isCurrentTurn && "player-card-active",
      isYou && "ring-1 ring-primary/30"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isCurrentTurn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {rank === 1 ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <p className={cn(
              "font-semibold text-sm",
              isCurrentTurn && "text-primary"
            )}>
              {player.name}
              {isYou && <span className="text-muted-foreground ml-1">(You)</span>}
            </p>
            {isCurrentTurn && (
              <p className="text-xs text-primary animate-pulse">Current Turn</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {player.isConnected ? (
            <Wifi className="w-3 h-3 text-cash-positive" />
          ) : (
            <WifiOff className="w-3 h-3 text-destructive" />
          )}
        </div>
      </div>

      {/* Cash */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1">Cash</p>
        <p className="cash-display">${player.cash.toLocaleString()}</p>
      </div>

      {/* Net Worth */}
      <div className="mb-3 pb-3 border-b border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
        <p className="font-mono text-lg font-medium text-foreground">
          ${netWorth.toLocaleString()}
        </p>
      </div>

      {/* Stocks */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Stocks</p>
        {activeStocks.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 italic">No stocks owned</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {activeStocks.map(({ chain, quantity, value }) => (
              <div
                key={chain}
                className={cn(
                  "stock-badge",
                  `chain-${chain}`
                )}
                title={`${quantity} shares worth $${value.toLocaleString()}`}
              >
                <span className={cn(
                  "font-semibold",
                  chain === 'tower' ? "text-background" : "text-foreground"
                )}>
                  {CHAINS[chain].displayName.slice(0, 3)}
                </span>
                <span className={cn(
                  chain === 'tower' ? "text-background/80" : "text-foreground/80"
                )}>
                  {quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
