'use client'

import React, { useState } from "react"
import { InlineImage } from "@/types/serp"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Download, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface InlineImagesProps {
  data?: InlineImage[]
}

export const InlineImagesSection: React.FC<InlineImagesProps> = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState<InlineImage | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  if (!data || data.length === 0) {
    return null
  }

  const handleImageClick = (image: InlineImage, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const handlePrevImage = () => {
    const newIndex = (currentIndex - 1 + data.length) % data.length
    setSelectedImage(data[newIndex])
    setCurrentIndex(newIndex)
  }

  const handleNextImage = () => {
    const newIndex = (currentIndex + 1) % data.length
    setSelectedImage(data[newIndex])
    setCurrentIndex(newIndex)
  }

  const handleDownload = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = url.split('/').pop() || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">이미지 검색 결과</h2>
        <Badge variant="outline" className="px-3 py-1">
          {data.length}개 결과
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {data.map((image, index) => (
            <motion.div
              key={image.original}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="cursor-pointer group relative overflow-hidden rounded-lg"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div onClick={() => handleImageClick(image, index)}>
                    <AspectRatio ratio={4/3} className="bg-muted">
                      <img
                        src={image.thumbnail}
                        alt={image.title || "검색 이미지"}
                        className="object-cover w-full h-full transition-all duration-300 group-hover:brightness-90"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                      <div className="p-2 text-white w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs truncate">{image.title || "이미지"}</p>
                        <p className="text-xs opacity-70 truncate">{image.source_name || ""}</p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
                  {selectedImage && (
                    <div className="relative">
                      <div className="flex justify-center items-center min-h-[300px] max-h-[80vh]">
                        <img
                          src={selectedImage.original}
                          alt={selectedImage.title || "이미지"}
                          className="max-w-full max-h-[80vh] object-contain"
                        />
                      </div>
                      
                      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage();
                          }}
                          className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                      </div>
                      
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          className="rounded-full bg-black/20 hover:bg-black/40 text-white"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-medium mb-1">{selectedImage.title || "이미지"}</h3>
                        <p className="text-white/70 text-sm mb-2">{selectedImage.source_name || ""}</p>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(selectedImage.original)}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedImage.source || selectedImage.original, '_blank')}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            원본 보기
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default InlineImagesSection 