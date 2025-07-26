import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Types
type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: PieceType;
  matrix: number[][];
  position: Position;
  rotation: number;
}

interface GameState {
  arena: number[][];
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  holdPiece: PieceType | null;
  nextQueue: PieceType[];
  bag: PieceType[];
  score: number;
  lines: number;
  level: number;
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  canHold: boolean;
  lastDropTime: number;
}

interface GameSettings {
  das: number;
  arr: number;
  gravity: number;
  softDropMultiplier: number;
  volume: number;
}

interface KeyBindings {
  moveLeft: string;
  moveRight: string;
  softDrop: string;
  hardDrop: string;
  rotateClockwise: string;
  rotateCounterClockwise: string;
  rotate180: string;
  hold: string;
  restart: string;
  pause: string;
}

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINO_SHAPES: Record<PieceType, { shape: number[][], color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f5ff'
  },
  O: {
    shape: [
      [4, 4],
      [4, 4]
    ],
    color: '#ffff00'
  },
  T: {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: '#8000ff'
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0]
    ],
    color: '#00ff00'
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ],
    color: '#ff0000'
  },
  J: {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0]
    ],
    color: '#0000ff'
  },
  L: {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: '#ff8000'
  }
};

const DEFAULT_SETTINGS: GameSettings = {
  das: 133,
  arr: 10,
  gravity: 1,
  softDropMultiplier: 20,
  volume: 0.1
};

const DEFAULT_KEYBINDINGS: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: 'Space',
  rotateClockwise: 'KeyX',
  rotateCounterClockwise: 'KeyZ',
  rotate180: 'KeyA',
  hold: 'ShiftLeft',
  restart: 'KeyR',
  pause: 'Escape'
};

// Game Logic Functions
function createEmptyArena(): number[][] {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

function shuffleBag(): PieceType[] {
  const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

function getNextPiece(state: GameState): PieceType {
  if (state.bag.length === 0) {
    state.bag.push(...shuffleBag());
  }
  return state.bag.pop()!;
}

function createTetromino(type: PieceType): Tetromino {
  return {
    type,
    matrix: TETROMINO_SHAPES[type].shape.map(row => [...row]),
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    rotation: 0
  };
}

function isValidPosition(matrix: number[][], position: Position, arena: number[][]): boolean {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0) {
        const newX = position.x + x;
        const newY = position.y + y;
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (newY >= 0 && arena[newY][newX] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function movePiece(piece: Tetromino, dx: number, dy: number, arena: number[][]): Tetromino | null {
  const newPosition = { x: piece.position.x + dx, y: piece.position.y + dy };
  
  if (isValidPosition(piece.matrix, newPosition, arena)) {
    return { ...piece, position: newPosition };
  }
  
  return null;
}

function rotatePiece(piece: Tetromino, direction: 1 | -1 | 2, arena: number[][]): Tetromino | null {
  const matrix = piece.matrix;
  let rotatedMatrix: number[][];
  
  if (direction === 2) {
    // 180 degree rotation
    rotatedMatrix = matrix.map(row => [...row].reverse()).reverse();
  } else {
    // 90 degree rotation
    const size = matrix.length;
    rotatedMatrix = Array.from({ length: size }, () => Array(size).fill(0));
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (direction === 1) {
          rotatedMatrix[x][size - 1 - y] = matrix[y][x];
        } else {
          rotatedMatrix[size - 1 - x][y] = matrix[y][x];
        }
      }
    }
  }
  
  // Try the rotation with SRS kicks
  const kicks = getSRSKicks(piece.type, piece.rotation, direction);
  
  for (const kick of kicks) {
    const testPosition = {
      x: piece.position.x + kick.x,
      y: piece.position.y + kick.y
    };
    
    if (isValidPosition(rotatedMatrix, testPosition, arena)) {
      return {
        ...piece,
        matrix: rotatedMatrix,
        position: testPosition,
        rotation: (piece.rotation + direction + 4) % 4
      };
    }
  }
  
  return null;
}

function getSRSKicks(type: PieceType, rotation: number, direction: 1 | -1 | 2): Position[] {
  // Simplified SRS kicks
  const kicks: Position[] = [
    { x: 0, y: 0 }, // No kick
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }, // Right
    { x: 0, y: -1 }, // Up
    { x: -1, y: -1 }, // Left + Up
    { x: 1, y: -1 } // Right + Up
  ];
  
  if (type === 'I') {
    // I-piece has special kicks
    kicks.push({ x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -2 });
  }
  
  return kicks;
}

function mergePiece(piece: Tetromino, arena: number[][]) {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x] !== 0) {
        const arenaY = piece.position.y + y;
        const arenaX = piece.position.x + x;
        
        if (arenaY >= 0 && arenaY < BOARD_HEIGHT && arenaX >= 0 && arenaX < BOARD_WIDTH) {
          arena[arenaY][arenaX] = piece.matrix[y][x];
        }
      }
    }
  }
}

function clearLines(arena: number[][]): number {
  let linesCleared = 0;
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (arena[y].every(cell => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(Array(BOARD_WIDTH).fill(0));
      linesCleared++;
      y++; // Check the same line again
    }
  }
  
  return linesCleared;
}

function calculateGhostPosition(piece: Tetromino, arena: number[][]): Position {
  let ghostY = piece.position.y;
  
  while (isValidPosition(piece.matrix, { x: piece.position.x, y: ghostY + 1 }, arena)) {
    ghostY++;
  }
  
  return { x: piece.position.x, y: ghostY };
}

function hardDrop(piece: Tetromino, arena: number[][]): Tetromino {
  const ghostPosition = calculateGhostPosition(piece, arena);
  return { ...piece, position: ghostPosition };
}

// Color mapping
function getPieceColor(value: number): string {
  const colorMap: Record<number, string> = {
    1: '#00f5ff', // I - Cyan
    2: '#0000ff', // J - Blue  
    3: '#ff8000', // L - Orange
    4: '#ffff00', // O - Yellow
    5: '#00ff00', // S - Green
    6: '#8000ff', // T - Purple
    7: '#ff0000'  // Z - Red
  };
  return colorMap[value] || '#00f5ff';
}

// Components
function GameBoard({ gameState, cellSize = 30 }: { gameState: GameState; cellSize?: number }) {
  const { arena, currentPiece, ghostPiece } = gameState;

  const renderCell = (x: number, y: number) => {
    let content = arena[y][x];
    let isGhost = false;
    let isCurrent = false;

    // Check if this cell contains the current piece
    if (currentPiece) {
      const relativeX = x - currentPiece.position.x;
      const relativeY = y - currentPiece.position.y;
      
      if (
        relativeX >= 0 && 
        relativeX < currentPiece.matrix[0].length &&
        relativeY >= 0 && 
        relativeY < currentPiece.matrix.length &&
        currentPiece.matrix[relativeY][relativeX] !== 0
      ) {
        content = currentPiece.matrix[relativeY][relativeX];
        isCurrent = true;
      }
    }

    // Check if this cell contains the ghost piece
    if (!isCurrent && ghostPiece && ghostPiece.position.y !== currentPiece?.position.y) {
      const relativeX = x - ghostPiece.position.x;
      const relativeY = y - ghostPiece.position.y;
      
      if (
        relativeX >= 0 && 
        relativeX < ghostPiece.matrix[0].length &&
        relativeY >= 0 && 
        relativeY < ghostPiece.matrix.length &&
        ghostPiece.matrix[relativeY][relativeX] !== 0 &&
        arena[y][x] === 0
      ) {
        content = ghostPiece.matrix[relativeY][relativeX];
        isGhost = true;
      }
    }

    const isEmpty = content === 0 && !isGhost;
    
    const getBackgroundColor = () => {
      if (isEmpty) return 'rgba(255,255,255,0.05)';
      if (isGhost) return 'rgba(255,255,255,0.2)';
      return getPieceColor(content);
    };

    return (
      <div
        key={`${x}-${y}`}
        className={`absolute border border-white/10 ${isGhost ? 'opacity-40' : ''}`}
        style={{
          left: x * cellSize,
          top: y * cellSize,
          width: cellSize,
          height: cellSize,
          backgroundColor: getBackgroundColor(),
          borderColor: isGhost ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'
        }}
      />
    );
  };

  return (
    <div 
      className="relative bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl"
      style={{
        width: BOARD_WIDTH * cellSize,
        height: BOARD_HEIGHT * cellSize,
      }}
    >
      {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
        Array.from({ length: BOARD_WIDTH }, (_, x) => renderCell(x, y))
      )}
    </div>
  );
}

function PiecePreview({ piece, size = 80, className = '' }: { piece: PieceType | null; size?: number; className?: string }) {
  if (!piece) {
    return (
      <div 
        className={`bg-gray-800 border border-gray-600 rounded-md flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-xs">Empty</div>
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[piece];
  const matrix = shape.shape;
  const blockSize = Math.floor(size / 6);
  
  const matrixWidth = matrix[0].length;
  const matrixHeight = matrix.length;
  const offsetX = (size - matrixWidth * blockSize) / 2;
  const offsetY = (size - matrixHeight * blockSize) / 2;

  return (
    <div 
      className={`relative bg-gray-800 border border-gray-600 rounded-md ${className}`}
      style={{ width: size, height: size }}
    >
      {matrix.map((row, y) =>
        row.map((cell, x) => {
          if (cell === 0) return null;
          
          return (
            <div
              key={`${x}-${y}`}
              className="absolute border border-white/20 rounded-sm"
              style={{
                left: offsetX + x * blockSize,
                top: offsetY + y * blockSize,
                width: blockSize,
                height: blockSize,
                backgroundColor: getPieceColor(cell)
              }}
            />
          );
        })
      )}
    </div>
  );
}

// Main Component
export function TetrisGameConsolidated() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    arena: createEmptyArena(),
    currentPiece: null,
    ghostPiece: null,
    holdPiece: null,
    nextQueue: [],
    bag: [],
    score: 0,
    lines: 0,
    level: 1,
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    canHold: true,
    lastDropTime: 0
  }));

  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [keyBindings] = useState<KeyBindings>(DEFAULT_KEYBINDINGS);
  const [showSettings, setShowSettings] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const dasTimerRef = useRef<number>();
  const arrTimerRef = useRef<number>();
  const keysPressed = useRef(new Set<string>());

  // Initialize next queue
  const initializeNextQueue = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      newState.bag = shuffleBag();
      newState.nextQueue = [];
      
      for (let i = 0; i < 5; i++) {
        if (newState.bag.length === 0) {
          newState.bag.push(...shuffleBag());
        }
        newState.nextQueue.push(newState.bag.pop()!);
      }
      
      return newState;
    });
  }, []);

  const spawnPiece = useCallback(() => {
    setGameState(prev => {
      if (prev.nextQueue.length === 0) return prev;
      
      const nextType = prev.nextQueue[0];
      const newPiece = createTetromino(nextType);
      
      // Check game over
      if (!isValidPosition(newPiece.matrix, newPiece.position, prev.arena)) {
        return {
          ...prev,
          isGameOver: true,
          isRunning: false,
          currentPiece: null,
          ghostPiece: null
        };
      }
      
      // Remove first piece from queue and add new one
      const newQueue = [...prev.nextQueue.slice(1)];
      const newBag = [...prev.bag];
      
      while (newQueue.length < 5) {
        if (newBag.length === 0) {
          newBag.push(...shuffleBag());
        }
        newQueue.push(newBag.pop()!);
      }
      
      const ghostPosition = calculateGhostPosition(newPiece, prev.arena);
      const ghostPiece = { ...newPiece, position: ghostPosition };
      
      return {
        ...prev,
        currentPiece: newPiece,
        ghostPiece,
        nextQueue: newQueue,
        bag: newBag,
        canHold: true
      };
    });
  }, []);

  const lockPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece) return prev;
      
      const newArena = prev.arena.map(row => [...row]);
      mergePiece(prev.currentPiece, newArena);
      
      const linesCleared = clearLines(newArena);
      let newScore = prev.score;
      let newLevel = prev.level;
      let newLines = prev.lines;
      
      if (linesCleared > 0) {
        const lineScore = [0, 40, 100, 300, 1200][linesCleared] * prev.level;
        newScore += lineScore;
        newLines += linesCleared;
        newLevel = Math.floor(newLines / 10) + 1;
      }
      
      return {
        ...prev,
        arena: newArena,
        score: newScore,
        lines: newLines,
        level: newLevel,
        currentPiece: null,
        ghostPiece: null
      };
    });
    
    setTimeout(spawnPiece, 50);
  }, [spawnPiece]);

  const move = useCallback((dx: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const movedPiece = movePiece(prev.currentPiece, dx, 0, prev.arena);
      if (movedPiece) {
        const ghostPosition = calculateGhostPosition(movedPiece, prev.arena);
        const ghostPiece = { ...movedPiece, position: ghostPosition };
        
        return {
          ...prev,
          currentPiece: movedPiece,
          ghostPiece
        };
      }
      return prev;
    });
  }, []);

  const rotate = useCallback((direction: 1 | -1 | 2) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const rotatedPiece = rotatePiece(prev.currentPiece, direction, prev.arena);
      if (rotatedPiece) {
        const ghostPosition = calculateGhostPosition(rotatedPiece, prev.arena);
        const ghostPiece = { ...rotatedPiece, position: ghostPosition };
        
        return {
          ...prev,
          currentPiece: rotatedPiece,
          ghostPiece
        };
      }
      return prev;
    });
  }, []);

  const softDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const movedPiece = movePiece(prev.currentPiece, 0, 1, prev.arena);
      if (movedPiece) {
        return {
          ...prev,
          currentPiece: movedPiece,
          lastDropTime: Date.now()
        };
      } else {
        setTimeout(lockPiece, 0);
        return prev;
      }
    });
  }, [lockPiece]);

  const performHardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isPaused || prev.isGameOver) return prev;
      
      const droppedPiece = hardDrop(prev.currentPiece, prev.arena);
      
      setTimeout(() => {
        setGameState(current => {
          if (!current.currentPiece) return current;
          
          const newArena = current.arena.map(row => [...row]);
          mergePiece(droppedPiece, newArena);
          
          const linesCleared = clearLines(newArena);
          let newScore = current.score;
          let newLevel = current.level;
          let newLines = current.lines;
          
          if (linesCleared > 0) {
            const lineScore = [0, 40, 100, 300, 1200][linesCleared] * current.level;
            newScore += lineScore;
            newLines += linesCleared;
            newLevel = Math.floor(newLines / 10) + 1;
          }
          
          return {
            ...current,
            arena: newArena,
            score: newScore,
            lines: newLines,
            level: newLevel,
            currentPiece: null,
            ghostPiece: null
          };
        });
        
        setTimeout(spawnPiece, 50);
      }, 0);
      
      return {
        ...prev,
        currentPiece: droppedPiece
      };
    });
  }, [spawnPiece]);

  const hold = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || !prev.canHold || prev.isPaused || prev.isGameOver) return prev;
      
      const currentType = prev.currentPiece.type;
      let nextType: PieceType;
      
      if (prev.holdPiece) {
        nextType = prev.holdPiece;
      } else {
        nextType = prev.nextQueue[0];
        const newQueue = [...prev.nextQueue.slice(1)];
        const newBag = [...prev.bag];
        
        while (newQueue.length < 5) {
          if (newBag.length === 0) {
            newBag.push(...shuffleBag());
          }
          newQueue.push(newBag.pop()!);
        }
        
        return {
          ...prev,
          holdPiece: currentType,
          nextQueue: newQueue,
          bag: newBag,
          canHold: false,
          currentPiece: null,
          ghostPiece: null
        };
      }
      
      const newPiece = createTetromino(nextType);
      const ghostPosition = calculateGhostPosition(newPiece, prev.arena);
      const ghostPiece = { ...newPiece, position: ghostPosition };
      
      return {
        ...prev,
        holdPiece: currentType,
        currentPiece: newPiece,
        ghostPiece,
        canHold: false
      };
    });
    
    setTimeout(() => {
      setGameState(current => {
        if (!current.currentPiece && !current.isGameOver) {
          setTimeout(spawnPiece, 0);
        }
        return current;
      });
    }, 0);
  }, [spawnPiece]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      arena: createEmptyArena(),
      currentPiece: null,
      ghostPiece: null,
      holdPiece: null,
      score: 0,
      lines: 0,
      level: 1,
      isRunning: true,
      isPaused: false,
      isGameOver: false,
      canHold: true,
      lastDropTime: Date.now()
    }));
    
    initializeNextQueue();
    setTimeout(spawnPiece, 100);
  }, [initializeNextQueue, spawnPiece]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    startGame();
  }, [startGame]);

  // Game loop with proper soft drop handling
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused || gameState.isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const dropInterval = Math.max(50, 500 / settings.gravity);
      const softDropInterval = Math.max(25, dropInterval / settings.softDropMultiplier);
      
      // Check if soft drop is being held
      const isSoftDropping = keysPressed.current.has(keyBindings.softDrop);
      const actualDropInterval = isSoftDropping ? softDropInterval : dropInterval;
      
      if (now - gameState.lastDropTime > actualDropInterval) {
        softDrop();
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isRunning, gameState.isPaused, gameState.isGameOver, gameState.lastDropTime, settings.gravity, settings.softDropMultiplier, softDrop, keyBindings.softDrop]);

  // Keyboard handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    
    if (keysPressed.current.has(key)) return;
    keysPressed.current.add(key);

    if (key === keyBindings.pause) {
      pauseGame();
      return;
    }

    if (key === keyBindings.restart) {
      restartGame();
      return;
    }

    if (!gameState.isRunning || gameState.isPaused || gameState.isGameOver) return;

    switch (key) {
      case keyBindings.moveLeft:
        move(-1);
        dasTimerRef.current = window.setTimeout(() => {
          arrTimerRef.current = window.setInterval(() => {
            if (keysPressed.current.has(keyBindings.moveLeft)) {
              move(-1);
            }
          }, settings.arr);
        }, settings.das);
        break;
        
      case keyBindings.moveRight:
        move(1);
        dasTimerRef.current = window.setTimeout(() => {
          arrTimerRef.current = window.setInterval(() => {
            if (keysPressed.current.has(keyBindings.moveRight)) {
              move(1);
            }
          }, settings.arr);
        }, settings.das);
        break;
        
      case keyBindings.hardDrop:
        event.preventDefault();
        performHardDrop();
        break;
        
      case keyBindings.rotateClockwise:
        rotate(1);
        break;
        
      case keyBindings.rotateCounterClockwise:
        rotate(-1);
        break;
        
      case keyBindings.rotate180:
        rotate(2);
        break;
        
      case keyBindings.hold:
        hold();
        break;
    }
  }, [gameState.isRunning, gameState.isPaused, gameState.isGameOver, keyBindings, settings, move, rotate, performHardDrop, hold, pauseGame, restartGame]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    keysPressed.current.delete(key);
    
    if (dasTimerRef.current) {
      clearTimeout(dasTimerRef.current);
      dasTimerRef.current = undefined;
    }
    if (arrTimerRef.current) {
      clearInterval(arrTimerRef.current);
      arrTimerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TETRIS
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Modern Tetris with SRS rotation system
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Left Panel - Hold & Stats */}
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl p-6 min-w-[200px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                  Hold
                </h3>
                <PiecePreview piece={gameState.holdPiece} size={80} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Score:</span>
                    <span className="text-white font-mono">{gameState.score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lines:</span>
                    <span className="text-white font-mono">{gameState.lines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white font-mono">{gameState.level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={gameState.isRunning ? pauseGame : startGame}
                variant={gameState.isRunning ? "secondary" : "default"}
                size="lg"
              >
                {gameState.isRunning ? (gameState.isPaused ? 'Resume' : 'Pause') : 'Start'}
              </Button>
              <Button onClick={restartGame} variant="outline" size="lg">
                Restart
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" size="lg">
                Settings
              </Button>
            </div>
            
            {gameState.isGameOver && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">Game Over!</div>
                <div className="text-gray-400">Final Score: {gameState.score.toLocaleString()}</div>
              </div>
            )}
            
            {gameState.isPaused && gameState.isRunning && (
              <div className="text-2xl font-bold text-yellow-400">Paused</div>
            )}
            
            <div className="relative">
              <GameBoard gameState={gameState} cellSize={30} />
            </div>
          </div>

          {/* Right Panel - Next Queue & Controls */}
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl p-6 min-w-[200px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                  Next
                </h3>
                <div className="space-y-3">
                  {gameState.nextQueue.slice(0, 5).map((piece, index) => (
                    <PiecePreview 
                      key={index} 
                      piece={piece} 
                      size={index === 0 ? 70 : 50} 
                      className={index === 0 ? 'ring-1 ring-blue-500/50' : ''}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 space-y-2">
                <div className="font-semibold text-white mb-2">Controls:</div>
                <div>← → Move</div>
                <div>↓ Soft Drop</div>
                <div>Space Hard Drop</div>
                <div>Z/X Rotate</div>
                <div>A 180° Rotate</div>
                <div>Shift Hold</div>
                <div>R Restart</div>
                <div>Esc Pause</div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Gravity: {settings.gravity}</Label>
                <Slider
                  value={[settings.gravity]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, gravity: value }))}
                  max={20}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>DAS (ms): {settings.das}</Label>
                <Slider
                  value={[settings.das]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, das: value }))}
                  max={300}
                  min={50}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ARR (ms): {settings.arr}</Label>
                <Slider
                  value={[settings.arr]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, arr: value }))}
                  max={50}
                  min={5}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}