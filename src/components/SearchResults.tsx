import { SearchResult } from "../types";
import "./SearchResults.css";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  hasSearched: boolean;
  onResultClick?: (result: SearchResult) => void;
}

function SearchResults({
  results,
  loading,
  hasSearched,
  onResultClick,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="search-results">
        <div className="loading">Loading results...</div>
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

  return (
    <div className="search-results">
      <div className="results-header">{results.length} results found</div>
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
