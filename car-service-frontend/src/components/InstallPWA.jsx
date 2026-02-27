import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstall(false);
        }

        setDeferredPrompt(null);
    };

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
            <div className="flex-1">
                <p className="font-semibold">Install Car Service Manager</p>
                <p className="text-sm text-blue-100">Get quick access from your home screen</p>
            </div>
            <button
                onClick={handleInstall}
                className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
                Install
            </button>
            <button
                onClick={() => setShowInstall(false)}
                className="ml-2 p-2 hover:bg-blue-700 rounded"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default InstallPWA;
