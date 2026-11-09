import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin, config } from '../lib/supabase';
import StoryViewer from './StoryViewer';
import { useAppSettings } from '../context/AppSettingsContext';

export default function StoriesBar() {
  const { lang } = useAppSettings();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [seenStoryIds, setSeenStoryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('saqr_seen_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchStoriesFromDB = async () => {
    setLoading(true);

    if (!config.isConfigured || !supabase) {
      setLoading(false);
      setStories([]);
      return;
    }

    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories from Supabase:', error);
        setStories([]);
      } else if (data) {
        const now = new Date();
        const activeStories = data.filter((s) => {
          if (!s.expires_at) return true;
          return new Date(s.expires_at) > now;
        });
        setStories(activeStories);
      }
    } catch (e) {
      console.error('Stories fetch error:', e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoriesFromDB();
  }, []);

  const handleStoryViewed = async (storyId) => {
    // 1. Mark as seen locally
    if (!seenStoryIds.includes(storyId)) {
      const updated = [...seenStoryIds, storyId];
      setSeenStoryIds(updated);
      try {
        localStorage.setItem('saqr_seen_stories', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Increment view count in Supabase
    if (supabase) {
      try {
        await supabase.rpc('increment_story_views', { p_story_id: storyId });
      } catch {
        try {
          const client = supabaseAdmin || supabase;
          const current = stories.find((s) => s.id === storyId);
          if (current) {
            await client
              .from('stories')
              .update({ views_count: (current.views_count || 0) + 1 })
              .eq('id', storyId);
          }
        } catch (err) {
          console.error('Failed to update story views:', err);
        }
      }
    }

    // 3. Increment in local state
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, views_count: (s.views_count || 0) + 1 } : s))
    );
  };

  // Skeleton loader while fetching
  if (loading) {
    return (
      <div className="py-2 overflow-hidden flex items-center justify-center gap-4 sm:gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-col items-center flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 p-1" />
            <div className="w-12 h-2.5 bg-white/5 rounded-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // If no stories in database, return null without any fake fallback
  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="py-2 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Horizontal Story Circles Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {stories.map((story, index) => {
            const isSeen = seenStoryIds.includes(story.id);
            const localizedTitle = lang === 'en'
              ? (story.title?.includes('لاتيه') ? 'Bianco Latte' :
                 story.title?.includes('اليكسير') ? 'Invictus Elixir' :
                 story.title?.includes('ايربا') ? 'Erba Pura' :
                 story.title?.includes('انفيكتوس') ? 'Invictus' :
                 story.title?.includes('قهوه') || story.title?.includes('قهوة') ? 'Khamrah Qahwa' :
                 story.title?.includes('صقر') ? 'SAQR' : story.title)
              : story.title;

            return (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(index)}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer focus:outline-none transition-transform active:scale-95"
              >
                {/* Outer Ring: Gold Gradient if UNSEEN, Muted subtle ring if SEEN */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSeen
                      ? 'p-[1.5px] border border-white/20 opacity-70 group-hover:opacity-100'
                      : 'p-[2.5px] bg-gradient-to-tr from-[#C5A059] via-[#DFC082] to-[#E6CA85] shadow-[0_0_15px_rgba(197,160,89,0.4)] group-hover:shadow-[0_0_20px_rgba(197,160,89,0.6)]'
                  }`}
                >
                  {/* Inner Gap & Thumbnail from Supabase Storage */}
                  <div className="w-full h-full rounded-full bg-black p-[2px] overflow-hidden">
                    <img
                      src={story.media_url}
                      alt={localizedTitle}
                      className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Story Title Label */}
                <span
                  className={`text-[11px] sm:text-xs font-medium mt-1.5 max-w-[80px] sm:max-w-[90px] truncate transition-colors ${
                    isSeen ? 'text-saqr-gray group-hover:text-white' : 'text-white font-semibold'
                  }`}
                >
                  {localizedTitle}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onStoryViewed={handleStoryViewed}
        />
      )}
    </div>
  );
}
