
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full text-center py-8">
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
                AI Virtual Try-On Studio
            </h1>
            <p className="text-slate-500 mt-2 text-lg">See it on before you buy it.</p>
        </header>
    );
};

export default Header;
