import {
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
} from "../services/notification.service.js";

// GET NOTIFICATIONS
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.authUserId;

    const result = await getNotificationsService(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// MARK SINGLE READ
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.authUserId;
    const { notificationId } = req.params;

    await markNotificationReadService(
      Number(notificationId),
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// MARK ALL READ
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.authUserId;

    await markAllNotificationsReadService(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    // Return empty result gracefully for non-student accounts
    if (role !== "student") {
      return res.status(200).json({
        success: true,
        data: { notifications: [], unreadCount: 0, page: 1, limit: 20, total: 0 }
      });
    }

    // Existing student notification fetching logic here...
    const notifications = await fetchNotificationsFromDb(userId);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
