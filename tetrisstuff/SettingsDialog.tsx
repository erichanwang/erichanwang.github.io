// @ts-nocheck
import { useState, useEffect } from 'react';

export function SettingsDialog({ open, onOpenChange, settings, onSettingsChange, keyBindings, onKeyBindingsChange }) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [localKeyBindings, setLocalKeyBindings] = useState(keyBindings);
    const [isBinding, setIsBinding] = useState(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        setLocalKeyBindings(keyBindings);
    }, [keyBindings]);

    const handleSettingChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: Number(value) }));
    };

    const handleKeyBind = (action) => {
        setIsBinding(action);
    };

    useEffect(() => {
        if (isBinding) {
            const handleKeyPress = (e) => {
                setLocalKeyBindings(prev => ({ ...prev, [isBinding]: e.code }));
                setIsBinding(null);
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [isBinding]);

    const handleSave = () => {
        onSettingsChange(localSettings);
        onKeyBindingsChange(localKeyBindings);
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Gameplay</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-400">DAS (ms)</span>
                                <input
                                    type="number"
                                    value={localSettings.das}
                                    onChange={(e) => handleSettingChange('das', e.target.value)}
                                    className="bg-gray-900 border border-gray-600 rounded p-2 mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-400">ARR (ms)</span>
                                <input
                                    type="number"
                                    value={localSettings.arr}
                                    onChange={(e) => handleSettingChange('arr', e.target.value)}
                                    className="bg-gray-900 border border-gray-600 rounded p-2 mt-1"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Key Bindings</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {Object.entries(localKeyBindings).map(([action, key]) => (
                                <div key={action} className="flex items-center justify-between">
                                    <span className="capitalize">{action.replace(/([A-Z])/g, ' $1')}</span>
                                    <button
                                        onClick={() => handleKeyBind(action)}
                                        className="bg-gray-700 hover:bg-gray-600 rounded px-3 py-1"
                                    >
                                        {isBinding === action ? 'Press a key...' : key}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => onOpenChange(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
