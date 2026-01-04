import { useGameState } from '@/hooks/useGameState';
import { Lobby } from '@/components/game/Lobby';
import { GameContainer } from '@/components/game/GameContainer';
import { TileId, ChainName } from '@/types/game';

const Index = () => {
  const {
    gameState,
    startGame,
    handleTilePlacement,
    handleFoundChain,
    handleBuyStocks,
    handleSkipBuyStock,
    resetGame,
  } = useGameState();

  if (!gameState) {
    return <Lobby onStartGame={startGame} />;
  }

  return (
    <GameContainer
      gameState={gameState}
      onTilePlacement={(tileId) => handleTilePlacement(tileId as TileId)}
      onFoundChain={(chain) => handleFoundChain(chain as ChainName)}
      onBuyStocks={(purchases) => handleBuyStocks(purchases as { chain: ChainName; quantity: number }[])}
      onSkipBuyStock={handleSkipBuyStock}
      onNewGame={resetGame}
    />
  );
};

export default Index;
