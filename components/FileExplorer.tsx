"use client";

import { useState, useEffect } from "react";
import type { FileMetadata } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import FolderTree from "./FolderTree";
import Breadcrumb from "./Breadcrumb";
import FileOperationsModal from "./FileOperationsModal";

interface FileItem extends FileMetadata {
  type: "file" | "folder";
  name: string;
}

export default function FileExplorer() {
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
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Load all files
  const loadAllFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/files?maxKeys=10000");
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

  // Organize files into folders and files for current path
  const organizeFolders = (allFilesList: FileMetadata[], path: string) => {
    const pathPrefix = path ? (path.endsWith("/") ? path : `${path}/`) : "";
    const items: FileItem[] = [];
    const folders = new Set<string>();

    allFilesList.forEach((file) => {
      // Skip files not in current path
      if (pathPrefix && !file.key.startsWith(pathPrefix)) return;
      if (!pathPrefix && file.key.includes("/")) {
        // Root level - only show items without "/" or first-level folders
        const parts = file.key.split("/");
        if (parts.length > 1) {
          folders.add(parts[0]);
          return;
        }
      }

      const relativePath = pathPrefix ? file.key.substring(pathPrefix.length) : file.key;

      if (relativePath.includes("/")) {
        // It's in a subfolder
        const folderName = relativePath.split("/")[0];
        folders.add(folderName);
      } else if (relativePath) {
        // It's a file in current directory
        items.push({
          ...file,
          type: "file",
          name: relativePath,
        });
      }
    });

    // Add folders
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

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const key = currentPath ? `${currentPath}/${uploadFile.name}` : uploadFile.name;
      formData.append("key", key);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      showMessage("success", "File uploaded successfully");
      setShowUploadModal(false);
      setUploadFile(null);
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Upload error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Delete ${selectedItems.size} item(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedItems).map((key) =>
        fetch(`/api/files?key=${encodeURIComponent(key)}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);
      showMessage("success", `Deleted ${selectedItems.size} item(s)`);
      setSelectedItems(new Set());
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Delete error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      // Create a placeholder file to create the folder
      const key = currentPath ? `${currentPath}/${folderName}/.keep` : `${folderName}/.keep`;
      const formData = new FormData();
      formData.append("file", new Blob([""]), ".keep");
      formData.append("key", key);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create folder");

      showMessage("success", "Folder created");
      await loadAllFiles();
    } catch (error) {
      showMessage("error", `Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const response = await fetch(`/api/files/download?key=${encodeURIComponent(key)}`);
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
      showMessage("error", `Download error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === "folder") {
      return "📁";
    }
    const ext = item.name.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📽️",
      pptx: "📽️",
      txt: "📃",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎬",
      mp3: "🎵",
      zip: "📦",
      rar: "📦",
    };
    return iconMap[ext || ""] || "📄";
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-200 border-b border-base-300">
        <div className="flex-1">
          <h1 className="text-xl font-bold px-4">R2 File Explorer</h1>
        </div>
        <div className="flex-none gap-2">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${viewMode === "list" ? "btn-active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰ List
            </button>
            <button
              className={`btn btn-sm ${viewMode === "grid" ? "btn-active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ⊞ Grid
            </button>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={loadAllFiles}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-base-200 border-b border-base-300 p-2 flex gap-2">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          ⬆️ Upload
        </button>
        <button className="btn btn-sm" onClick={handleCreateFolder}>
          📁 New Folder
        </button>
        {selectedItems.size > 0 && (
          <>
            <button
              className="btn btn-sm"
              onClick={() => {
                setOperationType("copy");
                setShowOperationsModal(true);
              }}
            >
              📋 Copy
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setOperationType("move");
                setShowOperationsModal(true);
              }}
            >
              ✂️ Move
            </button>
            <button className="btn btn-sm btn-error" onClick={handleDelete}>
              🗑️ Delete ({selectedItems.size})
            </button>
          </>
        )}
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type} mx-4 mt-4`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folder Tree */}
        <div className="w-64 bg-base-200 border-r border-base-300 overflow-y-auto">
          <FolderTree
            allFiles={allFiles}
            currentPath={currentPath}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

          {/* Files/Folders View */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center text-base-content/60 mt-8">
                <p className="text-4xl mb-4">📂</p>
                <p>This folder is empty</p>
              </div>
            ) : viewMode === "list" ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item) => (
                    <tr
                      key={item.key}
                      className={`hover cursor-pointer ${selectedItems.has(item.key) ? "active" : ""}`}
                      onClick={(e) => handleFileSelect(item.key, e.ctrlKey || e.metaKey)}
                      onDoubleClick={() =>
                        item.type === "folder" && handleFolderDoubleClick(item.name)
                      }
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getFileIcon(item)}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td>{item.type === "file" ? formatFileSize(item.size) : "—"}</td>
                      <td>{new Date(item.lastModified).toLocaleString()}</td>
                      <td>
                        <div className="flex gap-1">
                          {item.type === "file" && (
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.key);
                              }}
                            >
                              ⬇️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((item) => (
                  <div
                    key={item.key}
                    className={`card bg-base-200 hover:bg-base-300 cursor-pointer p-4 ${selectedItems.has(item.key) ? "ring-2 ring-primary" : ""}`}
                    onClick={(e) => handleFileSelect(item.key, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() =>
                      item.type === "folder" && handleFolderDoubleClick(item.name)
                    }
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-5xl">{getFileIcon(item)}</span>
                      <p className="text-sm text-center truncate w-full" title={item.name}>
                        {item.name}
                      </p>
                      {item.type === "file" && (
                        <p className="text-xs text-base-content/60">
                          {formatFileSize(item.size)}
                        </p>
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Upload File</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Upload to: {currentPath || "(root)"}
            </p>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!uploadFile}
              >
                Upload
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowUploadModal(false)}>close</button>
          </form>
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
    </div>
  );
}
