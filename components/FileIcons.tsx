import {
  FileText,
  File,
  Image as ImageIcon,
  Video,
  FileCode,
  Archive,
  Music,
  FileSpreadsheet,
  FileCog,
  FileJson,
} from 'lucide-react';
import { FolderIcon } from './icons/FolderIcon';

export function getFileIcon(fileName: string, isFolder: boolean = false, size: number = 20) {
  if (isFolder) {
    return <FolderIcon size={size} />;
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || '';
  const iconColor = 'var(--gnome-text-secondary)';
  const iconProps = { size, color: iconColor };

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(ext)) {
    return <ImageIcon {...iconProps} />;
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'm4v', 'mpg', 'mpeg'].includes(ext)) {
    return <Video {...iconProps} />;
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(ext)) {
    return <Music {...iconProps} />;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(ext)) {
    return <Archive {...iconProps} />;
  }

  // Spreadsheets
  if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet {...iconProps} />;
  }

  // Code files
  if ([
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
    'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'sh', 'bash',
    'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte'
  ].includes(ext)) {
    return <FileCode {...iconProps} />;
  }

  // JSON files
  if (['json', 'jsonl', 'yaml', 'yml', 'toml', 'xml'].includes(ext)) {
    return <FileJson {...iconProps} />;
  }

  // Config files
  if ([
    'config', 'conf', 'cfg', 'ini', 'env', 'properties',
    'lock', 'log', 'gitignore', 'dockerignore'
  ].includes(ext)) {
    return <FileCog {...iconProps} />;
  }

  // Documents
  if (['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown'].includes(ext)) {
    return <FileText {...iconProps} />;
  }

  // Default file icon
  return <File {...iconProps} />;
}
