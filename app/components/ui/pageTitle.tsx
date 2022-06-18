import React from "react";
import { classes } from "../util/classes";
import { Container } from "./container";

const PageTitleRaw: React.FC<{ className?: string; sub?: string }> = ({
  children,
  className,
  sub,
}) => (
  <h1 className={classes("mb-12 text-7xl text-black", className)}>
    {children}
    {sub && (
      <small className="mt-1 ml-2 block text-lg text-zinc-500">{sub}</small>
    )}
  </h1>
);

export const PageTitle: React.FC<{ sub?: string }> = ({ children, sub }) => (
  <Container className="border:zinc-600 mb-8 mt-16 flex border-b">
    <PageTitleRaw sub={sub}>{children}</PageTitleRaw>
  </Container>
);

export const ActionTitle: React.FC<{ title: string; sub?: string }> = ({
  title,
  sub,
  children,
}) => (
  <Container className="border:zinc-600 mb-8 mt-16 flex border-b">
    <div className="flex-grow items-center">
      <PageTitleRaw sub={sub}>{title}</PageTitleRaw>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </Container>
);
