import { isEmpty } from "./collegeRequests.validator.js";

const ALLOWED_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const validateCreateSkill = (req, res, next) => {
  const errors = [];
  const { skill_name, proficiency_level } = req.body;

  if (isEmpty(skill_name)) errors.push("skill_name is required");

  if (isEmpty(proficiency_level)) {
    errors.push("proficiency_level is required");
  } else if (!ALLOWED_LEVELS.includes(proficiency_level)) {
    errors.push(`proficiency_level must be one of: ${ALLOWED_LEVELS.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

export const validateUpdateSkill = (req, res, next) => {
  const errors = [];
  const { proficiency_level } = req.body;

  if (proficiency_level !== undefined && !ALLOWED_LEVELS.includes(proficiency_level)) {
    errors.push(`proficiency_level must be one of: ${ALLOWED_LEVELS.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};
