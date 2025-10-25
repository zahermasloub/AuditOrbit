"use client";

import { useCallback, useRef, useState } from "react";

export type StorageDestination = {
  type: "s3" | "minio";
  bucket: string;
  prefix?: string;
};

type FileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

type FileDropzoneProps = {
  accept?: string[];
  maxSizeMB?: number;
  destination: StorageDestination;
  strategy?: "multipart" | "tus";
  onUploadedAction?: (meta: FileMeta) => void;
  onErrorAction?: (error: Error) => void;
  onPauseAction?: () => void;
  onResumeAction?: () => void;
};

export function FileDropzone({
  accept,
  maxSizeMB = 50,
  destination,
  strategy = "multipart",
  onUploadedAction,
  onErrorAction,
  onPauseAction,
  onResumeAction,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      if (accept && accept.length > 0 && !accept.some((pattern) => file.type === pattern || file.name.endsWith(pattern))) {
        throw new Error("نوع الملف غير مسموح به");
      }
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        throw new Error(`الحد الأقصى للحجم هو ${maxSizeMB} ميغابايت`);
      }
    },
    [accept, maxSizeMB],
  );

  const finishUpload = useCallback(
    (file: File) => {
      const meta: FileMeta = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
      setUploading(false);
      onUploadedAction?.(meta);
    },
    [onUploadedAction],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }
      const [file] = Array.from(files);
      try {
        setErrorMessage(null);
        validateFile(file);
        setUploading(true);
        // Placeholder for future integration with Uppy/Tus or presigned upload APIs.
        await new Promise((resolve) => setTimeout(resolve, 600));
        finishUpload(file);
      } catch (error) {
        setUploading(false);
        const err = error instanceof Error ? error : new Error("تعذر رفع الملف");
        setErrorMessage(err.message);
        onErrorAction?.(err);
      }
    },
    [finishUpload, onErrorAction, validateFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      void handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      void handleFiles(event.currentTarget.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="رفع الملفات"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? "border-[rgb(var(--ao-primary))] bg-[rgb(var(--ao-muted))] bg-opacity-20" : "border-[rgb(var(--ao-border))]"
        } ${uploading ? "opacity-70" : "opacity-100"}`}
      >
        <p className="text-sm text-[rgb(var(--ao-fg))]">
          اسحب الملفات هنا أو
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mx-1 text-[rgb(var(--ao-primary))] underline"
          >
            اختر ملفًا
          </button>
        </p>
        <p className="text-xs text-[rgb(var(--ao-muted))]">
          الوجهة: {destination.type.toUpperCase()} / {destination.bucket} — الإستراتيجية: {strategy.toUpperCase()}
        </p>
        {uploading ? <p className="mt-2 text-xs text-[rgb(var(--ao-primary))]">جاري الرفع...</p> : null}
      </div>

      {errorMessage ? <p className="text-xs text-[rgb(var(--ao-danger))]">{errorMessage}</p> : null}

      <div className="hidden">
        <input
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          accept={accept?.join(",")}
        />
        <button type="button" onClick={onPauseAction} />
        <button type="button" onClick={onResumeAction} />
      </div>
    </div>
  );
}
