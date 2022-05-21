import React from "react";
import { classes } from "../util/classes";

const PageTitleRaw: React.FC<{ className: string }> = ({
  children,
  className,
}) => <h1 className={classes("font-serif text-7xl", className)}>{children}</h1>;

export const PageTitle: React.FC = ({ children }) => (
  <PageTitleRaw className="mb-12">{children}</PageTitleRaw>
);

export const ActionTitle: React.FC<{ title: string }> = ({
  title,
  children,
}) => (
  <div className="flex mb-12">
    <div className="flex-grow items-center">
      <PageTitle>{title}</PageTitle>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);
