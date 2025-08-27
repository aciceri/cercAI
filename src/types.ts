export interface SearchResult {
  title: string;
  description: string;
  url: string;
}

export interface APIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export type APIProvider = "openrouter" | "openai";

export interface APIConfig {
  provider: APIProvider;
  apiKey: string;
  model: string;
}

export interface APISettings {
  openrouter: {
    apiKey: string;
    model: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CachedSearchResults {
  [query: string]: {
    [page: number]: SearchResult[];
  };
}

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  currentQuery: string;
  pagination: PaginationData;
  cache: CachedSearchResults;
}

export interface GeneratedPage {
  html: string;
  css: string;
  title: string;
  url: string;
}

export interface CachedGeneratedPages {
  [key: string]: GeneratedPage; // key is a hash of result + query
}

export interface ResultPageRequest {
  result: SearchResult;
  originalQuery: string;
}

export type AppView = "search" | "result";
