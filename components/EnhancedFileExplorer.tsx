"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { CredentialsManager } from "@/lib/credentials";
import FolderTree from "./FolderTree";
import Breadcrumb from "./Breadcrumb";
import FileOperationsModal from "./FileOperationsModal";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import { getFileIcon } from "./FileIcons";
import {
  Upload,
  FolderPlus,
  Copy,
  Scissors,
  Trash,
  Download,
  RefreshCcw,
  LogOut,
  List,
  Grid,
  Edit3,
  Folder,
} from "@geist-ui/icons";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

interface ClipboardData {
  operation: "copy" | "cut";
  items: string[];
}

export default function EnhancedFileExplorer() {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allFiles, setAllFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [operationType, setOperationType] = useState<"copy" | "move" | "rename">("copy");
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: FileItem } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const fileListRef = useRef<HTMLDivElement>(null);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadAllFiles = async () => {
    setLoading(true);
    try {
      const headers = CredentialsManager.getHeaders();
      const response = await fetch("/api/files?maxKeys=10000", { headers });
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setAllFiles(data.files);
      organizeFolders(data.files, currentPath);
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  const organizeFolders = (allFilesList: FileMetadata[], path: string) => {
    const pathPrefix = path ? (path.endsWith("/") ? path : `${path}/`) : "";
    const items: FileItem[] = [];
    const folders = new Set<string>();

    allFilesList.forEach((file) => {
      if (pathPrefix && !file.key.startsWith(pathPrefix)) return;
      if (!pathPrefix && file.key.includes("/")) {
        const parts = file.key.split("/");
        if (parts.length > 1) {
          folders.add(parts[0]);
          return;
        }
      }

      const relativePath = pathPrefix ? file.key.substring(pathPrefix.length) : file.key;

      if (relativePath.includes("/")) {
        const folderName = relativePath.split("/")[0];
        folders.add(folderName);
      } else if (relativePath) {
        items.push({ ...file, type: "file", name: relativePath });
      }
    });

    folders.forEach((folderName) => {
      items.unshift({
        key: pathPrefix + folderName,
        type: "folder",
        name: folderName,
        size: 0,
        lastModified: new Date(),
      });
    });

    setFiles(items);
  };

  useEffect(() => {
    loadAllFiles();
  }, []);

  useEffect(() => {
    organizeFolders(allFiles, currentPath);
    setSelectedItems(new Set());
  }, [currentPath, allFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+C - Copy
      if (isCtrl && e.key === "c" && selectedItems.size > 0) {
        e.preventDefault();
        handleCopy();
      }

      // Ctrl+X - Cut
      if (isCtrl && e.key === "x" && selectedItems.size > 0) {
        e.preventDefault();
        handleCut();
      }

      // Ctrl+V - Paste
      if (isCtrl && e.key === "v" && clipboard) {
        e.preventDefault();
        handlePaste();
      }

      // Delete - Delete files
      if (e.key === "Delete" && selectedItems.size > 0) {
        e.preventDefault();
        handleDelete();
      }

      // F2 - Rename
      if (e.key === "F2" && selectedItems.size === 1) {
        e.preventDefault();
        setOperationType("rename");
        setShowOperationsModal(true);
      }

      // Ctrl+A - Select all
      if (isCtrl && e.key === "a") {
        e.preventDefault();
        const allKeys = new Set(files.map(f => f.key));
        setSelectedItems(allKeys);
      }

      // Escape - Clear selection
      if (e.key === "Escape") {
        setSelectedItems(new Set());
        setClipboard(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems, clipboard, files, currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleFolderDoubleClick = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  const handleFileSelect = (key: string, isCtrlClick: boolean) => {
    const newSelected = new Set(selectedItems);
    if (isCtrlClick) {
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
    } else {
      newSelected.clear();
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const handleCopy = () => {
    setClipboard({
      operation: "copy",
      items: Array.from(selectedItems),
    });
    showMessage("info", `${selectedItems.size} item(s) copied`);
  };

  const handleCut = () => {
    setClipboard({
      operation: "cut",
      items: Array.from(selectedItems),
    });
    showMessage("info", `${selectedItems.size} item(s) cut`);
  };

  const handlePaste = async () => {
    if (!clipboard) return;

    try {
      const destPath = currentPath ? (currentPath.endsWith("/") ? currentPath : `${currentPath}/`) : "";
      const files = clipboard.items.map((source) => {
        const fileName = source.split("/").pop() || "";
        return { source, destination: `${destPath}${fileName}` };
      });

      const headers = CredentialsManager.getHeaders();
      const response = await fetch("/api/files/batch", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: clipboard.operation === "cut" ? "move" : "copy",
          files,
        }),
      });

      if (!response.ok) throw new Error(`${clipboard.operation} failed`);

      showMessage("success", `${clipboard.operation === "cut" ? "Moved" : "Copied"} ${clipboard.items.length} item(s)`);
      if (clipboard.operation === "cut") {
        setClipboard(null);
      }
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const key = currentPath ? `${currentPath}/${uploadFile.name}` : uploadFile.name;
      formData.append("key", key);

      const headers = CredentialsManager.getHeaders();
      const response = await fetch("/api/files", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      showMessage("success", "File uploaded");
      setShowUploadModal(false);
      setUploadFile(null);
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} item(s)?`)) return;

    try {
      const headers = CredentialsManager.getHeaders();
      const deletePromises = Array.from(selectedItems).map((key) =>
        fetch(`/api/files?key=${encodeURIComponent(key)}`, { method: "DELETE", headers })
      );

      await Promise.all(deletePromises);
      showMessage("success", `Deleted ${selectedItems.size} item(s)`);
      setSelectedItems(new Set());
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Folder name:");
    if (!folderName) return;

    try {
      const key = currentPath ? `${currentPath}/${folderName}/.keep` : `${folderName}/.keep`;
      const formData = new FormData();
      formData.append("file", new Blob([""]), ".keep");
      formData.append("key", key);

      const headers = CredentialsManager.getHeaders();
      const response = await fetch("/api/files", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error("Failed");

      showMessage("success", "Folder created");
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const headers = CredentialsManager.getHeaders();
      const response = await fetch(`/api/files/download?key=${encodeURIComponent(key)}`, { headers });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showMessage("success", "Download started");
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleLogout = () => {
    if (confirm("Logout and clear credentials?")) {
      CredentialsManager.remove();
      window.location.reload();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item?: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    const item = contextMenu?.item;
    const items: ContextMenuItem[] = [];

    if (item) {
      if (item.type === "folder") {
        items.push({
          label: "Open",
          icon: <Folder size={16} />,
          onClick: () => handleFolderDoubleClick(item.name),
        });
      } else {
        items.push({
          label: "Download",
          icon: <Download size={16} />,
          onClick: () => handleDownload(item.key),
        });
      }

      items.push({ separator: true } as ContextMenuItem);

      items.push({
        label: "Copy",
        icon: <Copy size={16} />,
        shortcut: "Ctrl+C",
        onClick: () => {
          setSelectedItems(new Set([item.key]));
          handleCopy();
        },
      });

      items.push({
        label: "Cut",
        icon: <Scissors size={16} />,
        shortcut: "Ctrl+X",
        onClick: () => {
          setSelectedItems(new Set([item.key]));
          handleCut();
        },
      });

      items.push({
        label: "Rename",
        icon: <Edit3 size={16} />,
        shortcut: "F2",
        onClick: () => {
          setSelectedItems(new Set([item.key]));
          setOperationType("rename");
          setShowOperationsModal(true);
        },
      });

      items.push({ separator: true } as ContextMenuItem);

      items.push({
        label: "Delete",
        icon: <Trash size={16} />,
        shortcut: "Del",
        danger: true,
        onClick: () => {
          setSelectedItems(new Set([item.key]));
          handleDelete();
        },
      });
    } else {
      items.push({
        label: "Upload File",
        icon: <Upload size={16} />,
        onClick: () => setShowUploadModal(true),
      });

      items.push({
        label: "New Folder",
        icon: <FolderPlus size={16} />,
        onClick: handleCreateFolder,
      });

      if (clipboard) {
        items.push({ separator: true } as ContextMenuItem);
        items.push({
          label: `Paste ${clipboard.items.length} item(s)`,
          icon: <Copy size={16} />,
          shortcut: "Ctrl+V",
          onClick: handlePaste,
        });
      }

      items.push({ separator: true } as ContextMenuItem);

      items.push({
        label: "Refresh",
        icon: <RefreshCcw size={16} />,
        onClick: loadAllFiles,
      });
    }

    return items;
  };

  const getItemIcon = (item: FileItem) => {
    return getFileIcon(item.name, item.type === "folder");
  };

  const isItemInClipboard = (key: string) => {
    return clipboard?.items.includes(key);
  };

  const isItemCut = (key: string) => {
    return clipboard?.operation === "cut" && clipboard.items.includes(key);
  };

  return (
    <div
      className="h-screen flex flex-col bg-[#fafbfc] dark:bg-[#0d1117]"
      onContextMenu={(e) => handleContextMenu(e)}
    >
      {/* Header */}
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              R2 File Explorer
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List size={16} />
                List
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={16} />
                Grid
              </button>
            </div>
            <button
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
              onClick={loadAllFiles}
            >
              <RefreshCcw size={16} />
            </button>
            <button
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            Upload
          </button>
          <button
            onClick={handleCreateFolder}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FolderPlus size={16} />
            New Folder
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>

          {selectedItems.size > 0 && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                onClick={handleCut}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Scissors size={16} />
                Cut
              </button>
              {selectedItems.size === 1 && (
                <button
                  onClick={() => {
                    setOperationType("rename");
                    setShowOperationsModal(true);
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Rename
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash size={16} />
                Delete ({selectedItems.size})
              </button>
            </>
          )}

          {clipboard && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
              <button
                onClick={handlePaste}
                className="px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Paste {clipboard.items.length} item(s)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${
          message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800" :
          message.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800" :
          "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        }`}>
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-6 gap-4">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <FolderTree allFiles={allFiles} currentPath={currentPath} onNavigate={handleNavigate} />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

          <div
            ref={fileListRef}
            className="flex-1 overflow-y-auto p-6"
            onContextMenu={(e) => handleContextMenu(e)}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-6xl mb-4">📂</p>
                <p>Empty folder</p>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-1">
                {files.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      selectedItems.has(item.key)
                        ? "bg-blue-500/20 ring-2 ring-blue-500/50"
                        : "hover:bg-white/30 dark:hover:bg-gray-800/30"
                    } ${
                      isItemCut(item.key) ? "opacity-50" : ""
                    } ${
                      isItemInClipboard(item.key) && clipboard?.operation === "copy"
                        ? "ring-1 ring-green-500/50"
                        : ""
                    }`}
                    onClick={(e) => handleFileSelect(item.key, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => item.type === "folder" && handleFolderDoubleClick(item.name)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <div className="flex-shrink-0">{getItemIcon(item)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.type === "file" ? formatFileSize(item.size) : "Folder"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((item) => (
                  <div
                    key={item.key}
                    className={`bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedItems.has(item.key)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${isItemCut(item.key) ? "opacity-50" : ""} ${
                      isItemInClipboard(item.key) && clipboard?.operation === "copy"
                        ? "border-green-500"
                        : ""
                    }`}
                    onClick={(e) => handleFileSelect(item.key, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => item.type === "folder" && handleFolderDoubleClick(item.name)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-700 rounded-lg">
                        {getItemIcon(item)}
                      </div>
                      <p className="text-sm text-center truncate w-full font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.type === "file" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(item.size)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <dialog className="modal modal-open">
          <div className="modal-box glass-card">
            <h3 className="font-bold text-lg mb-4">Upload File</h3>
            <p className="text-sm mb-4">Upload to: {currentPath || "(root)"}</p>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={!uploadFile}>
                Upload
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Operations Modal */}
      {showOperationsModal && (
        <FileOperationsModal
          operation={operationType}
          selectedItems={Array.from(selectedItems)}
          allFiles={allFiles}
          currentPath={currentPath}
          onClose={() => setShowOperationsModal(false)}
          onSuccess={() => {
            setShowOperationsModal(false);
            setSelectedItems(new Set());
            loadAllFiles();
            showMessage("success", `${operationType} completed`);
          }}
          onError={(error) => showMessage("error", error)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
