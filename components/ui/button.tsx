import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[18px] text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#0D9CFF] to-[#00D3F7] text-white hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[56px] px-[45px] py-[18px]",
        sm: "h-9 px-3 py-2",
        lg: "h-11 px-8 py-3",
        xl: "h-14 px-10 py-4",
        full: "w-full h-[56px] px-[45px] py-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      style={{
        fontFamily: "Aeonik, Arial, Helvetica, sans-serif",
        fontSize: "18px",
        lineHeight: "20px",
        fontWeight: 600,
        boxShadow: "none",
        transition:
          "opacity 0.45s cubic-bezier(0.25, 1, 0.33, 1), transform 0.45s cubic-bezier(0.25, 1, 0.33, 1), border-color 0.45s cubic-bezier(0.25, 1, 0.33, 1), color 0.45s cubic-bezier(0.25, 1, 0.33, 1), background-color 0.45s cubic-bezier(0.25, 1, 0.33, 1), box-shadow 0.45s cubic-bezier(0.25, 1, 0.33, 1)",
      }}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

