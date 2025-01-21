import React, { useState, useEffect } from 'react';
import { Users, Bot, RotateCcw, Trophy, Zap, Brain, Cpu } from 'lucide-react';

type Player = 'X' | 'O';
type GameMode = '2P' | 'BOT';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type BoardState = (Player | null)[];

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

function App() {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [showDifficulty, setShowDifficulty] = useState(false);

  const checkWinner = (boardState: BoardState): [Player | 'DRAW' | null, number[] | null] => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return [boardState[a] as Player, combo];
      }
    }
    if (boardState.every(cell => cell !== null)) return ['DRAW', null];
    return [null, null];
  };

  const findBestMove = (boardState: BoardState, depth: number, isMax: boolean): number => {
    const [winner] = checkWinner(boardState);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'DRAW') return 0;

    const moves = boardState.reduce((acc: number[], cell, idx) => 
      !cell ? [...acc, idx] : acc, []);

    if (isMax) {
      let bestScore = -Infinity;
      let bestMove = moves[0];
      for (const move of moves) {
        const newBoard = [...boardState];
        newBoard[move] = 'O';
        const score = findBestMove(newBoard, depth + 1, false);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return depth === 0 ? bestMove : bestScore;
    } else {
      let bestScore = Infinity;
      let bestMove = moves[0];
      for (const move of moves) {
        const newBoard = [...boardState];
        newBoard[move] = 'X';
        const score = findBestMove(newBoard, depth + 1, true);
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return depth === 0 ? bestMove : bestScore;
    }
  };

  const getBotMove = () => {
    const emptyCells = board.reduce((acc: number[], cell, idx) => 
      !cell ? [...acc, idx] : acc, []);
    
    if (emptyCells.length === 0) return -1;

    switch (difficulty) {
      case 'EASY':
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      case 'MEDIUM':
        return Math.random() < 0.6 ? 
          findBestMove([...board], 0, true) : 
          emptyCells[Math.floor(Math.random() * emptyCells.length)];
      case 'HARD':
        return findBestMove([...board], 0, true);
      default:
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  };

  const makeMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const [newWinner, winLine] = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setWinningLine(winLine);
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  useEffect(() => {
    if (gameMode === 'BOT' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const botMove = getBotMove();
        if (botMove >= 0) {
          makeMove(botMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  const getCellClassName = (index: number) => {
    let className = "w-24 h-24 border-2 border-purple-500/30 flex items-center justify-center text-4xl font-bold transition-all duration-300 hover:bg-purple-500/10 ";
    if (winningLine?.includes(index)) {
      className += "bg-gradient-to-r from-purple-500/30 to-red-500/30 ";
    }
    return className;
  };

  if (!gameMode || (gameMode === 'BOT' && !difficulty)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* 3D floating shapes */}
          <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          <div className="relative bg-gray-800/40 p-12 rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10">
            <h1 className="text-7xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 via-red-400 to-purple-400 text-transparent bg-clip-text tracking-tight">
              Tic Tac Toe
            </h1>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Choose your game mode and challenge yourself or a friend
            </p>
            
            {!showDifficulty ? (
              <div className="space-y-6">
                <button
                  onClick={() => setGameMode('2P')}
                  className="w-full py-6 px-8 rounded-xl bg-gradient-to-r from-purple-600/80 to-purple-800/80 hover:from-purple-700/80 hover:to-purple-900/80 transition-all flex items-center justify-center gap-4 group backdrop-blur-sm"
                >
                  <Users size={28} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xl">Play with Friend</span>
                </button>
                <button
                  onClick={() => {
                    setGameMode('BOT');
                    setShowDifficulty(true);
                  }}
                  className="w-full py-6 px-8 rounded-xl bg-gradient-to-r from-red-600/80 to-red-800/80 hover:from-red-700/80 hover:to-red-900/80 transition-all flex items-center justify-center gap-4 group backdrop-blur-sm"
                >
                  <Bot size={28} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xl">Play vs PriBot</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl text-center text-gray-300 mb-8">Select Difficulty</h2>
                <button
                  onClick={() => setDifficulty('EASY')}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-600/80 to-green-800/80 hover:from-green-700/80 hover:to-green-900/80 transition-all flex items-center justify-center gap-3 group"
                >
                  <Zap size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-lg">Easy Mode</span>
                </button>
                <button
                  onClick={() => setDifficulty('MEDIUM')}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-yellow-600/80 to-yellow-800/80 hover:from-yellow-700/80 hover:to-yellow-900/80 transition-all flex items-center justify-center gap-3 group"
                >
                  <Brain size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-lg">Medium Mode</span>
                </button>
                <button
                  onClick={() => setDifficulty('HARD')}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600/80 to-red-800/80 hover:from-red-700/80 hover:to-red-900/80 transition-all flex items-center justify-center gap-3 group"
                >
                  <Cpu size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-lg">Hard Mode</span>
                </button>
                <button
                  onClick={() => {
                    setGameMode(null);
                    setShowDifficulty(false);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-all text-gray-300 mt-4"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 flex items-center justify-center">
      <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm shadow-2xl border border-white/10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-red-400 text-transparent bg-clip-text">
            Tic Tac Toe
          </h1>
          <div className="text-gray-300 flex items-center justify-center gap-2">
            {gameMode === 'BOT' ? (
              <>
                <Bot className="inline" size={20} />
                <span>vs PriBot ({difficulty} Mode)</span>
              </>
            ) : (
              <>
                <Users className="inline" size={20} />
                <span>2 Players</span>
              </>
            )}
          </div>
        </div>

        {winner ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
              <Trophy className="text-yellow-400" />
              <span className="bg-gradient-to-r from-purple-400 to-red-400 text-transparent bg-clip-text">
                {winner === 'DRAW' ? "It's a Draw!" : `${winner === 'X' ? 'Player X' : (gameMode === 'BOT' ? 'PriBot' : 'Player O')} Wins!`}
              </span>
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        ) : (
          <div className="text-xl font-semibold text-center mb-6 text-gray-300">
            {currentPlayer === 'X' ? "Player X's Turn" : (gameMode === 'BOT' ? "PriBot's Turn" : "Player O's Turn")}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => makeMove(index)}
              disabled={!!cell || (gameMode === 'BOT' && currentPlayer === 'O') || !!winner}
              className={getCellClassName(index)}
            >
              <span className={`${cell === 'X' ? 'text-purple-400' : 'text-red-400'}`}>
                {cell}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setGameMode(null);
            setDifficulty(null);
            setShowDifficulty(false);
            resetGame();
          }}
          className="w-full py-2 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-all text-gray-300"
        >
          Change Game Mode
        </button>
      </div>
    </div>
  );
}

export default App;