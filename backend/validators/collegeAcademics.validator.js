export const validateSemesterQuery = (req, res, next) => {
  const { semester } = req.query;

  if (!semester) {
    return res.status(400).json({ success: false, errors: ["semester query parameter is required"] });
  }

  const sem = Number(semester);
  if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
    return res.status(400).json({ success: false, errors: ["semester must be an integer between 1 and 12"] });
  }

  next();
};
