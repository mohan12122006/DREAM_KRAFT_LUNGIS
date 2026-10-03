import React from "react";
export default function Loading() {
  return (
    <div className="loading-grid" aria-label="Loading">
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
