import * as React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))] text-white border-transparent hover:opacity-90",
  outline: "bg-transparent text-[rgb(var(--fg))] border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))]",
  ghost: "bg-transparent text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface))] border-transparent",
  danger: "bg-[rgb(var(--danger))] text-white border-transparent hover:opacity-90",
  success: "bg-[rgb(var(--success))] text-white border-transparent hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
