export const handleAuthError = (navigate) => {
  alert("Session expired. Please login again.");
  localStorage.removeItem("token");
  navigate("/"); // login path
};