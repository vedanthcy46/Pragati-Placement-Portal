import { isEmpty, isValidDate } from "./collegeRequests.validator.js";

export const validateCreateProject = (req, res, next) => {
  const errors = [];
  const { title, tech_stack, start_date, end_date } = req.body;

  if (isEmpty(title)) errors.push("title is required");

  if (tech_stack !== undefined && !Array.isArray(tech_stack)) {
    errors.push("tech_stack must be an array of strings");
  }

  if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) errors.push("start_date must be a valid date");
  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) errors.push("end_date must be a valid date");

  if (start_date && end_date && isValidDate(start_date) && isValidDate(end_date)) {
    if (new Date(end_date) < new Date(start_date)) {
      errors.push("end_date cannot be before start_date");
    }
  }

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};

export const validateUpdateProject = (req, res, next) => {
  const errors = [];
  const { tech_stack, start_date, end_date } = req.body;

  if (tech_stack !== undefined && !Array.isArray(tech_stack)) errors.push("tech_stack must be an array of strings");
  if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) errors.push("start_date must be a valid date");
  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) errors.push("end_date must be a valid date");

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};
