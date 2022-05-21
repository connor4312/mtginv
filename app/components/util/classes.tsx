export const classes = (...classes: (string | null | false | undefined)[]) =>
  classes.filter((c) => !!c).join(" ");

export const classObj = (classes: { [key: string]: unknown }) =>
  Object.keys(classes)
    .filter((c) => !!classes[c])
    .join(" ");
