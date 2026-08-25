import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getNotifications,
  getNotificationHistory,
  sendNotification,
  updateNotification,
  deleteNotification,
  triggerNotification,
} from "../services/communicationService";

export const useNotifications = (queryParams = {}) => {
  const queryClient = useQueryClient();

  // F1-2 & F5-MIN: Notifications List Query
  const {
    data: notifications = [],
    isLoading: loadingNotifications,
    error: errorNotifications,
    refetch: fetchNotifications,
  } = useQuery({
    queryKey: ["notifications", queryParams],
    queryFn: async () => {
      const response = await getNotifications(queryParams);
      const items = response?.data?.data || response?.data || response;
      return Array.isArray(items) ? items : [];
    },
    refetchOnWindowFocus: true,
  });

  // F1-2 & F5-MIN: Notification History Query
  const {
    data: history = [],
    isLoading: loadingHistory,
    error: errorHistory,
    refetch: fetchNotificationHistory,
  } = useQuery({
    queryKey: ["notificationHistory"],
    queryFn: async () => {
      const response = await getNotificationHistory();
      const items = response?.data?.data || response?.data || response;
      return Array.isArray(items) ? items : [];
    },
    refetchOnWindowFocus: true,
  });

  // Create/Send Mutation
  const createMutation = useMutation({
    mutationFn: (notificationData) => sendNotification(notificationData),
    onSuccess: () => {
      toast.success("Notification created successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationHistory"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create notification."
      );
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, notificationData }) =>
      updateNotification(id, notificationData),
    onSuccess: () => {
      toast.success("Notification updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationHistory"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update notification."
      );
    },
  });

  // Delete Mutation with Optimistic Update & Rollback
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", queryParams] });
      const previousNotifications = queryClient.getQueryData(["notifications", queryParams]);

      queryClient.setQueryData(["notifications", queryParams], (old) =>
        Array.isArray(old) ? old.filter((item) => item.id !== id) : old
      );

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications", queryParams],
          context.previousNotifications
        );
      }
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete notification."
      );
    },
    onSuccess: () => {
      toast.success("Notification deleted successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationHistory"] });
    },
  });

  // Trigger Notification Dispatch Mutation
  const triggerMutation = useMutation({
    mutationFn: (id) => triggerNotification(id),
    onSuccess: () => {
      toast.success("Notification sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationHistory"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to send notification."
      );
    },
  });

  return {
    notifications,
    history,
    loading: loadingNotifications || loadingHistory,
    error: errorNotifications || errorHistory
      ? (errorNotifications || errorHistory)?.response?.data?.message ||
        "Failed to fetch notifications."
      : null,
    fetchNotifications,
    fetchNotificationHistory,
    create: (data) => createMutation.mutateAsync(data),
    update: (id, data) => updateMutation.mutateAsync({ id, notificationData: data }),
    remove: (id) => deleteMutation.mutateAsync(id),
    send: (id) => triggerMutation.mutateAsync(id),
  };
};

export default useNotifications;