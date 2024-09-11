'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

export default function VideoAnalysis() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      setAnalysis(null) // Reset analysis when new video is uploaded
    }
  }

  const handleAnalyze = async () => {
    if (!videoSrc || !fileInputRef.current?.files?.[0]) return

    setIsAnalyzing(true)
    setAnalysis(null) // Clear previous analysis

    const formData = new FormData()
    formData.append('file', fileInputRef.current.files[0]) // Ensure the field name is 'file'

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authorization token is missing')
      }

      console.log('Token:', token) // Debugging: Log the token
      console.log('FormData:', formData) // Debugging: Log the form data

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
      setAnalysis(result.analysis || 'Analysis successful, but no result message provided.')
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
      setAnalysis(`Video analysis failed. Please try again. Error: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-4 text-sm">
                {analysis.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Upload a video and start analysis to see results here.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}