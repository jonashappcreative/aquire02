import React from 'react';
import { TileId, ChainName, CHAINS } from '@/types/game';
import { TutorialGameState } from './types';
import { cn } from '@/lib/utils';

interface TutorialGameBoardProps {
  gameState: TutorialGameState;
  highlightedTile?: TileId;
  onTileClick?: (tileId: TileId) => void;
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const TutorialGameBoard: React.FC<TutorialGameBoardProps> = ({
  gameState,
  highlightedTile,
  onTileClick,
}) => {
  const getChainClass = (chainName: ChainName | null): string => {
    if (!chainName) return '';
    return `chain-${chainName}`;
  };

  const isTileInHand = (tileId: TileId): boolean => {
    return gameState.playerTiles.includes(tileId);
  };

  return (
    <div className="bg-board rounded-2xl p-4 md:p-6 shadow-lg" data-tutorial="game-board">
      {/* Column headers */}
      <div className="flex mb-2">
        <div className="w-8 md:w-10" />
        {COLS.map(col => (
          <div 
            key={col} 
            className="flex-1 text-center text-xs md:text-sm font-medium text-muted-foreground"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Board grid */}
      <div className="space-y-1 md:space-y-1.5">
        {ROWS.map(row => (
          <div key={row} className="flex gap-1 md:gap-1.5">
            {/* Row label */}
            <div className="w-8 md:w-10 flex items-center justify-center text-xs md:text-sm font-medium text-muted-foreground">
              {row}
            </div>
            
            {/* Tiles */}
            {COLS.map(col => {
              const tileId = `${row}${col}` as TileId;
              const tile = gameState.board.get(tileId);
              const isInHand = isTileInHand(tileId);
              const isPlaced = tile?.placed === true;
              const chainName = tile?.chain;
              const isHighlighted = highlightedTile === tileId;

              // Determine if this tile should be clickable
              const isClickable = isInHand || isHighlighted;
              
              return (
                <button
                  key={tileId}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClickable) {
                      onTileClick?.(tileId);
                    }
                  }}
                  disabled={!isClickable}
                  className={cn(
                    "tile flex-1 aspect-[4/3] min-h-[28px] md:min-h-[36px] text-[10px] md:text-xs font-mono relative",
                    isPlaced && !chainName && "tile-placed",
                    chainName && `tile-chain ${getChainClass(chainName)}`,
                    isInHand && "tile-playable cursor-pointer",
                    isHighlighted && !isPlaced && "ring-2 ring-primary scale-105 animate-pulse cursor-pointer bg-primary/20",
                    !isClickable && !isPlaced && "opacity-50"
                  )}
                  style={{ pointerEvents: isClickable ? 'auto' : 'none' }}
                  title={tileId}
                >
                  {/* Show tile ID for placed tiles, tiles in hand, OR highlighted tiles */}
                  {(isPlaced || isInHand || isHighlighted) && (
                    <span className={cn(
                      "font-semibold",
                      chainName === 'tower' ? "text-background" : "text-foreground",
                      isHighlighted && !isPlaced && "text-primary font-bold"
                    )}>
                      {tileId}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Chain legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {Object.entries(CHAINS).map(([key, chain]) => {
          const chainState = gameState.chains[key as ChainName];
          const isActive = chainState.isActive;
          
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-opacity",
                isActive ? "opacity-100" : "opacity-40"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", `chain-${key}`)} />
              <span className="text-foreground/80">
                {chain.displayName}
                {chainState.isSafe && " ★"}
              </span>
              {isActive && (
                <span className="text-muted-foreground">
                  ({chainState.tiles.length})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
