import api from "../../../services/api";

export const getProfile = async () => {
  try {
    const response = await api.get('/college/profile');
    return response.data;
  } catch (error) {
    const error_message = error.response?.data?.message || 'Network error';
    return { success: false, message: error_message };
  }
};

export const addProfile = async (payload) => {
  try {
    const response = await api.post('/college/profile', payload);
    return response.data;
  } catch (error) {
    const error_message = error.response?.data?.message || 'Network error';
    return { success: false, message: error_message };
  }
};

export const updateProfile = async (payload) => {
  try {
    const response = await api.put('/college/profile', payload);
    return response.data;
  } catch (error) {
    const error_message = error.response?.data?.message || 'Network error';
    return { success: false, message: error_message };
  }
};

export const changePassword = async (payload) => {
  try {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  } catch (error) {
    const error_message = error.response?.data?.message || 'Network error';
    return { success: false, message: error_message };
  }
};