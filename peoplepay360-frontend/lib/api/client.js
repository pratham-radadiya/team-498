import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Zod-style validators typically return a generic top-level `error` string
 * (e.g. "Validation failed") plus a field-level array under `issues`/
 * `details`/`errors` — surface that array too, or the message is useless
 * for figuring out which field actually failed.
 */
function describeValidationIssues(data) {
  const issues = data?.issues || data?.details || data?.errors;
  if (!Array.isArray(issues) || issues.length === 0) return null;
  return issues
    .map((issue) => {
      if (typeof issue === "string") return issue;
      const field = Array.isArray(issue.path) ? issue.path.join(".") : issue.path || issue.field;
      const text = issue.message || issue.msg || JSON.stringify(issue);
      return field ? `${field}: ${text}` : text;
    })
    .join("; ");
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    const data = error.response?.data;
    const base = data?.error || error.message || "Something went wrong. Please try again.";
    const issues = describeValidationIssues(data);
    const message = issues ? `${base} (${issues})` : base;
    return Promise.reject(new ApiError(message, status, data));
  }
);

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export default apiClient;
