/**
 * Client-side input validator functions.
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email address cannot be empty.";
  }
  // Basic robust email format check
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email format (e.g. name@domain.com).";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password cannot be empty.";
  }
  return null;
};
