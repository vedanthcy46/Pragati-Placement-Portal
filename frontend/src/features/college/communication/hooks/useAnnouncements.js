import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
} from "../services/communicationService";

export const useAnnouncements = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState(initialParams);

  // F1-1 & F5-MIN: Fetch Announcements using React Query
  const {
    data = { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["announcements", queryParams],
    queryFn: async () => {
      const response = await getAnnouncements(queryParams);

      const payloadData = response?.data?.data || response?.data || response;
      const items = Array.isArray(payloadData)
        ? payloadData
        : Array.isArray(payloadData?.data)
        ? payloadData.data
        : [];

      const metadata = response?.data?.meta || payloadData?.meta || {
        page: 1,
        limit: 10,
        total: items.length,
        totalPages: 1,
      };

      return { items, meta: metadata };
    },
    refetchOnWindowFocus: true,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (announcementData) => createAnnouncement(announcementData),
    onSuccess: () => {
      toast.success("Announcement created successfully!");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create announcement."
      );
    },
  });

  // Edit Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, announcementData }) =>
      updateAnnouncement(id, announcementData),
    onSuccess: () => {
      toast.success("Announcement updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update announcement."
      );
    },
  });

  // F2-2: Delete Mutation with Optimistic Update & Rollback
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      const previousData = queryClient.getQueryData(["announcements", queryParams]);

      if (previousData) {
        queryClient.setQueryData(["announcements", queryParams], {
          ...previousData,
          items: (previousData.items || []).filter((item) => item.id !== id),
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["announcements", queryParams],
          context.previousData
        );
      }
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete announcement."
      );
    },
    onSuccess: () => {
      toast.success("Announcement deleted successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  // F2-1: Publish Mutation with Optimistic Update & Rollback
  const publishMutation = useMutation({
    mutationFn: (id) => publishAnnouncement(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      const previousData = queryClient.getQueryData(["announcements", queryParams]);

      if (previousData) {
        queryClient.setQueryData(["announcements", queryParams], {
          ...previousData,
          items: (previousData.items || []).map((item) =>
            item.id === id ? { ...item, status: "Published" } : item
          ),
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["announcements", queryParams],
          context.previousData
        );
      }
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to publish announcement."
      );
    },
    onSuccess: () => {
      toast.success("Announcement published successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  // F2-1: Unpublish Mutation with Optimistic Update & Rollback
  const unpublishMutation = useMutation({
    mutationFn: (id) => unpublishAnnouncement(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      const previousData = queryClient.getQueryData(["announcements", queryParams]);

      if (previousData) {
        queryClient.setQueryData(["announcements", queryParams], {
          ...previousData,
          items: (previousData.items || []).map((item) =>
            item.id === id ? { ...item, status: "Draft" } : item
          ),
        });
      }

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["announcements", queryParams],
          context.previousData
        );
      }
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to unpublish announcement."
      );
    },
    onSuccess: () => {
      toast.success("Announcement unpublished successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements: data.items,
    meta: data.meta,
    loading: isLoading,
    isError,
    error: error
      ? error.response?.data?.message || error.message || "Failed to fetch announcements."
      : null,
    queryParams,
    setQueryParams,
    fetchAnnouncements: refetch,
    addAnnouncement: createMutation.mutate,
    editAnnouncement: (id, formData) =>
      updateMutation.mutate({ id, announcementData: formData }),
    removeAnnouncement: deleteMutation.mutate,
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
  };
};

export default useAnnouncements;