"use client";

interface BreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Breadcrumb({ currentPath, onNavigate }: BreadcrumbProps) {
  const parts = currentPath ? currentPath.split("/") : [];
  const breadcrumbs = [
    { name: "Home", path: "" },
    ...parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join("/"),
    })),
  ];

  return (
    <div className="bg-base-200 border-b border-base-300 px-4 py-2">
      <div className="breadcrumbs text-sm">
        <ul>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path}>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold">{crumb.name}</span>
              ) : (
                <button
                  className="link link-hover"
                  onClick={() => onNavigate(crumb.path)}
                >
                  {crumb.name}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
