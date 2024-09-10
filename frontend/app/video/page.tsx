'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return

    setLoading(true)
    setAnalysis(null)

    // Simuler l'analyse de l'IA (remplacer par l'appel API réel)
    await new Promise(resolve => setTimeout(resolve, 3000))

    setAnalysis("Analyse de la vidéo de rencard : Le client montre une bonne posture et maintient un contact visuel constant. Cependant, il pourrait améliorer son écoute active et poser plus de questions à son interlocuteur. Le langage corporel est ouvert, mais il y a des signes de nervosité occasionnels. Recommandations : Travailler sur la respiration pour réduire le stress, pratiquer des techniques d'écoute active, et préparer quelques questions ouvertes à l'avance pour stimuler la conversation.")
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Analyse de Vidéo de Rencard</CardTitle>
        <CardDescription>Téléchargez une vidéo pour obtenir une analyse IA et des conseils pour votre client.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video">Vidéo</Label>
            <Input id="video" type="file" accept="video/*" onChange={handleFileChange} />
          </div>
          <Button type="submit" disabled={!file || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              'Analyser la vidéo'
            )}
          </Button>
        </form>
      </CardContent>
      {analysis && (
        <CardFooter>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Résultat de l'analyse :</h3>
            <p className="text-sm text-muted-foreground">{analysis}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}