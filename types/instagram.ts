export interface Location {
  name: string
  address: string
  city: string
}

export interface Post {
  post_id: string
  post_url: string
  caption: string
  posting_date: string
  likes: number
  comments: number
  hashtags: string[]
  location: Location
  image_url: string
  thumbnail_url: string
  is_video: boolean
}

export interface Statistics {
  total_posts: number
  total_likes: number
  total_comments: number
  average_likes_per_post: number
  average_comments_per_post: number
}

export interface InstagramAnalysis {
  statistics: Statistics
  profile_analysis: ProfileAnalysis[]
  hashtag_analysis: HashtagAnalysis
}

export interface ProfileAnalysis {
  account: string
  posts: Post[]
  statistics: Statistics
}

export interface HashtagPost {
  caption: string
  hashtags: string[]
  url: string
  timestamp: string
}

export interface HashtagTrends {
  top_hashtags: Record<string, number>
  regional_trends: Record<string, number>
  category_trends: Record<string, number>
  post_count: number
  unique_hashtags: number
}

export interface HashtagAnalysis {
  posts: HashtagPost[]
  trends: HashtagTrends
}

export interface InstagramAnalysisData {
  timestamp: string
  data: {
    timestamp: string
    analyzed_accounts: string[]
    analyzed_hashtags: string[]
    profile_analysis: ProfileAnalysis[]
    hashtag_analysis: HashtagAnalysis
  }
}

export interface OcrAnalysis {
  category: string;
  frequency: number;
  text: string;
  postCount: number;
  averageEngagement: {
    likes: number;
    comments: number;
  };
  posts: Post[];
}