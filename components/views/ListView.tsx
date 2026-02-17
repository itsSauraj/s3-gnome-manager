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

interface ListViewProps {
  files: FileItem[];
  selectedItems: Set<string>;
  onSelect: (key: string, isCtrl: boolean) => void;
  onDoubleClick: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item?: FileItem) => void;
  clipboard?: ClipboardData | null;
}

export default function ListView({
  files,
  selectedItems,
  onSelect,
  onDoubleClick,
  onContextMenu,
  clipboard
}: ListViewProps) {
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
    <div className="flex flex-col">
      {files.map((item) => {
        const isSelected = selectedItems.has(item.key);
        const isCut = isItemCut(item.key);

        return (
          <div
            key={item.key}
            title={item.name}
            className={`
              flex items-center gap-3 px-3 py-1.5 cursor-pointer
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
            {getFileIcon(item.name, item.type === 'folder', 20)}
            <span className="flex-1 text-sm text-[var(--gnome-text-primary)] truncate min-w-0" title={item.name}>
              {item.name}
            </span>
            <span className="text-xs text-[var(--gnome-text-secondary)] w-24 text-right">
              {item.type === 'file' ? formatFileSize(item.size) : 'Folder'}
            </span>
            <span className="text-xs text-[var(--gnome-text-secondary)] w-32">
              {new Date(item.lastModified).toLocaleDateString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
