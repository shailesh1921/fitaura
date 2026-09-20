import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Camera as CameraIcon } from 'lucide-react';

interface NativeCameraProps {
  onPhotoCapture: (webPath: string) => void;
  buttonText?: string;
}

export const NativeCamera: React.FC<NativeCameraProps> = ({ 
  onPhotoCapture, 
  buttonText = "Take Progress Photo" 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async () => {
    setIsProcessing(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, // Force opening the native camera, not gallery
      });

      if (image.webPath) {
        onPhotoCapture(image.webPath);
      }
    } catch (e) {
      console.error('Camera cancelled or failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handleCapture}
      disabled={isProcessing}
      className="flex items-center justify-center gap-2 bg-[#7000ff] text-white px-6 py-3 rounded-full font-heading font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-70 w-full max-w-sm"
    >
      <CameraIcon size={20} />
      <span>{isProcessing ? "Opening Camera..." : buttonText}</span>
    </button>
  );
};
