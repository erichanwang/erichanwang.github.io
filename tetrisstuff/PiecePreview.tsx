// @ts-nocheck
const PIECES = {
    'I': { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00FFFF' },
    'J': { shape: [[2,0,0], [2,2,2], [0,0,0]], color: '#0000FF' },
    'L': { shape: [[0,0,3], [3,3,3], [0,0,0]], color: '#FF7F00' },
    'O': { shape: [[4,4], [4,4]], color: '#FFFF00' },
    'S': { shape: [[0,5,5], [5,5,0], [0,0,0]], color: '#00FF00' },
    'T': { shape: [[0,6,0], [6,6,6], [0,0,0]], color: '#800080' },
    'Z': { shape: [[7,7,0], [0,7,7], [0,0,0]], color: '#FF0000' },
};

export function PiecePreview({ piece, size = 80 }) {
    if (!piece) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    border: '1px solid #444',
                    backgroundColor: '#222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: '12px',
                }}
            >
                Empty
            </div>
        );
    }

    const { shape, color } = PIECES[piece];
    const blockSize = Math.floor(size / 4);
    const matrixSize = shape.length;
    const offsetX = (size - matrixSize * blockSize) / 2;
    const offsetY = (size - matrixSize * blockSize) / 2;

    return (
        <div
            style={{
                position: 'relative',
                width: size,
                height: size,
                border: '1px solid #444',
                backgroundColor: '#222',
            }}
        >
            {shape.map((row, y) =>
                row.map((cell, x) => {
                    if (cell === 0) return null;
                    return (
                        <div
                            key={`${x}-${y}`}
                            style={{
                                position: 'absolute',
                                left: offsetX + x * blockSize,
                                top: offsetY + y * blockSize,
                                width: blockSize,
                                height: blockSize,
                                backgroundColor: color,
                                border: '1px solid #000',
                            }}
                        />
                    );
                })
            )}
        </div>
    );
}
