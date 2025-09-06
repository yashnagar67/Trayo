
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingState from './components/LoadingState';
import ResultDisplay from './components/ResultDisplay';
import { generateTryOnImage } from './services/geminiService';
import type { ImageData } from './types';

const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const OutfitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.864l-7.682-7.682a4.5 4.5 0 010-6.364L12 2.364l7.682 5.454a4.5 4.5 0 01-6.364 6.364L12 12.864" transform="scale(0.6) translate(8,8)"/>
    </svg>
);

const App: React.FC = () => {
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
    const [generatedImage, setGeneratedImage] = useState<ImageData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleTryOn = async () => {
        if (!modelImage || !outfitImage) {
            setError("Please upload both your photo and an outfit photo.");
            return;
        }
        setLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const result = await generateTryOnImage(modelImage, outfitImage);
            if (result) {
                setGeneratedImage(result);
            } else {
                setError("Could not generate an image from the response. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    const isButtonDisabled = !modelImage || !outfitImage || loading;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <Header />
            <main className="w-full max-w-6xl mx-auto">
                {!generatedImage ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <ImageUploader 
                                title="1. Upload Your Photo" 
                                icon={<PersonIcon />}
                                onImageUpload={setModelImage}
                                previewUrl={modelImage?.dataUrl ?? null}
                            />
                            <ImageUploader 
                                title="2. Upload Outfit Photo" 
                                icon={<OutfitIcon />}
                                onImageUpload={setOutfitImage}
                                previewUrl={outfitImage?.dataUrl ?? null}
                            />
                        </div>

                        <div className="text-center relative pt-4">
                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            <div className="relative inline-block">
                               <button 
                                    onClick={handleTryOn} 
                                    disabled={isButtonDisabled}
                                    className="relative px-8 py-4 text-lg font-bold text-white bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <span className="absolute inset-0 bg-indigo-600 transition-transform duration-300 ease-in-out transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
                                    <span className="relative z-10">Generate Try-On</span>
                                </button>
                                {loading && <LoadingState />}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <ResultDisplay image={generatedImage} />
                        <div className="text-center mt-8">
                            <button 
                                onClick={() => setGeneratedImage(null)}
                                className="px-6 py-2 text-base font-medium text-indigo-600 bg-transparent border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                            >
                                Try Another Outfit
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
