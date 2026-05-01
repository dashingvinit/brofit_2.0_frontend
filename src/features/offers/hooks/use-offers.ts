import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { offersApi } from "../api/offers-api";
import type { OfferType, CreateOfferData, UpdateOfferData } from "@/shared/types/common.types";

export function useOffers(type?: OfferType, isActive?: boolean) {
  return useQuery({
    queryKey: ["offers", type, isActive],
    queryFn: async () => {
      const response = await offersApi.getAllOffers(type, isActive);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offers", id],
    queryFn: async () => {
      const response = await offersApi.getOfferById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferData) => offersApi.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer created successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create offer";
      toast.error(message);
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferData }) =>
      offersApi.updateOffer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers", variables.id] });
      toast.success("Offer updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update offer";
      toast.error(message);
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersApi.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer deleted successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete offer";
      toast.error(message);
    },
  });
}
