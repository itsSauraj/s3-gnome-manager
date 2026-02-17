"use client";

import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { getFileIcon } from "../FileIcons";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

interface ClipboardData {
  operation: "copy" | "cut";
  items: string[];
}

interface GridViewProps {
  files: FileItem[];
  selectedItems: Set<string>;
  onSelect: (key: string, isCtrl: boolean) => void;
  onDoubleClick: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item?: FileItem) => void;
  clipboard?: ClipboardData | null;
}

export default function GridView({
  files,
  selectedItems,
  onSelect,
  onDoubleClick,
  onContextMenu,
  clipboard
}: GridViewProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--gnome-text-secondary)]">
        <div className="text-6xl mb-4 opacity-30">📂</div>
        <div className="text-sm">Empty folder</div>
      </div>
    );
  }

  const isItemInClipboard = (key: string) => {
    return clipboard?.items.includes(key);
  };

  const isItemCut = (key: string) => {
    return clipboard?.operation === "cut" && clipboard.items.includes(key);
  };

  return (
    <div
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, 96px)' }}
    >
      {files.map((item) => {
        const isSelected = selectedItems.has(item.key);
        const isCut = isItemCut(item.key);

        return (
          <div
            key={item.key}
            className={`
              flex flex-col items-center gap-2 p-2 rounded cursor-pointer
              ${isSelected
                ? 'bg-[var(--gnome-bg-selected)]'
                : 'hover:bg-[var(--gnome-bg-hover)]'
              }
              ${isCut ? 'opacity-50' : ''}
            `}
            onClick={(e) => onSelect(item.key, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => onDoubleClick(item)}
            onContextMenu={(e) => {
              e.stopPropagation();
              onContextMenu(e, item);
            }}
          >
            {getFileIcon(item.name, item.type === 'folder', 48)}
            <span className="text-xs text-center break-words w-full text-[var(--gnome-text-primary)]">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
