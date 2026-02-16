import {
  FileText,
  File,
  FileImage,
  FileVideo,
  FileCode,
  FileArchive,
  Folder,
  Music,
  FileSpreadsheet,
} from "@geist-ui/icons";

export function getFileIcon(fileName: string, isFolder: boolean = false) {
  if (isFolder) {
    return <Folder size={20} className="text-blue-500" />;
  }

  const ext = fileName.split(".").pop()?.toLowerCase();

  const iconMap: Record<string, JSX.Element> = {
    // Images
    jpg: <FileImage size={20} className="text-purple-500" />,
    jpeg: <FileImage size={20} className="text-purple-500" />,
    png: <FileImage size={20} className="text-purple-500" />,
    gif: <FileImage size={20} className="text-purple-500" />,
    webp: <FileImage size={20} className="text-purple-500" />,
    svg: <FileImage size={20} className="text-purple-500" />,

    // Videos
    mp4: <FileVideo size={20} className="text-red-500" />,
    avi: <FileVideo size={20} className="text-red-500" />,
    mov: <FileVideo size={20} className="text-red-500" />,
    mkv: <FileVideo size={20} className="text-red-500" />,
    webm: <FileVideo size={20} className="text-red-500" />,

    // Audio
    mp3: <Music size={20} className="text-pink-500" />,
    wav: <Music size={20} className="text-pink-500" />,
    flac: <Music size={20} className="text-pink-500" />,
    ogg: <Music size={20} className="text-pink-500" />,

    // Documents
    pdf: <FileText size={20} className="text-red-600" />,
    doc: <FileText size={20} className="text-blue-600" />,
    docx: <FileText size={20} className="text-blue-600" />,
    txt: <FileText size={20} className="text-gray-600" />,

    // Spreadsheets
    xls: <FileSpreadsheet size={20} className="text-green-600" />,
    xlsx: <FileSpreadsheet size={20} className="text-green-600" />,
    csv: <FileSpreadsheet size={20} className="text-green-600" />,

    // Code
    js: <FileCode size={20} className="text-yellow-500" />,
    ts: <FileCode size={20} className="text-blue-500" />,
    tsx: <FileCode size={20} className="text-blue-500" />,
    jsx: <FileCode size={20} className="text-yellow-500" />,
    py: <FileCode size={20} className="text-blue-400" />,
    java: <FileCode size={20} className="text-orange-500" />,
    cpp: <FileCode size={20} className="text-blue-600" />,
    c: <FileCode size={20} className="text-blue-600" />,
    go: <FileCode size={20} className="text-cyan-500" />,
    rs: <FileCode size={20} className="text-orange-600" />,
    html: <FileCode size={20} className="text-orange-500" />,
    css: <FileCode size={20} className="text-blue-500" />,
    json: <FileCode size={20} className="text-yellow-600" />,

    // Archives
    zip: <FileArchive size={20} className="text-gray-600" />,
    rar: <FileArchive size={20} className="text-gray-600" />,
    "7z": <FileArchive size={20} className="text-gray-600" />,
    tar: <FileArchive size={20} className="text-gray-600" />,
    gz: <FileArchive size={20} className="text-gray-600" />,
  };

  return iconMap[ext || ""] || <File size={20} className="text-gray-500" />;
}
