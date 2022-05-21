import React from "react";
import { Link } from "remix";
import { classes } from "../util/classes";

const commonCls =
  "py-2 px-5 transition ease-in duration-100 text-center text-base text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-sm disabled:opacity-50 disabled:pointer-events-none";

const primaryCls = `${commonCls} bg-sky-700 hover:bg-sky-800 focus:ring-sky-600 focus:ring-offset-sky-300 text-white shadow`;

const defaultCls = `${commonCls} bg-zinc-200 hover:bg-zinc-300 focus:ring-zinc-300 focus:ring-offset-zinc-100 text-zinc-700`;

interface ButtonCommon {
  primary?: boolean;
}

const getClass = (primary?: boolean) => (primary ? primaryCls : defaultCls);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonCommon
> = ({ children, primary, ...props }) => (
  <button {...props} className={classes(getClass(primary), props.className)}>
    {children}
  </button>
);

export const LinkButton: React.FC<
  React.ComponentProps<typeof Link> & ButtonCommon
> = ({ children, primary, ...props }) => (
  <Link {...props} className={classes(getClass(primary), props.className)}>
    {children}
  </Link>
);
