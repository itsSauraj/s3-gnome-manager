"use client";

import { useState, useEffect } from "react";
import type { FileMetadata } from "@/lib/types";

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

interface FolderTreeProps {
  allFiles: FileMetadata[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function FolderTree({ allFiles, currentPath, onNavigate }: FolderTreeProps) {
  const [folderStructure, setFolderStructure] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));

  useEffect(() => {
    buildFolderStructure();
  }, [allFiles]);

  const buildFolderStructure = () => {
    const root: FolderNode = { name: "Root", path: "", children: [] };
    const folderMap = new Map<string, FolderNode>();
    folderMap.set("", root);

    // Extract all unique folder paths
    const folderPaths = new Set<string>();
    allFiles.forEach((file) => {
      const parts = file.key.split("/");
      let currentPath = "";

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        folderPaths.add(currentPath);
      }
    });

    // Build folder hierarchy
    Array.from(folderPaths)
      .sort()
      .forEach((folderPath) => {
        const parts = folderPath.split("/");
        const folderName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join("/");

        if (!folderMap.has(folderPath)) {
          const node: FolderNode = {
            name: folderName,
            path: folderPath,
            children: [],
          };
          folderMap.set(folderPath, node);

          const parent = folderMap.get(parentPath);
          if (parent) {
            parent.children.push(node);
          }
        }
      });

    setFolderStructure([root]);
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const isSelected = currentPath === folder.path;
    const hasChildren = folder.children.length > 0;

    return (
      <div key={folder.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-base-300 cursor-pointer ${
            isSelected ? "bg-primary text-primary-content" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onNavigate(folder.path)}
        >
          {hasChildren && (
            <button
              className="btn btn-xs btn-ghost p-0 min-h-0 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.path);
              }}
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {!hasChildren && <span className="w-4"></span>}
          <span className="text-lg">📁</span>
          <span className="text-sm truncate flex-1">{folder.name}</span>
        </div>
        {isExpanded &&
          folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-2">
      <div className="text-xs font-bold text-base-content/60 px-2 py-1 mb-2">
        FOLDERS
      </div>
      {folderStructure.map((folder) => renderFolder(folder))}
    </div>
  );
}
