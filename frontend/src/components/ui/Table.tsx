import * as React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full text-sm border-collapse">{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[rgb(var(--muted))]/10 [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-medium [&_th]:text-[rgb(var(--muted))]">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="[&_td]:px-3 [&_td]:py-2 [&_td]:border-t [&_td]:border-[rgb(var(--border))]">
      {children}
    </tbody>
  );
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-[rgb(var(--muted))]/5 transition-colors">{children}</tr>;
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th>{children}</th>;
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td>{children}</td>;
}
