import React, { useState, useEffect } from "react";

interface FactCheckPopoverProps {
  selectedText: string;
  isVisible: boolean;
  result?: string | null;
}

interface FactCheckResult {
  success: true;
  accuracy: string;
  explanation: string;
  citations: string[];
  timing: {
    perplexity: string;
    objectGeneration: string;
    total: string;
  };
}

interface FactCheckError {
  success: false;
  error: string;
  details?: string;
}

type ParsedResult = FactCheckResult | FactCheckError;

const FactCheckPopover: React.FC<FactCheckPopoverProps> = ({
  selectedText,
  isVisible,
  result,
}) => {
  const [show, setShow] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  useEffect(() => {
    if (result) {
      try {
        setParsedResult(JSON.parse(result));
      } catch (e) {
        console.error("Failed to parse fact check result:", e);
        setParsedResult({
          success: false,
          error: "Failed to parse the result",
          details: e instanceof Error ? e.message : String(e),
        });
      }
    } else {
      setParsedResult(null);
    }
  }, [result]);

  if (!show) return null;

  return (
    <div className={`fact-check-popover ${isVisible ? "visible" : ""}`}>
      <div className="fact-check-header">
        <h3 className="fact-check-title">Fact Check Results</h3>
      </div>

      <div className="fact-check-content">
        <div className="fact-check-selected-text">
          {selectedText.length > 150
            ? `${selectedText.substring(0, 150)}...`
            : selectedText}
        </div>

        {!parsedResult ? (
          <div className="fact-check-loading">
            <svg
              className="fact-check-loading-spinner"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Analyzing facts...</span>
          </div>
        ) : !parsedResult.success ? (
          <div className="fact-check-error">
            <div className="fact-check-error-message">
              <svg
                className="fact-check-error-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
                  fill="currentColor"
                />
                <path
                  d="M12 14C11.4477 14 11 13.5523 11 13V7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7V13C13 13.5523 12.5523 14 12 14Z"
                  fill="currentColor"
                />
                <path
                  d="M10.5 16.5C10.5 15.6716 11.1716 15 12 15C12.8284 15 13.5 15.6716 13.5 16.5C13.5 17.3284 12.8284 18 12 18C11.1716 18 10.5 17.3284 10.5 16.5Z"
                  fill="currentColor"
                />
              </svg>
              <span>{parsedResult.error}</span>
            </div>
            {parsedResult.details && (
              <div className="fact-check-error-details">
                {String(parsedResult.details)}
              </div>
            )}
          </div>
        ) : (
          <div className="fact-check-result">
            <div className="fact-check-result-header">
              <div
                className="fact-check-accuracy"
                data-accuracy={parsedResult.accuracy}
              >
                {parsedResult.accuracy}
              </div>
            </div>
            <div
              className="fact-check-explanation"
              dangerouslySetInnerHTML={{
                __html: parsedResult.explanation.replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong>$1</strong>"
                ),
              }}
            />
            {parsedResult.citations && parsedResult.citations.length > 0 && (
              <div className="fact-check-citations">
                <div className="fact-check-citations-title">Sources</div>
                <ul className="fact-check-citations-list">
                  {parsedResult.citations.map((citation, index) => (
                    <li key={index}>
                      <a
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fact-check-citation overflow-hidden text-ellipsis"
                      >
                        {citation}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactCheckPopover;
