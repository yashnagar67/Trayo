
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Warming up the virtual runway...",
    "Tailoring pixels to perfection...",
    "Styling your new look...",
    "Applying the finishing touches...",
    "Getting your outfit ready...",
];

const LoadingSpinner: React.FC = () => (
    <div className="w-8 h-8 border-4 border-t-indigo-500 border-slate-200 rounded-full animate-spin"></div>
);

const LoadingState: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600 font-medium text-center transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default LoadingState;
