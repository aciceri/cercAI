import { useState, useCallback } from "react";
import { SearchResult, CachedSearchResults, PaginationData } from "../types";

const RESULTS_PER_PAGE = 10;

export function useSearchPagination() {
  const [cache, setCache] = useState<CachedSearchResults>({});
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getCachedResults = useCallback(
    (query: string, page: number): SearchResult[] | null => {
      return cache[query]?.[page] || null;
    },
    [cache],
  );

  const setCachedResults = useCallback(
    (query: string, page: number, results: SearchResult[]) => {
      setCache((prev) => ({
        ...prev,
        [query]: {
          ...prev[query],
          [page]: results,
        },
      }));
    },
    [],
  );

  const clearCache = useCallback(() => {
    setCache({});
    setCurrentPage(1);
  }, []);

  const getPaginationData = useCallback((page: number): PaginationData => {
    // For this implementation, we'll assume there are always more pages available
    // since we can't know the total without hitting the API
    return {
      currentPage: page,
      totalPages: -1, // Unknown total pages
      hasNextPage: true, // Always assume there might be more
      hasPreviousPage: page > 1,
    };
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const startNewSearch = useCallback((query: string) => {
    setCurrentQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    currentQuery,
    currentPage,
    cache,
    getCachedResults,
    setCachedResults,
    clearCache,
    getPaginationData,
    goToPage,
    nextPage,
    previousPage,
    startNewSearch,
  };
}
