// @ts-nocheck
const PIECES = {
    'I': { color: '#00FFFF' },
    'J': { color: '#0000FF' },
    'L': { color: '#FF7F00' },
    'O': { color: '#FFFF00' },
    'S': { color: '#00FF00' },
    'T': { color: '#800080' },
    'Z': { color: '#FF0000' },
};

const GHOST_COLOR = 'rgba(255, 255, 255, 0.2)';

export function GameBoard({ gameState }) {
    const { board, player } = gameState;
    const cellSize = 30;

    const renderCells = () => {
        const cells = [];
        const boardRows = board.length;
        const boardCols = board[0].length;

        // Render the board state
        for (let y = 0; y < boardRows; y++) {
            for (let x = 0; x < boardCols; x++) {
                const cellValue = board[y][x];
                const color = cellValue ? PIECES[Object.keys(PIECES)[cellValue - 1]].color : '#222';
                cells.push(
                    <div
                        key={`cell-${y}-${x}`}
                        style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: color,
                            border: '1px solid #333',
                            boxSizing: 'border-box',
                            position: 'absolute',
                            left: x * cellSize,
                            top: y * cellSize,
                        }}
                    />
                );
            }
        }

        // Render the current piece
        if (player) {
            const { matrix, pos, type } = player;
            const color = PIECES[type].color;

            for (let y = 0; y < matrix.length; y++) {
                for (let x = 0; x < matrix[y].length; x++) {
                    if (matrix[y][x]) {
                        cells.push(
                            <div
                                key={`player-${y}-${x}`}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    backgroundColor: color,
                                    border: '1px solid #000',
                                    boxSizing: 'border-box',
                                    position: 'absolute',
                                    left: (pos.x + x) * cellSize,
                                    top: (pos.y + y) * cellSize,
                                }}
                            />
                        );
                    }
                }
            }
        }

        return cells;
    };

    return (
        <div
            style={{
                position: 'relative',
                width: board[0].length * cellSize,
                height: board.length * cellSize,
                border: '2px solid #888',
                backgroundColor: '#111',
            }}
        >
            {renderCells()}
        </div>
    );
}
