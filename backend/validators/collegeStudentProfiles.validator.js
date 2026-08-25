import { isEmpty } from "./collegeRequests.validator.js";

export const validateUpdateStudentProfile = (req, res, next) => {
  const errors = [];
  const { name, cgpa, phone, semester } = req.body;

  if (name !== undefined && isEmpty(name)) {
    errors.push("name cannot be empty");
  }

  if (cgpa !== undefined) {
    const cgpaNum = Number(cgpa);
    if (Number.isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      errors.push("cgpa must be a number between 0 and 10");
    }
  }

  if (semester !== undefined) {
    const sem = Number(semester);
    if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
      errors.push("semester must be an integer between 1 and 12");
    }
  }

  if (phone !== undefined && !isEmpty(phone)) {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      errors.push("phone must be a valid 10-digit mobile number");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
