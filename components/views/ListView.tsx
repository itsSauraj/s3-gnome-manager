"use client";

import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { getFileIcon } from "../FileIcons";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

interface ListViewProps {
  files: FileItem[];
  selectedItems: Set<string>;
  onSelect: (key: string, isCtrl: boolean) => void;
  onDoubleClick: (name: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export default function ListView({
  files,
  selectedItems,
  onSelect,
  onDoubleClick,
  onContextMenu
}: ListViewProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--gnome-text-secondary)]">
        <div className="text-6xl mb-4 opacity-30">📂</div>
        <div className="text-sm">Empty folder</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {files.map((item) => {
        const isSelected = selectedItems.has(item.key);

        return (
          <div
            key={item.key}
            className={`
              flex items-center gap-3 px-3 py-1.5 cursor-pointer
              ${isSelected
                ? 'bg-[var(--gnome-bg-selected)]'
                : 'hover:bg-[var(--gnome-bg-hover)]'
              }
            `}
            onClick={(e) => onSelect(item.key, e.ctrlKey || e.metaKey)}
            onDoubleClick={() => item.type === 'folder' && onDoubleClick(item.name)}
            onContextMenu={(e) => onContextMenu(e, item)}
          >
            {getFileIcon(item.name, item.type === 'folder', 20)}
            <span className="flex-1 text-sm text-[var(--gnome-text-primary)]">
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
