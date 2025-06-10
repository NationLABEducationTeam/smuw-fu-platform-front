'use client'

import { useState, useEffect } from 'react'
import { InstagramAnalysisData, ProfileAnalysis } from '@/types/instagram'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { PostCard } from './postcard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
})

export function InstagramFeed() {
  const [data, setData] = useState<InstagramAnalysisData | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const command = new GetObjectCommand({
          Bucket: 'smwu-daily-instagram-analysis',
          Key: `${today}/latest.json`
        })
        
        const response = await s3Client.send(command)
        const str = await response.Body?.transformToString()
        const jsonData = str ? JSON.parse(str) as InstagramAnalysisData : null
        setData(jsonData)
        if (jsonData && jsonData.data?.profile_analysis?.length > 0) {
          setSelectedAccount(jsonData.data.profile_analysis[0].account)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>No data available</div>

  const selectedProfile = data.data.profile_analysis.find(
    profile => profile.account === selectedAccount
  )

  if (!selectedProfile) return <div>No profile selected</div>

  return (
    <div className="space-y-6">
      <Tabs 
        value={selectedAccount} 
        onValueChange={setSelectedAccount}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {data.data.profile_analysis.map((profile) => (
            <TabsTrigger 
              key={profile.account} 
              value={profile.account}
              className="min-w-fit"
            >
              {profile.account}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {selectedProfile.posts.map((post) => (
          <PostCard
            key={post.post_id}
            imageUrl={post.image_url}
            likes={post.likes}
            comments={post.comments}
            description={post.caption}
            username={selectedProfile.account}
            userAvatar="/placeholder.svg?height=40&width=40"
            timestamp={new Date(post.posting_date).toLocaleString('ko-KR', { 
              timeStyle: 'short', 
              dateStyle: 'short' 
            })}
            location={post.location}
            hashtags={post.hashtags}
          />
        ))}
      </div>
    </div>
  )
}