import {
  CalendarIcon,
  ShieldUserIcon,
  TrashIcon,
  UserCircle2Icon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { SelectUserSchema } from "@/lib/zod/user.zod";
import { ListingView } from "@/shared/types/global";
import { useDeleteUser } from "../queries/use-delete";

type Props = {
  view?: ListingView;
  user: SelectUserSchema;
};

export function UserItem({ view = "list", user }: Props) {
  const { mutate: mutateDelete, isPending: isDeleting } = useDeleteUser();

  if (view === "grid") {
    return (
      <Card className="p-4 rounded-md shadow-none hover:shadow-md transition-shadow group bg-secondary/10">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              {user.isAdmin ? (
                <ShieldUserIcon className="size-5" />
              ) : (
                <UserCircle2Icon className="h-5 w-5" />
              )}
            </div>

            <Button
              variant="destructive"
              onClick={() => mutateDelete(user.id)}
              loading={isDeleting}
            >
              <TrashIcon />
            </Button>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {user.username}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="group flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {user.isAdmin ? (
            <ShieldUserIcon className="size-5" />
          ) : (
            <UserCircle2Icon className="h-5 w-5" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {user.username}
          </h3>

          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Button
        variant="destructive"
        className=""
        onClick={() => mutateDelete(user.id)}
        loading={isDeleting}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}
