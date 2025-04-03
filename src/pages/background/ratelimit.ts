interface RateLimitData {
  count: number;
  resetTime: number;
}

// Number of requests per day
const RATE_LIMIT = 10;

// Check if the user is within their rate limit
export async function checkRateLimit(): Promise<boolean> {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  return new Promise((resolve) => {
    chrome.storage.local.get(["rateLimit"], (result) => {
      const data: RateLimitData = result.rateLimit || {
        count: 0,
        resetTime: now,
      };

      // Reset if we're in a new day
      if (now >= data.resetTime) {
        const newData: RateLimitData = {
          count: 1,
          resetTime: now + dayInMs,
        };
        chrome.storage.local.set({ rateLimit: newData });
        resolve(true);
      } else if (data.count < RATE_LIMIT) {
        // 10 requests per day limit
        const newData: RateLimitData = {
          ...data,
          count: data.count + 1,
        };
        chrome.storage.local.set({ rateLimit: newData });
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
