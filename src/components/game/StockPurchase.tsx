import { useState } from 'react';
import { ChainName, GameState, CHAINS, MAX_STOCKS_PER_TURN } from '@/types/game';
import { getStockPrice } from '@/utils/gameLogic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, SkipForward } from 'lucide-react';

interface StockPurchaseProps {
  gameState: GameState;
  playerCash: number;
  onPurchase: (purchases: { chain: ChainName; quantity: number }[]) => void;
  onSkip: () => void;
}

export const StockPurchase = ({ gameState, playerCash, onPurchase, onSkip }: StockPurchaseProps) => {
  const [selections, setSelections] = useState<Record<ChainName, number>>({
    sackson: 0,
    tower: 0,
    worldwide: 0,
    american: 0,
    festival: 0,
    continental: 0,
    imperial: 0,
  });

  const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0);
  
  const getTotalCost = (): number => {
    return (Object.entries(selections) as [ChainName, number][]).reduce((total, [chain, qty]) => {
      if (qty === 0) return total;
      const price = getStockPrice(chain, gameState.chains[chain].tiles.length);
      return total + (price * qty);
    }, 0);
  };

  const totalCost = getTotalCost();
  const canAfford = totalCost <= playerCash;
  const remainingPurchases = MAX_STOCKS_PER_TURN - totalSelected;

  const activeChains = (Object.keys(gameState.chains) as ChainName[])
    .filter(chain => gameState.chains[chain].isActive)
    .sort((a, b) => {
      const priceA = getStockPrice(a, gameState.chains[a].tiles.length);
      const priceB = getStockPrice(b, gameState.chains[b].tiles.length);
      return priceA - priceB;
    });

  const updateSelection = (chain: ChainName, delta: number) => {
    const currentQty = selections[chain];
    const available = gameState.stockBank[chain];
    const newQty = Math.max(0, Math.min(currentQty + delta, available));
    
    // Check if adding would exceed max purchases
    if (delta > 0 && totalSelected >= MAX_STOCKS_PER_TURN) return;
    
    // Check if can afford
    if (delta > 0) {
      const price = getStockPrice(chain, gameState.chains[chain].tiles.length);
      if (totalCost + price > playerCash) return;
    }

    setSelections(prev => ({ ...prev, [chain]: newQty }));
  };

  const handleConfirm = () => {
    const purchases = (Object.entries(selections) as [ChainName, number][])
      .filter(([_, qty]) => qty > 0)
      .map(([chain, quantity]) => ({ chain, quantity }));
    onPurchase(purchases);
  };

  if (activeChains.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 text-center animate-slide-up">
        <p className="text-muted-foreground mb-4">No active chains to purchase stock from</p>
        <Button onClick={onSkip} variant="secondary">
          <SkipForward className="w-4 h-4 mr-2" />
          End Turn
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Buy Stocks</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {remainingPurchases} of {MAX_STOCKS_PER_TURN} remaining
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {activeChains.map(chain => {
          const chainState = gameState.chains[chain];
          const price = getStockPrice(chain, chainState.tiles.length);
          const available = gameState.stockBank[chain];
          const selected = selections[chain];
          const canBuyMore = selected < available && totalSelected < MAX_STOCKS_PER_TURN && totalCost + price <= playerCash;

          return (
            <div
              key={chain}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                "bg-secondary/50 border border-border/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-4 h-4 rounded-full", `chain-${chain}`)} />
                <div>
                  <p className="font-medium">{CHAINS[chain].displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    ${price.toLocaleString()} per share • {available} available
                    {chainState.isSafe && " • Safe ★"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateSelection(chain, -1)}
                  disabled={selected === 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="w-8 text-center font-mono font-semibold">
                  {selected}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateSelection(chain, 1)}
                  disabled={!canBuyMore}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className={cn(
            "text-xl font-mono font-bold",
            !canAfford && "text-destructive"
          )}>
            ${totalCost.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Cash</p>
          <p className="text-xl font-mono font-bold cash-display">
            ${playerCash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onSkip}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip
        </Button>
        <Button
          className="flex-1"
          onClick={handleConfirm}
          disabled={totalSelected === 0 || !canAfford}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy {totalSelected > 0 ? `(${totalSelected})` : ''}
        </Button>
      </div>
    </div>
  );
};
