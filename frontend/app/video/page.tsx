'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from 'react-markdown'

interface AnalysisResult {
  facialExpressions: string;
  posture: string;
  interactionDynamics: string;
  tips: string;
}

export default function VideoAnalysis() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      setAnalysis(null)
    }
  }

  const handleAnalyze = async () => {
    if (!videoSrc || !fileInputRef.current?.files?.[0]) return

    setIsAnalyzing(true)
    setAnalysis(null)

    const formData = new FormData()
    formData.append('file', fileInputRef.current.files[0])

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authorization token is missing')
      }

      const response = await fetch('http://127.0.0.1:8000/api/ai/analyze_video', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Network response was not ok: ${errorText}`)
      }

      const result = await response.json()
      setAnalysis({
        facialExpressions: result.facial_expressions || 'No facial expression analysis available.',
        posture: result.posture || 'No posture analysis available.',
        interactionDynamics: result.interaction_dynamics || 'No interaction dynamics analysis available.',
        tips: result.tips || 'No tips available.'
      })
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
      setAnalysis({
        facialExpressions: `Analysis failed: ${error.message}`,
        posture: `Analysis failed: ${error.message}`,
        interactionDynamics: `Analysis failed: ${error.message}`,
        tips: `Analysis failed: ${error.message}`
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Analysis</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="video">Video</Label>
                <Input 
                  id="video" 
                  type="file" 
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              {videoSrc && (
                <video 
                  src={videoSrc} 
                  controls 
                  className="w-full rounded-lg shadow-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              <Button 
                onClick={handleAnalyze} 
                disabled={!videoSrc || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : 'Start Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : analysis ? (
              <Tabs defaultValue="facialExpressions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="facialExpressions" className="text-xs sm:text-sm">Facial Expressions</TabsTrigger>
                  <TabsTrigger value="posture" className="text-xs sm:text-sm">Posture</TabsTrigger>
                  <TabsTrigger value="interactionDynamics" className="text-xs sm:text-sm">Interaction Dynamics</TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs sm:text-sm">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="facialExpressions">
                  <h3 className="text-lg font-semibold mb-2">Facial Expressions Analysis</h3>
                  <div className="text-sm">{renderMarkdown(analysis.facialExpressions)}</div>
                </TabsContent>
                <TabsContent value="posture">
                  <h3 className="text-lg font-semibold mb-2">Posture Analysis</h3>
                  <div className="text-sm">{renderMarkdown(analysis.posture)}</div>
                </TabsContent>
                <TabsContent value="interactionDynamics">
                  <h3 className="text-lg font-semibold mb-2">Interaction Dynamics Analysis</h3>
                  <div className="text-sm">{renderMarkdown(analysis.interactionDynamics)}</div>
                </TabsContent>
                <TabsContent value="tips">
                  <h3 className="text-lg font-semibold mb-2">Tips</h3>
                  <div className="text-sm">{renderMarkdown(analysis.tips)}</div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">Upload a video and start analysis to see results here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}