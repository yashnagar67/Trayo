import React, { useState, useEffect } from 'react';
import type { ImageData } from '../types';

// Try multiple approaches to load images
let recommendImages: string[] = [];

try {
  // Approach 1: import.meta.glob with specific pattern
  const recommendImageModules = import.meta.glob('../product_images/recommend_outfit/*.jpg', { eager: true, as: 'url' });
  console.log('Raw image modules:', recommendImageModules);
  console.log('Module keys:', Object.keys(recommendImageModules));
  
  recommendImages = Object.values(recommendImageModules) as string[];
  console.log('Loaded recommend images (glob):', recommendImages);
} catch (error) {
  console.error('Error with import.meta.glob:', error);
}

// If no images loaded, try alternative approach
if (recommendImages.length === 0) {
  try {
    // Approach 2: Try with different pattern
    const altModules = import.meta.glob('../product_images/recommend_outfit/*', { eager: true, as: 'url' });
    console.log('Alternative modules:', altModules);
    recommendImages = Object.values(altModules).filter(url => 
      typeof url === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    ) as string[];
    console.log('Loaded recommend images (alt):', recommendImages);
  } catch (error) {
    console.error('Error with alternative approach:', error);
  }
}

// If still no images, try manual import approach
if (recommendImages.length === 0) {
  try {
    // Approach 3: Manual imports (fallback)
    const manualImports = [
      new URL('../product_images/recommend_outfit/35bf936de15f1bdc0d66769d477daa10.jpg', import.meta.url).href,
      new URL('../product_images/recommend_outfit/6ee4fee31cbc6d53fbde59532353249e.jpg', import.meta.url).href,
      new URL('../product_images/recommend_outfit/790a7dc23ea48a73da4816ebb46ffb50.jpg', import.meta.url).href,
      new URL('../product_images/recommend_outfit/db0b34fc9666384d521d4709c547c49f.jpg', import.meta.url).href,
      new URL('../product_images/recommend_outfit/dc00a8dd8fe025fd0f9f36d9e3b53ea2.jpg', import.meta.url).href,
      new URL('../product_images/recommend_outfit/ed0355ad04940f4ea8df97eab1ea9d59.jpg', import.meta.url).href,
    ];
    recommendImages = manualImports;
    console.log('Loaded recommend images (manual):', recommendImages);
  } catch (error) {
    console.error('Error with manual imports:', error);
  }
}

console.log('Final recommend images:', recommendImages);
console.log('Number of images found:', recommendImages.length);

interface RecommendOutfitProps {
  onSelectOutfit: (image: ImageData) => void;
}

const RecommendOutfit: React.FC<RecommendOutfitProps> = ({ onSelectOutfit }) => {
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    // Check if we have images loaded
    if (recommendImages.length > 0) {
      setLoading(false);
    } else {
      // If no images, stop loading after a short delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  const handleImageSelect = async (imagePath: string) => {
    try {
      // Fetch the image and convert to ImageData format
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const imageData: ImageData = {
          base64,
          mimeType: blob.type,
          dataUrl,
        };
        onSelectOutfit(imageData);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
        <p className="text-slate-600 mt-2">Loading recommended outfits...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-6 h-6 mr-2 text-indigo-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Recommended Outfits
        <span className="ml-2 text-sm text-slate-500">({recommendImages.length} images, {imagesLoaded} loaded)</span>
      </h3>
      
      {recommendImages.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-16 h-16 mx-auto mb-4 text-slate-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No recommended outfits yet</p>
          <p className="text-sm">Add product images to the <code className="bg-slate-100 px-2 py-1 rounded text-xs">product_images/recommend_outfit</code> folder to see recommendations here.</p>
          <p className="text-xs text-slate-400 mt-2">Supported formats: JPG, JPEG, PNG, GIF, WEBP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {recommendImages.map((imagePath, index) => (
            <div
              key={index}
              onClick={() => handleImageSelect(imagePath)}
              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            >
              <img
                src={imagePath}
                alt={`Recommended outfit ${index + 1}`}
                className="w-full h-48 sm:h-52 md:h-48 lg:h-52 object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  console.error('Failed to load image:', imagePath);
                  e.currentTarget.style.display = 'none';
                  // Show fallback content
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                onLoad={(e) => {
                  console.log('Successfully loaded image:', imagePath);
                  handleImageLoad();
                }}
              />
              {/* Fallback content when image fails to load */}
              <div 
                className="w-full h-48 sm:h-52 md:h-48 lg:h-52 bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>Image {index + 1}</div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white rounded-full p-2 shadow-lg">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-5 h-5 text-indigo-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Product info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-800/70 to-transparent p-3">
                <div className="text-white text-sm font-medium">
                  Outfit #{index + 1}
                </div>
                <div className="text-white/80 text-xs">
                  Click to try on
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendOutfit;
