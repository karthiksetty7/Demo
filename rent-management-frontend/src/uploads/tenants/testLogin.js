// testLogin.js
import fetch from 'node-fetch';

const login = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Karthik",       // Replace with actual username
        password: "!@#$KARthik%^&*"    // Replace with actual password
      })
    });

    const data = await response.json();
    console.log(data);

    if (data.success) {
      console.log("Login successful! Token:", data.token);
    } else {
      console.log("Login failed:", data.message);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
};

login();