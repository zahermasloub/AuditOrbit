import { clsx } from "clsx";
import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className={clsx(
        "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none",
        props.className
      )} 
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea 
      {...props} 
      className={clsx(
        "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-vertical",
        props.className
      )} 
    />
  );
}
