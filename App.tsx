
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingState from './components/LoadingState';
import ResultDisplay from './components/ResultDisplay';
import TShirtCatalog from './components/TShirtCatalog';
import RecommendOutfit from './components/RecommendOutfit';
import { generateTryOnImage } from './services/geminiService';
import type { ImageData } from './types';

const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const OutfitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.864l-7.682-7.682a4.5 4.5 0 010-6.364L12 2.364l7.682 5.454a4.5 4.5 0 01-6.364 6.364L12 12.864" transform="scale(0.6) translate(8,8)"/>
    </svg>
);

const BottomNav = ({ selected, onSelect }: { selected: number, onSelect: (idx: number) => void }) => (
  <nav style={{
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fff',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    zIndex: 100,
    boxShadow: '0 -2px 8px #0001',
  }}>
    {[
      { label: 'Home', icon: (
        <svg width="26" height="26" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
      ) },
      { label: 'Current selection', icon: (
        <svg width="26" height="26" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
      ) },
      { label: 'Try-On', icon: (
        <svg width="32" height="32" fill="#fff" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
      ) },
      { label: 'Wishlist', icon: (
        <svg width="26" height="26" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12.91 4.01 13.44 5.61C13.97 4.01 15.64 3 17.38 3C20.38 3 22.88 5.5 22.88 8.5C22.88 13.5 15 21 15 21H12Z"/></svg>
      ) },
      { label: 'Profile', icon: (
        <svg width="26" height="26" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg>
      ) },
    ].map((item, i) => (
      <div key={item.label} onClick={() => onSelect(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 12, color: selected === i ? '#222' : '#888', fontWeight: selected === i ? 700 : 400, cursor: 'pointer' }}>
        {item.icon}
        <span style={{ marginTop: 2 }}>{item.label}</span>
        {selected === i && <div style={{ width: 24, height: 3, background: '#222', borderRadius: 2, marginTop: 2 }} />}
      </div>
    ))}
  </nav>
);

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [tab, setTab] = useState<number>(2); // 2 = Try-On, 1 = Catalog

  const handleTryOn = async () => {
    if (!modelImage || !outfitImage) {
      setError("Please upload both your photo and an outfit photo.");
      return;
    }
    setLoading(true);
    setError(null);
    setWarning(null);
    setGeneratedImage(null);
    try {
      const result = await generateTryOnImage(modelImage, outfitImage);
      if (result.image) {
        setGeneratedImage(result.image);
        if (result.warning) {
          setWarning(result.warning);
        }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8" style={{ paddingBottom: 80 }}>
      {tab !== 1 && <Header />}
      <main className="w-full max-w-6xl mx-auto">
        {tab === 2 && (
          // Try-On tab: main page with 2 input image fields
          !generatedImage ? (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start">
                <ImageUploader 
                  title="1. Your Photo" 
                  icon={<PersonIcon />} 
                  onImageUpload={setModelImage} 
                  previewUrl={modelImage?.dataUrl ?? null} 
                />
                <ImageUploader 
                  title="2. Outfit Photo" 
                  icon={<OutfitIcon />} 
                  onImageUpload={setOutfitImage} 
                  previewUrl={outfitImage?.dataUrl ?? null} 
                />
              </div>
              
              {/* Recommend Outfit Section */}
              <div className="mt-4 sm:mt-6 md:mt-8">
                <RecommendOutfit onSelectOutfit={setOutfitImage} />
              </div>
              
              <div className="text-center relative pt-4">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {warning && <p className="text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">{warning}</p>}
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
              {warning && <p className="text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">{warning}</p>}
              <ResultDisplay image={generatedImage} />
              <div className="text-center mt-8">
                <button 
                  onClick={() => {
                    setGeneratedImage(null);
                    setWarning(null);
                  }}
                  className="px-6 py-2 text-base font-medium text-indigo-600 bg-transparent border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Try Another Outfit
                </button>
              </div>
            </div>
          )
        )}
        {tab === 1 && (
          // Current selection tab: show catalog
          <TShirtCatalog onSelectOutfit={(img) => {
            setOutfitImage(img);
            setTab(2);
          }} />
        )}
        {tab !== 1 && tab !== 2 && (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#888', fontSize: 20 }}>
            Coming soon...
          </div>
        )}
      </main>
      <BottomNav selected={tab} onSelect={setTab} />
    </div>
  );
};

export default App;
