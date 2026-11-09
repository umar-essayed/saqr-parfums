import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, ShoppingBag, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function StoryViewer({ stories, initialIndex = 0, onClose, onStoryViewed }) {
  const { lang, getLocalizedPerfume } = useAppSettings();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  const { setSelectedPerfume } = useCart();

  const currentStory = stories[currentIndex];
  const duration = (currentStory?.duration_seconds || 7) * 1000; // 7 seconds default for image

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && onStoryViewed) {
      onStoryViewed(currentStory.id);
    }
    setProgress(0);
    pausedTimeRef.current = 0;
  }, [currentIndex, currentStory]);

  // Handle timer & progress
  useEffect(() => {
    if (!currentStory || isPaused) return;

    // For video, video duration/events handle progression
    if (currentStory.media_type === 'video') {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    // For images: 7 seconds progress animation
    const intervalMs = 50;
    const step = (intervalMs / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentStory, duration]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handleNext(); // RTL
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPaused((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none animate-fade-in overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentStory.media_url}
          alt=""
          className="w-full h-full object-cover filter blur-3xl opacity-20 scale-125"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Story Container (Mobile-first vertical canvas) */}
      <div className="relative z-10 w-full max-w-md h-full sm:h-[92vh] sm:max-h-[850px] bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">
        
        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 pt-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => {
              let fillPercentage = 0;
              if (idx < currentIndex) fillPercentage = 100;
              else if (idx === currentIndex) fillPercentage = progress;
              else fillPercentage = 0;

              return (
                <div
                  key={s.id || idx}
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-saqr-gold transition-all duration-75 ease-linear"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Top Info Bar */}
          <div className="flex items-center justify-between mt-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black/50 border border-saqr-gold/40 p-1 flex items-center justify-center">
                <img src="/images/logo.png" alt="صقر" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block leading-tight">
                  عطور صَقْر
                </span>
                <span className="text-[10px] text-saqr-gold font-light">
                  {currentStory.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentStory.media_type === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <div className="flex items-center gap-1 text-[11px] text-saqr-gray bg-black/40 px-2 py-0.5 rounded-full">
                <Eye className="w-3 h-3 text-saqr-gold" />
                <span>{currentStory.views_count || 1}</span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Canvas */}
        <div
          className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              playsInline
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleNext}
              className="w-full h-full object-contain sm:object-cover"
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt={currentStory.title}
              className="w-full h-full object-contain sm:object-cover"
            />
          )}

          {/* Left / Right Click Navigation Zones */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext(); // In RTL next is left
            }}
            className="absolute left-0 top-16 bottom-24 w-1/3 z-20"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev(); // In RTL prev is right
            }}
            className="absolute right-0 top-16 bottom-24 w-1/3 z-20"
          />
        </div>

        {/* Bottom Caption & Product Link */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-5 bg-gradient-to-t from-black via-black/80 to-transparent text-center space-y-3">
          {currentStory.caption && (
            <p className="text-xs sm:text-sm text-white font-medium max-w-sm mx-auto leading-relaxed drop-shadow-md">
              {currentStory.caption}
            </p>
          )}

          {currentStory.perfume && (
            <button
              onClick={() => {
                onClose();
                setSelectedPerfume(currentStory.perfume);
              }}
              className="w-full py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs tracking-wide transition-all shadow-[0_0_25px_rgba(197,160,89,0.4)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `اقتنِ العطر الآن • ${currentStory.perfume.name}`
                  : `Acquire Fragrance • ${getLocalizedPerfume(currentStory.perfume)?.name || currentStory.perfume.name}`}
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Desktop Prev / Next Buttons */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
        aria-label="السابق"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
        aria-label="التالي"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

    </div>
  );
}
