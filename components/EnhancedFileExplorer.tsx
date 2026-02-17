"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { CredentialsManager, type BucketConfig } from "@/lib/credentials";
import { NavigationHistoryManager } from "@/lib/navigation-history";
import FileOperationsModal from "./FileOperationsModal";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import { getFileIcon } from "./FileIcons";
import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import GridView from "./views/GridView";
import ListView from "./views/ListView";
import SettingsDialog from "./SettingsDialog";
import LoadingSpinner from "./LoadingSpinner";
import {
  Upload,
  FolderPlus,
  Copy,
  Scissors,
  Trash,
  Download,
  Edit3,
  Folder,
  RefreshCcw,
} from "lucide-react";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

interface ClipboardData {
  operation: "copy" | "cut";
  items: string[];
}

export default function EnhancedFileExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allFiles, setAllFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buckets, setBuckets] = useState<BucketConfig[]>([]);
  const [currentBucket, setCurrentBucket] = useState<string>("");
  const [operationType, setOperationType] = useState<"copy" | "move" | "rename">("copy");
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: FileItem } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const fileListRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateNavigationState = () => {
    if (currentBucket) {
      setCanGoBack(NavigationHistoryManager.canGoBack(currentBucket));
      setCanGoForward(NavigationHistoryManager.canGoForward(currentBucket));
    }
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

  // Initial setup - runs once on mount
  useEffect(() => {
    // Load buckets
    const availableBuckets = CredentialsManager.getBuckets();
    setBuckets(availableBuckets);

    // Set current bucket
    const currentBucketId = CredentialsManager.getCurrentBucketId();
    let activeBucketId = currentBucketId;

    if (currentBucketId) {
      setCurrentBucket(currentBucketId);
    } else if (availableBuckets.length > 0) {
      activeBucketId = availableBuckets[0].id;
      setCurrentBucket(activeBucketId);
      CredentialsManager.setCurrentBucket(activeBucketId);
    }

    // Initialize navigation history for the bucket
    if (activeBucketId) {
      const pathFromUrl = searchParams.get('path');
      const initialPath = pathFromUrl ? decodeURIComponent(pathFromUrl) : "";
      NavigationHistoryManager.initializeBucket(activeBucketId, initialPath);
      setCurrentPath(initialPath);
      updateNavigationState();
    }

    loadAllFiles();
  }, []);

  // Sync currentPath with URL changes (for browser back/forward)
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    // Browser back/forward navigation detected
    const pathFromUrl = searchParams.get('path');
    const decodedPath = pathFromUrl ? decodeURIComponent(pathFromUrl) : "";

    if (decodedPath !== currentPath) {
      setCurrentPath(decodedPath);
    }
  }, [searchParams]);

  useEffect(() => {
    organizeFolders(allFiles, currentPath);
    setSelectedItems(new Set());
  }, [currentPath, allFiles]);

  // Reload files when bucket changes
  useEffect(() => {
    if (currentBucket) {
      CredentialsManager.setCurrentBucket(currentBucket);

      // Initialize history for new bucket and get its last path
      NavigationHistoryManager.initializeBucket(currentBucket);
      const lastPath = NavigationHistoryManager.getCurrentPath(currentBucket);

      setCurrentPath(lastPath);
      updateNavigationState();
      loadAllFiles();
    }
  }, [currentBucket]);

  // Update navigation state when path changes
  useEffect(() => {
    updateNavigationState();
  }, [currentPath, currentBucket]);

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
    if (!currentBucket) return;

    isNavigatingRef.current = true;

    // Push to navigation history
    NavigationHistoryManager.pushPath(currentBucket, path);
    setCurrentPath(path);

    // Update URL with new path
    const params = new URLSearchParams(searchParams.toString());
    if (path) {
      params.set('path', encodeURIComponent(path));
    } else {
      params.delete('path');
    }
    router.push(`?${params.toString()}`, { scroll: false });

    // Update navigation state
    updateNavigationState();
  };

  const handleBack = () => {
    if (!currentBucket) return;

    const previousPath = NavigationHistoryManager.goBack(currentBucket);
    if (previousPath !== null) {
      isNavigatingRef.current = true;
      setCurrentPath(previousPath);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (previousPath) {
        params.set('path', encodeURIComponent(previousPath));
      } else {
        params.delete('path');
      }
      router.push(`?${params.toString()}`, { scroll: false });

      updateNavigationState();
    }
  };

  const handleForward = () => {
    if (!currentBucket) return;

    const nextPath = NavigationHistoryManager.goForward(currentBucket);
    if (nextPath !== null) {
      isNavigatingRef.current = true;
      setCurrentPath(nextPath);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (nextPath) {
        params.set('path', encodeURIComponent(nextPath));
      } else {
        params.delete('path');
      }
      router.push(`?${params.toString()}`, { scroll: false });

      updateNavigationState();
    }
  };

  const handleFolderDoubleClick = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    handleNavigate(newPath);
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

  const handleBucketChange = (bucketId: string) => {
    setCurrentBucket(bucketId);
    setCurrentPath(""); // Reset to root when changing buckets
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

      items.push({ separator: true } as ContextMenuItem);

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
    <div className="h-screen flex flex-col bg-[var(--gnome-bg-primary)]">
      <HeaderBar
        currentPath={currentPath}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigateHome={() => handleNavigate("")}
        buckets={buckets}
        currentBucket={currentBucket}
        onBucketChange={handleBucketChange}
        onBack={handleBack}
        onForward={handleForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          buckets={buckets}
          currentBucket={currentBucket}
          onBucketChange={handleBucketChange}
          onOpenSettings={() => setShowSettings(true)}
        />
        <main className="flex-1 overflow-y-auto" onContextMenu={(e) => handleContextMenu(e)}>
          {message && (
            <div className={`mx-4 mt-4 p-3 rounded border text-sm ${
              message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" :
              message.type === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" :
              "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            }`}>
              {message.text}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <div className="empty-text">Empty folder</div>
            </div>
          ) : viewMode === "grid" ? (
            <GridView
              files={files}
              selectedItems={selectedItems}
              onSelect={handleFileSelect}
              onDoubleClick={(item) => item.type === "folder" && handleFolderDoubleClick(item.name)}
              onContextMenu={handleContextMenu}
              clipboard={clipboard}
            />
          ) : (
            <ListView
              files={files}
              selectedItems={selectedItems}
              onSelect={handleFileSelect}
              onDoubleClick={(item) => item.type === "folder" && handleFolderDoubleClick(item.name)}
              onContextMenu={handleContextMenu}
              clipboard={clipboard}
            />
          )}
        </main>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <SettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onCredentialsUpdate={loadAllFiles}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal">
          <div className="modal-box">
            <div className="modal-header">Upload File</div>
            <div className="modal-body">
              <p className="text-sm mb-3 text-[var(--gnome-text-secondary)]">
                Upload to: {currentPath || "(root)"}
              </p>
              <input
                type="file"
                className="file-input w-full"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="modal-footer">
              <button className="gnome-button" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpload} disabled={!uploadFile}>
                Upload
              </button>
            </div>
          </div>
        </div>
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
