import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { ROUTES } from "@/shared/lib/constants";
import { OfferForm } from "../components/offer-form";

export function CreateOfferPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <PageHeader
        title="New Offer"
        description="Create a promotion, discount, event, or referral campaign for your members."
      />
      <OfferForm
        onSuccess={() => navigate(ROUTES.OFFERS)}
        onCancel={() => navigate(ROUTES.OFFERS)}
      />
    </div>
  );
}
