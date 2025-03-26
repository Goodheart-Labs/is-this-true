import React, { useState, useEffect } from "react";

interface FactCheckPopoverProps {
  selectedText: string;
  isVisible: boolean;
  result?: string | null;
}

const FactCheckPopover: React.FC<FactCheckPopoverProps> = ({
  selectedText,
  isVisible,
  result,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300); // Match transition duration
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform z-[2147483647] ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-blue-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Fact Check Results</h3>
      </div>

      <div
        className="p-4 overflow-auto"
        style={{ maxHeight: "calc(100dvh - 6rem)" }}
      >
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Selected text:</p>
          <p className="text-sm text-gray-700 italic">
            {selectedText.length > 150
              ? `${selectedText.substring(0, 150)}...`
              : selectedText}
          </p>
        </div>

        {!result ? (
          <div className="flex items-center space-x-3 text-blue-600">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            <span className="text-sm font-medium">Analyzing facts...</span>
          </div>
        ) : (
          <div className="text-sm text-gray-700">{result}</div>
        )}
      </div>
    </div>
  );
};

export default FactCheckPopover;
