
import React from 'react';
import type { ImageData } from '../types';

interface ResultDisplayProps {
    image: ImageData;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ image }) => {
    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
             <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-slate-800">Your Virtual Try-On</h2>
            <div className="relative w-full aspect-square bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <img src={image.dataUrl} alt="Generated virtual try-on" className="w-full h-full object-contain" />
            </div>
            <a
                href={image.dataUrl}
                download="virtual-try-on.png"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200 hover:scale-105"
            >
                <DownloadIcon />
                Download Image
            </a>
        </div>
    );
};

export default ResultDisplay;
