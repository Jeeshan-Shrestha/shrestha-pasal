const BASE_URL = "/api";
const TOKEN_KEY = "pasal_token";

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: user stays logged in for this tab only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** fetch wrapper: adds the bearer token, parses JSON, throws ApiError with a readable message. */
export async function api(path, { method = "GET", body, params } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      // token expired or revoked: drop it and tell the auth provider
      tokenStore.clear();
      window.dispatchEvent(new Event("pasal:unauthorized"));
    }
    const fieldMessage = data?.fieldErrors
      ? Object.values(data.fieldErrors)[0]
      : null;
    throw new ApiError(
      fieldMessage || data?.message || `Request failed (${response.status})`,
      response.status,
      data?.fieldErrors,
    );
  }
  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
