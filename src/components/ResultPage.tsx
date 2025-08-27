import { useEffect, useRef } from 'react';
import { GeneratedPage } from '../types';
import './ResultPage.css';

interface ResultPageProps {
  page: GeneratedPage | null;
  loading: boolean;
  onBack: () => void;
}

function ResultPage({ page, loading, onBack }: ResultPageProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (page && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        // Combine HTML and CSS
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <style>
        ${page.css}
        
        /* Add some default styles for better presentation */
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* Ensure links don't actually work */
        a {
            color: #1a0dab;
            cursor: default;
            pointer-events: none;
        }
        
        /* Make sure content fits well */
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    ${page.html.replace(/<!DOCTYPE html>.*?<body[^>]*>/is, '').replace(/<\/body>.*?<\/html>/is, '')}
</body>
</html>
        `;
        
        doc.open();
        doc.write(fullHTML);
        doc.close();
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-page-header">
          <button className="back-button" onClick={onBack}>
            ← Back to results
          </button>
        </div>
        <div className="result-page-content">
          <div className="loading-page">
            <div className="loading-spinner"></div>
            <p>Generating page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="result-page">
        <div className="result-page-header">
          <button className="back-button" onClick={onBack}>
            ← Back to results
          </button>
        </div>
        <div className="result-page-content">
          <div className="error-page">
            <h2>⚠️ Page Generation Error</h2>
            <p>The system was unable to generate valid content for this page.</p>
            <p>This can happen when the AI fails to produce a response in the correct format.</p>
            <div className="error-actions">
              <button className="retry-button" onClick={onBack}>
                🔄 Back to results and try again
              </button>
            </div>
            <div className="error-details">
              <details>
                <summary>Technical details</summary>
                <p>The LLM may have returned a malformed response or failed to follow JSON generation instructions.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      <div className="result-page-header">
        <button className="back-button" onClick={onBack}>
          ← Back to results
        </button>
        <div className="page-info">
          <h2 className="page-title">{page.title}</h2>
          <span className="page-url">{page.url}</span>
        </div>
      </div>
      
      <div className="result-page-content">
        <iframe
          ref={iframeRef}
          className="page-iframe"
          title={page.title}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

export default ResultPage;