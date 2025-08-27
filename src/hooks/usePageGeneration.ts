import { useState, useCallback } from 'react';
import { GeneratedPage, CachedGeneratedPages, ResultPageRequest, APIConfig } from '../types';
import { APIService } from '../services/apiService';

export function usePageGeneration(apiConfig: APIConfig | null) {
  const [cache, setCache] = useState<CachedGeneratedPages>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<GeneratedPage | null>(null);

  // Create a unique key for caching based on result and query
  const createCacheKey = useCallback((result: ResultPageRequest): string => {
    return btoa(`${result.originalQuery}-${result.result.title}-${result.result.url}`);
  }, []);

  const getCachedPage = useCallback((request: ResultPageRequest): GeneratedPage | null => {
    const key = createCacheKey(request);
    return cache[key] || null;
  }, [cache, createCacheKey]);

  const setCachedPage = useCallback((request: ResultPageRequest, page: GeneratedPage) => {
    const key = createCacheKey(request);
    setCache(prev => ({
      ...prev,
      [key]: page
    }));
  }, [createCacheKey]);

  const generatePage = useCallback(async (request: ResultPageRequest): Promise<GeneratedPage> => {
    if (!apiConfig) {
      throw new Error('API configuration not available');
    }

    const apiService = new APIService(apiConfig);
    return await apiService.generatePage(request);
  }, [apiConfig]);

  const loadPage = useCallback(async (request: ResultPageRequest): Promise<void> => {
    // Check cache first
    const cachedPage = getCachedPage(request);
    if (cachedPage) {
      setCurrentPage(cachedPage);
      return;
    }

    // If not cached, generate from API
    setLoading(true);
    try {
      console.log('Generating page for:', request);
      const page = await generatePage(request);
      
      // Cache the page
      setCachedPage(request, page);
      setCurrentPage(page);
    } catch (error) {
      console.error('Page generation error:', error);
      // Set current page to null to show error state
      setCurrentPage(null);
    } finally {
      setLoading(false);
    }
  }, [getCachedPage, generatePage, setCachedPage]);

  const clearCurrentPage = useCallback(() => {
    setCurrentPage(null);
  }, []);

  return {
    loading,
    currentPage,
    cache,
    loadPage,
    clearCurrentPage
  };
}