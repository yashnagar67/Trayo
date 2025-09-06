import React, { useState } from 'react';
import type { ImageData } from '../types';

interface CatalogItem {
  name: string;
  image: string;
  price: number;
  category: string;
}

interface TShirtCatalogProps {
  onSelectOutfit: (image: ImageData) => void;
}

// Dynamically import all images from subfolders in product_images
const imageModules = import.meta.glob('../product_images/*/*.{jpg,jpeg,png}', { eager: true, as: 'url' });
const items: CatalogItem[] = Object.keys(imageModules).map((path, i) => {
  // path: ../product_images/category/filename.jpg
  const parts = path.split('/');
  const category = parts[2];
  const name = parts[3].replace(/\.(jpg|jpeg|png)$/i, '');
  return {
    name,
    image: imageModules[path] as string,
    price: [490, 290, 199, 890, 390, 129, 190, 199, 690][i % 9], // placeholder prices
    category,
  };
});

const categories = Array.from(new Set(items.map(item => item.category)));

const TShirtCatalog: React.FC<TShirtCatalogProps> = ({ onSelectOutfit }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  const filtered = items.filter(item => item.category === activeCategory);

  const handleSelect = async (idx: number) => {
    const shirt = filtered[idx];
    const response = await fetch(shirt.image);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      onSelectOutfit({
        base64,
        mimeType: blob.type,
        dataUrl,
      });
    };
    reader.readAsDataURL(blob);
  };

  if (!categories.length) {
    return <div style={{ padding: 24 }}><h2>Catalog</h2><p>No product images found in <b>product_images</b> subfolders.</p></div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Try-On</h2>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, minWidth: 400 }}>
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontWeight: cat === activeCategory ? 700 : 400,
                borderBottom: cat === activeCategory ? '2px solid #222' : '2px solid transparent',
                color: cat === activeCategory ? '#222' : '#888',
                padding: '0 8px 8px 8px',
                fontSize: 16,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 16,
      }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 18, padding: 32 }}>No products in this category.</div>
        ) : filtered.map((shirt, idx) => (
          <div
            key={shirt.name + shirt.category}
            onClick={() => handleSelect(idx)}
            style={{
              borderRadius: 18,
              boxShadow: '0 2px 8px #0001',
              background: '#fff',
              padding: 0,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <span style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              padding: '2px 10px',
              boxShadow: '0 1px 4px #0001',
              zIndex: 2,
            }}>
              ${shirt.price}
            </span>
            <img src={shirt.image} alt={shirt.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
            <div style={{ padding: '10px 8px 12px', width: '100%', textAlign: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{shirt.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TShirtCatalog;
