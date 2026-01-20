
import React from 'react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, id }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-white/90">{label}</label>
      <div 
        className={`relative w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
          image ? 'border-transparent bg-black/20' : 'border-white/30 hover:border-white/60 bg-white/5'
        }`}
        onClick={() => document.getElementById(id)?.click()}
      >
        {image ? (
          <>
            <img src={image} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-medium">Thay đổi ảnh</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <svg className="w-8 h-8 text-white/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-white/50">Tải lên hoặc kéo thả</span>
          </div>
        )}
      </div>
      <input 
        id={id}
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
