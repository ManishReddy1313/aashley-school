import * as React from "react";

export function SchoolLogo({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** Use "white" on dark/colored backgrounds (e.g. footer, primary sections) */
  variant?: "default" | "white";
}) {
  const logoSrc = variant === "white" ? "/aashley_logo_white.png" : "/aashley_logo.png";
  return (
    <div
      className={`flex items-center ${className}`}
      aria-label="Aashley International School"
    >
      <img
        src={logoSrc}
        alt="Aashley International School"
        className="h-12 sm:h-14 w-auto object-contain max-h-16"
      />
    </div>
  );
}

