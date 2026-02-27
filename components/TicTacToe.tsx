
import React, { useState, useEffect } from 'react';
import { X, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicTacToeProps {
  onWin: (winnerId: string) => void;
  myId: string;
  opponentId: string;
  socket: any;
  isMyTurn: boolean;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onWin, myId, opponentId, socket, isMyTurn }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState(isMyTurn);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on("tictactoe_update", (data: any) => {
      setBoard(data.board);
      setTurn(data.nextTurn === myId);
      
      const winner = checkWinner(data.board);
      if (winner) {
        const mySymbol = isMyTurn ? 'X' : 'O';
        const winnerId = winner === mySymbol ? myId : opponentId;
        onWin(winnerId);
      }
    });
    return () => socket.off("tictactoe_update");
  }, [socket, myId, opponentId, isMyTurn, onWin]);

  // AI Move Logic
  useEffect(() => {
    if (opponentId === 'ai-friend' && !turn && !checkWinner(board)) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const emptyIndices = board.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];
        if (emptyIndices.length > 0) {
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const newBoard = [...board];
          newBoard[randomIndex] = isMyTurn ? 'O' : 'X'; 
          setBoard(newBoard);
          setTurn(true);
          setIsAiThinking(false);
          
          const winner = checkWinner(newBoard);
          if (winner) {
            onWin(opponentId);
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, board, opponentId, isMyTurn, onWin]);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (!turn || board[i] || checkWinner(board) || isAiThinking) return;

    const newBoard = [...board];
    const mySymbol = isMyTurn ? 'X' : 'O';
    newBoard[i] = mySymbol;
    setBoard(newBoard);
    setTurn(false);

    socket.emit("tictactoe_move", {
      toId: opponentId,
      board: newBoard,
      nextTurn: opponentId
    });

    const winner = checkWinner(newBoard);
    if (winner) {
      onWin(myId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Tic Tac Toe</h3>
        <div className="flex items-center justify-center gap-2">
          {isAiThinking ? (
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm animate-pulse">
              <Loader2 size={16} className="animate-spin" />
              <span>AI is thinking...</span>
            </div>
          ) : (
            <p className={`text-sm font-bold uppercase tracking-widest ${turn ? 'text-emerald-600' : 'text-slate-400'}`}>
              {turn ? "Your Turn" : "Opponent's Turn"}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-[2rem] shadow-inner">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={!square && turn ? { scale: 1.05 } : {}}
            whileTap={!square && turn ? { scale: 0.95 } : {}}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-colors ${
              square ? 'bg-white' : 'bg-white/50 hover:bg-white'
            }`}
          >
            <AnimatePresence mode="wait">
              {square === 'X' && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  key="X"
                >
                  <X className="text-indigo-600 w-10 h-10 stroke-[3]" />
                </motion.div>
              )}
              {square === 'O' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key="O"
                >
                  <Circle className="text-rose-500 w-10 h-10 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>You (X)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Opponent (O)</span>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
