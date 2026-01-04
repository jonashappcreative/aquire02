import { GameState } from '@/types/game';
import { GameBoard } from './GameBoard';
import { PlayerHand } from './PlayerHand';
import { PlayerCard } from './PlayerCard';
import { StockPurchase } from './StockPurchase';
import { ChainFounder } from './ChainFounder';
import { InfoCard } from './InfoCard';
import { GameLog } from './GameLog';
import { GameOver } from './GameOver';
import { getPlayerNetWorth, getAvailableChainsForFoundation } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';

interface GameContainerProps {
  gameState: GameState;
  onTilePlacement: (tileId: string) => void;
  onFoundChain: (chain: string) => void;
  onBuyStocks: (purchases: { chain: string; quantity: number }[]) => void;
  onSkipBuyStock: () => void;
  onNewGame: () => void;
}

export const GameContainer = ({
  gameState,
  onTilePlacement,
  onFoundChain,
  onBuyStocks,
  onSkipBuyStock,
  onNewGame,
}: GameContainerProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  // For local play, we're always "all players" but show current player's view
  const myPlayer = currentPlayer;
  const isMyTurn = true; // In local mode, it's always the current player's turn

  // Calculate player rankings by net worth
  const playersByNetWorth = [...gameState.players]
    .map(p => ({ ...p, netWorth: getPlayerNetWorth(p, gameState.chains) }))
    .sort((a, b) => b.netWorth - a.netWorth);

  const getPlayerRank = (playerId: string): number => {
    return playersByNetWorth.findIndex(p => p.id === playerId) + 1;
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Game Over Modal */}
      {gameState.phase === 'game_over' && (
        <GameOver gameState={gameState} onNewGame={onNewGame} />
      )}

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Acquire</h1>
            <p className="text-sm text-muted-foreground">
              Room: <span className="font-mono text-primary">{gameState.roomCode}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Current Turn</p>
              <p className="font-semibold text-primary">{currentPlayer.name}</p>
            </div>
            <InfoCard gameState={gameState} />
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 lg:gap-6">
          {/* Left Column - Board and Controls */}
          <div className="space-y-4 lg:space-y-6">
            {/* Game Board */}
            <GameBoard
              gameState={gameState}
              playerTiles={myPlayer.tiles}
              isCurrentPlayer={isMyTurn}
              onTileClick={onTilePlacement}
            />

            {/* Action Area */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Player's Hand */}
              <PlayerHand
                tiles={myPlayer.tiles}
                gameState={gameState}
                isCurrentPlayer={isMyTurn}
                canPlace={gameState.phase === 'place_tile'}
                onTileClick={onTilePlacement}
              />

              {/* Current Action */}
              <div>
                {gameState.phase === 'place_tile' && (
                  <div className="bg-card rounded-xl p-6 h-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-2">Place a Tile</p>
                      <p className="text-sm text-muted-foreground">
                        Select a highlighted tile from your hand or the board
                      </p>
                    </div>
                  </div>
                )}

                {gameState.phase === 'found_chain' && (
                  <ChainFounder
                    availableChains={getAvailableChainsForFoundation(gameState)}
                    onSelectChain={onFoundChain}
                  />
                )}

                {gameState.phase === 'buy_stock' && (
                  <StockPurchase
                    gameState={gameState}
                    playerCash={myPlayer.cash}
                    onPurchase={onBuyStocks}
                    onSkip={onSkipBuyStock}
                  />
                )}
              </div>
            </div>

            {/* Game Log - Mobile */}
            <div className="lg:hidden">
              <GameLog entries={gameState.gameLog} />
            </div>
          </div>

          {/* Right Column - Players and Log */}
          <div className="space-y-4 lg:space-y-6">
            {/* Player Cards */}
            <div className="space-y-3">
              {gameState.players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  gameState={gameState}
                  isCurrentTurn={index === gameState.currentPlayerIndex}
                  isYou={player.id === myPlayer.id}
                  rank={getPlayerRank(player.id)}
                />
              ))}
            </div>

            {/* Game Log - Desktop */}
            <div className="hidden lg:block">
              <GameLog entries={gameState.gameLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
