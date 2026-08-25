import * as certificationsService from "../services/collegeCertifications.service.js";
import { getPagination } from "../utils/pagination.js";

export const getCertifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { certifications, meta } = await certificationsService.getCertifications(req.user.userId, { page, limit, offset });
    res.status(200).json({ success: true, data: certifications, meta });
  } catch (error) {
    next(error);
  }
};

export const createCertification = async (req, res, next) => {
  try {
    const data = await certificationsService.addCertification(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    const data = await certificationsService.updateCertification(req.user.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    await certificationsService.deleteCertification(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: "Certification deleted successfully" });
  } catch (error) {
    next(error);
  }
};
