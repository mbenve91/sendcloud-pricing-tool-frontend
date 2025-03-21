"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  serviceId: z.string({
    required_error: "Please select a service",
  }),
  weightMin: z.coerce.number().min(0),
  weightMax: z.coerce.number().min(0.1),
  purchasePrice: z.coerce.number().min(0.01),
  retailPrice: z.coerce.number().min(0.01),
  volumeDiscount: z.coerce.number().min(0).max(100),
  promotionalDiscount: z.coerce.number().min(0).max(100),
  minimumVolume: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
})

type RateFormValues = z.infer<typeof formSchema>

interface RateFormProps {
  initialData?: any
}

// Mock services data
const services = [
  {
    id: "1",
    name: "Express",
    code: "BRT-EXP",
    carrier: {
      id: "1",
      name: "BRT",
    },
  },
  {
    id: "2",
    name: "Standard",
    code: "BRT-STD",
    carrier: {
      id: "1",
      name: "BRT",
    },
  },
  {
    id: "3",
    name: "Economy",
    code: "GLS-ECO",
    carrier: {
      id: "2",
      name: "GLS",
    },
  },
  {
    id: "4",
    name: "International Express",
    code: "DHL-INTL-EXP",
    carrier: {
      id: "3",
      name: "DHL",
    },
  },
]

export function RateForm({ initialData }: RateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [margin, setMargin] = useState(0)
  const [marginPercentage, setMarginPercentage] = useState(0)

  const form = useForm<RateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          serviceId: initialData.service.id,
          weightMin: initialData.weightMin,
          weightMax: initialData.weightMax,
          purchasePrice: initialData.purchasePrice,
          retailPrice: initialData.retailPrice,
          volumeDiscount: initialData.volumeDiscount,
          promotionalDiscount: initialData.promotionalDiscount,
          minimumVolume: initialData.minimumVolume,
          isActive: initialData.isActive,
        }
      : {
          serviceId: "",
          weightMin: 0,
          weightMax: 1,
          purchasePrice: 0,
          retailPrice: 0,
          volumeDiscount: 0,
          promotionalDiscount: 0,
          minimumVolume: 0,
          isActive: true,
        },
  })

  // Calculate margin when prices change
  useEffect(() => {
    const purchasePrice = form.watch("purchasePrice")
    const retailPrice = form.watch("retailPrice")

    if (retailPrice && purchasePrice) {
      const calculatedMargin = retailPrice - purchasePrice
      setMargin(calculatedMargin)

      if (retailPrice > 0) {
        const calculatedMarginPercentage = (calculatedMargin / retailPrice) * 100
        setMarginPercentage(calculatedMarginPercentage)
      } else {
        setMarginPercentage(0)
      }
    }
  }, [form.watch("purchasePrice"), form.watch("retailPrice")])

  function onSubmit(values: RateFormValues) {
    // In a real app, you would submit the form data to your API
    console.log(values)

    toast({
      title: "Rate saved",
      description: "The rate has been successfully saved.",
    })

    // Redirect back to the rates list
    router.push("/rates")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.carrier.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The service this rate applies to.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weightMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>The price you pay to the carrier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retailPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retail Price (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>The price you charge to customers.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Margin:</span>
                  <span className="text-sm font-bold">€{margin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Margin Percentage:</span>
                  <span className="text-sm font-bold">{marginPercentage.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="volumeDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Discount (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimumVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Volume</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="promotionalDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotional Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...field} />
                </FormControl>
                <FormDescription>Special promotional discount percentage.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>Enable or disable this rate.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}

