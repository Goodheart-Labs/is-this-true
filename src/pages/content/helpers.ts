/**
 * This cleans up titles to make them more palatable to users
 */
export function sanitizeTitle(str: string) {
  return str
    .replace("Almost certainly false", "Recommended context")
    .replace("almost certainly false", "recommended context");
}
