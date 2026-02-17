# S3 Explorer

A modern, feature-rich file manager for Amazon S3 and any S3-compatible storage (Cloudflare R2, MinIO, DigitalOcean Spaces, etc.), built with Next.js 16 and designed with GNOME Files (Nautilus) aesthetics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)
![React](https://img.shields.io/badge/React-19.2.3-blue.svg)

## Features

### 🎨 Modern UI
- **GNOME-inspired Design**: Flat, minimal aesthetic matching Ubuntu's GNOME Files
- **VS Code Material Icons**: 100+ file type icons with smart color coding
- **Dark/Light Theme**: Seamless theme switching with next-themes
- **Responsive Layout**: Header, sidebar, and main content area

### 📁 File Management
- **Multiple View Modes**: Grid and List views with toggle
- **Drag & Drop Upload**: Multi-file upload with Google Drive-style progress tracking
- **File Operations**: Copy, Cut, Paste, Delete, Rename, Download
- **Folder Operations**: Create folders, navigate folder structure
- **Context Menus**: Right-click menus for quick actions
- **Keyboard Shortcuts**:
  - `Ctrl+C` / `Cmd+C`: Copy
  - `Ctrl+X` / `Cmd+X`: Cut
  - `Ctrl+V` / `Cmd+V`: Paste
  - `Ctrl+A` / `Cmd+A`: Select all
  - `Delete`: Delete selected items
  - `F2`: Rename
  - `Escape`: Clear selection

### 🪣 Bucket Management
- **Multiple Buckets**: Connect to multiple S3 buckets
- **Bucket Groups**: Organize buckets into Chrome-style groups
- **Custom Bucket Colors**: Color-code your buckets
- **Custom Bucket Titles**: Rename buckets for display
- **Quick Bucket Switching**: `Ctrl+1` through `Ctrl+9` shortcuts
- **Bucket Context Menu**:
  - Edit Title
  - Choose Color
  - Move to Group
  - Create New Group
  - Remove from Group
  - Eject (disconnect)

### 🗂️ Group Management
- **Visual Groups**: Chrome-style tab grouping for buckets
- **Group Colors**: Color-code groups
- **Drag & Drop**: Drag buckets into groups
- **Group Context Menu**:
  - Rename Group
  - Change Color
  - Delete Group

### 🚀 Advanced Features
- **Browser Navigation**: Full back/forward support with URL persistence
- **Upload Progress**: Real-time upload tracking with status indicators
- **Browser Notifications**: Upload completion notifications
- **Multi-select**: Select multiple files/folders for batch operations
- **Custom Modals**: GNOME-styled dialogs for all confirmations
- **Persistent State**: All settings saved to localStorage

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS
- **Icons**: Lucide React (Material Design style)
- **Theme**: next-themes
- **Storage**: AWS S3 SDK v3 (works with any S3-compatible service)
- **SDK**: AWS SDK v3

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- S3-compatible storage account with:
  - S3 bucket(s)
  - Access Key ID
  - Secret Access Key
  - S3 endpoint URL

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd r2
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-Time Setup

1. On first launch, you'll see the login screen
2. Click "Add Storage Connection"
3. Enter your S3 credentials:
   - **Connection Name**: A friendly name for this bucket
   - **S3 Endpoint**: Your S3 endpoint URL (e.g., `https://s3.amazonaws.com` or `https://xxxxx.r2.cloudflarestorage.com`)
   - **Access Key ID**: Your S3 access key
   - **Secret Access Key**: Your S3 secret key
   - **Bucket Name**: The name of your S3 bucket
4. Click "Add Connection" to test and save
5. Start managing your files!

## Usage Guide

### Managing Files

**Upload Files:**
- Click "Upload File" button in the header
- Or drag and drop files directly into the main area
- Multiple files supported
- Progress tracking for each file

**Create Folders:**
- Click "New Folder" button
- Or right-click in empty space → "New Folder"
- Enter folder name and confirm

**Copy/Move Files:**
1. Select file(s)
2. Press `Ctrl+C` to copy or `Ctrl+X` to cut
3. Navigate to destination folder
4. Press `Ctrl+V` to paste

**Delete Files:**
- Select file(s) and press `Delete`
- Or right-click → "Delete"
- Confirm deletion

**Download Files:**
- Right-click on a file → "Download"

**Rename Files:**
- Select a single file and press `F2`
- Or right-click → "Rename"

### Managing Buckets

**Add New Bucket:**
1. Click "Settings" in the sidebar
2. Click "Add Storage Connection"
3. Enter credentials and test connection
4. Save

**Switch Buckets:**
- Click on bucket in sidebar
- Or use `Ctrl+1` through `Ctrl+9` for first 9 buckets

**Organize with Groups:**
1. Right-click on a bucket
2. Select "Move to Group" → Choose group
3. Or "Create New Group" to make a new group

**Customize Buckets:**
- Right-click bucket → "Edit Title" for custom name
- Right-click bucket → "Choose Color" for color coding

**Manage Groups:**
- Right-click on group header
- Rename, change color, or delete group

### Navigation

**Browse Folders:**
- Double-click folders to navigate into them
- Use browser back/forward buttons
- Click "Home" button to return to root

**Path Persistence:**
- Current path is saved in URL
- Browser back/forward fully supported
- Navigation history per bucket

## Project Structure

```
r2/
├── app/
│   ├── api/                    # API routes for S3 operations
│   │   └── files/             # File operations endpoints
│   ├── globals.css            # GNOME theme CSS variables
│   ├── layout.tsx             # Root layout with theme provider
│   └── page.tsx               # Main page
├── components/
│   ├── views/                 # View components
│   │   ├── GridView.tsx       # Grid layout view
│   │   ├── ListView.tsx       # List layout view
│   │   └── TreeView.tsx       # Tree view (VS Code style)
│   ├── icons/                 # Icon components
│   │   └── FolderIcon.tsx     # Custom folder icon
│   ├── ColorPicker.tsx        # Color selection dialog
│   ├── ConfirmDialog.tsx      # Confirmation modal
│   ├── ContextMenu.tsx        # Right-click context menu
│   ├── EnhancedFileExplorer.tsx    # Main file explorer
│   ├── EnhancedSidebar.tsx    # Bucket sidebar with groups
│   ├── FileIcons.tsx          # Legacy icon system
│   ├── FileOperationsModal.tsx     # File operations dialog
│   ├── HeaderBar.tsx          # Top navigation bar
│   ├── InputDialog.tsx        # Text input modal
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── LoginScreen.tsx        # Initial login/setup screen
│   ├── MaterialFileIcons.tsx  # VS Code Material Icons
│   ├── SettingsDialog.tsx     # Settings/bucket management
│   ├── ThemeProvider.tsx      # Theme context provider
│   ├── UploadConfirmDialog.tsx     # Upload confirmation
│   └── UploadProgressBar.tsx  # Upload progress tracker
├── lib/
│   ├── credentials.ts         # Bucket credentials manager
│   ├── file-utils.ts          # File utility functions
│   ├── navigation-history.ts  # Browser navigation manager
│   ├── r2-operations.ts       # S3 SDK operations (AWS SDK v3)
│   └── types.ts              # TypeScript type definitions
└── public/                    # Static assets
```

## Configuration

### Theme Customization

Edit `app/globals.css` to customize GNOME theme colors:

```css
:root {
  --gnome-bg-primary: #ffffff;
  --gnome-bg-sidebar: #f6f5f4;
  --gnome-accent-blue: #3584e4;
  /* ... more variables */
}

.dark {
  --gnome-bg-primary: #242424;
  /* ... dark theme colors */
}
```

## Development

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Security Notes

- **Credentials Storage**: All credentials are stored in browser localStorage
- **Client-Side Only**: Credentials never leave the browser
- **No Backend**: Direct connection to S3 from client
- **Private Data**: Never commit credentials or .env files

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Known Limitations

- Maximum 10,000 files per bucket (S3 list objects limit per request)
- No server-side operations
- Credentials stored in browser localStorage
- No user authentication system

## Roadmap

- [ ] Tree view with expandable folders (VS Code style)
- [ ] File search functionality
- [ ] Batch operations UI
- [ ] File preview support
- [ ] Keyboard navigation enhancements
- [ ] Custom theme builder
- [ ] Export/import bucket configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- **Design**: Inspired by GNOME Files (Nautilus)
- **Icons**: Based on VS Code Material Icon Theme
- **Framework**: Built with Next.js and React
- **Storage**: Compatible with Amazon S3, Cloudflare R2, MinIO, and all S3-compatible services

---

**Built with ❤️ using Next.js and AWS S3 SDK**
