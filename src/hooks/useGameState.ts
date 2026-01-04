import { useState, useCallback } from 'react';
import { 
  GameState, 
  TileId, 
  ChainName 
} from '@/types/game';
import {
  initializeGame,
  placeTile,
  foundChain,
  growChain,
  buyStocks,
  endTurn,
  analyzeTilePlacement,
  getAvailableChainsForFoundation,
  checkGameEnd,
  calculateFinalScores,
} from '@/utils/gameLogic';
import { toast } from '@/hooks/use-toast';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const startGame = useCallback((playerNames: string[]) => {
    const newGame = initializeGame(playerNames);
    setGameState(newGame);
    setCurrentPlayerIndex(0);
    toast({
      title: "Game Started!",
      description: `${playerNames[0]}'s turn to play`,
    });
  }, []);

  const handleTilePlacement = useCallback((tileId: TileId) => {
    if (!gameState) return;
    
    const analysis = analyzeTilePlacement(gameState, tileId);
    if (!analysis.valid) {
      toast({
        title: "Invalid Move",
        description: analysis.reason,
        variant: "destructive",
      });
      return;
    }

    let newState = placeTile(gameState, tileId);

    if (analysis.action === 'form_chain') {
      // Need to choose which chain to found
      newState.phase = 'found_chain';
      newState.pendingChainFoundation = [tileId, ...analysis.adjacentUnincorporated];
      setGameState(newState);
      return;
    }

    if (analysis.action === 'grow_chain') {
      // Automatically grow the chain
      const chainToGrow = analysis.adjacentChains[0];
      newState = growChain(newState, chainToGrow);
      
      // Add log entry for growth
      newState.gameLog = [
        ...newState.gameLog,
        {
          timestamp: Date.now(),
          playerId: newState.players[newState.currentPlayerIndex].id,
          playerName: newState.players[newState.currentPlayerIndex].name,
          action: `Extended ${chainToGrow}`,
          details: `Chain now has ${newState.chains[chainToGrow].tiles.length} tiles`,
        },
      ];
    }

    if (analysis.action === 'merge_chains') {
      // TODO: Implement merger logic
      toast({
        title: "Merger Detected",
        description: "Merger logic coming soon! For now, placing as independent tile.",
      });
      newState.phase = 'buy_stock';
    }

    if (analysis.action === 'place_only') {
      newState.phase = 'buy_stock';
    }

    // Check for game end
    if (checkGameEnd(newState)) {
      newState.phase = 'game_over';
      newState.winner = calculateFinalScores(newState)[0].name;
    }

    setGameState(newState);
  }, [gameState]);

  const handleFoundChain = useCallback((chainName: ChainName) => {
    if (!gameState) return;

    const newState = foundChain(gameState, chainName);
    
    // Check for game end after founding
    if (checkGameEnd(newState)) {
      newState.phase = 'game_over';
      newState.winner = calculateFinalScores(newState)[0].name;
    }

    setGameState(newState);
    
    toast({
      title: `${chainName.charAt(0).toUpperCase() + chainName.slice(1)} Founded!`,
      description: "You received 1 bonus share.",
    });
  }, [gameState]);

  const handleBuyStocks = useCallback((purchases: { chain: ChainName; quantity: number }[]) => {
    if (!gameState) return;

    let newState = buyStocks(gameState, purchases);
    newState = endTurn(newState);
    
    // Check for game end
    if (checkGameEnd(newState)) {
      newState.phase = 'game_over';
      newState.winner = calculateFinalScores(newState)[0].name;
    }

    setGameState(newState);
    setCurrentPlayerIndex(newState.currentPlayerIndex);

    toast({
      title: "Turn Complete",
      description: `${newState.players[newState.currentPlayerIndex].name}'s turn`,
    });
  }, [gameState]);

  const handleSkipBuyStock = useCallback(() => {
    if (!gameState) return;

    let newState = endTurn(gameState);
    
    // Check for game end
    if (checkGameEnd(newState)) {
      newState.phase = 'game_over';
      newState.winner = calculateFinalScores(newState)[0].name;
    }

    setGameState(newState);
    setCurrentPlayerIndex(newState.currentPlayerIndex);

    toast({
      title: "Turn Complete",
      description: `${newState.players[newState.currentPlayerIndex].name}'s turn`,
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setCurrentPlayerIndex(0);
  }, []);

  return {
    gameState,
    currentPlayerIndex,
    startGame,
    handleTilePlacement,
    handleFoundChain,
    handleBuyStocks,
    handleSkipBuyStock,
    resetGame,
    getAvailableChains: gameState ? () => getAvailableChainsForFoundation(gameState) : () => [],
  };
};
