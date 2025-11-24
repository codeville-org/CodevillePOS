import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  itemsPerPage: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  entityName: string;
  showText?: boolean;
};

export function Pagination({
  currentPage,
  itemsPerPage,
  totalCount,
  totalPages,
  onPageChange,
  entityName,
  showText = true
}: Props) {
  return (
    <div className="flex items-center justify-between p-4 border-t border-foreground/5 flex-shrink-0">
      {showText && (
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
          {entityName}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className="w-9 h-9"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
