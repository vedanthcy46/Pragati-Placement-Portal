import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";

export const useCommunicationFilters = (announcements = []) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // F3-1: 400ms Debounce delay on search input
  const debouncedSearch = useDebouncedValue(search, 400);


  const filteredAnnouncements = useMemo(() => {
    const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
    return safeAnnouncements.filter((announcement) => {
      if (!announcement) return false;

      const matchesSearch =
        !debouncedSearch ||
        (announcement.title &&
          announcement.title.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (announcement.description &&
          announcement.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesCategory =
        !category ||
        String(announcement.category) === String(category) ||
        String(announcement.category_id) === String(category);

      const matchesStatus =
        !status ||
        announcement.status?.toLowerCase() === status.toLowerCase();

      const matchesDate =
        !date ||
        announcement.publishDate === date ||
        announcement.created_at?.startsWith(date);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    announcements,
    debouncedSearch,
    category,
    status,
    date,
  ]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setDate("");
  };

  // Server-side query parameter object for React Query integration
  const queryParams = useMemo(() => {
    const params = {};
    if (debouncedSearch) params.title = debouncedSearch;
    if (category) params.category_id = category;
    if (status) params.status = status;
    return params;
  }, [debouncedSearch, category, status]);

  return {
    search,
    setSearch,
    debouncedSearch,

    category,
    setCategory,

    status,
    setStatus,

    date,
    setDate,

    queryParams,
    filteredAnnouncements,

    resetFilters,
  };
};

export default useCommunicationFilters;