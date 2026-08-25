import { BATCH_OPTIONS as FALLBACK } from "../../constants/analyticsConstants";
import { useCollegeFilterOptions } from "../../../shared/hooks/useCollegeFilterOptions";

const selectCls = (darkMode) =>
  `px-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
    darkMode
      ? "bg-[#3D3D3D] border-[#4D4D4D] text-white focus:border-[#00bea3]"
      : "bg-gray-50 border-gray-200 text-[#2D3436] focus:border-[#00bea3]"
  }`;

export const BatchFilter = ({ darkMode, value, onChange }) => {
  const { options } = useCollegeFilterOptions();
  const list = options?.batches?.length ? ["All", ...options.batches] : ["All", ...FALLBACK];

  return (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls(darkMode)}>
    {list.map((b) => (
      <option key={b} value={b}>{b === "All" ? "All Batches" : `Batch ${b}`}</option>
    ))}
  </select>
  );
};
