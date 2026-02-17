import {
  FileText,
  File,
  FileCode,
  FileJson,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Database,
  Settings,
  Lock,
  FileType,
  Folder,
  FolderOpen,
  Globe,
  Palette,
  Package,
  FileSpreadsheet,
  FileBox,
} from "lucide-react";

interface MaterialFileIconProps {
  fileName: string;
  isFolder?: boolean;
  isOpen?: boolean;
  size?: number;
  className?: string;
}

const getFileIconByExtension = (fileName: string, size: number = 16) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Programming Languages
  const codeIcons: Record<string, { color: string }> = {
    // JavaScript/TypeScript
    'js': { color: '#f7df1e' },
    'jsx': { color: '#61dafb' },
    'ts': { color: '#3178c6' },
    'tsx': { color: '#3178c6' },
    'mjs': { color: '#f7df1e' },
    'cjs': { color: '#f7df1e' },

    // Web
    'html': { color: '#e34c26' },
    'htm': { color: '#e34c26' },
    'css': { color: '#563d7c' },
    'scss': { color: '#cc6699' },
    'sass': { color: '#cc6699' },
    'less': { color: '#1d365d' },

    // Python
    'py': { color: '#3776ab' },
    'pyc': { color: '#3776ab' },
    'pyd': { color: '#3776ab' },
    'pyw': { color: '#3776ab' },

    // Java/Kotlin
    'java': { color: '#007396' },
    'class': { color: '#007396' },
    'jar': { color: '#007396' },
    'kt': { color: '#7f52ff' },
    'kts': { color: '#7f52ff' },

    // C/C++
    'c': { color: '#555555' },
    'cpp': { color: '#f34b7d' },
    'cc': { color: '#f34b7d' },
    'cxx': { color: '#f34b7d' },
    'h': { color: '#a074c4' },
    'hpp': { color: '#a074c4' },

    // C#
    'cs': { color: '#239120' },
    'csx': { color: '#239120' },

    // Go
    'go': { color: '#00add8' },

    // Rust
    'rs': { color: '#dea584' },

    // PHP
    'php': { color: '#777bb4' },

    // Ruby
    'rb': { color: '#cc342d' },
    'erb': { color: '#cc342d' },

    // Shell
    'sh': { color: '#89e051' },
    'bash': { color: '#89e051' },
    'zsh': { color: '#89e051' },
    'fish': { color: '#89e051' },

    // Swift
    'swift': { color: '#f05138' },

    // Dart
    'dart': { color: '#0175c2' },
  };

  if (codeIcons[ext]) {
    return <FileCode size={size} style={{ color: codeIcons[ext].color }} />;
  }

  // JSON/Config files
  if (['json', 'jsonc', 'json5'].includes(ext)) {
    return <FileJson size={size} style={{ color: '#f7df1e' }} />;
  }

  if (['xml', 'xaml', 'svg'].includes(ext)) {
    return <FileCode size={size} style={{ color: '#ff6600' }} />;
  }

  if (['yaml', 'yml'].includes(ext)) {
    return <FileCode size={size} style={{ color: '#cb171e' }} />;
  }

  if (['toml', 'ini', 'cfg', 'conf', 'config'].includes(ext)) {
    return <Settings size={size} style={{ color: '#6d6d6d' }} />;
  }

  // Markdown/Docs
  if (['md', 'markdown', 'mdx'].includes(ext)) {
    return <FileText size={size} style={{ color: '#083fa1' }} />;
  }

  if (['txt', 'text', 'log'].includes(ext)) {
    return <FileText size={size} style={{ color: '#6d6d6d' }} />;
  }

  if (['pdf'].includes(ext)) {
    return <FileText size={size} style={{ color: '#f40f02' }} />;
  }

  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
    return <FileText size={size} style={{ color: '#2b579a' }} />;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet size={size} style={{ color: '#217346' }} />;
  }

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff', 'svg'].includes(ext)) {
    return <Image size={size} style={{ color: '#a074c4' }} />;
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'm4v'].includes(ext)) {
    return <Video size={size} style={{ color: '#fd971f' }} />;
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) {
    return <Music size={size} style={{ color: '#f92672' }} />;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(ext)) {
    return <Archive size={size} style={{ color: '#eca020' }} />;
  }

  // Package files
  if (['pkg', 'deb', 'rpm', 'dmg', 'msi', 'exe'].includes(ext)) {
    return <Package size={size} style={{ color: '#e74c3c' }} />;
  }

  // Database
  if (['sql', 'db', 'sqlite', 'sqlite3', 'mdb'].includes(ext)) {
    return <Database size={size} style={{ color: '#f29111' }} />;
  }

  // Lock files
  if (fileName.includes('.lock') || ['lock'].includes(ext)) {
    return <Lock size={size} style={{ color: '#6d6d6d' }} />;
  }

  // Package manager files
  if (['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'].includes(fileName)) {
    return <Package size={size} style={{ color: '#cb3837' }} />;
  }

  if (['composer.json', 'composer.lock'].includes(fileName)) {
    return <Package size={size} style={{ color: '#777bb4' }} />;
  }

  if (['Gemfile', 'Gemfile.lock'].includes(fileName)) {
    return <Package size={size} style={{ color: '#cc342d' }} />;
  }

  // Config files
  if (['.env', '.env.local', '.env.production', '.env.development'].includes(fileName)) {
    return <Settings size={size} style={{ color: '#ffc107' }} />;
  }

  if (['.gitignore', '.gitattributes', '.gitmodules'].includes(fileName)) {
    return <FileCode size={size} style={{ color: '#f14e32' }} />;
  }

  if (['.dockerignore', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'].includes(fileName)) {
    return <FileBox size={size} style={{ color: '#2496ed' }} />;
  }

  if (['tsconfig.json', 'jsconfig.json'].includes(fileName)) {
    return <FileJson size={size} style={{ color: '#3178c6' }} />;
  }

  if (['next.config.js', 'next.config.mjs', 'next.config.ts'].includes(fileName)) {
    return <Settings size={size} style={{ color: '#000000' }} />;
  }

  if (['tailwind.config.js', 'tailwind.config.ts'].includes(fileName)) {
    return <Settings size={size} style={{ color: '#06b6d4' }} />;
  }

  if (['vite.config.js', 'vite.config.ts'].includes(fileName)) {
    return <Settings size={size} style={{ color: '#646cff' }} />;
  }

  if (['webpack.config.js'].includes(fileName)) {
    return <Settings size={size} style={{ color: '#8dd6f9' }} />;
  }

  // README
  if (fileName.toLowerCase().startsWith('readme')) {
    return <FileText size={size} style={{ color: '#3b82f6' }} />;
  }

  // LICENSE
  if (fileName.toLowerCase().startsWith('license')) {
    return <FileText size={size} style={{ color: '#f59e0b' }} />;
  }

  // Default file icon
  return <File size={size} style={{ color: 'var(--gnome-text-secondary)' }} />;
};

export default function MaterialFileIcon({
  fileName,
  isFolder = false,
  isOpen = false,
  size = 16,
  className = "",
}: MaterialFileIconProps) {
  if (isFolder) {
    // Folder icons with special colors for common folders
    const folderName = fileName.toLowerCase();
    const Icon = isOpen ? FolderOpen : Folder;

    const specialFolders: Record<string, string> = {
      'node_modules': '#8bc34a',
      'dist': '#ff9800',
      'build': '#ff9800',
      'out': '#ff9800',
      'public': '#9c27b0',
      'static': '#9c27b0',
      'assets': '#9c27b0',
      'src': '#3f51b5',
      'test': '#f44336',
      'tests': '#f44336',
      '__tests__': '#f44336',
      'docs': '#2196f3',
      'documentation': '#2196f3',
      'images': '#e91e63',
      'img': '#e91e63',
      'icons': '#e91e63',
      'components': '#00bcd4',
      'lib': '#009688',
      'utils': '#009688',
      'helpers': '#009688',
      'api': '#ff5722',
      'config': '#795548',
      'scripts': '#607d8b',
      '.git': '#f14e32',
      '.github': '#f14e32',
      '.vscode': '#007acc',
      '.idea': '#000000',
    };

    const color = specialFolders[folderName] || '#e9b96e';

    return <Icon size={size} style={{ color }} className={className} />;
  }

  return <span className={className}>{getFileIconByExtension(fileName, size)}</span>;
}

export function getFolderIcon(folderName: string, isOpen: boolean, size: number = 16) {
  return <MaterialFileIcon fileName={folderName} isFolder={true} isOpen={isOpen} size={size} />;
}

export function getFileIcon(fileName: string, size: number = 16) {
  return <MaterialFileIcon fileName={fileName} isFolder={false} size={size} />;
}
