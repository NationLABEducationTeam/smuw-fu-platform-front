import React from 'react';
import { TopStory } from '@/types/serp';
import { ExternalLink, Calendar } from 'lucide-react';

interface TopStoriesSectionProps {
  data: TopStory[];
  serpapi_link?: string;
}

export function TopStoriesSection({ data, serpapi_link }: TopStoriesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {data.map((story, index) => (
          <a
            key={index}
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div className="flex gap-4">
              {story.thumbnail && (
                <img
                  src={story.thumbnail}
                  alt={story.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2">
                  {story.title}
                </h3>
                {story.snippet && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {story.snippet}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="font-medium text-blue-600">
                    {story.source}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {story.date}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {serpapi_link && (
        <a
          href={serpapi_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-4"
        >
          <ExternalLink className="w-4 h-4" />
          더 많은 뉴스 보기
        </a>
      )}
    </div>
  );
} 