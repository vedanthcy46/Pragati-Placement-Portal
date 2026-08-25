import * as projectsService from "../services/collegeProjects.service.js";
import { getPagination } from "../utils/pagination.js";

export const getProjects = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { projects, meta } = await projectsService.getProjects(req.user.userId, { page, limit, offset });
    res.status(200).json({ success: true, data: projects, meta });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const data = await projectsService.addProject(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const data = await projectsService.updateProject(req.user.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
