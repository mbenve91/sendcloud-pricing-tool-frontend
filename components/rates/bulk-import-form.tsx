"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BulkImportForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<{
    valid: boolean
    message: string
    details?: string[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Reset validation results when a new file is selected
      setValidationResults(null)
    }
  }

  const validateFile = () => {
    if (!file) return

    setUploading(true)
    setProgress(20)

    // Simulate file validation
    setTimeout(() => {
      setProgress(60)

      // For demo purposes, we'll randomly show validation success or errors
      const isValid = Math.random() > 0.5

      if (isValid) {
        setValidationResults({
          valid: true,
          message: "File validation successful. Ready to import.",
        })
      } else {
        setValidationResults({
          valid: false,
          message: "File validation failed. Please fix the following issues:",
          details: [
            "Row 5: Invalid service ID",
            "Row 12: Purchase price cannot be greater than retail price",
            "Row 23: Missing weight range",
          ],
        })
      }

      setProgress(100)
      setUploading(false)
    }, 1500)
  }

  const handleImport = () => {
    if (!file || !validationResults?.valid) return

    setUploading(true)
    setProgress(20)

    // Simulate import process
    setTimeout(() => {
      setProgress(50)

      setTimeout(() => {
        setProgress(80)

        setTimeout(() => {
          setProgress(100)
          setUploading(false)

          toast({
            title: "Import successful",
            description: `Imported ${Math.floor(Math.random() * 100) + 50} rates from ${file.name}`,
          })

          // Redirect back to rates list
          router.push("/rates")
        }, 500)
      }, 800)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file">Select CSV File</Label>
        <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
      </div>

      {file && !validationResults && (
        <Button onClick={validateFile} disabled={uploading}>
          {uploading ? "Validating..." : "Validate File"}
        </Button>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress < 100 ? "Processing..." : "Complete"}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {validationResults && (
        <Alert variant={validationResults.valid ? "default" : "destructive"}>
          <div className="flex items-start gap-2">
            {validationResults.valid ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5" />
            )}
            <div>
              <AlertTitle>{validationResults.valid ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                <p>{validationResults.message}</p>
                {validationResults.details && (
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {validationResults.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {validationResults?.valid && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setValidationResults(null)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={uploading}>
            {uploading ? "Importing..." : "Import Rates"}
          </Button>
        </div>
      )}
    </div>
  )
}

