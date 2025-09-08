
import React, { useCallback, useState } from 'react';
import type { ImageData } from '../types';

interface ImageUploaderProps {
    onImageUpload: (imageData: ImageData) => void;
    title: string;
    icon: React.ReactNode;
    previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, icon, previewUrl }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                onImageUpload({
                    base64,
                    mimeType: file.type,
                    dataUrl: dataUrl
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const onDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const onDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };
    
    const uploaderClass = isDragging 
      ? 'border-indigo-500 bg-indigo-50' 
      : 'border-slate-300 hover:border-slate-400';

    return (
        <div className="w-full">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">{title}</h3>
            <label
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                className={`relative flex flex-col items-center justify-center w-full h-32 sm:h-40 md:h-48 lg:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-white transition-colors duration-200 ${uploaderClass}`}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={title} className="object-contain w-full h-full rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center justify-center p-2 sm:p-4 text-slate-500">
                        <div className="scale-75 sm:scale-90 md:scale-100">
                            {icon}
                        </div>
                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-center"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-center">PNG, JPG, WEBP</p>
                    </div>
                )}
                <input type="file" onChange={onFileChange} className="hidden" accept="image/*" />
            </label>
        </div>
    );
};

export default ImageUploader;
