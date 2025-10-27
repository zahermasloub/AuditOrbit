"use client";
export default function SectionTitle({title,sub}:{title:string;sub?:string}) {
  return (
    <header className="mb-3 sm:mb-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-1 text-sm opacity-70">{sub}</p>}
    </header>
  );
}
