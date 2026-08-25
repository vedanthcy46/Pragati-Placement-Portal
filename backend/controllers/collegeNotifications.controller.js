import * as service from "../services/collegeNotifications.service.js";

export const getNotifications = async (req, res) => {
  try {
    const result = await service.getNotifications(req.query);
    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await service.getNotification(req.params.id);
    res.status(200).json({
      success: true,
      message: "Notification fetched successfully.",
      data: notification,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notification = await service.addNotification(req.body);

    res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      data: notification,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const notification = await service.editNotification(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully.",
      data: notification,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const result = await service.removeNotification(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const notification = await service.sendNotification(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification sent successfully.",
      data: notification,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export const getNotificationHistory = async (req, res) => {
  try {
    const history = await service.getNotificationHistory();

    res.status(200).json({
      success: true,
      message: "Notification history fetched successfully.",
      data: history,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

export default {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getNotificationHistory,
};