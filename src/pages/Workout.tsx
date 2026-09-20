import React, { useState } from 'react';
import { NativeCamera } from '../components/NativeCamera';

export const Workout: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoCapture = (url: string) => {
    setPhotos(prev => [url, ...prev]);
    // TODO: Use syncService.ts to queue this photo upload to Firebase Storage!
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-6 pt-12">
      <h1 className="text-4xl font-bold font-heading mb-2 text-gray-900">Workout Engine</h1>
      <p className="text-gray-600 mb-8">Log your sets and scan your pump.</p>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">Progress Photos</h2>
        
        {/* Here is the newly integrated Native Camera Plugin! */}
        <NativeCamera onPhotoCapture={handlePhotoCapture} buttonText="Scan Pump / Take Photo" />

        {/* Display captured photos */}
        {photos.length > 0 && (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
            {photos.map((url, i) => (
              <img key={i} src={url} alt={`Progress ${i}`} className="h-32 w-32 object-cover rounded-xl shadow-md flex-shrink-0" />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Current Session</h2>
        <p className="text-gray-500 italic text-sm">
          UI components for logging sets, reps, and RPE go here.
        </p>
      </div>
    </div>
  );
};
