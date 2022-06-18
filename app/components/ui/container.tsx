import { classes } from "../util/classes";

export const Container: React.FC<{ className?: string }> = ({
  className,
  children,
}) => (
  <div className={classes(className, "mx-auto max-w-7xl px-8")}>{children}</div>
);
