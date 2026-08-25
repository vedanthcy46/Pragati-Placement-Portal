import { useState, useEffect } from "react";
import fetchCollegeFilterOptions from "../services/filterOptionsService";

export const useCollegeFilterOptions = () => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchCollegeFilterOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { options, loading, error };
};

export default useCollegeFilterOptions;