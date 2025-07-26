// @ts-nocheck
export function GameControls({
  isRunning,
  isPaused,
  isGameOver,
  onStart,
  onPause,
  onRestart,
  onSettings
}) {
  return (
    <div className="flex gap-3 justify-center">
      {!isRunning || isGameOver ? (
        <button 
          onClick={isGameOver ? onRestart : onStart}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {isGameOver ? 'Restart' : 'Start'}
        </button>
      ) : (
        <button 
          onClick={onPause}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      
      <button 
        onClick={onRestart}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Restart
      </button>
      
      <button 
        onClick={onSettings}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Settings
      </button>
    </div>
  );
}
