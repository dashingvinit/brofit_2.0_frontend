import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/shared/lib/constants";
import { useOffer } from "../hooks/use-offers";
import { OfferForm } from "../components/offer-form";

export function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offer, isLoading } = useOffer(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Offer not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Edit: ${offer.title}`}
        description="Update the offer details below."
      />
      <OfferForm
        offer={offer}
        onSuccess={() => navigate(ROUTES.OFFERS)}
        onCancel={() => navigate(ROUTES.OFFERS)}
      />
    </div>
  );
}
