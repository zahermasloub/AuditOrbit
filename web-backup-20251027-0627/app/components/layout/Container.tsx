"use client";
export default function Container({children,className=""}:{children:React.ReactNode;className?:string}) {
  return <div className={`mx-auto w-full max-w-6xl px-3 sm:px-4 ${className}`}>{children}</div>;
}
