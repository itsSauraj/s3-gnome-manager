"use client";

import { useState, useEffect } from "react";
import type { FileMetadata } from "@/lib/types";

interface FileOperationsModalProps {
  operation: "copy" | "move" | "rename";
  selectedItems: string[];
  allFiles: FileMetadata[];
  currentPath: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function FileOperationsModal({
  operation,
  selectedItems,
  allFiles,
  currentPath,
  onClose,
  onSuccess,
  onError,
}: FileOperationsModalProps) {
  const [destinationPath, setDestinationPath] = useState(currentPath);
  const [newName, setNewName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    // Extract all unique folder paths
    const folderSet = new Set<string>([""]); // Include root
    allFiles.forEach((file) => {
      const parts = file.key.split("/");
      let path = "";
      for (let i = 0; i < parts.length - 1; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i];
        folderSet.add(path);
      }
    });
    setFolders(Array.from(folderSet).sort());

    // Set initial values
    if (operation === "rename" && selectedItems.length === 1) {
      const fileName = selectedItems[0].split("/").pop() || "";
      setNewName(fileName);
    }
  }, [allFiles, operation, selectedItems]);

  const handleExecute = async () => {
    if (operation === "rename" && !newName.trim()) {
      onError("Please enter a new name");
      return;
    }

    setProcessing(true);

    try {
      if (operation === "rename") {
        await handleRename();
      } else {
        await handleCopyOrMove();
      }
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleRename = async () => {
    if (selectedItems.length !== 1) throw new Error("Can only rename one item");

    const oldKey = selectedItems[0];
    const pathParts = oldKey.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newKey = pathParts.join("/");

    // Use batch move operation
    const response = await fetch("/api/files/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "move",
        files: [{ source: oldKey, destination: newKey }],
      }),
    });

    if (!response.ok) throw new Error("Rename failed");
  };

  const handleCopyOrMove = async () => {
    const destPath = destinationPath ? (destinationPath.endsWith("/") ? destinationPath : `${destinationPath}/`) : "";

    const files = selectedItems.map((source) => {
      const fileName = source.split("/").pop() || "";
      return {
        source,
        destination: `${destPath}${fileName}`,
      };
    });

    const response = await fetch("/api/files/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation,
        files,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.failed > 0) {
      throw new Error(result.message || `${operation} failed`);
    }
  };

  const getTitle = () => {
    switch (operation) {
      case "copy":
        return `Copy ${selectedItems.length} item(s)`;
      case "move":
        return `Move ${selectedItems.length} item(s)`;
      case "rename":
        return "Rename item";
    }
  };

  return (
    <div className="modal">
      <div className="modal-box" style={{ maxWidth: '600px' }}>
        <div className="modal-header">{getTitle()}</div>

        <div className="modal-body">
          {operation === "rename" ? (
            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                Current name:
              </label>
              <input
                type="text"
                className="w-full mb-4"
                value={selectedItems[0]?.split("/").pop() || ""}
                disabled
              />

              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                New name:
              </label>
              <input
                type="text"
                className="w-full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                Selected items:
              </label>
              <div className="bg-[var(--gnome-bg-sidebar)] rounded p-3 mb-4 max-h-32 overflow-y-auto border border-[var(--gnome-border)]">
                {selectedItems.map((item) => (
                  <div key={item} className="text-sm py-1 text-[var(--gnome-text-primary)]">
                    📄 {item}
                  </div>
                ))}
              </div>

              <label className="block text-sm font-medium text-[var(--gnome-text-primary)] mb-2">
                {operation === "copy" ? "Copy to:" : "Move to:"}
              </label>
              <select
                className="w-full"
                value={destinationPath}
                onChange={(e) => setDestinationPath(e.target.value)}
              >
                {folders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder === "" ? "(Root)" : folder}
                  </option>
                ))}
              </select>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {operation === "copy"
                    ? "Files will be copied to the selected folder"
                    : "Files will be moved to the selected folder"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="gnome-button" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleExecute}
            disabled={processing || (operation === "rename" && !newName.trim())}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="loading" style={{ width: 16, height: 16 }}></div>
                Processing...
              </span>
            ) : (
              operation.charAt(0).toUpperCase() + operation.slice(1)
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
