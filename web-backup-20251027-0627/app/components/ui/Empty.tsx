"use client";
export default function Empty({title="لا توجد بيانات",hint}:{title?:string;hint?:string}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border p-10 text-center">
      <div className="text-2xl">🗂️</div>
      <div className="mt-2 font-semibold">{title}</div>
      {hint && <div className="mt-1 text-sm opacity-70">{hint}</div>}
    </div>
  );
}
