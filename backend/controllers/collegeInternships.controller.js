import * as internshipsService from "../services/collegeInternships.service.js";
import { getPagination } from "../utils/pagination.js";

export const getInternships = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { internships, meta } = await internshipsService.getInternships(req.user.userId, { page, limit, offset });
    res.status(200).json({ success: true, data: internships, meta });
  } catch (error) {
    next(error);
  }
};

export const createInternship = async (req, res, next) => {
  try {
    const data = await internshipsService.addInternship(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateInternship = async (req, res, next) => {
  try {
    const data = await internshipsService.updateInternship(req.user.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteInternship = async (req, res, next) => {
  try {
    await internshipsService.deleteInternship(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: "Internship deleted successfully" });
  } catch (error) {
    next(error);
  }
};
