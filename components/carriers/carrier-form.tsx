"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  logoUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the logo.",
    })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  fuelSurcharge: z.coerce.number().min(0).max(100),
  isVolumetric: z.boolean().default(false),
})

type CarrierFormValues = z.infer<typeof formSchema>

interface CarrierFormProps {
  initialData?: CarrierFormValues
}

export function CarrierForm({ initialData }: CarrierFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [logoPreview, setLogoPreview] = useState(initialData?.logoUrl || "")

  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      logoUrl: "",
      isActive: true,
      fuelSurcharge: 0,
      isVolumetric: false,
    },
  })

  function onSubmit(values: CarrierFormValues) {
    // In a real app, you would submit the form data to your API
    console.log(values)

    toast({
      title: "Carrier saved",
      description: "The carrier has been successfully saved.",
    })

    // Redirect back to the carriers list
    router.push("/carriers")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter carrier name" {...field} />
                </FormControl>
                <FormDescription>The display name of the carrier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/logo.png"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setLogoPreview(e.target.value)
                    }}
                  />
                </FormControl>
                <FormDescription>URL to the carrier's logo image.</FormDescription>
                <FormMessage />
                {logoPreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1">Preview:</p>
                    <div className="h-12 w-12 relative border rounded">
                      <Image
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        fill
                        className="object-contain p-1"
                        onError={() => setLogoPreview("")}
                      />
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fuelSurcharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Surcharge (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.1" {...field} />
                </FormControl>
                <FormDescription>The fuel surcharge percentage applied to shipments.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>Enable or disable this carrier.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVolumetric"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Volumetric Weight</FormLabel>
                    <FormDescription>Enable if this carrier uses volumetric weight calculation.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
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

