import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Search,
  Megaphone,
  CheckCircle2,
  FileEdit,
  RotateCcw,
  AlertCircle,
  Inbox,
} from "lucide-react";

import { useAnnouncements } from "../hooks/useAnnouncements";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import AnnouncementCard from "../components/announcements/AnnouncementCard";
import AnnouncementDetails from "../components/announcements/AnnouncementDetails";
import AnnouncementForm from "../components/forms/AnnouncementForm";
import EditAnnouncementForm from "../components/forms/EditAnnouncementForm";

const AnnouncementsPage = () => {
  const outletContext = useOutletContext() || {};
  const darkMode = outletContext.darkMode || false;

  const {
    announcements = [],
    loading,
    error,
    isError,
    fetchAnnouncements,
    addAnnouncement,
    editAnnouncement,
    removeAnnouncement,
    publish,
    unpublish,
  } = useAnnouncements();

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState("published"); // "published" | "draft"
  const [search, setSearch] = useState("");

  // F3: Debounced search value (400ms idle trigger)
  const debouncedSearch = useDebouncedValue(search, 400);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = announcements.length;
    const published = announcements.filter((a) => a.status === "Published").length;
    const draft = announcements.filter((a) => a.status === "Draft").length;
    return { total, published, draft };
  }, [announcements]);

  // Filter announcements by debounced search and active tab
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => (activeTab === "published" ? a.status === "Published" : a.status === "Draft"))
      .filter((a) => 
        !debouncedSearch || 
        a.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
  }, [announcements, activeTab, debouncedSearch]);

  if (showCreateForm) {
    return (
      <AnnouncementForm
        onSubmit={async (data) => {
          await addAnnouncement(data);
          setShowCreateForm(false);
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (showEditForm) {
    return (
      <EditAnnouncementForm
        announcement={selectedAnnouncement}
        onUpdate={async (data) => {
          await editAnnouncement(selectedAnnouncement.id, data);
          setShowEditForm(false);
        }}
        onCancel={() => setShowEditForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Communication & Announcements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, publish, and schedule college placement notices.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* F4-3: Error State Banner with Retry Button */}
      {(isError || error) && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
            <span>{error || "Failed to load announcements. Please try again."}</span>
          </div>
          <button
            onClick={() => fetchAnnouncements()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/60 hover:bg-red-200 text-red-800 dark:text-red-200 transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${darkMode ? "border-slate-800 bg-[#151D30]" : "border-slate-200 bg-white shadow-sm"}`}>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Megaphone size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Notices</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.total}</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${darkMode ? "border-slate-800 bg-[#151D30]" : "border-slate-200 bg-white shadow-sm"}`}>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Published</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.published}</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${darkMode ? "border-slate-800 bg-[#151D30]" : "border-slate-200 bg-white shadow-sm"}`}>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <FileEdit size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Drafts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.draft}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("published")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "published"
                ? "bg-white dark:bg-[#151D30] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Published ({stats.published})
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "draft"
                ? "bg-white dark:bg-[#151D30] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Drafts ({stats.draft})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              darkMode ? "bg-[#151D30] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {/* F4-1: Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`p-5 rounded-2xl border animate-pulse space-y-3 ${
                darkMode ? "border-slate-800 bg-[#151D30]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        /* F4-2: Empty State Component */
        <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center ${
          darkMode ? "border-slate-800 bg-[#151D30]" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
            <Inbox size={32} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No {activeTab} announcements found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {search
              ? `No results match "${search}". Try checking for typos or clear your search term.`
              : `There are currently no ${activeTab} announcements.`}
          </p>
        </div>
      ) : (
        /* Grid View with Announcement Cards */
        <AnnouncementCard
          announcements={filteredAnnouncements}
          onView={(a) => setSelectedAnnouncement(a)}
          onEdit={(a) => {
            setSelectedAnnouncement(a);
            setShowEditForm(true);
          }}
          onDelete={(a) => removeAnnouncement(a.id)}
          onPublish={(a) => publish(a.id)}
          onUnpublish={(a) => unpublish(a.id)}
        />
      )}

      {/* Details Drawer */}
      <AnnouncementDetails
        announcement={selectedAnnouncement}
        isOpen={selectedAnnouncement !== null && !showEditForm}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

export default AnnouncementsPage;