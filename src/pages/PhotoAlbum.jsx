// src/pages/PhotoAlbum.jsx
/**
 * Photo Album Page - Stunning visual gallery of dog memories
 * Features: Masonry layout, filters, photo editing, sharing
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectDog, selectDogJournal } from '@/redux/dogSlice.js';
import PageShell from '@/components/PageShell.jsx';

export default function PhotoAlbum() {
  const dog = useSelector(selectDog);
  const journal = useSelector(selectDogJournal);
  const [selectedPhoto, setSelectedPhoto] = React.useState(null);
  const [filterMode, setFilterMode] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('masonry');

  // Generate sample photos from journal entries and milestones
  const photos = React.useMemo(() => {
    const allPhotos = [];
    
    // Add milestone photos
    if (dog?.adoptedAt) {
      allPhotos.push({
        id: 'adoption',
        type: 'milestone',
        title: 'Adoption Day! 🎉',
        description: `The day ${dog.name} came home`,
        date: dog.adoptedAt,
        mood: 'happy',
        tags: ['milestone', 'adoption'],
      });
    }

    // Add journal-based photos
    journal?.entries?.forEach((entry, idx) => {
      if (entry.milestone || entry.mood === 'happy' || entry.mood === 'playful') {
        allPhotos.push({
          id: `journal-${idx}`,
          type: 'memory',
          title: entry.milestone ? `🌟 ${entry.milestone}` : 'A Happy Moment',
          description: entry.text || entry.milestone,
          date: entry.timestamp,
          mood: entry.mood || 'happy',
          tags: [entry.mood, entry.milestone ? 'milestone' : 'memory'],
        });
      }
    });

    // Sort by date, newest first
    return allPhotos.sort((a, b) => b.date - a.date);
  }, [dog, journal]);

  const filteredPhotos = React.useMemo(() => {
    if (filterMode === 'all') return photos;
    return photos.filter(p => p.tags?.includes(filterMode));
  }, [photos, filterMode]);

  const filters = [
    { id: 'all', label: 'All Photos', icon: '📷' },
    { id: 'milestone', label: 'Milestones', icon: '🌟' },
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'playful', label: 'Playful', icon: '🎾' },
  ];

  return (
    <PageShell>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-purple-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-shimmer">
                  <span className="inline-block mr-3 text-4xl">📸</span>
                  {dog?.name}&apos;s Photo Album
                </h1>
                <p className="text-gray-600 mt-2">
                  {filteredPhotos.length} precious memories captured
                </p>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Add Photo
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterMode(filter.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                    filterMode === filter.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-20 h-20 mx-auto text-gray-300 mb-4 animate-bounce" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No photos yet</h3>
              <p className="text-gray-500">
                Start creating memories with {dog?.name || 'your dog'}!
              </p>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'masonry' 
                ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6' 
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            `}>
              {filteredPhotos.map((photo, idx) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={idx}
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            dogName={dog?.name}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </div>
    </PageShell>
  );
}

function PhotoCard({ photo, index, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  const moodColors = {
    happy: 'from-yellow-400 to-orange-400',
    playful: 'from-green-400 to-blue-400',
    calm: 'from-blue-400 to-purple-400',
    default: 'from-purple-400 to-pink-400',
  };

  const gradientClass = moodColors[photo.mood] || moodColors.default;

  return (
    <div
      className="break-inside-avoid mb-6 group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className={`
        relative rounded-2xl overflow-hidden shadow-lg
        transform transition-all duration-500
        ${isHovered ? 'scale-105 shadow-2xl -rotate-1' : 'hover:shadow-xl'}
        animate-fadeIn
      `}>
        {/* Photo Placeholder with Gradient */}
        <div className={`
          aspect-[4/3] bg-gradient-to-br ${gradientClass}
          flex items-center justify-center relative overflow-hidden
        `}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>

          {/* Icon or content */}
          <div className="relative z-10 text-white text-6xl animate-heartbeat">
            {photo.type === 'milestone' ? '🌟' : '📸'}
          </div>

          {/* Hover overlay */}
          <div className={`
            absolute inset-0 bg-black/40 backdrop-blur-sm
            flex items-center justify-center gap-4
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`
                p-3 rounded-full bg-white/20 backdrop-blur-md
                hover:bg-white/30 transition-all duration-200
                ${isLiked ? 'scale-125' : ''}
              `}
            >
              <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
            </button>
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-200">
              <span className="text-2xl">↗️</span>
            </button>
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-200">
              <span className="text-2xl">⬇️</span>
            </button>
          </div>
        </div>

        {/* Card Info */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
            {photo.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {photo.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(photo.date).toLocaleDateString()}</span>
            <div className="flex gap-1">
              {photo.tags?.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ photo, dogName, onClose }) {
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Photo */}
        <div className="aspect-video bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
          <div className="text-white text-8xl animate-heartbeat">
            {photo.type === 'milestone' ? '🌟' : '📸'}
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{photo.title}</h2>
          <p className="text-gray-600 mb-4">{photo.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {new Date(photo.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
