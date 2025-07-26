// @ts-nocheck
import { useState, useEffect } from 'react';
import { useTetris } from './useTetris';
import { GameBoard } from './GameBoard';
import { PiecePreview } from './PiecePreview';
import { GameStats } from './GameStats';
import { GameControls } from './GameControls';
import { SettingsDialog } from './SettingsDialog';

export function TetrisGame() {
  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    settings,
    setSettings,
    keyBindings,
    setKeyBindings,
  } = useTetris();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-400">
            TETRIS
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Modern Tetris with SRS
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Left Panel - Hold & Stats */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 min-w-[200px] space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                Hold
              </h3>
              <PiecePreview piece={gameState.holdPiece} />
            </div>
            <GameStats gameState={gameState} />
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center space-y-6">
            <GameControls
              isRunning={gameState.isRunning}
              isPaused={!gameState.isRunning && gameState.player !== null}
              isGameOver={gameState.isGameOver}
              onStart={startGame}
              onPause={pauseGame}
              onRestart={restartGame}
              onSettings={() => setShowSettings(true)}
            />
            
            <div className="relative">
              <GameBoard gameState={gameState} />
              {gameState.isGameOver && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-3xl font-bold">
                  GAME OVER
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Next Queue */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 min-w-[200px] space-y-4">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
              Next
            </h3>
            {gameState.nextQueue.map((piece, index) => (
              <PiecePreview key={index} piece={piece} />
            ))}
          </div>
        </div>

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          settings={settings}
          onSettingsChange={setSettings}
          keyBindings={keyBindings}
          onKeyBindingsChange={setKeyBindings}
        />
      </div>
    </div>
  );
}
