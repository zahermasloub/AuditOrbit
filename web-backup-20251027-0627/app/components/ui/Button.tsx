import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm border transition-shadow focus-visible:outline-none focus-visible:ring-2 ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primaryfg border-transparent hover:shadow-soft",
        outline: "bg-transparent text-fg border-border hover:bg-card",
        ghost:   "bg-transparent text-fg hover:bg-card border-transparent",
        danger:  "bg-danger text-white border-transparent hover:shadow-soft",
        success: "bg-success text-black border-transparent hover:shadow-soft",
      },
      size: { 
        sm: "px-3 py-1.5 text-xs", 
        md: "px-4 py-2", 
        lg: "px-5 py-3 text-base" 
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        ref={ref} 
        className={clsx(buttonVariants({ variant, size }), className)} 
        {...props} 
      />
    );
  }
);

Button.displayName = "Button";
