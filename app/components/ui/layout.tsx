import React from "react";

export const EqualColumns: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div
    style={{
      gridAutoColumns: "1fr",
      gridAutoFlow: "column",
      display: "grid",
    }}
    {...props}
  >
    {children}
  </div>
);
