"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/app/lib/apiFetch";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { useToast } from "@/app/components/toast/Toast";

const schema = z.object({
  id: z.string().uuid(),
  method: z.enum(["random","systematic","high_value"]).optional(),
  size: z.number().int().positive().max(100000).optional(),
});

type FormT = z.infer<typeof schema>;

export default function ModalEditSample(
  {open,onCloseAction,defaults,engagementId}:{open:boolean;onCloseAction:()=>void;defaults:FormT;engagementId:string}
){
  const { push } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FormT>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const mutate = useMutation({
    mutationFn: async (data:FormT)=>{
      const {id, ...patch} = data;
      return apiFetch(`/samples/${id}`, { method:"PATCH", body: JSON.stringify(patch) });
    },
    onSuccess: ()=>{
      push({kind:"success", text:"تم حفظ العينة / Sample saved"});
      qc.invalidateQueries({ queryKey:["manager-samples", engagementId]});
      onCloseAction();
    },
    onError: ()=> push({kind:"error", text:"تعذر الحفظ / Failed to save"}),
  });

  const onDelete = async ()=>{
    if (!window.confirm("هل أنت متأكد من الحذف؟ / Are you sure you want to delete?")) return;
    try{
      await apiFetch(`/samples/${defaults.id}`, { method:"DELETE" });
      push({kind:"success", text:"تم الحذف / Deleted"});
      qc.invalidateQueries({ queryKey:["manager-samples", engagementId]});
      onCloseAction();
    }catch{ push({kind:"error", text:"تعذر الحذف / Delete failed"}); }
  };

  return (
    <Modal open={open} onOpenChangeAction={(o)=>!o && onCloseAction()} title="تعديل العينة / Edit Sample">
      <form onSubmit={handleSubmit((d)=>mutate.mutate(d))} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">الطريقة / Method</label>
          <select className="w-full rounded-lg border border-[rgb(var(--ao-border))] px-3 py-2 bg-white dark:bg-neutral-900"
            {...register("method")}>
            <option value="random">random / عشوائي</option>
            <option value="systematic">systematic / منهجي</option>
            <option value="high_value">high_value / قيمة-عالية</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الحجم / Size</label>
          <Input type="number" {...register("size", { valueAsNumber:true })} />
          {errors.size && <p className="text-sm text-danger mt-1">{errors.size.message}</p>}
        </div>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="danger" onClick={onDelete}>حذف / Delete</Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCloseAction}>إلغاء / Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>حفظ / Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
