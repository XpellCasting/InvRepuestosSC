import React, { useState } from 'react';
import { PackageOpen, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const ProductImage = ({ src, alt, className = "w-full h-full object-cover", fallbackSize = 48, fallbackIcon = "package" }) => {
  const [error, setError] = useState(false);

  // Intentamos procesar la fuente de la imagen
  let safeSrc = src;
  
  if (src && typeof src === 'string') {
    // A veces puede venir como un array JSON en texto: '["http..."]'
    try {
      if (src.trim().startsWith('[')) {
        const parsed = JSON.parse(src);
        if (Array.isArray(parsed) && parsed.length > 0) {
          safeSrc = parsed[0];
        } else {
          safeSrc = null;
        }
      }
    } catch (e) {
      // No era JSON, usar tal cual
    }
  } else if (Array.isArray(src) && src.length > 0) {
    safeSrc = src[0];
  }

  if (!safeSrc || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className} p-4`}>
        {fallbackIcon === 'package' ? (
          <PackageOpen size={fallbackSize} className="mb-2 opacity-50" />
        ) : fallbackIcon === 'alert' ? (
          <AlertTriangle size={fallbackSize} className="mb-2 opacity-50" />
        ) : (
          <ImageIcon size={fallbackSize} className="mb-2 opacity-50" />
        )}
        <span className="text-sm font-medium">Sin Imagen</span>
      </div>
    );
  }

  return (
    <img 
      src={safeSrc} 
      alt={alt || "Product image"} 
      className={className} 
      onError={() => setError(true)}
    />
  );
};

export default ProductImage;
