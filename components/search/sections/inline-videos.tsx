import React from 'react';
import { InlineVideo } from '@/types/serp';
import { Play, Clock, Eye } from 'lucide-react';

interface InlineVideosSectionProps {
  data: InlineVideo[];
}

export function InlineVideosSection({ data }: InlineVideosSectionProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((video) => (
        <a
          key={video.position}
          href={video.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {video.channel?.name && video.channel?.link && (
                <a
                  href={video.channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {video.channel.name}
                </a>
              )}
              {video.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.views}
                </span>
              )}
              {video.published && (
                <span>{video.published}</span>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
} 