import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-apple text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-glass",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary shadow-apple hover:shadow-apple-lg transform hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-apple hover:shadow-apple-lg transform hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-border/40 bg-background/20 backdrop-blur-glass hover:bg-accent/30 hover:text-accent-foreground shadow-apple transform hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary/60 text-secondary-foreground hover:bg-secondary/80 shadow-apple transform hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground transform hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline transform hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-apple px-4",
        lg: "h-14 rounded-apple-lg px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
