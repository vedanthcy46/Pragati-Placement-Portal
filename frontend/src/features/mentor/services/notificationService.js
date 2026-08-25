// Merged mock data supporting both rich toast alerts and timeAgo formats
export const mockNotificationData = [
  {
    id: "mock_001",
    type: "success",
    title: "New Mentee Added",
    message: "Sonal Gupta has been assigned to you.",
    timeAgo: "1m ago",
  },
  {
    id: "mock_002",
    type: "request",
    title: "New Mentee Request",
    message: "New Mentee Request: Aakash Sharma.",
    timeAgo: "5m ago",
  },
  {
    id: "mock_003",
    type: "info",
    title: "Session Reminder",
    message: "Your mentoring session starts in 30 minutes.",
    timeAgo: "30m ago",
  },
  {
    id: "mock_004",
    type: "success",
    title: "Project Submitted",
    message: "Priya Jha submitted UI/UX Project.",
    timeAgo: "1h ago",
  },
  {
    id: "mock_005",
    type: "warning",
    title: "Profile Incomplete",
    message: "Please complete your mentor profile.",
    timeAgo: "2h ago",
  },
  {
    id: "mock_006",
    type: "error",
    title: "Submission Failed",
    message: "Unable to upload your report.",
    timeAgo: "3h ago",
  },
];

import api from "../../../services/api";

const handleAuthError = () => {
  window.location.href = "/login";
};

export const fetchNotificationsAPI = async () => {
  try {
    const response = await api.get("/student/notifications");
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data?.message || error.message || error);
    return mockNotificationData.map((item) => ({ ...item }));
  }
};

export const markNotificationAsReadAPI = async (id) => {
  try {
    const response = await api.put(`/v1/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error(`Error marking ${id} as read:`, error);
    return { success: false };
  }
};

export const getRecentNotifications = fetchNotificationsAPI;

export async function dismissNotification(id) {
  const success = await markNotificationAsReadAPI(id);
  return { success, id };
}
