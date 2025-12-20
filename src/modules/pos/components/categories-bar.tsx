import {
  LayoutGridIcon,
  LayoutListIcon,
  SearchIcon,
  XCircleIcon,
  ZapIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TEXTS } from "@/lib/language";
import { SelectCategory } from "@/lib/zod/categories.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { usePosStore } from "@/lib/zustand/pos-store";
import { useGetAllCategories } from "@/modules/categories/queries/use-get-all";

type Props = {};

export function CategoriesBar({}: Props) {
  const { language } = usePersistStore();
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [categorySearchTermDebounce, setCategorySearchTermDebounce] = useState<
    string | null
  >(null);
  const { filter, setFilter, listingMode, setListingMode } = usePosStore();

  const { data, isPending, error } = useGetAllCategories({
    page: "1",
    limit: "50",
    search: categorySearchTermDebounce || undefined,
    sort: "asc"
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setCategorySearchTermDebounce(categorySearchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [categorySearchTerm]);

  if (error) return <></>;

  if (isPending) {
    return (
      <div className="flex items-center gap-2 p-4">
        {Array(5)
          .fill("_")
          .map((_, index) => (
            <Skeleton className="w-36 h-10 rounded-full" key={index} />
          ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex items-center whitespace-nowrap w-full max-w-[calc(100vw-435px)]">
      <div className="flex items-center gap-2 p-4">
        <Button
          variant={"outline"}
          className="rounded-full hover:shadow ease-in-out h-10 w-10 transition-all duration-150 cursor-pointer"
          onClick={() =>
            listingMode === "grid"
              ? setListingMode("list")
              : setListingMode("grid")
          }
        >
          {listingMode === "grid" ? (
            <LayoutListIcon className="size-4" />
          ) : (
            <LayoutGridIcon className="size-4" />
          )}
        </Button>

        <Badge
          variant={filter === "featured" ? "default" : "secondary"}
          className="rounded-full hover:shadow hover:-translate-y-0.5 ease-in-out h-10 px-4 text-sm transition-all duration-150 cursor-pointer"
          onClick={() =>
            filter === "featured" ? setFilter("all") : setFilter("featured")
          }
        >
          <ZapIcon fill="#fff" />
          {TEXTS.pos.quickAccess[language]}
        </Badge>

        <div className="flex items-center gap-2 h-10 max-w-fit px-3 border border-border rounded-full bg-secondary/50 dark:bg-secondary/30">
          <SearchIcon className="size-4 text-secondary-foreground/70" />

          <input
            className="w-fit text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
            placeholder={TEXTS.pos.categorySearch[language]}
            value={categorySearchTerm}
            onChange={(e) => setCategorySearchTerm(e.target.value)}
          />

          {categorySearchTerm && (
            <XCircleIcon
              className="text-red-500 hover:text-red-600 size-4 cursor-pointer"
              onClick={() => setCategorySearchTerm("")}
            />
          )}
        </div>

        {data.data.map((category) => (
          <Badge
            key={category.id}
            variant={
              (filter as SelectCategory).id === category.id
                ? "default"
                : "secondary"
            }
            className="rounded-full hover:shadow hover:-translate-y-0.5 ease-in-out h-10 px-4 text-sm transition-all duration-150 cursor-pointer"
            onClick={() =>
              (filter as SelectCategory).id === category.id
                ? setFilter("all")
                : setFilter(category)
            }
          >
            {category.name}
          </Badge>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
