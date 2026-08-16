export function getApiUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("api_url") || "";
}