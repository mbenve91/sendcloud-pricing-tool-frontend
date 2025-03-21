import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { BulkImportForm } from "@/components/rates/bulk-import-form"

export default function BulkImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
          Bulk Import Rates
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Instructions</CardTitle>
            <CardDescription>How to prepare and import your rate data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Follow these steps to successfully import your rates:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Download the template CSV file</li>
              <li>Fill in your rate data following the template format</li>
              <li>Save the file as CSV</li>
              <li>Upload the file using the form on the right</li>
              <li>Review and confirm the import</li>
            </ol>
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Rates</CardTitle>
            <CardDescription>Import rates from a CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <BulkImportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

