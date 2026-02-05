// src/services/authService.js
const API_URL = "http://localhost:4000/users";

// Helper function to get the correct app URL
const getAppUrl = () => {
  return window.location.origin || "http://localhost:3000";
};

// REGISTER USER
export const registerUser = async (data) => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try {
    users = await res.json();
  } catch (e) {
    console.error("Failed to parse users:", e);
    users = [];
  }

  // Email check
  if (users.some((u) => 
    u && u.email && 
    typeof u.email === 'string' && 
    u.email.toLowerCase() === data.email?.toLowerCase()
  )) {
    throw new Error("Email already exists");
  }

  // Phone uniqueness check
  if (users.some((u) => u && u.phone === data.phone)) {
    throw new Error("Phone number already registered");
  }

  // Required fields
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

  // Format validations
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
    cart: [] // Initialize empty cart
  };

  const postRes = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  if (!postRes.ok) {
    throw new Error("Failed to register user");
  }

  // Return user without password for immediate use
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

// LOGIN USER
export const loginUser = async ({ email, password }) => {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPassword = password?.trim();
  
  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password required");
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try {
    users = await res.json();
  } catch (e) {
    throw new Error("Failed to load users");
  }

  const existingUser = users.find((u) => 
    u && u.email && 
    typeof u.email === 'string' && 
    u.email.toLowerCase() === cleanEmail
  );

  if (!existingUser) {
    throw new Error("Invalid email or password");
  }

  if (!existingUser.password) {
    throw new Error("Invalid user data");
  }

  if (existingUser.password !== cleanPassword) {
    throw new Error("Invalid email or password");
  }

  // Return user without password
  const { password: userPassword, ...safeUser } = existingUser;
  return safeUser;
};

// LOGOUT USER
export const logoutUser = async () => {
  try {
    // Clear all storage
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('cart');
    
    // Clear cart from Zustand store if it exists
    if (typeof window !== 'undefined' && window.updateCartState) {
      window.updateCartState([]);
    }
    
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (email) => {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail) throw new Error("Email required");

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try { 
    users = await res.json(); 
  } catch (e) { 
    throw new Error("Failed to load users"); 
  }

  const user = users.find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (!user) throw new Error("Email not found");

  const resetToken = "RESET_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  user.reset_token = resetToken;
  user.reset_expiry = resetExpiry;

  const updateRes = await fetch(`${API_URL}/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!updateRes.ok) throw new Error("Failed to send reset link");

  const resetUrl = `${getAppUrl()}/reset-password?token=${resetToken}`;
  console.log(`📧 EMAIL SENT to ${cleanEmail}:`);
  console.log(`Reset link: ${resetUrl}`);
  
  return { 
    message: "Reset link sent to your email", 
    token: resetToken,
    resetUrl: resetUrl
  };
};

// RESET PASSWORD
export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword || newPassword.length < 6) {
    throw new Error("Invalid token or password too short");
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Server unavailable");
  
  let users = [];
  try { 
    users = await res.json(); 
  } catch (e) { 
    throw new Error("Failed to load users"); 
  }

  const now = new Date().toISOString();
  const user = users.find((u) => 
    u && u.reset_token === token && 
    u.reset_expiry && new Date(u.reset_expiry) > new Date(now)
  );

  if (!user) throw new Error("Invalid or expired reset token");

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

// USER STORAGE FUNCTIONS

// Get user from storage
export const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from storage:", error);
    return null;
  }
};

// Save user to storage
export const saveUserToStorage = (user, rememberMe = false) => {
  try {
    // Remove password before saving
    const { password, ...safeUser } = user;
    const userData = JSON.stringify(safeUser);
    
    if (rememberMe) {
      localStorage.setItem('user', userData);
    } else {
      sessionStorage.setItem('user', userData);
    }
    
    // Dispatch a custom event for immediate navbar update
    const event = new CustomEvent('userStateChanged', { 
      detail: { user: safeUser } 
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error("Error saving user to storage:", error);
    return false;
  }
};

// Clear user from storage
export const clearUserFromStorage = () => {
  try {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Dispatch logout event
    const event = new CustomEvent('userStateChanged', { 
      detail: { user: null } 
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error("Error clearing user from storage:", error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getUserFromStorage();
};

// Get current user (for immediate access)
export const getCurrentUser = () => {
  return getUserFromStorage();
};

// Validate session (optional - for checking with server)
export const validateSession = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    const res = await fetch(`${API_URL}/${user.id}`);
    return res.ok;
  } catch (error) {
    console.error("Session validation failed:", error);
    return false;
  }
};

// Check if user exists by email
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

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    const updatedUser = await response.json();
    
    // Update in storage if this is the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveUserToStorage(updatedUser, localStorage.getItem('user') !== null);
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Helper to sync user state across components
export const syncUserState = (callback) => {
  window.addEventListener('userStateChanged', (e) => {
    callback(e.detail.user);
  });
  
  return () => {
    window.removeEventListener('userStateChanged', callback);
  };
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
  getUserFromStorage,
  getCurrentUser,
  saveUserToStorage,
  clearUserFromStorage,
  isAuthenticated,
  updateUserProfile,
  syncUserState
};