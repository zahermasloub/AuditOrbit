"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ToastMsg = { id: string; kind?: "success"|"error"|"info"; text: string };

const ToastCtx = createContext<{ push:(m:Omit<ToastMsg,"id">)=>void }>({ push: ()=>{} });

export function ToastProvider({children}:{children:React.ReactNode}) {
  const [items,setItems] = useState<ToastMsg[]>([]);
  const push = (m:Omit<ToastMsg,"id">) => {
    const id = crypto.randomUUID();
    setItems(v => [...v, {id, ...m}]);
    setTimeout(()=> setItems(v => v.filter(x=>x.id!==id)), 3200);
  };
  const ctx = useMemo(()=>({push}),[]);
  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      {createPortal(
        <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rtl:left-4 rtl:right-auto">
          {items.map(i=>(
            <div key={i.id}
              className="min-w-[220px] rounded-lg px-3 py-2 text-sm shadow-ao-md bg-white dark:bg-neutral-900 border
                         data-[kind=success]:border-green-500/30 data-[kind=error]:border-red-500/30 data-[kind=info]:border-sky-500/30"
              data-kind={i.kind||"info"}>
              {i.text}
            </div>
          ))}
        </div>, document.body)}
    </ToastCtx.Provider>
  );
}

export function useToast(){ return useContext(ToastCtx); }
