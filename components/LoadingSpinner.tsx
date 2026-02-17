export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="border-4 border-[var(--gnome-border)] border-t-[var(--gnome-accent-blue)] rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
