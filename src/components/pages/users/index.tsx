import PageContainer from "@/components/layouts/dashboard/page-container";
import { AppPageShell } from "@/components/layouts/dashboard/page-shell";
import { Separator } from "@/components/ui/separator";
import { TEXTS } from "@/lib/language";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { AddUser } from "@/modules/users/components/add-user";

type Props = {};

export function UsersPage({}: Props) {
  const { language } = usePersistStore();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-col w-full h-full gap-4">
        <AppPageShell
          title={TEXTS.users.title[language]}
          description={TEXTS.users.subtitle[language]}
          actionComponent={<AddUser />}
        />

        <Separator />

        {/* <CategoryListing className="flex-1" /> */}
      </div>
    </PageContainer>
  );
}
