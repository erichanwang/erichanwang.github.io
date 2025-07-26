// @ts-nocheck
import { useState, useCallback, useRef, useEffect } from 'react';

const ROWS = 20;
const COLS = 10;

const PIECES = {
    'I': { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00FFFF' },
    'J': { shape: [[2,0,0], [2,2,2], [0,0,0]], color: '#0000FF' },
    'L': { shape: [[0,0,3], [3,3,3], [0,0,0]], color: '#FF7F00' },
    'O': { shape: [[4,4], [4,4]], color: '#FFFF00' },
    'S': { shape: [[0,5,5], [5,5,0], [0,0,0]], color: '#00FF00' },
    'T': { shape: [[0,6,0], [6,6,6], [0,0,0]], color: '#800080' },
    'Z': { shape: [[7,7,0], [0,7,7], [0,0,0]], color: '#FF0000' },
};

const pieceTypes = Object.keys(PIECES);

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Super Rotation System (SRS) kick data
const KICK_DATA = {
    'I': [
        [[0,0], [-2,0], [ 1,0], [-2,-1], [ 1, 2]],
        [[0,0], [-1,0], [ 2,0], [-1, 2], [ 2,-1]],
        [[0,0], [ 2,0], [-1,0], [ 2, 1], [-1,-2]],
        [[0,0], [ 1,0], [-2,0], [ 1,-2], [-2, 1]],
    ],
    'other': [
        [[0,0], [-1,0], [-1, 1], [0,-2], [-1,-2]],
        [[0,0], [ 1,0], [ 1,-1], [0, 2], [ 1, 2]],
        [[0,0], [ 1,0], [ 1, 1], [0,-2], [ 1,-2]],
        [[0,0], [-1,0], [-1,-1], [0, 2], [-1, 2]],
    ]
};

export const useTetris = () => {
    const [board, setBoard] = useState(createEmptyBoard());
    const [player, setPlayer] = useState(null);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [nextQueue, setNextQueue] = useState([]);
    const [holdPiece, setHoldPiece] = useState(null);
    const [canHold, setCanHold] = useState(true);

    const [settings, setSettings] = useState({
        das: 100, // Delayed Auto Shift
        arr: 30,  // Auto Repeat Rate
        softDropSpeed: 50,
    });

    const [keyBindings, setKeyBindings] = useState({
        moveLeft: 'ArrowLeft',
        moveRight: 'ArrowRight',
        softDrop: 'ArrowDown',
        hardDrop: 'Space',
        rotateClockwise: 'ArrowUp',
        rotateCounterClockwise: 'KeyZ',
        rotate180: 'KeyA',
        hold: 'ShiftLeft',
        pause: 'Escape',
        restart: 'KeyR',
    });

    const gameLoopRef = useRef(null);
    const lastTimeRef = useRef(0);
    const dropCounterRef = useRef(0);
    const lockDelayRef = useRef(null);
    const bagRef = useRef([]);

    const shuffleBag = () => {
        const newBag = [...pieceTypes];
        for (let i = newBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
        }
        bagRef.current = [...bagRef.current, ...newBag];
    };

    const getNextPiece = useCallback(() => {
        if (bagRef.current.length < 7) {
            shuffleBag();
        }
        return bagRef.current.shift();
    }, []);

    const resetPlayer = useCallback(() => {
        const pieceType = getNextPiece();
        const piece = PIECES[pieceType];
        const newPlayer = {
            pos: { x: Math.floor(COLS / 2 - piece.shape[0].length / 2), y: 0 },
            matrix: piece.shape,
            type: pieceType,
            rotation: 0,
        };

        if (collide(newPlayer, board)) {
            setIsGameOver(true);
            setIsRunning(false);
        } else {
            setPlayer(newPlayer);
        }

        setNextQueue(bagRef.current.slice(0, 5));
    }, [board, getNextPiece]);

    const startGame = () => {
        setBoard(createEmptyBoard());
        setScore(0);
        setLines(0);
        setLevel(1);
        setIsGameOver(false);
        setIsRunning(true);
        setHoldPiece(null);
        setCanHold(true);
        bagRef.current = [];
        shuffleBag();
        resetPlayer();
        lastTimeRef.current = 0;
        dropCounterRef.current = 0;
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const pauseGame = () => {
        if (isGameOver) return;
        if (isRunning) {
            cancelAnimationFrame(gameLoopRef.current);
        } else {
            lastTimeRef.current = performance.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        setIsRunning(!isRunning);
    };

    const playerDrop = useCallback((isSoftDrop = false) => {
        if (!player || !isRunning) return;
        
        const newPlayer = { ...player, pos: { ...player.pos, y: player.pos.y + 1 } };

        if (collide(newPlayer, board)) {
            if (lockDelayRef.current === null) {
                lockDelayRef.current = setTimeout(() => {
                    merge(player);
                    resetPlayer();
                    setCanHold(true);
                    lockDelayRef.current = null;
                }, 500);
            }
        } else {
            if (lockDelayRef.current) {
                clearTimeout(lockDelayRef.current);
                lockDelayRef.current = null;
            }
            setPlayer(newPlayer);
            if (isSoftDrop) {
                setScore(s => s + 1);
            }
        }
        dropCounterRef.current = 0;
    }, [player, board, resetPlayer, isRunning]);

    const hardDrop = () => {
        if (!player || !isRunning) return;
        let newPlayer = { ...player };
        let dropCount = 0;
        while (!collide(newPlayer, board)) {
            newPlayer.pos.y++;
            dropCount++;
        }
        newPlayer.pos.y--;
        setScore(s => s + dropCount * 2);
        merge(newPlayer);
        resetPlayer();
        setCanHold(true);
    };

    const playerMove = (dir) => {
        if (!player || !isRunning) return;
        const newPlayer = { ...player, pos: { ...player.pos, x: player.pos.x + dir } };
        if (!collide(newPlayer, board)) {
            setPlayer(newPlayer);
        }
    };

    const rotateMatrix = (matrix, dir) => {
        const newMatrix = matrix.map((_, index) => matrix.map(col => col[index]));
        if (dir > 0) {
            return newMatrix.map(row => row.reverse());
        }
        return newMatrix.reverse();
    };

    const playerRotate = (dir) => {
        if (!player || !isRunning) return;
        
        const newPlayer = JSON.parse(JSON.stringify(player));
        newPlayer.matrix = rotateMatrix(newPlayer.matrix, dir);
        
        const oldRotation = newPlayer.rotation;
        newPlayer.rotation = (newPlayer.rotation + dir + 4) % 4;

        const kickTable = PIECES[newPlayer.type].shape.length === 4 ? KICK_DATA.I : KICK_DATA.other;
        const kickSet = kickTable[oldRotation];

        for (const kick of kickSet) {
            const [x, y] = kick;
            newPlayer.pos.x += x;
            newPlayer.pos.y -= y; // SRS y-axis is inverted
            if (!collide(newPlayer, board)) {
                setPlayer(newPlayer);
                return;
            }
            newPlayer.pos.x -= x;
            newPlayer.pos.y += y;
        }
    };

    const hold = () => {
        if (!canHold || !isRunning) return;
        const currentPieceType = player.type;
        if (holdPiece) {
            const newPlayerPiece = PIECES[holdPiece];
            const newPlayer = {
                pos: { x: Math.floor(COLS / 2 - newPlayerPiece.shape[0].length / 2), y: 0 },
                matrix: newPlayerPiece.shape,
                type: holdPiece,
                rotation: 0,
            };
            setPlayer(newPlayer);
            setHoldPiece(currentPieceType);
        } else {
            setHoldPiece(currentPieceType);
            resetPlayer();
        }
        setCanHold(false);
    };

    const collide = (player, board) => {
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (
                    player.matrix[y][x] !== 0 &&
                    (board[y + player.pos.y] && board[y + player.pos.y][x + player.pos.x]) !== 0
                ) {
                    return true;
                }
            }
        }
        return false;
    };

    const merge = (player) => {
        const newBoard = board.map(row => [...row]);
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    newBoard[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
        sweepRows(newBoard);
    };

    const sweepRows = (newBoard) => {
        let clearedLines = 0;
        outer: for (let y = newBoard.length - 1; y >= 0; --y) {
            for (let x = 0; x < newBoard[y].length; ++x) {
                if (newBoard[y][x] === 0) {
                    continue outer;
                }
            }
            const row = newBoard.splice(y, 1)[0].fill(0);
            newBoard.unshift(row);
            clearedLines++;
            y++;
        }

        if (clearedLines > 0) {
            const newLines = lines + clearedLines;
            const points = [0, 100, 300, 500, 800][clearedLines] * level;
            const newLevel = Math.floor(newLines / 10) + 1;
            setLines(newLines);
            setScore(s => s + points);
            setLevel(newLevel);
        }
        setBoard(newBoard);
    };

    const gameLoop = (time) => {
        if (!isRunning) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dropCounterRef.current += deltaTime;

        const dropInterval = 1000 / level;
        if (dropCounterRef.current > dropInterval) {
            playerDrop();
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    // Keyboard handling for smooth movement (DAS/ARR)
    const moveState = useRef({ left: false, right: false, down: false, timer: null, repeatTimer: null });

    const handleKeyUp = useCallback((e) => {
        const { moveLeft, moveRight, softDrop } = keyBindings;
        if (e.code === moveLeft) moveState.current.left = false;
        if (e.code === moveRight) moveState.current.right = false;
        if (e.code === softDrop) moveState.current.down = false;

        if (!moveState.current.left && !moveState.current.right && !moveState.current.down) {
            clearTimeout(moveState.current.timer);
            clearInterval(moveState.current.repeatTimer);
            moveState.current.timer = null;
            moveState.current.repeatTimer = null;
        }
    }, [keyBindings]);

    const handleKeyDown = useCallback((e) => {
        e.preventDefault();
        if (!isRunning) {
            if (e.code === keyBindings.restart) startGame();
            return;
        }

        const { moveLeft, moveRight, softDrop, hardDrop, rotateClockwise, rotateCounterClockwise, rotate180, hold: holdKey, pause } = keyBindings;

        if (e.code === moveLeft || e.code === moveRight || e.code === softDrop) {
            if (moveState.current.timer) return; // Already moving

            const move = () => {
                if (moveState.current.left) playerMove(-1);
                if (moveState.current.right) playerMove(1);
                if (moveState.current.down) playerDrop(true);
            };
            
            if (e.code === moveLeft) moveState.current.left = true;
            if (e.code === moveRight) moveState.current.right = true;
            if (e.code === softDrop) moveState.current.down = true;

            move();

            moveState.current.timer = setTimeout(() => {
                moveState.current.repeatTimer = setInterval(move, settings.arr);
            }, settings.das);
        }

        switch (e.code) {
            case hardDrop: hardDrop(); break;
            case rotateClockwise: playerRotate(1); break;
            case rotateCounterClockwise: playerRotate(-1); break;
            case rotate180: playerRotate(1); playerRotate(1); break;
            case holdKey: hold(); break;
            case pause: pauseGame(); break;
        }
    }, [isRunning, keyBindings, settings, playerMove, playerDrop, hardDrop, playerRotate, hold, pauseGame, startGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return {
        gameState: { board, player, score, lines, level, isRunning, isGameOver, nextQueue, holdPiece },
        startGame,
        pauseGame,
        restartGame: startGame,
        settings,
        setSettings,
        keyBindings,
        setKeyBindings,
    };
};
