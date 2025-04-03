import React, { useState, useEffect } from "react";
import { sanitizeTitle } from "../helpers";
import { BiLike, BiDislike } from "react-icons/bi";
import { MdFeedback } from "react-icons/md";
import {
  trackPositiveFeedback,
  trackNegativeFeedback,
  trackQualitativeFeedback,
} from "../analytics";

interface FactCheckPopoverProps {
  selectedText: string;
  isVisible: boolean;
  result?: string | null;
  factCheckId: string | null;
  onClose: () => void;
  onAnimationComplete: () => void;
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

interface FeedbackButtonsProps {
  factCheckId: string;
}

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSubmit }) => {
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSubmit(feedbackText);
      onClose();
    }
  };

  return (
    <div className="fact-check-modal-overlay">
      <div className="fact-check-modal">
        <div className="fact-check-modal-header">
          <h3 className="fact-check-modal-title">Send Feedback</h3>
          <button
            onClick={onClose}
            className="fact-check-close-button"
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="fact-check-modal-content">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            className="fact-check-feedback-textarea"
          />
          <div className="fact-check-modal-footer">
            <button className="fact-check-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="fact-check-feedback-submit"
              onClick={handleSubmit}
              disabled={!feedbackText.trim()}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SuccessNotificationProps {
  message: string;
  onDismiss: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fact-check-success-notification">
      <div className="fact-check-success-content">
        <svg
          className="fact-check-success-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <span className="whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ factCheckId }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<
    "positive" | "negative" | null
  >(null);

  const handlePositiveFeedback = () => {
    if (!submittedFeedback) {
      trackPositiveFeedback(factCheckId);
      setSubmittedFeedback("positive");
      setShowSuccessNotification(true);
    }
  };

  const handleNegativeFeedback = () => {
    if (!submittedFeedback) {
      trackNegativeFeedback(factCheckId);
      setSubmittedFeedback("negative");
      setShowSuccessNotification(true);
    }
  };

  const handleSubmitFeedback = (feedbackText: string) => {
    trackQualitativeFeedback({
      factCheckId,
      feedback: feedbackText,
      timestamp: new Date().toISOString(),
    });
    setShowSuccessNotification(true);
  };

  return (
    <div className="fact-check-feedback">
      <span className="fact-check-feedback-label">Results?</span>
      <div className="fact-check-feedback-buttons">
        <button
          className={`fact-check-feedback-button ${
            submittedFeedback === "positive" ? "active" : ""
          }`}
          aria-label="Helpful"
          onClick={handlePositiveFeedback}
          disabled={submittedFeedback !== null}
        >
          <BiLike />
        </button>
        <button
          className={`fact-check-feedback-button ${
            submittedFeedback === "negative" ? "active" : ""
          }`}
          aria-label="Not Helpful"
          onClick={handleNegativeFeedback}
          disabled={submittedFeedback !== null}
        >
          <BiDislike />
        </button>
      </div>
      <button
        className="fact-check-feedback-send"
        aria-label="Send Feedback"
        onClick={() => setShowFeedbackModal(true)}
      >
        <MdFeedback />
        <span>Send Feedback</span>
      </button>
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
      {showSuccessNotification && (
        <SuccessNotification
          message="Thank you for your feedback!"
          onDismiss={() => setShowSuccessNotification(false)}
        />
      )}
    </div>
  );
};

const FactCheckPopover: React.FC<FactCheckPopoverProps> = ({
  selectedText,
  isVisible,
  result,
  factCheckId,
  onClose,
  onAnimationComplete,
}) => {
  const [show, setShow] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => {
        setShow(false);
        onAnimationComplete();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onAnimationComplete]);

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
        <h3 className="fact-check-title">Is this true?</h3>
        <button
          onClick={onClose}
          className="fact-check-close-button"
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="fact-check-content">
        <div className="fact-check-selected-text line-clamp-3">
          {selectedText.length > 250
            ? `${selectedText.substring(0, 250)}...`
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
                {sanitizeTitle(parsedResult.accuracy)}
              </div>
            </div>
            <div
              className="fact-check-explanation"
              dangerouslySetInnerHTML={{
                __html: sanitizeTitle(parsedResult.explanation).replace(
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
            {factCheckId && <FeedbackButtons factCheckId={factCheckId} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactCheckPopover;
