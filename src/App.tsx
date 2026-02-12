import React, { useState, useMemo, useEffect } from "react";
// import BingoScene from './BingoScene';
import { Trophy, RefreshCw, Zap } from "lucide-react";
import BingoScene from "./components/BingoScene";

const generateCard = () => {
  const card = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) card.push("FREE");
    else card.push(Math.floor(Math.random() * 75) + 1);
  }
  return card;
};

export default function App() {
  const [card, setCard] = useState(generateCard());
  const [drawn, setDrawn] = useState([]);
  const [balls, setBalls] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  // Derive marked indices from the current card and drawn numbers
  const markedIndices = card
    .map((num, i) => (drawn.includes(num) || i === 12 ? i : null))
    .filter((val) => val !== null);

  const checkBingo = (markedIndices) => {
    const winLines = [
      // Rows
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ];

    return winLines.some((line) =>
      line.every((index) => markedIndices.includes(index)),
    );
  };

  // Effect to check for Bingo whenever a number is drawn
  useEffect(() => {
    if (checkBingo(markedIndices) && !hasWon) {
      setHasWon(true);
      // You could trigger a confetti cannon here!
    }
  }, [drawn]);

  const handleDraw = () => {
    if (hasWon || drawn.length >= 75) return;

    let num;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (drawn.includes(num));

    setDrawn((prev) => [num, ...prev]);
    setBalls((prev) => [
      ...prev,
      { color: num % 2 === 0 ? "#00f2ff" : "#bc13fe" },
    ]);
  };

  const resetGame = () => {
    setCard(generateCard());
    setDrawn([]);
    setBalls([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center relative overflow-hidden">
      {/* Winner Overlay */}
      {hasWon && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center p-10 border-4 border-yellow-400 rounded-3xl bg-gray-900 shadow-[0_0_50px_rgba(250,204,21,0.4)]">
            <h2 className="text-7xl font-black italic text-yellow-400 mb-4 animate-bounce">
              BINGO!
            </h2>
            <p className="text-cyan-400 tracking-widest uppercase mb-8">
              Mission Accomplished
            </p>
            <button
              onClick={() => {
                setHasWon(false);
                resetGame();
              }}
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* ... Existing UI Header ... */}

      <div
        className={`w-full max-w-2xl transition-all duration-700 ${hasWon ? "scale-90 opacity-50" : "scale-100"}`}
      >
        <BingoScene balls={balls} />

        <div className="p-6 bg-gray-900 rounded-b-3xl border border-white/10">
          {/* Grid implementation as before, but using the markedIndices check */}
          <div className="grid grid-cols-5 gap-2">
            {card.map((num, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-lg font-bold border-2 transition-all
                  ${
                    markedIndices.includes(i)
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-white text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                      : "bg-gray-800 border-gray-700 text-gray-600"
                  }`}
              >
                {num === "FREE" ? <Trophy size={20} /> : num}
              </div>
            ))}
          </div>

          <button
            disabled={hasWon}
            onClick={handleDraw}
            className="w-full mt-8 py-4 bg-purple-600 rounded-xl font-black text-xl disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            {hasWon ? "MATCH COMPLETE" : "DRAW NEXT BALL"}
          </button>
        </div>
      </div>
    </div>
  );
}
