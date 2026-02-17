"use client";

import { AlertCircle, Info, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "danger" | "success";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const icons = {
    info: <Info size={24} className="text-[var(--gnome-accent-blue)]" />,
    warning: <AlertCircle size={24} className="text-orange-500" />,
    danger: <AlertCircle size={24} className="text-red-500" />,
    success: <CheckCircle size={24} className="text-green-500" />,
  };

  const buttonColors = {
    info: "bg-[var(--gnome-accent-blue)]",
    warning: "bg-orange-500",
    danger: "bg-red-500",
    success: "bg-green-500",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded-lg w-[400px] border border-[var(--gnome-border)] shadow-2xl">
        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{icons[type]}</div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-[var(--gnome-text-primary)] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[var(--gnome-text-secondary)]">{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--gnome-border)]">
          <button onClick={onCancel} className="gnome-button px-4 py-2">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`gnome-button px-4 py-2 ${buttonColors[type]} text-white`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
