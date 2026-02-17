"use client";

import { X, FileIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

interface UploadProgressBarProps {
  uploads: UploadItem[];
  onClose: () => void;
  onCancel: (id: string) => void;
}

export default function UploadProgressBar({ uploads, onClose, onCancel }: UploadProgressBarProps) {
  if (uploads.length === 0) return null;

  const pending = uploads.filter(u => u.status === "pending").length;
  const uploading = uploads.filter(u => u.status === "uploading").length;
  const completed = uploads.filter(u => u.status === "completed").length;
  const failed = uploads.filter(u => u.status === "error").length;
  const total = uploads.length;

  const allCompleted = completed + failed === total;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
        <div className="flex items-center gap-2">
          {!allCompleted && <Loader2 size={16} className="animate-spin text-[var(--gnome-accent-blue)]" />}
          {allCompleted && <CheckCircle size={16} className="text-green-500" />}
          <span className="text-sm font-medium text-[var(--gnome-text-primary)]">
            {allCompleted ? "Upload Complete" : "Uploading..."}
          </span>
        </div>
        <button onClick={onClose} className="gnome-button-icon">
          <X size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 py-2 bg-[var(--gnome-bg-hover)] text-xs text-[var(--gnome-text-secondary)]">
        {completed} of {total} completed
        {pending > 0 && ` • ${pending} pending`}
        {uploading > 0 && ` • ${uploading} uploading`}
        {failed > 0 && ` • ${failed} failed`}
      </div>

      {/* Upload list */}
      <div className="max-h-64 overflow-y-auto">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center gap-3 px-4 py-2 border-b border-[var(--gnome-border)] last:border-b-0"
          >
            {/* Status icon */}
            <div className="flex-shrink-0">
              {upload.status === "completed" && (
                <CheckCircle size={16} className="text-green-500" />
              )}
              {upload.status === "uploading" && (
                <Loader2 size={16} className="animate-spin text-[var(--gnome-accent-blue)]" />
              )}
              {upload.status === "pending" && (
                <FileIcon size={16} className="text-[var(--gnome-text-secondary)]" />
              )}
              {upload.status === "error" && (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--gnome-text-primary)] truncate">
                {upload.file.name}
              </div>
              {upload.status === "uploading" && (
                <div className="mt-1 h-1 bg-[var(--gnome-bg-hover)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--gnome-accent-blue)] transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
              {upload.status === "error" && upload.error && (
                <div className="text-xs text-red-500 truncate">{upload.error}</div>
              )}
              {upload.status === "completed" && (
                <div className="text-xs text-green-500">Completed</div>
              )}
            </div>

            {/* Cancel button */}
            {(upload.status === "pending" || upload.status === "uploading") && (
              <button
                onClick={() => onCancel(upload.id)}
                className="flex-shrink-0 text-[var(--gnome-text-secondary)] hover:text-[var(--gnome-text-primary)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
