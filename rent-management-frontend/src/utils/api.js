import { handleAuthError } from "./auth";

const BASE_URL = "https://demo-production-bf0f.up.railway.app/api";

export const apiRequest = async ({
  endpoint,
  method = "GET",
  body = null,
  navigate,
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    handleAuthError(navigate);
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    // ✅ Handle 401
    if (res.status === 401) {
      handleAuthError(navigate);
      return null;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // ❗ IMPORTANT CHANGE HERE
    if (!res.ok) {
      console.log("❌ API ERROR RESPONSE:", data);

      // ✅ Show backend message (NOT network error)
      alert(data.message || data.error || "Something went wrong");

      return null; // ❗ DO NOT THROW
    }

    return data;
  } catch (error) {
    console.error("❌ Network Error:", error);

    // ✅ Only real network error here
    alert("Server not reachable. Check internet or backend.");

    return null;
  }
};