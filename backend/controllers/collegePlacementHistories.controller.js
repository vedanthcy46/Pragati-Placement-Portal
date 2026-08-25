import * as placementService from "../services/collegePlacementHistories.service.js";

export const getPlacementHistory = async (req, res, next) => {
  try {
    const data = await placementService.getPlacementHistory(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAppliedCompanies = async (req, res, next) => {
  try {
    const data = await placementService.getAppliedCompanies(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req, res, next) => {
  try {
    const data = await placementService.getInterviewHistory(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getOfferHistory = async (req, res, next) => {
  try {
    const data = await placementService.getOfferHistory(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
