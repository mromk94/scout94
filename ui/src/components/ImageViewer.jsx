import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export default function ImageViewer({ screenshots, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadImage(currentIndex);
  }, [currentIndex]);

  const loadImage = async (index) => {
    if (!screenshots || screenshots.length === 0) return;
    
    setLoading(true);
    try {
      const path = screenshots[index];
      const data = await invoke('read_screenshot', { screenshotPath: path });
      
      // Convert byte array to base64
      const base64 = btoa(
        new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      setImageData(`data:image/png;base64,${base64}`);
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `screenshot-${currentIndex + 1}.png`;
    link.click();
  };

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <p className="text-xl mb-4">📸 No screenshots available</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur">
        <div className="text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📸 Screenshot Viewer
          </h2>
          <p className="text-sm text-gray-400">
            {currentIndex + 1} of {screenshots.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition ml-2"
            title="Download"
          >
            <Download className="w-5 h-5 text-white" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition ml-2"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {loading ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p>Loading screenshot...</p>
          </div>
        ) : (
          <motion.img
            key={currentIndex}
            src={imageData}
            alt={`Screenshot ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease-out',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        )}
      </div>

      {/* Navigation */}
      {screenshots.length > 1 && (
        <div className="flex items-center justify-center gap-4 p-4 bg-black/50 backdrop-blur">
          <button
            onClick={handlePrevious}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-white">Previous</span>
          </button>

          <div className="flex gap-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-blue-500 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
          >
            <span className="text-white">Next</span>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
