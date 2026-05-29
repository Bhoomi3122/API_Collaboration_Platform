/**
 * Validation utility functions for form inputs
 */

/**
 * Validates email format
 * @param {string} email - The email address to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return "";
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  const passwordRules = [
    { test: (v) => v.length >= 8, message: "at least 8 characters" },
    { test: (v) => /[A-Z]/.test(v), message: "an uppercase letter" },
    { test: (v) => /[a-z]/.test(v), message: "a lowercase letter" },
    { test: (v) => /[0-9]/.test(v), message: "a number" },
    { test: (v) => /[^A-Za-z0-9]/.test(v), message: "a special character" },
  ];

  const failedRules = passwordRules.filter(rule => !rule.test(password));

  if (failedRules.length > 0) {
    const missing = failedRules.map(rule => rule.message).join(", ");
    return `Password must contain ${missing}`;
  }

  return "";
};

/**
 * Validates name field
 * @param {string} name - The name to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return "Name is required";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }

  return "";
};

/**
 * Validates that passwords match
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirmation password
 * @returns {string} Error message if they don't match, empty string if they match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return "";
};

/**
 * Password strength rules for display purposes
 */
export const passwordRules = [
  { label: "Uppercase", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /[0-9]/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: "Min 8 chars", test: (v) => v.length >= 8 },
];

/**
 * Validates a complete signup form
 * @param {Object} form - Form data object containing name, email, password, confirmPassword
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateSignupForm = (form) => {
  const errors = {};

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validatePasswordMatch(form.password, form.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
};

/**
 * Validates a complete login form
 * @param {Object} form - Form data object containing email and password
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateLoginForm = (form) => {
  const errors = {};

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

