import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  q: parseAsString,
  sort: parseAsString,
  update: parseAsString,
  category: parseAsString,

  search: parseAsString,
  status: parseAsString
};

export function useSearchParams() {
  return useQueryStates(searchParams);
}
