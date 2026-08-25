const RecentUpdates = ({ darkMode, activities = [] }) => {
  const items = activities.slice(0, 6);
  return (
    <div className={`rounded-xl border p-5 ${
      darkMode
        ? "bg-[#2D2D2D] border-[#3D3D3D]"
        : "bg-white border-gray-200 shadow"
    }`}>
      <h2 className={`text-lg font-semibold mb-5 ${
        darkMode ? "text-white" : "text-[#2D3436]"
      }`}>
        Recent Updates
      </h2>

      {items.length === 0 ? (
        <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          No recent updates yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`border-b pb-2 ${
                darkMode ? "border-[#3D3D3D] text-gray-400" : "border-gray-100 text-gray-600"
              }`}
            >
              <span className="text-[#ff6d34] mr-2">&#9656;</span> {item.description || item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentUpdates;