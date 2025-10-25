import { clsx } from "clsx";

export function Card({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div 
      className={clsx(
        "bg-card text-cardfg border border-border rounded-2xl p-4 shadow-soft", 
        className
      )}
    >
      {children}
    </div>
  );
}
