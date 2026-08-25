import { BATCHES as FALLBACK } from "../../constants/companyJobPostingConstants";
import { useCollegeFilterOptions } from "../../../shared/hooks/useCollegeFilterOptions";

const BatchFilter = ({
  value = "",
  onChange,
  darkMode,
}) => {
  const { options } = useCollegeFilterOptions();
  const list = options?.batches?.length ? options.batches : FALLBACK;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#ff6d34] ${
        darkMode
          ? 'bg-[#1A1A1A] border-[#3D3D3D] text-white'
          : 'border border-slate-300 focus:border-blue-500 focus:ring-blue-200'
      }`}
    >
      <option value="">Batch</option>

      {list.map((batch) => (
        <option
          key={batch}
          value={batch}
        >
          {batch}
        </option>
      ))}
    </select>
  );
};

export default BatchFilter;