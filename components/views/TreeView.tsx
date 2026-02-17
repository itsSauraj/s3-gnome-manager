"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import MaterialFileIcon from "../MaterialFileIcons";
import { formatFileSize, formatDate } from "@/lib/file-utils";

export interface TreeNode {
  key: string;
  name: string;
  type: "file" | "folder";
  size: number;
  lastModified: Date;
  children?: TreeNode[];
  level: number;
}

interface TreeViewProps {
  files: Array<{
    key: string;
    name: string;
    type: "file" | "folder";
    size: number;
    lastModified: Date;
  }>;
  selectedItems: Set<string>;
  onSelect: (key: string, isCtrlClick: boolean) => void;
  onDoubleClick: (item: { key: string; type: string; name: string }) => void;
  onContextMenu: (e: React.MouseEvent, item: any) => void;
  clipboard: { operation: "copy" | "cut"; items: string[] } | null;
  onFolderExpand?: (folderKey: string) => Promise<TreeNode[]>;
}

export default function TreeView({
  files,
  selectedItems,
  onSelect,
  onDoubleClick,
  onContextMenu,
  clipboard,
  onFolderExpand,
}: TreeViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Map<string, TreeNode[]>>(new Map());

  const toggleFolder = async (folderKey: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (expandedFolders.has(folderKey)) {
      // Collapse
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.delete(folderKey);
        return next;
      });
    } else {
      // Expand
      setExpandedFolders((prev) => new Set(prev).add(folderKey));

      // Load folder contents if not already loaded
      if (onFolderExpand && !folderContents.has(folderKey)) {
        const contents = await onFolderExpand(folderKey);
        setFolderContents((prev) => new Map(prev).set(folderKey, contents));
      }
    }
  };

  const renderTreeNode = (node: TreeNode, index: number) => {
    const isSelected = selectedItems.has(node.key);
    const isExpanded = expandedFolders.has(node.key);
    const isFolder = node.type === "folder";
    const isCut = clipboard?.operation === "cut" && clipboard.items.includes(node.key);
    const indentWidth = node.level * 16;

    return (
      <div key={node.key}>
        <div
          className={`
            flex items-center px-3 py-1 cursor-pointer text-sm
            hover:bg-[var(--gnome-bg-hover)]
            ${isSelected ? "bg-[var(--gnome-bg-selected)] text-[var(--gnome-accent-blue)]" : ""}
            ${isCut ? "opacity-50" : ""}
          `}
          style={{ paddingLeft: `${indentWidth + 12}px` }}
          onClick={(e) => {
            if (isFolder) {
              toggleFolder(node.key, e);
            } else {
              onSelect(node.key, e.ctrlKey || e.metaKey);
            }
          }}
          onDoubleClick={() => !isFolder && onDoubleClick(node)}
          onContextMenu={(e) => onContextMenu(e, node)}
          title={node.name}
        >
          {/* Expand/Collapse arrow for folders */}
          {isFolder && (
            <button
              onClick={(e) => toggleFolder(node.key, e)}
              className="flex-shrink-0 mr-1 hover:bg-[var(--gnome-bg-hover)] rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-[var(--gnome-text-secondary)]" />
              ) : (
                <ChevronRight size={14} className="text-[var(--gnome-text-secondary)]" />
              )}
            </button>
          )}

          {/* Icon */}
          <span className="flex-shrink-0 mr-2 flex items-center">
            <MaterialFileIcon
              fileName={node.name}
              isFolder={isFolder}
              isOpen={isExpanded}
              size={16}
            />
          </span>

          {/* File/Folder name */}
          <span className="flex-1 truncate">{node.name}</span>

          {/* File size (only for files) */}
          {!isFolder && (
            <span className="text-xs text-[var(--gnome-text-secondary)] ml-2 flex-shrink-0">
              {formatFileSize(node.size)}
            </span>
          )}

          {/* Last modified date */}
          <span className="text-xs text-[var(--gnome-text-secondary)] ml-3 flex-shrink-0 w-32">
            {formatDate(node.lastModified)}
          </span>
        </div>

        {/* Render children if expanded */}
        {isFolder && isExpanded && folderContents.has(node.key) && (
          <div>
            {folderContents.get(node.key)!.map((child, idx) => renderTreeNode(child, idx))}
          </div>
        )}
      </div>
    );
  };

  // Convert flat file list to tree nodes (top level only)
  const treeNodes: TreeNode[] = files.map((file) => ({
    ...file,
    level: 0,
    children: [],
  }));

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center px-3 py-2 text-xs font-medium text-[var(--gnome-text-secondary)] border-b border-[var(--gnome-border)] sticky top-0 bg-[var(--gnome-bg-primary)]">
        <span className="flex-1">Name</span>
        <span className="w-20 text-right">Size</span>
        <span className="w-32 ml-3">Modified</span>
      </div>

      {/* Tree items */}
      <div className="overflow-y-auto">
        {treeNodes.map((node, index) => renderTreeNode(node, index))}
      </div>
    </div>
  );
}
