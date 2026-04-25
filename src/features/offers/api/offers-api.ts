import { apiClient } from "@/shared/lib/api-client";
import type {
  Offer,
  OfferType,
  CreateOfferData,
  UpdateOfferData,
  ApiResponse,
} from "@/shared/types/common.types";

export const offersApi = {
  getAllOffers: async (
    type?: OfferType,
    isActive?: boolean,
    page = 1,
    limit = 100,
  ): Promise<ApiResponse<Offer[]>> => {
    const params: Record<string, string | number> = { page, limit };
    if (type) params.type = type;
    if (isActive !== undefined) params.isActive = String(isActive);
    const response = await apiClient.get("/offers", { params });
    return response.data;
  },

  getOfferById: async (id: string): Promise<ApiResponse<Offer>> => {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  },

  createOffer: async (data: CreateOfferData): Promise<ApiResponse<Offer>> => {
    const response = await apiClient.post("/offers", data);
    return response.data;
  },

  updateOffer: async (id: string, data: UpdateOfferData): Promise<ApiResponse<Offer>> => {
    const response = await apiClient.patch(`/offers/${id}`, data);
    return response.data;
  },

  deleteOffer: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/offers/${id}`);
    return response.data;
  },
};
