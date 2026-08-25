import { NOTIFICATION_AUDIENCES } from "../constants/collegeCommunication.constants.js";

const TITLE_REGEX = /^[A-Za-z0-9][A-Za-z0-9&.,'()\-:!?/" ]{2,149}$/;

export const validateNotification = (req, res, next) => {
  const {
    announcement_id,
    title,
    message,
    audience,
  } = req.body || {};

  if (!Number.isInteger(Number(announcement_id))) {
    return res.status(400).json({
      success: false,
      message: "announcement_id is required.",
      data: null,
    });
  }

  if (!title || typeof title !== "string") {
    return res.status(400).json({
      success: false,
      message: "Title is required.",
      data: null,
    });
  }

  if (!TITLE_REGEX.test(title.trim())) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification title.",
      data: null,
    });
  }

  if (!message || typeof message !== "string" || message.trim().length < 3 || message.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Message must be between 3 and 5000 characters.",
      data: null,
    });
  }

  if (!audience || typeof audience !== "string") {
    return res.status(400).json({
      success: false,
      message: "Audience is required.",
      data: null,
    });
  }

  if (NOTIFICATION_AUDIENCES && NOTIFICATION_AUDIENCES.length > 0 && !NOTIFICATION_AUDIENCES.includes(audience)) {
    return res.status(400).json({
      success: false,
      message: `Invalid audience. Allowed values: ${NOTIFICATION_AUDIENCES.join(", ")}`,
      data: null,
    });
  }

  next();
};

export const validateNotificationUpdate = (
  req,
  res,
  next
) => {
  const {
    title,
    message,
    audience,
    status,
  } = req.body || {};

  if (
    title !== undefined &&
    !TITLE_REGEX.test(title.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid title.",
      data: null,
    });
  }

  if (
    message !== undefined &&
    (typeof message !== "string" || message.trim().length < 3 || message.trim().length > 5000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Message must be between 3 and 5000 characters.",
      data: null,
    });
  }

  if (audience !== undefined) {
    if (typeof audience !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid audience.",
        data: null,
      });
    }

    if (NOTIFICATION_AUDIENCES && NOTIFICATION_AUDIENCES.length > 0 && !NOTIFICATION_AUDIENCES.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: `Invalid audience. Allowed values: ${NOTIFICATION_AUDIENCES.join(", ")}`,
        data: null,
      });
    }
  }

  if (
    status !== undefined &&
    !["Pending", "Sent"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Status must be Pending or Sent.",
      data: null,
    });
  }

  next();
};

export default {
  validateNotification,
  validateNotificationUpdate,
};