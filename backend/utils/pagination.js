import { PAGINATION } from "../constants/collegeStudentNominations.constants.js";

// Used by student-profile modules (skills, certifications, internships, projects, achievements)
export const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// NOTE: college-team's pagination helper for the nominations feature also
// clashed on the name "getPagination". Kept its logic intact under a new
// name so nothing is lost -- but if nominations code imports `getPagination`
// directly from this file, that import needs to be updated to
// `getNominationPagination`, or this needs a real conversation with whoever
// owns the nominations feature about consolidating into one shared utility.
export const getNominationPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT,
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};
