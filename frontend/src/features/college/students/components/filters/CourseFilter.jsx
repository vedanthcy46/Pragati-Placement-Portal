import { COURSES as FALLBACK } from "../../constants/studentConstants"
import { useCollegeFilterOptions } from "../../../shared/hooks/useCollegeFilterOptions"

const CourseFilter = ({ value, onChange, darkMode }) => {
  const { options } = useCollegeFilterOptions();
  const list = options?.courses?.length ? ["All", ...options.courses] : FALLBACK;

  return (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`h-10 px-3 rounded-xl text-sm outline-none cursor-pointer ${
      darkMode
        ? 'bg-[#1A1A1A] border border-[#3D3D3D] text-gray-300 focus:border-[#ff6d34]'
        : 'bg-white border border-gray-200 text-gray-600 focus:border-blue-400'
    }`}
  >
    {list.map((c) => <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>)}
  </select>
  );
}

export default CourseFilter