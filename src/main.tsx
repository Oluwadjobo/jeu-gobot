import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// =================================================================================
// TYPE DEFINITIONS
// =================================================================================

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

type TileValue = number | null;
type BoardLayout = TileValue[];

enum GameStatus {
  SELECTING,
  PLAYING,
  SOLVED,
  TIME_UP,
}

// =================================================================================
// ICON COMPONENTS
// =================================================================================

const UploadCloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const TimerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const MovesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 10h-1.26a2 2 0 0 0-1.92 1.45l-2.43 7.28a2 2 0 0 1-1.92 1.45H10a2 2 0 0 1-2-2v-3.59a2 2 0 0 0-.59-1.41l-2.82-2.82a2 2 0 0 0-2.83 0L2 12.17" />
        <path d="m7 2 3 3-3 3" />
        <path d="M10 5h9" />
    </svg>
);

// =================================================================================
// TILE COMPONENT
// =================================================================================

interface TileProps {
  value: number;
  imageSrc: string;
  boardSize: number;
  tileSize: number;
  position: { x: number; y: number };
  onClick: () => void;
  isSolved: boolean;
}

const Tile: React.FC<TileProps> = ({ value, imageSrc, boardSize, tileSize, position, onClick, isSolved }) => {
  const correctPosition = value - 1;
  const correctX = correctPosition % boardSize;
  const correctY = Math.floor(correctPosition / boardSize);

  const backgroundPosX = `-${correctX * tileSize}px`;
  const backgroundPosY = `-${correctY * tileSize}px`;

  return (
    <div
      className="absolute bg-cover bg-no-repeat rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:z-10"
      style={{
        width: `${tileSize}px`,
        height: `${tileSize}px`,
        transform: `translate(${position.x * tileSize}px, ${position.y * tileSize}px)`,
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: `${boardSize * tileSize}px ${boardSize * tileSize}px`,
        backgroundPosition: `${backgroundPosX} ${backgroundPosY}`,
        opacity: isSolved ? 0.8 : 1,
      }}
      onClick={onClick}
    />
  );
};

// =================================================================================
// IMAGE SELECTOR COMPONENT
// =================================================================================

interface ImageSelectorProps {
  onGameStart: (imageSrc: string, level: number) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ onGameStart }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [level, setLevel] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-6">
        <div className="flex justify-center items-center">
             <h1 className="text-3xl md:text-4xl font-bold text-secondary">Puzzle GoBot</h1>
        </div>
       
        <p className="text-slate-600">
          Choisissez une image et un niveau de difficulté pour commencer à jouer.
        </p>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div 
          className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={handleSelectImageClick}
        >
          {imageSrc ? (
            <img src={imageSrc} alt="Aperçu" className="max-h-full max-w-full rounded-md object-contain" />
          ) : (
            <>
              <UploadCloudIcon className="w-12 h-12 text-slate-400 mb-2" />
              <span className="text-slate-500 font-medium">Cliquez pour choisir une image</span>
            </>
          )}
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-2">
            Niveau de difficulté
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
          >
            <option value="3">Facile (3x3)</option>
            <option value="4">Moyen (4x4)</option>
            <option value="5">Difficile (5x5)</option>
          </select>
        </div>

        <button
          onClick={() => imageSrc && onGameStart(imageSrc, level)}
          disabled={!imageSrc}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:scale-100"
        >
          <PlayIcon className="w-5 h-5" />
          Commencer à jouer
        </button>
      </div>
    </div>
  );
};

// =================================================================================
// MAIN APP COMPONENT
// =================================================================================

const App: React.FC = () => {
    const [status, setStatus] = useState<GameStatus>(GameStatus.SELECTING);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [size, setSize] = useState(3);
    const [board, setBoard] = useState<BoardLayout>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [boardSizePx, setBoardSizePx] = useState(500);

    const timeLimit = useMemo(() => size * size * 10, [size]);

    const getWinMessage = useCallback(() => {
        switch (size) {
            case 3: return "Gagné ! Bonus de 10% sur le billet de 5000.";
            case 4: return "Gagné ! Bonus de 7% sur le billet de 10000.";
            case 5: return "Gagné ! Bonus de 6% sur le billet de 25000.";
            default: return "Gagné !";
        }
    }, [size]);

    const shuffleBoard = useCallback((s: number): BoardLayout => {
        const totalTiles = s * s;
        let newBoard = Array.from({ length: totalTiles }, (_, i) => i + 1);
        newBoard[totalTiles - 1] = null;

        let blankIndex = totalTiles - 1;

        for (let i = 0; i < s * s * 10; i++) {
            const possibleMoves: Direction[] = [];
            const [x, y] = [blankIndex % s, Math.floor(blankIndex / s)];

            if (y > 0) possibleMoves.push(Direction.DOWN);
            if (y < s - 1) possibleMoves.push(Direction.UP);
            if (x > 0) possibleMoves.push(Direction.RIGHT);
            if (x < s - 1) possibleMoves.push(Direction.LEFT);
            
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            let targetIndex = -1;
            if (randomMove === Direction.UP) targetIndex = blankIndex + s;
            if (randomMove === Direction.DOWN) targetIndex = blankIndex - s;
            if (randomMove === Direction.LEFT) targetIndex = blankIndex + 1;
            if (randomMove === Direction.RIGHT) targetIndex = blankIndex - 1;

            [newBoard[blankIndex], newBoard[targetIndex]] = [newBoard[targetIndex], newBoard[blankIndex]];
            blankIndex = targetIndex;
        }
        
        // Ensure it's not solved already
        if (isSolved(newBoard)) {
            return shuffleBoard(s);
        }

        return newBoard;
    }, []);

    const isSolved = (currentBoard: BoardLayout): boolean => {
        for (let i = 0; i < currentBoard.length - 1; i++) {
            if (currentBoard[i] !== i + 1) return false;
        }
        return currentBoard[currentBoard.length - 1] === null;
    };

    const handleGameStart = (img: string, level: number) => {
        setImageSrc(img);
        setSize(level);
        setBoard(shuffleBoard(level));
        setMoves(0);
        setTime(0);
        setStatus(GameStatus.PLAYING);
    };

    const handleNewGame = () => {
        setStatus(GameStatus.SELECTING);
        setImageSrc(null);
    };
    
    const handleReset = () => {
        setBoard(shuffleBoard(size));
        setMoves(0);
        setTime(0);
        setStatus(GameStatus.PLAYING);
    };
    
    const handleSolve = () => {
        const solvedBoard = Array.from({ length: size * size }, (_, i) => i + 1);
        solvedBoard[size * size - 1] = null;
        setBoard(solvedBoard);
        setStatus(GameStatus.SOLVED);
    };

    const handleTileClick = (tileIndex: number) => {
        if (status !== GameStatus.PLAYING) return;
        
        const blankIndex = board.indexOf(null);
        if (blankIndex === -1) return;

        const [tileX, tileY] = [tileIndex % size, Math.floor(tileIndex / size)];
        const [blankX, blankY] = [blankIndex % size, Math.floor(blankIndex / size)];

        const isAdjacent = Math.abs(tileX - blankX) + Math.abs(tileY - blankY) === 1;

        if (isAdjacent) {
            const newBoard = [...board];
            [newBoard[tileIndex], newBoard[blankIndex]] = [newBoard[blankIndex], newBoard[tileIndex]];
            setBoard(newBoard);
            setMoves(m => m + 1);
        }
    };

    useEffect(() => {
        if (status === GameStatus.PLAYING) {
            const timer = setInterval(() => {
                setTime(t => {
                    if (t + 1 >= timeLimit) {
                        setStatus(GameStatus.TIME_UP);
                        clearInterval(timer);
                        return timeLimit;
                    }
                    return t + 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, timeLimit]);
    
    useEffect(() => {
        if(status === GameStatus.PLAYING && isSolved(board)) {
            setStatus(GameStatus.SOLVED);
        }
    }, [board, status]);

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            const size = Math.min(600, screenWidth * 0.9);
            setBoardSizePx(size);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tileSize = boardSizePx / size;

    if (status === GameStatus.SELECTING) {
        return <ImageSelector onGameStart={handleGameStart} />;
    }

    const renderMessage = () => {
        switch (status) {
            case GameStatus.SOLVED:
                return <div className="text-green-600 font-bold flex items-center gap-2"><CheckCircleIcon className="w-6 h-6" /> {getWinMessage()}</div>;
            case GameStatus.TIME_UP:
                return <div className="text-red-600 font-bold">Temps écoulé ! Pas de réduction.</div>;
            case GameStatus.PLAYING:
                return <div className="text-slate-500">Déplacez les tuiles pour reconstituer l'image.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-light p-4 font-sans">
            <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
                <div className="w-full bg-white rounded-2xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                         <h1 className="text-2xl md:text-3xl font-bold text-secondary">Puzzle GoBot</h1>
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 text-slate-700">
                                <MovesIcon className="w-5 h-5 text-primary" />
                                <span className="font-semibold">{moves}</span><span className="hidden sm:inline">Coups</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 text-slate-700">
                                <TimerIcon className="w-5 h-5 text-primary" />
                                <span className="font-semibold">{time}s / {timeLimit}s</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm md:text-base">
                         <div className="w-full sm:w-auto text-center">{renderMessage()}</div>
                         <div className="flex gap-2">
                             <button onClick={handleNewGame} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">Nouveau Jeu</button>
                             <button onClick={handleReset} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Recommencer</button>
                             <button onClick={handleSolve} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Résoudre</button>
                         </div>
                    </div>
                </div>

                <div className="relative bg-slate-200/50 rounded-2xl shadow-inner" style={{ width: boardSizePx, height: boardSizePx }}>
                    {board.map((value, index) => {
                        if (value === null) return null;
                        const pos = board.indexOf(value);
                        const x = pos % size;
                        const y = Math.floor(pos / size);
                        return (
                            <Tile
                                key={value}
                                value={value}
                                imageSrc={imageSrc!}
                                boardSize={size}
                                tileSize={tileSize}
                                position={{ x, y }}
                                onClick={() => handleTileClick(pos)}
                                isSolved={status === GameStatus.SOLVED}
                            />
                        );
                    })}
                     {status === GameStatus.SOLVED && imageSrc && (
                        <div className="absolute inset-0">
                            <img src={imageSrc} alt="Solved Puzzle" className="w-full h-full object-cover rounded-2xl" />
                        </div>
                     )}
                </div>
                 <div className="text-center text-slate-500 text-sm mt-2">
                    Cliquez sur une tuile adjacente à l'espace vide pour la déplacer.
                </div>
            </main>
        </div>
    );
};

// =================================================================================
// RENDER ROOT
// =================================================================================

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
