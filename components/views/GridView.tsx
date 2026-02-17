"use client";

import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { getFileIcon } from "../FileIcons";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

interface GridViewProps {
  files: FileItem[];
  selectedItems: Set<string>;
  onSelect: (key: string, isCtrl: boolean) => void;
  onDoubleClick: (name: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export default function GridView({
  files,
  selectedItems,
  onSelect,
  onDoubleClick,
  onContextMenu
}: GridViewProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--gnome-text-secondary)]">
        <div className="text-6xl mb-4 opacity-30">📂</div>
        <div className="text-sm">Empty folder</div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, 96px)' }}
    >
      {files.map((item) => {
        const isSelected = selectedItems.has(item.key);

        return (
          <div
            key={item.key}
            className={`
              flex flex-col items-center gap-2 p-2 rounded cursor-pointer
              ${isSelected
                ? 'bg-[var(--gnome-bg-selected)]'
                : 'hover:bg-[var(--gnome-bg-hover)]'
              }
            `}
            onClick={(e) => onSelect(item.key, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => item.type === 'folder' && onDoubleClick(item.name)}
            onContextMenu={(e) => onContextMenu(e, item)}
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
