"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-teal to-teal-light text-white shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/30 hover:scale-[1.02]",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02]",
        outline: "border-2 border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:border-gold/60",
        secondary: "bg-gradient-to-r from-sand to-muted text-foreground shadow-md hover:scale-[1.02]",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gradient-to-r from-gold to-gold-light text-white shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02]",
        teal: "bg-gradient-to-r from-teal to-teal-light text-white shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/30 hover:scale-[1.02]",
        coral: "bg-gradient-to-r from-coral to-orange-400 text-white shadow-lg shadow-coral/25 hover:shadow-xl hover:shadow-coral/30 hover:scale-[1.02]",
        sage: "bg-gradient-to-r from-sage to-emerald-400 text-white shadow-lg shadow-sage/25 hover:shadow-xl hover:shadow-sage/30 hover:scale-[1.02]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };