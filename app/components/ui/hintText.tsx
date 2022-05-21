import { InfoCircle } from "./icons";

export const BlockHint: React.FC = ({ children }) => (
  <div className="border:zinc-600 my-2 rounded-sm border border-sky-200 bg-sky-50 p-2 text-sm">
    <div className="flex items-center text-xs text-sky-700 mb-1">
      <InfoCircle className="h-4 w-4 mr-1" /> Professor Onyx says:
    </div>
    {children}
  </div>
);
