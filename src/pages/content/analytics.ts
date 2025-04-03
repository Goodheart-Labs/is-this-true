import { getPostHog } from "./posthog";
import { nanoid } from "nanoid";

interface FactCheckData {
  requestText: string;
  pageTitle: string;
  pageUrl: string;
  response: string;
  timestamp: string;
}

interface FactCheckEvent {
  factCheckId: string;
  requestText: string;
  pageTitle: string;
  pageUrl: string;
  response: string;
  timestamp: string;
}

interface FeedbackEvent {
  factCheckId: string;
  timestamp: string;
}

interface QualitativeFeedbackEvent extends FeedbackEvent {
  feedback: string;
}

// Base event tracking function with common data
const trackFactCheckEvent = (eventName: string, data: FactCheckEvent) => {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.capture(eventName, {
    fact_check_id: data.factCheckId,
    request_text: data.requestText,
    page_title: data.pageTitle,
    page_url: data.pageUrl,
    response: data.response,
    timestamp: data.timestamp,
  });
};

// Track when a fact check is completed (existing functionality)
export const trackFactCheckCompleted = (data: FactCheckData): string => {
  const factCheckId = nanoid();
  trackFactCheckEvent("fact_check_completed", {
    ...data,
    factCheckId,
  });
  return factCheckId;
};

// Track when user gives positive feedback on a fact check
export const trackPositiveFeedback = (factCheckId: string) => {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.capture("fact_check_positive_feedback", {
    fact_check_id: factCheckId,
    timestamp: new Date().toISOString(),
  });
};

// Track when user gives negative feedback on a fact check
export const trackNegativeFeedback = (factCheckId: string) => {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.capture("fact_check_negative_feedback", {
    fact_check_id: factCheckId,
    timestamp: new Date().toISOString(),
  });
};

// Track when user submits qualitative feedback
export const trackQualitativeFeedback = (data: QualitativeFeedbackEvent) => {
  const posthog = getPostHog();
  if (!posthog) return;

  posthog.capture("fact_check_qualitative_feedback", {
    fact_check_id: data.factCheckId,
    feedback: data.feedback,
    timestamp: data.timestamp,
  });
};
