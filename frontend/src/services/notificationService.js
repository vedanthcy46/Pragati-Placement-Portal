import api from "./api";

const TYPE_MAP = {
  info: "general",
  success: "general",
  warning: "session",
  alert: "drive",
};

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString();
}

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mapNotification(n) {
  return {
    notificationId: `n-${String(n.id || 0).padStart(3, "0")}`,
    title: n.title || "",
    message: n.message || "",
    type: TYPE_MAP[n.type] || "general",
    isRead: Boolean(n.isRead),
    time: getRelativeTime(n.createdAt),
    createdAt: n.createdAt,
    linkUrl: n.linkUrl || "#",
    date: formatDate(n.createdAt),
    status: n.isRead ? "read" : "unread",
  };
}

export async function fetchNotifications({ page = 1, limit = 20 } = {}) {
  try {
    const res = await api.get(`/v1/notifications?page=${page}&limit=${limit}`);
    const data = res?.data?.data || res?.data || {};

    return {
      success: true,
      notifications: Array.isArray(data.notifications)
        ? data.notifications.map(mapNotification)
        : [],
      unreadCount: data.unreadCount || 0,
      page: data.page || page,
      limit: data.limit || limit,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("fetchNotifications error:", error?.response?.data || error.message);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      page,
      limit,
      total: 0,
    };
  }
}

export async function fetchUnreadCount() {
  try {
    const res = await api.get("/v1/notifications?page=1&limit=1");
    const data = res?.data?.data || res?.data || {};
    return data.unreadCount || 0;
  } catch (error) {
    console.error("fetchUnreadCount error:", error?.response?.data || error.message);
    return 0;
  }
}

export async function markAsRead({ notificationIds, markAll } = {}) {
  try {
    const res = await api.put("/v1/notifications/read", {
      ...(markAll ? { markAll: true } : { notificationIds }),
    });
    return res.data;
  } catch (error) {
    console.error("markAsRead error:", error?.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Failed to mark as read" };
  }
}

export async function markAllAsRead() {
  return markAsRead({ markAll: true });
}