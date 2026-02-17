"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface InputDialogProps {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InputDialog({
  title,
  message,
  placeholder = "",
  defaultValue = "",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--gnome-bg-primary)] rounded-lg w-[400px] border border-[var(--gnome-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gnome-border)]">
          <h3 className="text-base font-medium text-[var(--gnome-text-primary)]">{title}</h3>
          <button onClick={onCancel} className="gnome-button-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-[var(--gnome-text-secondary)] mb-3">{message}</p>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-[var(--gnome-bg-primary)] border border-[var(--gnome-border)] rounded text-sm text-[var(--gnome-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gnome-accent-blue)]"
          />
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--gnome-border)]">
          <button onClick={onCancel} className="gnome-button px-4 py-2">
            {cancelText}
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={!value.trim()}
            className="gnome-button px-4 py-2 bg-[var(--gnome-accent-blue)] text-white disabled:opacity-50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
