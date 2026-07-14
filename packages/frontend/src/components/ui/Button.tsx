import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  secondary: "bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700",
  ghost: "hover:bg-gray-800 text-gray-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
