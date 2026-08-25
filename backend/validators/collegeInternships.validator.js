import { isEmpty, isValidDate } from "./collegeRequests.validator.js";

export const validateCreateInternship = (req, res, next) => {
  const errors = [];
  const { company_name, role, start_date, end_date } = req.body;

  if (isEmpty(company_name)) errors.push("company_name is required");
  if (isEmpty(role)) errors.push("role is required");

  if (isEmpty(start_date)) {
    errors.push("start_date is required");
  } else if (!isValidDate(start_date)) {
    errors.push("start_date must be a valid date");
  }

  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) {
    errors.push("end_date must be a valid date");
  }

  if (start_date && end_date && isValidDate(start_date) && isValidDate(end_date)) {
    if (new Date(end_date) < new Date(start_date)) {
      errors.push("end_date cannot be before start_date");
    }
  }

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};

export const validateUpdateInternship = (req, res, next) => {
  const errors = [];
  const { start_date, end_date } = req.body;

  if (start_date !== undefined && !isValidDate(start_date)) errors.push("start_date must be a valid date");
  if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) errors.push("end_date must be a valid date");

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};
