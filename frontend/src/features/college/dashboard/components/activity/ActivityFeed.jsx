import ActivityCard from "./ActivityCard";

const formatTime = (ts) => {
  if (!ts) return "Just now";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ActivityFeed = ({ darkMode, activities = [] }) => {
  const displayActivities = activities.map((item) => ({
    title: item.title || item.description || "Update",
    time: formatTime(item.timestamp),
    status: item.type === "drive_created" ? "Info" : "Completed",
  }));

  return (
    <div className={`rounded-xl border p-5 ${
      darkMode
        ? "bg-[#2D2D2D] border-[#3D3D3D]"
        : "bg-white border-gray-200 shadow"
    }`}>
      <h2 className={`text-lg font-semibold mb-5 ${
        darkMode ? "text-white" : "text-[#2D3436]"
      }`}>
        Recent Activities
      </h2>

      {displayActivities.length === 0 ? (
        <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          No recent activities yet.
        </p>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((item, index) => (
            <ActivityCard key={index} darkMode={darkMode} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;