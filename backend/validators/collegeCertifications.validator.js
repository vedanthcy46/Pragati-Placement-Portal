import { isEmpty, isValidDate } from "./collegeRequests.validator.js";

export const validateCreateCertification = (req, res, next) => {
  const errors = [];
  const { title, issuing_organization, issue_date, expiry_date } = req.body;

  if (isEmpty(title)) errors.push("title is required");
  if (isEmpty(issuing_organization)) errors.push("issuing_organization is required");

  if (isEmpty(issue_date)) {
    errors.push("issue_date is required");
  } else if (!isValidDate(issue_date)) {
    errors.push("issue_date must be a valid date");
  }

  if (expiry_date !== undefined && expiry_date !== null && !isValidDate(expiry_date)) {
    errors.push("expiry_date must be a valid date");
  }

  if (issue_date && expiry_date && isValidDate(issue_date) && isValidDate(expiry_date)) {
    if (new Date(expiry_date) < new Date(issue_date)) {
      errors.push("expiry_date cannot be before issue_date");
    }
  }

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};

export const validateUpdateCertification = (req, res, next) => {
  const errors = [];
  const { issue_date, expiry_date } = req.body;

  if (issue_date !== undefined && !isValidDate(issue_date)) errors.push("issue_date must be a valid date");
  if (expiry_date !== undefined && expiry_date !== null && !isValidDate(expiry_date)) errors.push("expiry_date must be a valid date");

  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  next();
};
