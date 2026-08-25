import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";

export const SearchAnnouncement = ({ value = "", onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync state during render when prop changes (avoids setState in effect error)
  if (value !== prevValue) {
    setPrevValue(value);
    setSearchTerm(value);
  }

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400);

  // Trigger search prop only after 400ms debounce
  useEffect(() => {
    if (debouncedSearchTerm !== value) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, value]);

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        placeholder="Search announcements..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            onSearch("");
          }}
          className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchAnnouncement;