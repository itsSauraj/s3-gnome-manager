# File Explorer Guide

A realistic, user-friendly file explorer for Cloudflare R2 with folder navigation, similar to Windows Explorer or macOS Finder.

## Features

### 📁 Navigation
- **Folder Tree Sidebar**: Navigate through folders in a hierarchical tree view
- **Breadcrumb Navigation**: See your current location and quickly jump to parent folders
- **Double-click Folders**: Open folders by double-clicking
- **Expandable Folders**: Click arrows to expand/collapse folder trees

### 🎯 File Management
- **Upload Files**: Upload files to the current folder
- **Create Folders**: Create new folders anywhere
- **Multi-select**: Select multiple files using Ctrl+Click (Cmd+Click on Mac)
- **Drag-select**: Coming soon!

### ⚙️ Operations
- **Copy**: Copy files/folders to another location
- **Move**: Move files/folders to another location
- **Rename**: Rename individual files or folders
- **Delete**: Delete selected files/folders
- **Download**: Download files to your computer

### 👁️ View Modes
- **List View**: Detailed table view with file info
- **Grid View**: Icon-based grid layout for easier browsing

### 🎨 User Interface
- **File Icons**: Visual icons for different file types (📄 documents, 🖼️ images, 🎬 videos, etc.)
- **Selection Highlighting**: Selected items are visually highlighted
- **Current Path Indicator**: Always know where you are
- **Empty State Messages**: Helpful messages when folders are empty

## How to Use

### Basic Navigation

1. **Browse Folders**
   - Click on folders in the sidebar tree to navigate
   - Or click on breadcrumb items to jump to that folder
   - Double-click folders in the main area to open them

2. **Go Back to Parent**
   - Click on any breadcrumb to go up in the folder hierarchy
   - Click "Home" to return to root

### File Operations

#### Upload Files
1. Click **"⬆️ Upload"** button
2. Select a file from your computer
3. File will be uploaded to the current folder
4. Click **"Upload"** to confirm

#### Create New Folder
1. Navigate to where you want the folder
2. Click **"📁 New Folder"**
3. Enter folder name in the prompt
4. Click OK

#### Copy Files
1. Select one or more files/folders (Ctrl+Click for multiple)
2. Click **"📋 Copy"**
3. Choose destination folder from dropdown
4. Click **"Copy"** to confirm

#### Move Files
1. Select files/folders to move
2. Click **"✂️ Move"**
3. Choose destination folder
4. Click **"Move"** to confirm

#### Rename
1. Select a single file or folder
2. Click **"📋 Copy"** or **"✂️ Move"** button
3. In the modal, you can rename during the operation
4. Or use the rename feature in the operations menu

#### Delete Files
1. Select files/folders to delete
2. Click **"🗑️ Delete (X)"** button (X = number of selected items)
3. Confirm deletion
4. Files are permanently deleted

#### Download Files
1. Find the file you want to download
2. Click the **⬇️** button in the Actions column (List view)
3. File will download to your computer

### Selection Tips

- **Single Select**: Click on any file/folder
- **Multi Select**: Hold Ctrl (or Cmd on Mac) and click multiple items
- **Deselect**: Ctrl+Click on selected items to deselect
- **Clear Selection**: Click on empty space

### View Modes

#### List View (☰ List)
- Shows detailed information: name, size, modified date
- Better for managing many files
- Quick access to download button
- Sortable columns (coming soon!)

#### Grid View (⊞ Grid)
- Shows files as large icons
- Better for visual browsing
- Shows file type icons prominently
- Great for image galleries

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Click | Multi-select files |
| Double-click folder | Open folder |
| Escape | Close modals |

## File Type Icons

The explorer uses visual icons to help identify file types:

- 📁 Folders
- 📄 PDF documents
- 📝 Word documents
- 📊 Excel spreadsheets
- 📽️ PowerPoint presentations
- 📃 Text files
- 🖼️ Images (JPG, PNG, GIF)
- 🎬 Videos (MP4)
- 🎵 Audio (MP3)
- 📦 Archives (ZIP, RAR)

## Tips & Tricks

### Organizing Files
1. Create a folder structure that makes sense (e.g., `images/`, `documents/`, `videos/`)
2. Use descriptive folder names
3. Keep similar files together

### Efficient Uploads
1. Navigate to the destination folder first
2. Then upload - files go directly to that folder
3. No need to move files after uploading

### Batch Operations
1. Select multiple files at once
2. Perform operations on all selected files
3. Much faster than one-by-one

### Finding Files
1. Use the folder tree to navigate quickly
2. Breadcrumbs show your current path
3. Refresh button updates the file list

## Current Limitations

- No drag-and-drop upload (yet!)
- No file search (yet!)
- No sorting in list view (yet!)
- No file preview (yet!)
- Folders are created with a `.keep` file

## Technical Details

### How Folders Work in R2
Cloudflare R2 (like S3) doesn't have true folders. Instead:
- Folders are represented by file paths with `/` separators
- Creating a folder creates a `.keep` file inside it
- Deleting all files in a folder doesn't delete the folder structure

### File Paths
- All paths use forward slashes `/`
- Root level has no prefix
- Nested files have full path: `folder/subfolder/file.txt`

## Troubleshooting

**Files not showing up?**
- Click the 🔄 Refresh button
- Check if you're in the right folder
- Verify files were uploaded successfully

**Can't create folder?**
- Make sure you have write permissions
- Check if folder name is valid (no special characters)

**Operations failing?**
- Refresh the page and try again
- Check browser console for errors
- Verify your R2 credentials are correct

**Empty folder not appearing in tree?**
- Folders need at least one file to appear
- The `.keep` file serves this purpose

## Future Enhancements

- 🔍 File search and filtering
- 📊 Sorting by name, size, date
- 👁️ File preview for images/PDFs
- ⬆️ Drag-and-drop upload
- 📦 Bulk upload (multiple files)
- 🏷️ File tagging and metadata
- 📸 Thumbnail previews for images
- ⌨️ More keyboard shortcuts
- 📋 Copy/paste with keyboard
- ↩️ Undo/Redo operations

## Need Help?

Check the main documentation:
- [R2_FILE_MANAGER.md](R2_FILE_MANAGER.md) - Setup and configuration
- [API_REFERENCE.md](API_REFERENCE.md) - Developer API reference
- [examples/usage-examples.ts](examples/usage-examples.ts) - Code examples

Enjoy your file explorer! 🚀
