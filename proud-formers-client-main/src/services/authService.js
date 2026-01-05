// src/services/authService.js
const API_URL = "http://localhost:4000/users";

// Helper function to get the correct app URL
const getAppUrl = () => {
  // Use window.location.origin to get current app URL (e.g., http://localhost:5173)
  return window.location.origin || "http://localhost:3000";
};

// REGISTER USER
export const registerUser = async (data) => {
  // 1) Safe fetch users
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try {
    users = await res.json();
  } catch (e) {
    console.error("Failed to parse users:", e);
    users = []; // Empty array on parse error
  }

  // 2) Safe email check (handle undefined/null email)
  if (users.some((u) => 
    u && u.email && 
    typeof u.email === 'string' && 
    u.email.toLowerCase() === data.email?.toLowerCase()
  )) {
    throw new Error("Email already exists");
  }

  // 3) Phone uniqueness check (safe)
  if (users.some((u) => u && u.phone === data.phone)) {
    throw new Error("Phone number already registered");
  }

  // 4) Required fields (safe access)
  const requiredFields = {
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    email: data.email?.trim(),
    phone: data.phone?.trim(),
    password: data.password?.trim(),
    address1: data.address1?.trim(),
    city: data.city?.trim(),
    pincode: data.pincode?.trim(),
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new Error(`${field.replace(/([A-Z])/g, " $1").trim()} is required`);
    }
  }

  // 5) Format validations
  if (!/^[6-9]\d{9}$/.test(data.phone)) {
    throw new Error("Phone must be valid 10-digit Indian mobile number");
  }
  if (!/^\d{6}$/.test(data.pincode)) {
    throw new Error("Pincode must be 6 digits");
  }
  if (data.password?.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Build & POST user
  const newUser = {
    id: "USR" + Date.now(),
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    role: "customer",
    password: data.password.trim(),
    created_at: new Date().toISOString().split("T")[0],
    addresses: [{
      id: "AD" + Date.now(),
      full_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
      address_line1: data.address1.trim(),
      address_line2: "",
      city: data.city.trim(),
      pincode: data.pincode.trim(),
      is_default: true,
    }],
  };

  const postRes = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  if (!postRes.ok) {
    throw new Error("Failed to register user");
  }

  return true;
};

// LOGIN USER
export const loginUser = async ({ email, password }) => {
  // 1) Input sanitization
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPassword = password?.trim();
  
  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password required");
  }

  // 2) Safe fetch users
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try {
    users = await res.json();
  } catch (e) {
    throw new Error("Failed to load users");
  }

  // 3) Safe user lookup
  const existingUser = users.find((u) => 
    u &&           // User exists
    u.email &&      // Has email property
    typeof u.email === 'string' &&  // Email is string
    u.email.toLowerCase() === cleanEmail
  );

  if (!existingUser) {
    throw new Error("Invalid email or password");
  }

  // 4) Check if password exists in user object
  if (!existingUser.password) {
    throw new Error("Invalid user data");
  }

  // 5) Compare passwords (plain text comparison - backend should handle hashing)
  if (existingUser.password !== cleanPassword) {
    throw new Error("Invalid email or password");
  }

  // 6) Return safe user without password
  const { password: userPassword, ...safeUser } = existingUser;
  return safeUser;
};

// LOGOUT USER
export const logoutUser = async () => {
  try {
    // For client-side logout, we don't need to call the API
    // We just clear the localStorage or session storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Clear any other stored user data
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};

// FORGOT PASSWORD - Generate reset token & "send email"
export const forgotPassword = async (email) => {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail) throw new Error("Email required");

  // 1) Safe fetch users
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  let users = [];
  try { users = await res.json(); } catch (e) { throw new Error("Failed to load users"); }

  // 2) Find user
  const user = users.find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (!user) throw new Error("Email not found");

  // 3) Generate reset token (24hr expiry)
  const resetToken = "RESET_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  // 4) Update user with reset info
  user.reset_token = resetToken;
  user.reset_expiry = resetExpiry;

  const updateRes = await fetch(`${API_URL}/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!updateRes.ok) throw new Error("Failed to send reset link");

  // 5) SIMULATE EMAIL - Use dynamic URL
  const resetUrl = `${getAppUrl()}/reset-password?token=${resetToken}`;
  console.log(`📧 EMAIL SENT to ${cleanEmail}:`);
  console.log(`Reset link: ${resetUrl}`);
  
  return { 
    message: "Reset link sent to your email", 
    token: resetToken,
    resetUrl: resetUrl // Return the URL for UI display
  };
};

// RESET PASSWORD - Validate token & update password
export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword || newPassword.length < 6) {
    throw new Error("Invalid token or password too short");
  }

  // 1) Fetch users
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  let users = [];
  try { users = await res.json(); } catch (e) { throw new Error("Failed to load users"); }

  // 2) Find user with valid reset token
  const now = new Date().toISOString();
  const user = users.find((u) => 
    u && u.reset_token === token && 
    u.reset_expiry && new Date(u.reset_expiry) > new Date(now)
  );

  if (!user) throw new Error("Invalid or expired reset token");

  // 3) Update password with plain text (backend should hash it)
  user.password = newPassword;
  delete user.reset_token;
  delete user.reset_expiry;

  const updateRes = await fetch(`${API_URL}/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!updateRes.ok) throw new Error("Failed to reset password");

  return { message: "Password reset successfully" };
};

// Optional: Helper function to validate user session
export const validateSession = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Server unavailable");
    const users = await res.json();
    return users.length > 0;
  } catch (error) {
    console.error("Session validation failed:", error);
    return false;
  }
};

// Helper to check if user exists by email
export const checkUserExists = async (email) => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Server unavailable");
    const users = await res.json();
    const cleanEmail = email?.trim().toLowerCase();
    return users.some((u) => 
      u && u.email && 
      typeof u.email === 'string' && 
      u.email.toLowerCase() === cleanEmail
    );
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

// Get current user from storage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Save user to storage
export const saveUserToStorage = (user, rememberMe = false) => {
  try {
    const userData = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem('user', userData);
    } else {
      sessionStorage.setItem('user', userData);
    }
    return true;
  } catch (error) {
    console.error("Error saving user to storage:", error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Export all functions
export default {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  validateSession,
  checkUserExists,
  getCurrentUser,
  saveUserToStorage,
  isAuthenticated,
};

