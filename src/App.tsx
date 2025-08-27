import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import Pagination from './components/Pagination'
import ResultPage from './components/ResultPage'
import APISettingsComponent from './components/APISettings'
import { SearchResult, AppView, ResultPageRequest, APIConfig } from './types'
import { useSearchPagination } from './hooks/useSearchPagination'
import { usePageGeneration } from './hooks/usePageGeneration'
import { useAPISettings } from './hooks/useAPISettings'
import { APIService } from './services/apiService'
import './App.css'

function App() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<AppView>('search')
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  
  const {
    settings,
    updateSettings,
    hasValidConfiguration,
    getBestProvider,
    currentProvider,
    changeProvider
  } = useAPISettings()

  const {
    currentQuery,
    currentPage,
    getCachedResults,
    setCachedResults,
    clearCache,
    getPaginationData,
    goToPage,
    nextPage,
    previousPage,
    startNewSearch
  } = useSearchPagination()

  // Get current API configuration
  const getAPIConfig = (): APIConfig | null => {
    const provider = getBestProvider()
    if (!provider) return null
    
    return {
      provider,
      apiKey: settings[provider].apiKey,
      model: settings[provider].model
    }
  }

  const {
    loading: pageLoading,
    currentPage: generatedPage,
    loadPage,
    clearCurrentPage
  } = usePageGeneration(getAPIConfig())

  const performSearch = async (query: string, page: number): Promise<SearchResult[]> => {
    const apiConfig = getAPIConfig()
    if (!apiConfig) {
      throw new Error('API configuration not available. Please configure your API settings.')
    }

    const apiService = new APIService(apiConfig)
    return await apiService.performSearch(query, page)
  }

  const handleSearch = async (query: string): Promise<void> => {
    // Clear current page when starting a new search
    if (currentView === 'result') {
      clearCurrentPage()
      setCurrentView('search')
    }
    
    setHasSearched(true)
    startNewSearch(query)
    await loadSearchPage(query, 1)
  }

  const loadSearchPage = async (query: string, page: number): Promise<void> => {
    // Check cache first
    const cachedResults = getCachedResults(query, page)
    if (cachedResults) {
      setResults(cachedResults)
      return
    }

    // If not cached, fetch from API
    setLoading(true)
    try {
      console.log(`Loading page ${page} for query: "${query}"`)
      const newResults = await performSearch(query, page)
      
      // Cache the results
      setCachedResults(query, page, newResults)
      setResults(newResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = async (result: SearchResult): Promise<void> => {
    const request: ResultPageRequest = {
      result,
      originalQuery: currentQuery
    }
    
    setCurrentView('result')
    await loadPage(request)
  }

  const handleBackToResults = (): void => {
    setCurrentView('search')
    clearCurrentPage()
  }

  // Load page when currentPage changes
  useEffect(() => {
    if (currentQuery && currentPage > 0 && currentView === 'search') {
      loadSearchPage(currentQuery, currentPage)
    }
  }, [currentQuery, currentPage, currentView])

  const handlePageChange = (page: number) => {
    goToPage(page)
  }

  const handleNextPage = () => {
    nextPage()
  }

  const handlePreviousPage = () => {
    previousPage()
  }

  // Render result page view
  if (currentView === 'result') {
    return (
      <div className="app">
        <ResultPage 
          page={generatedPage}
          loading={pageLoading}
          onBack={handleBackToResults}
        />
      </div>
    )
  }

  // Show configuration warning if no API is configured
  if (!hasValidConfiguration()) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-title-section">
            <h1>cercAI</h1>
            <p className="app-subtitle">Why limit yourself to searching results when you can imagine them?</p>
          </div>
          <div className="config-warning">
            <p>⚠️ No API configured. Configure your API keys to use the search engine.</p>
          </div>
          <APISettingsComponent 
            currentSettings={settings}
            onSettingsChange={updateSettings}
            currentProvider={currentProvider}
            onProviderChange={changeProvider}
          />
        </header>
      </div>
    )
  }

  // Render search view
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-and-search">
            <div className="header-title-section">
              <h1>cercAI</h1>
              <div className="header-search-section">
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>
            </div>
            <p className="app-subtitle">Why limit yourself to searching results when you can imagine them?</p>
          </div>
          <APISettingsComponent 
            currentSettings={settings}
            onSettingsChange={updateSettings}
            currentProvider={currentProvider}
            onProviderChange={changeProvider}
          />
        </div>
      </header>
      <main className="app-main">
        <div className="search-section">
          <SearchResults 
            results={results} 
            loading={loading}
            hasSearched={hasSearched}
            onResultClick={handleResultClick}
          />
          {results.length > 0 && !loading && (
            <Pagination
              pagination={getPaginationData(currentPage)}
              onPageChange={handlePageChange}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
