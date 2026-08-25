import { isEmpty, isValidDate } from "./collegeRequests.validator.js";

const ALLOWED_CATEGORIES = ["Academic", "Sports", "Cultural", "Technical", "Other"];

export const validateCreateAchievement = (req, res, next) => {
  const errors = [];
  const { title, category, achievement_date } = req.body;

  if (isEmpty(title)) errors.push("title is required");

  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }

  if (isEmpty(achievement_date)) {
    errors.push("achievement_date is required");
  } else if (!isValidDate(achievement_date)) {
    errors.push("achievement_date must be a valid date");
  }

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};

export const validateUpdateAchievement = (req, res, next) => {
  const errors = [];
  const { category, achievement_date } = req.body;

  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }
  if (achievement_date !== undefined && !isValidDate(achievement_date)) errors.push("achievement_date must be a valid date");

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};
