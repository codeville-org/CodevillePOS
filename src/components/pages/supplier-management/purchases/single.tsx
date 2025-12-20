import { Loader } from "lucide-react";
import { useParams } from "react-router-dom";

import PageContainer from "@/components/layouts/dashboard/page-container";
import { ManagePurchase } from "@/modules/purchases/components/manage-purchase";
import { PurchaseActions } from "@/modules/purchases/components/purchase-actions";
import { SinglePurchaseHeader } from "@/modules/purchases/components/single-purchase-header";
import { useGetPurchaseById } from "@/modules/purchases/queries/use-get-by-id";

type Props = {};

export function SinglePurchasePage({}: Props) {
  const params = useParams<{ id: string }>();
  const { data, error, isPending } = useGetPurchaseById(params.id);

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="p-2 rounded-full bg-secondary">
          <Loader className="animate-spin size-5 text-secondary-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col w-full h-full gap-4">
        <SinglePurchaseHeader purchase={data} />

        <div className="flex-1 flex flex-col gap-2">
          <ManagePurchase className="flex-1" purchase={data} />

          <PurchaseActions purchase={data} />
        </div>
      </div>
    </PageContainer>
  );
}
