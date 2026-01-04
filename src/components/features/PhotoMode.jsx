// src/components/features/PhotoMode.jsx
// Photo mode for capturing and sharing dog moments

import * as React from 'react';
import { useToast } from '@/components/ToastProvider.jsx';

/**
 * PhotoMode - Allows players to capture and download snapshots of their dog
 * 
 * @param {Object} props
 * @param {string} props.dogName - The dog's name
 * @param {Function} props.onCapture - Callback when photo is captured
 */
export default function PhotoMode({ dogName = 'Pup', onCapture }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState(null);
  const toast = useToast();

  const handleCapture = React.useCallback(async () => {
    setIsCapturing(true);

    try {
      // In a real implementation, we'd use html2canvas or similar
      // For now, we'll simulate the capture
      
      toast.success('📸 Photo captured!', 1500);
      
      // Simulate capture delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const timestamp = new Date().toLocaleDateString();
      setCapturedImage({
        timestamp,
        dogName,
      });

      onCapture?.({ timestamp, dogName });
    } catch {
      toast.error('Failed to capture photo', 2000);
    } finally {
      setIsCapturing(false);
    }
  }, [dogName, onCapture, toast]);

  const handleDownload = React.useCallback(() => {
    toast.info('💾 Download feature coming soon!', 2000);
    // In real implementation: trigger download of captured canvas/image
  }, [toast]);

  const handleShare = React.useCallback(() => {
    toast.info('📤 Share feature coming soon!', 2000);
    // In real implementation: use Web Share API
  }, [toast]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full border-2 border-purple-400/40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md shadow-[0_8px_24px_rgba(168,85,247,0.3)] hover:shadow-[0_12px_32px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center text-2xl animate-float"
        aria-label="Open photo mode"
        title="Photo Mode"
      >
        📷
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-md w-full rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-950/95 to-pink-950/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-scaleIn">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 bg-black/30 hover:bg-black/50 transition-colors flex items-center justify-center text-white/80 hover:text-white"
          aria-label="Close photo mode"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📸</div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
            Photo Mode
          </h2>
          <p className="mt-2 text-sm text-purple-200/70">
            Capture special moments with {dogName}
          </p>
        </div>

        {/* Capture preview area */}
        <div className="relative rounded-2xl border-2 border-dashed border-purple-400/40 bg-purple-900/20 aspect-video mb-6 overflow-hidden">
          {capturedImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="text-6xl mb-3">🐕</div>
              <div className="text-sm font-semibold text-purple-100">{capturedImage.dogName}</div>
              <div className="text-xs text-purple-200/60 mt-1">{capturedImage.timestamp}</div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-purple-200/40 text-sm">
              Frame your perfect shot
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {!capturedImage ? (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full rounded-2xl border-2 border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-6 py-3 text-base font-bold text-purple-100 hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 shadow-[0_6px_20px_rgba(168,85,247,0.2)] hover:shadow-[0_8px_28px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCapturing ? '📸 Capturing...' : '📸 Capture Photo'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-500/30 transition-all duration-300"
              >
                💾 Download
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-2xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-sm font-bold text-blue-100 hover:bg-blue-500/30 transition-all duration-300"
              >
                📤 Share
              </button>
            </div>
          )}

          {capturedImage && (
            <button
              type="button"
              onClick={() => setCapturedImage(null)}
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-6 py-2 text-sm font-semibold text-white/80 hover:bg-black/30 transition-all duration-300"
            >
              Take Another
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 pt-4 border-t border-purple-400/20">
          <p className="text-xs text-purple-200/50 text-center">
            💡 Tip: Try different actions for unique shots!
          </p>
        </div>
      </div>
    </div>
  );
}
