import api from "../../../../services/api";

let cachedPromise = null;

export const fetchCollegeFilterOptions = () => {
  if (!cachedPromise) {
    cachedPromise = api
      .get("/analytics/filter-options")
      .then((res) => {
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        throw new Error("Invalid filter options response");
      })
      .catch((err) => {
        cachedPromise = null;
        throw err;
      });
  }
  return cachedPromise;
};

export const resetCollegeFilterOptionsCache = () => {
  cachedPromise = null;
};

export default fetchCollegeFilterOptions;