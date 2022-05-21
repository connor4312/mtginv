import { ValidationError, ValidationErrorItem } from "joi";
import React, { useState } from "react";
import { classes } from "../util/classes";
import { Warning } from "./icons";

const inputCls =
  "block w-full flex-1 appearance-none rounded-sm border border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm duration-100 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-sky-200";

export const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    errors?: ValidationError;
    containerClassName?: string;
  }
> = ({ errors, containerClassName, ...props }) => {
  const error = errors?.details.find((d) => d.path[0] === props.name);
  const [seenError, setSeenError] = useState<ValidationErrorItem | undefined>();

  return (
    <div className={classes("relative", containerClassName)}>
      <input
        {...props}
        onChange={(e) => {
          if (error) {
            setSeenError(error);
          }
          props.onChange?.(e);
        }}
        className={classes(
          inputCls,
          error && error !== seenError && "border-red-500",
          props.className
        )}
      />
      {error && error !== seenError && (
        <Warning className="absolute right-2 bottom-3 top-3 h-5 w-5 text-red-500" />
      )}
      {error && error !== seenError && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { errors?: ValidationError }
> = ({ errors, children, ...props }) => {
  const error = errors?.details.find((d) => d.path[0] === props.name);
  const [seenError, setSeenError] = useState<ValidationErrorItem | undefined>();

  return (
    <div className="relative">
      <select
        {...props}
        onChange={(e) => {
          if (error) {
            setSeenError(error);
          }
          props.onChange?.(e);
        }}
        className={classes(
          inputCls,
          error && error !== seenError && "border-red-500",
          props.className
        )}
      >
        {children}
      </select>
      {error && error !== seenError && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export const InputGroup: React.FC<{ label: React.ReactChild }> = ({
  label,
  children,
}) => (
  <label className="block py-2">
    <div className="mb-1 text-sm">{label}:</div>
    {children}
  </label>
);
