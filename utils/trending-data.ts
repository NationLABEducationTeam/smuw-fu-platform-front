import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { TimeStance, TrendingDataItem, TrendingKeyword, YouTubeVideo } from '../types/dashboard';
import { fetchFromAPI, API_ENDPOINTS } from '@/utils/api';

interface YouTubeAPIResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

interface YouTubeResponseData {
  videos: YouTubeVideo[];
}

const s3Client = new S3Client({
    region: 'ap-northeast-2',  // 직접 리전 지정
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
    }
  });

const BUCKET_NAME = 'smwu-daily-search-trend';
const BASE_FILE_KEY = 'trends';



interface TrendData {
  yesterdayData: TrendingDataItem[];
  weeklyData: TrendingDataItem[];
  monthlyData: TrendingDataItem[];
  quarterlyData: TrendingDataItem[];
}

// S3에서 데이터 가져오기
async function fetchS3Data(period: string): Promise<TrendingDataItem[]> {
  try {
    const timestamp = new Date().getTime();
    const fileKey = `${BASE_FILE_KEY}/${period}/latest.json?t=${timestamp}`;
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey.split('?')[0],
      ResponseCacheControl: 'no-cache, no-store, must-revalidate'
    });
  
      const response = await s3Client.send(command);
      // console.log(`Successfully received response from S3 for ${period}`);
      
      const str = await response.Body?.transformToString();
      // console.log(`Data for ${period}:`, str);
      
      return str ? JSON.parse(str) : [];
    } catch (error) {
      console.error(`Error fetching ${period} data:`, error);
      return [];
    }
  }
  
  // 모든 기간의 데이터 가져오기
  export async function fetchTrendData(): Promise<TrendData> {
    // console.log('Starting to fetch trend data...');
    
    const periodMap = {
      'daily': 'yesterdayData',
      'weekly': 'weeklyData',
      'monthly': 'monthlyData',
      'quarterly': 'quarterlyData'
    } as const;
  
    try {
      // console.log('AWS Credentials:', {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'exists' : 'missing'
      });
  
      const results = await Promise.all(
        Object.keys(periodMap).map(async (period) => {
          // console.log(`Fetching data for period: ${period}`);
          const data = await fetchS3Data(period);
          // console.log(`Received data for ${period}, length:`, data.length);
          return { [periodMap[period as keyof typeof periodMap]]: data };
        })
      );
  
      const finalData = results.reduce<TrendData>((acc, curr) => ({
        ...acc,
        ...curr
      }), {
        yesterdayData: [],
        weeklyData: [],
        monthlyData: [],
        quarterlyData: []
      });
  
      // console.log('Final aggregated data:', finalData);
      return finalData;
  
    } catch (error) {
      console.error('Error in fetchTrendData:', error);
      return {
        yesterdayData: [],
        weeklyData: [],
        monthlyData: [],
        quarterlyData: []
      };
    }
  }

  export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
    try {
      const response = await fetchFromAPI<YouTubeAPIResponse>(API_ENDPOINTS.YOUTUBE);
      
      const data = JSON.parse(response.body) as YouTubeResponseData;
      // console.log('Parsed Data:', data);
  
      if (!data.videos || !Array.isArray(data.videos)) {
        console.error('Invalid data format:', data);
        throw new Error('응답 데이터 형식이 올바르지 않습니다');
      }
  
      return data.videos;
    } catch (error) {
      console.error('YouTube 동영상 가져오기 오류:', error);
      throw error;
    }
  }

export async function getTrendingData(timeStance: TimeStance): Promise<TrendingDataItem[]> {
  const trendData = await fetchTrendData();
  
  switch (timeStance) {
    case 'yesterday': return trendData.yesterdayData;
    case 'weekly': return trendData.weeklyData;
    case 'monthly': return trendData.monthlyData;
    case 'quarterly': return trendData.quarterlyData;
    default: return trendData.weeklyData;
  }
}

export const getTrendingKeywords = (trendingData: TrendingDataItem[]): TrendingKeyword[] => 
  trendingData.map((item, index) => ({
    ...item,
    rank: index + 1,
    graphData: item.graph_data.map((value, index) => ({ time: index, value }))
  }));