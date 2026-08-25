import StatsCard from "./StatsCard";
import {
  Users,
  Briefcase,
  Building2,
  Award,
  GraduationCap,
  Layers,
  ClipboardList,
  Percent
} from "lucide-react";

const iconMap = {
  "Total Students": {
    icon: Users,
    iconBg: "bg-gradient-to-br from-orange-50 to-amber-50 text-[#ff6d34] border border-orange-200/80"
  },
  "Active Drives": {
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-teal-50 to-emerald-50 text-[#00bea3] border border-teal-200/80"
  },
  "Companies": {
    icon: Building2,
    iconBg: "bg-gradient-to-br from-orange-50 to-rose-50 text-[#ff6d34] border border-orange-200/80"
  },
  "Placements": {
    icon: Award,
    iconBg: "bg-gradient-to-br from-teal-50 to-cyan-50 text-[#00bea3] border border-teal-200/80"
  },
  "Faculty": {
    icon: GraduationCap,
    iconBg: "bg-gradient-to-br from-orange-50 to-yellow-50 text-[#ff6d34] border border-orange-200/80"
  },
  "Departments": {
    icon: Layers,
    iconBg: "bg-gradient-to-br from-teal-50 to-green-50 text-[#00bea3] border border-teal-200/80"
  },
  "Internships": {
    icon: ClipboardList,
    iconBg: "bg-gradient-to-br from-orange-50 to-amber-50 text-[#ff6d34] border border-orange-200/80"
  },
  "Placement Rate": {
    icon: Percent,
    iconBg: "bg-gradient-to-br from-teal-50 to-emerald-50 text-[#00bea3] border border-teal-200/80"
  }
};

const StatsGrid = ({ darkMode, stats }) => {
  const displayStats = stats || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.length > 0 ? (
        displayStats.map((stat) => {
          const config = iconMap[stat.title] || {
            icon: Users,
            iconBg: "bg-gradient-to-br from-gray-50 to-slate-50 text-slate-600 border border-slate-100"
          };
          return (
            <StatsCard
              key={stat.id || stat.title}
              darkMode={darkMode}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={config.icon}
              iconBg={config.iconBg}
            />
          );
        })
      ) : (
        <div className="col-span-full text-center py-12 text-slate-500">No dashboard statistics available.</div>
      )}
    </div>
  );
};

export default StatsGrid;