import * as React from "react";

export function SchoolLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center ${className}`}
      aria-label="Aashley International School"
    >
      <img
        src="/aashley_logo.png"
        alt="Aashley International School"
        className="h-12 sm:h-14 w-auto object-contain max-h-16"
      />
    </div>
  );
}

