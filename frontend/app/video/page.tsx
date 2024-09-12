'use client'

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useAuth } from '../actions';
import { ArrowPathIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, RocketLaunchIcon, TrashIcon } from '@heroicons/react/20/solid';
import { BorderBeam } from '@/components/ui/borderbeam';
import { Cover } from '@/components/ui/cover';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { FlipWords } from '@/components/ui/flip-words';

interface AnalysisResult {
  facialExpressions: string;
  posture: string;
  interactionDynamics: string;
  tips: string;
}

export default function VideoAnalysis() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>({
    "facialExpressions": "In the video, the client is seen laughing and smiling frequently, indicating a positive emotional response and engagement with the experience. Her eyebrows are raised and her mouth is slightly open in a smile, suggesting that she is enjoying herself. She is making eye contact with the camera or possibly a person, which can be a sign of connection and open communication. Overall, the client's facial expressions convey a sense of enjoyment, amusement, and comfort.",
    "posture": "In this \"simulation date\" video, the focus is on the interaction between the two individuals rather than just their posture. However, based on the available information, we can provide some insights into their body language and confidence:\n\n\n1. **Posture and Body Language:**\n   - The woman is leaning slightly forward, which could suggest that she is interested and engaged in the conversation.\n   - The man appears to be smiling, which indicates a positive and approachable demeanor.\n   - Both individuals are sitting close together, indicating a level of comfort and rapport.\n   - The woman's hands are resting on her lap, which could imply a relaxed and secure posture.\n   - The man leans slightly towards the woman, indicating a comfortable demeanor and an open attitude.\n   - The woman's body is slightly turned toward the man, possibly indicating that she is open to his attention.\n\n",
    "interactionDynamics": "In the \"simulation date\" video, two clients are participating in a virtual date. The woman client is wearing sunglasses and a scarf, and the man client is wearing a white shirt. Both are smiling throughout the conversation. The woman is the one who starts the conversation, initiates questions, and engages in small talk with the man. She shows a high level of interest and smiles at the man during the conversation. The man, on the other hand, appears relaxed and engaged while participating in the conversation, and he seems to maintain a neutral to positive facial expression. The man's posture, which is straight and comfortable, shows that he is interested and open to the interaction. Both clients are actively participating and engaged in the virtual date. Overall, the interaction seems positive and dynamic, with both parties contributing and expressing interest in the other. The woman appears to be more engaged in the conversation than",
    "tips": "It seems like you're asking about a \"simulation date\" video where I don't have the specific details about the individuals or their situation. However, I can provide some general advice based on the typical context of such a scenario.\n\n\n1. **Body Language and Facial Expression**: Maintaining a positive and open body language, like an inviting smile, open posture, and direct eye contact, can help signal your engagement and interest to the other person.\n\n2. **Non-Verbal Communication**: Using visual cues like nodding, mirroring, and maintaining the same rhythm of breath can help create a sense of synchrony.\n3. **Voice Tone and Volume**: Speak gently and with warmth, matching the tone of the conversation partner.\n4. **Personal Touch**: Physical contact like a gentle touch on the arm, a quick hug, or a"
});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoSrc || !fileInputRef.current?.files?.[0])
      return;

    setIsAnalyzing(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    try {
      const token = getToken();
      if (!token)
        throw new Error('Authorization token is missing');

      const response = await fetch('http://127.0.0.1:8000/api/ai/analyze_video', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const result = await response.json();
      setAnalysis({
        facialExpressions: result.facial_expressions || 'No facial expression analysis available.',
        posture: result.posture || 'No posture analysis available.',
        interactionDynamics: result.interaction_dynamics || 'No interaction dynamics analysis available.',
        tips: result.tips || 'No tips available.'
      });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      toast.error('There was a problem with the fetch operation', {
        duration: 5000,
        description: error instanceof Error ? error.message : String(error),
        important: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoSrc(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className='mb-4 last:mb-0'>{children}</p>,
          h1: ({ children }) => <h1 className='text-2xl font-bold mb-2'>{children}</h1>,
          h2: ({ children }) => <h2 className='text-xl font-semibold mb-2'>{children}</h2>,
          h3: ({ children }) => <h3 className='text-lg font-semibold mb-2'>{children}</h3>,
          ul: ({ children }) => <ul className='list-disc pl-5 mb-4'>{children}</ul>,
          ol: ({ children }) => <ol className='list-decimal pl-5 mb-4'>{children}</ol>,
          li: ({ children }) => <li className='mb-1'>{children}</li>,
          strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
          em: ({ children }) => <em className='italic'>{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    )
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setAnalysis(null);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'video/*': [] } });

  const words = [
    'skills',
    'talent',
    'performance',
    'engagement',
    'productivity',
    'motivation',
    'creativity',
    'innovation',
    'collaboration',
    'communication'
  ];

  const loadingPhrases = [
    "Hold tight, we're analyzing the chemistry of this date!",
    "The AI is reviewing body language and conversation flow... almost there!",
    "Just a moment! Your personalized date insights are being crafted.",
    "Hang on, we're decoding emotional signals and connection vibes!",
    "Almost done! Our AI is preparing advice based on your date's dynamics."
  ];

  return (
    <div className='w-full mx-auto'>
      <div>
        <h1 className='text-4xl md:text-4xl lg:text-5xl pb-6 font-semibold max-w-7xl mx-auto text-center relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-black to-neutral-600'>
          Analyze your video <Cover>to boost</Cover> <br /> your customers' skills using AI
        </h1>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden'>
        <Card>
          <CardHeader>
            <CardTitle className=''>
              Upload a video to analyze <FlipWords words={words} className='p-0' />
            </CardTitle>
            <CardDescription>
              Drag and drop a video here, or click to select a file to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 w-full'>
              <div {...getRootProps()} className='grid w-full h-[400px] items-center gap-1.5'>
                <input {...getInputProps()} ref={fileInputRef} />
                <div
                  className={clsx(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer w-full h-[400px] flex flex-col items-center justify-center transition-all duration-300',
                    isDragActive ? 'border-primary' : 'border-gray-300',
                    isDragActive ? 'bg-primary/10' : ''
                  )}
                >
                  {videoSrc ? (
                    <video
                      src={videoSrc}
                      controls
                      className='rounded-lg shadow-lg w-full h-full object-contain'
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div
                      className={clsx(
                        'flex flex-col items-center justify-center font-medium transition-all duration-200',
                        isDragActive ? 'text-primary' : 'text-muted-foreground',
                        isDragActive ? 'rotate-3 scale-105' : ''
                      )}
                    >
                      <DocumentArrowUpIcon
                        className={clsx(
                          'size-8',
                        )}
                      />
                      <p>Drag and drop a video here, or click to select a file</p>
                    </div>
                  )}
                </div>
              </div>
              <div className='flex gap-2 flex-col md:flex-row'>
                <Button
                  onClick={handleAnalyze}
                  className='w-full md:w-56'
                  disabled={!videoSrc || isAnalyzing}
                  shiny
                >
                  {isAnalyzing ? '' : 'Launch Analysis'}
                  {isAnalyzing ? <ArrowPathIcon className='h-4 w-4 animate-spin' /> : <RocketLaunchIcon className='h-4 w-4 ml-2' />}
                </Button>
                <Button
                  onClick={handleRemoveVideo}
                  disabled={!videoSrc || isAnalyzing}
                  variant='outline'
                  className='w-full md:w-56'
                >
                  Remove Video
                  <TrashIcon className='h-4 w-4 ml-2' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='relative'>
          <BorderBeam />
          <CardHeader>
            <CardTitle>
              Analysis Results
            </CardTitle>
            <CardDescription>
              See the analysis results of your video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4 w-full h-[450px] justify-between flex flex-col'>
              {isAnalyzing ? (
                <div className='flex items-center justify-center font-medium text-pretty h-32'>
                  <FlipWords words={loadingPhrases} className='p-0' duration={5000} />
                </div>
              ) : analysis ? (
                <div className='flex flex-col justify-between'>
                  <Tabs defaultValue='facialExpressions' className='w-full'>
                    <TabsList className='grid w-full grid-cols-2 lg:grid-cols-4 h-fit'>
                      <TabsTrigger value='facialExpressions' className='text-xs sm:text-sm'>Facial Expressions</TabsTrigger>
                      <TabsTrigger value='posture' className='text-xs sm:text-sm'>Posture</TabsTrigger>
                      <TabsTrigger value='interactionDynamics' className='text-xs sm:text-sm'>Interaction Dynamics</TabsTrigger>
                      <TabsTrigger value='tips' className='text-xs sm:text-sm'>Tips</TabsTrigger>
                    </TabsList>
                    <TabsContent value='facialExpressions'>
                      <h3 className='text-lg font-semibold mb-2'>Facial Expressions Analysis</h3>
                      <div className='text-sm'>{renderMarkdown(analysis.facialExpressions)}</div>
                    </TabsContent>
                    <TabsContent value='posture'>
                      <h3 className='text-lg font-semibold mb-2'>Posture Analysis</h3>
                      <div className='text-sm'>{renderMarkdown(analysis.posture)}</div>
                    </TabsContent>
                    <TabsContent value='interactionDynamics'>
                      <h3 className='text-lg font-semibold mb-2'>Interaction Dynamics Analysis</h3>
                      <div className='text-sm'>{renderMarkdown(analysis.interactionDynamics)}</div>
                    </TabsContent>
                    <TabsContent value='tips'>
                      <h3 className='text-lg font-semibold mb-2'>Tips</h3>
                      <div className='text-sm'>{renderMarkdown(analysis.tips)}</div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <></>
              )}
              <div className='mt-4 flex flex-wrap gap-2'>
                <Button variant='default' onClick={() => {
                  if (analysis) {
                    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'analysis_results.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}>
                  Download Results File
                  <DocumentArrowDownIcon className='size-4 ml-2'/>
                </Button>
                <Button variant='destructive' onClick={() => setAnalysis(null)}>
                  Clear Results
                  <TrashIcon className='size-4 ml-2'/>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}