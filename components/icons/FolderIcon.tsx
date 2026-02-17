export function FolderIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main folder body */}
      <path
        fill="var(--gnome-folder-color)"
        d="M8 6 C 6.895 6 6 6.895 6 8 L 6 12 L 6 38 C 6 39.105 6.895 40 8 40 L 40 40 C 41.105 40 42 39.105 42 38 L 42 16 C 42 14.895 41.105 14 40 14 L 22 14 L 18 10 L 8 10 L 8 6 z"
      />
      {/* Shadow at bottom for depth */}
      <path
        fill="#000000"
        opacity="0.1"
        d="M 8 38 L 40 38 C 41.105 38 42 37.105 42 36 L 42 38 C 42 39.105 41.105 40 40 40 L 8 40 C 6.895 40 6 39.105 6 38 L 6 36 C 6 37.105 6.895 38 8 38 z"
      />
    </svg>
  );
}
