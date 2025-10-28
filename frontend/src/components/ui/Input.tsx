import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input 
      {...rest} 
      className={`w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))] focus:outline-none ${className}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea 
      {...rest} 
      className={`w-full rounded-xl border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--accent-h)_var(--accent-s)_var(--accent-l))] focus:outline-none resize-vertical ${className}`}
    />
  );
}

export function Label({ children, htmlFor, className = "" }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
      {children}
    </label>
  );
}
