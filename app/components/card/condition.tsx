import React from "react";
import { Select } from "../ui/input";

export const ConditionSelect: React.FC<React.ComponentProps<typeof Select>> = (
  props
) => (
  <Select {...props}>
    <option value="NM">Near Mint</option>
    <option value="LP">Lightly Played</option>
    <option value="MP">Moderately Played</option>
    <option value="HP">Heavily Played</option>
    <option value="DM">Damaged</option>
  </Select>
);
