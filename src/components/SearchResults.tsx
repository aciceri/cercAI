import { SearchResult } from "../types";
import LoadingAnimation from "./LoadingAnimation";
import "./SearchResults.css";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  hasSearched: boolean;
  onResultClick?: (result: SearchResult) => void;
  searchDuration?: number;
}

function SearchResults({
  results,
  loading,
  hasSearched,
  onResultClick,
  searchDuration,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="search-results">
        <LoadingAnimation message="Loading results..." showTimer={true} />
      </div>
    );
  }

  if (!results || results.length === 0) {
    if (hasSearched) {
      return (
        <div className="search-results">
          <div className="no-results">No results to display</div>
        </div>
      );
    } else {
      return null; // Don't display anything if no search has been performed
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return "";
    if (duration < 1000) {
      return ` (${Math.round(duration)}ms)`;
    }
    return ` (${(duration / 1000).toFixed(1)}s)`;
  };

  return (
    <div className="search-results">
      <div className="results-header">
        {results.length} results found{formatDuration(searchDuration)}
      </div>
      {results.map((result, index) => (
        <div
          key={index}
          className={`result-item ${onResultClick ? "clickable" : ""}`}
          onClick={() => onResultClick?.(result)}
        >
          <div className="result-url">{result.url}</div>
          <h3 className="result-title">{result.title}</h3>
          <p className="result-description">{result.description}</p>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
