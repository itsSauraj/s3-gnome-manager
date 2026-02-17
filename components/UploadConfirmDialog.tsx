"use client";

import { FileIcon, X } from "lucide-react";

interface UploadConfirmDialogProps {
  files: File[];
  currentPath: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UploadConfirmDialog({
  files,
  currentPath,
  onConfirm,
  onCancel,
}: UploadConfirmDialogProps) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded-lg w-[500px] max-h-[80vh] flex flex-col border border-[var(--gnome-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
          <h2 className="text-base font-medium text-[var(--gnome-text-primary)]">
            Confirm Upload
          </h2>
          <button onClick={onCancel} className="gnome-button-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="text-sm text-[var(--gnome-text-primary)] mb-1">
              Upload {files.length} file{files.length > 1 ? "s" : ""} to:
            </div>
            <div className="text-sm text-[var(--gnome-accent-blue)] font-mono">
              {currentPath || "(root)"}
            </div>
          </div>

          <div className="mb-4 p-3 bg-[var(--gnome-bg-hover)] rounded">
            <div className="text-xs text-[var(--gnome-text-secondary)]">
              Total size: {formatSize(totalSize)}
            </div>
          </div>

          {/* File list */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-[var(--gnome-bg-hover)] rounded"
              >
                <FileIcon size={16} className="text-[var(--gnome-text-secondary)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--gnome-text-primary)] truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-[var(--gnome-text-secondary)]">
                    {formatSize(file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--gnome-border)]">
          <button onClick={onCancel} className="gnome-button px-4 py-2">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="gnome-button px-4 py-2 bg-[var(--gnome-accent-blue)] text-white"
          >
            Upload {files.length} File{files.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
