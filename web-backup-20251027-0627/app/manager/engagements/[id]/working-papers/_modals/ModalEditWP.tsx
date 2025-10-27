"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/app/lib/apiFetch";
import { Input, Textarea } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { useToast } from "@/app/components/toast/Toast";

const schema = z.object({
  id: z.string().uuid(),
  objective: z.string().min(1).max(500).optional(),
  procedure: z.string().min(1).max(2000).optional(),
  prepared_at: z.string().optional(),
  reviewed_at: z.string().optional(),
});

type FormT = z.infer<typeof schema>;

export default function ModalEditWP(
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
      return apiFetch(`/wp/${id}`, { method:"PATCH", body: JSON.stringify(patch) });
    },
    onSuccess: ()=>{
      push({kind:"success", text:"تم حفظ ورقة العمل / Working paper saved"});
      qc.invalidateQueries({ queryKey:["manager-working-papers", engagementId]});
      onCloseAction();
    },
    onError: ()=> push({kind:"error", text:"تعذر الحفظ / Failed to save"}),
  });

  const onDelete = async ()=>{
    if (!window.confirm("هل أنت متأكد من الحذف؟ / Are you sure you want to delete?")) return;
    try{
      await apiFetch(`/wp/${defaults.id}`, { method:"DELETE" });
      push({kind:"success", text:"تم الحذف / Deleted"});
      qc.invalidateQueries({ queryKey:["manager-working-papers", engagementId]});
      onCloseAction();
    }catch{ push({kind:"error", text:"تعذر الحذف / Delete failed"}); }
  };

  return (
    <Modal open={open} onOpenChangeAction={(o)=>!o && onCloseAction()} title="تعديل ورقة العمل / Edit Working Paper">
      <form onSubmit={handleSubmit((d)=>mutate.mutate(d))} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">الهدف / Objective</label>
          <Input {...register("objective")} />
          {errors.objective && <p className="text-sm text-danger mt-1">{errors.objective.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الإجراءات / Procedure</label>
          <Textarea rows={3} {...register("procedure")} />
          {errors.procedure && <p className="text-sm text-danger mt-1">{errors.procedure.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الإعداد / Prepared (ISO)</label>
            <Input type="datetime-local" {...register("prepared_at")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ المراجعة / Reviewed (ISO)</label>
            <Input type="datetime-local" {...register("reviewed_at")} />
          </div>
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
