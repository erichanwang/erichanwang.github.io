// @ts-nocheck
export function GameStats({ gameState }) {
    const { score, lines, level } = gameState;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Score
                </div>
                <div className="text-2xl font-bold text-white">
                    {score.toLocaleString()}
                </div>
            </div>

            <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Lines
                </div>
                <div className="text-xl font-bold text-green-400">
                    {lines}
                </div>
            </div>

            <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Level
                </div>
                <div className="text-xl font-bold text-yellow-400">
                    {level}
                </div>
            </div>
        </div>
    );
}
