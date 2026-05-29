# Validators Utility Documentation

## Overview

The `validators.js` file provides reusable validation functions for form inputs across the application. All validators return an empty string if validation passes, or an error message if validation fails.

## Location

```
src/utils/validators.js
```

## Functions

### `validateEmail(email)`

Validates email format using standard email regex pattern.

**Parameters:**
- `email` (string): The email address to validate

**Returns:**
- Empty string `""` if valid
- Error message string if invalid

**Validation Rules:**
- Email is required (not empty)
- Must match format: `something@domain.extension`

**Examples:**
```javascript
validateEmail("user@example.com")  // Returns: ""
validateEmail("")                   // Returns: "Email is required"
validateEmail("invalid-email")      // Returns: "Invalid email format"
```

---

### `validatePassword(password)`

Validates password strength according to security requirements.

**Parameters:**
- `password` (string): The password to validate

**Returns:**
- Empty string `""` if valid
- Error message string if invalid

**Validation Rules:**
- Password is required
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)
- Must contain special character (non-alphanumeric)

**Examples:**
```javascript
validatePassword("SecurePass123!")   // Returns: ""
validatePassword("")                  // Returns: "Password is required"
validatePassword("weak")             // Returns: "Password must contain..."
```

---

### `validateName(name)`

Validates name field for user registration.

**Parameters:**
- `name` (string): The name to validate

**Returns:**
- Empty string `""` if valid
- Error message string if invalid

**Validation Rules:**
- Name is required (not empty)
- Minimum 2 characters after trimming

**Examples:**
```javascript
validateName("John Doe")    // Returns: ""
validateName("")            // Returns: "Name is required"
validateName("A")           // Returns: "Name must be at least 2 characters"
```

---

### `validatePasswordMatch(password, confirmPassword)`

Validates that two passwords match (for signup/password change forms).

**Parameters:**
- `password` (string): The original password
- `confirmPassword` (string): The confirmation password

**Returns:**
- Empty string `""` if they match
- Error message string if they don't match

**Examples:**
```javascript
validatePasswordMatch("Pass123!", "Pass123!")  // Returns: ""
validatePasswordMatch("Pass123!", "")          // Returns: "Please confirm your password"
validatePasswordMatch("Pass123!", "Different") // Returns: "Passwords do not match"
```

---

### `validateSignupForm(form)`

Validates a complete signup form object.

**Parameters:**
- `form` (object): Form data with properties:
  - `name` (string)
  - `email` (string)
  - `password` (string)
  - `confirmPassword` (string)

**Returns:**
- Object with field names as keys and error messages as values
- Empty object `{}` if all fields are valid

**Example:**
```javascript
const form = {
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!"
};

const errors = validateSignupForm(form);
// Returns: {} (no errors)

const invalidForm = {
  name: "",
  email: "invalid",
  password: "weak",
  confirmPassword: "different"
};

const errors2 = validateSignupForm(invalidForm);
// Returns: {
//   name: "Name is required",
//   email: "Invalid email format",
//   password: "Password must contain...",
//   confirmPassword: "Passwords do not match"
// }
```

---

### `validateLoginForm(form)`

Validates a complete login form object.

**Parameters:**
- `form` (object): Form data with properties:
  - `email` (string)
  - `password` (string)

**Returns:**
- Object with field names as keys and error messages as values
- Empty object `{}` if all fields are valid

**Example:**
```javascript
const form = {
  email: "user@example.com",
  password: "SecurePass123!"
};

const errors = validateLoginForm(form);
// Returns: {} (no errors)
```

---

## Constants

### `passwordRules`

Array of password rule objects for UI display purposes (e.g., showing password requirements to users).

**Structure:**
```javascript
[
  { label: "Uppercase", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /[0-9]/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: "Min 8 chars", test: (v) => v.length >= 8 }
]
```

**Usage Example:**
```javascript
import { passwordRules } from "../../utils/validators";

// Display password requirements
passwordRules.map(rule => (
  <div key={rule.label} className={rule.test(password) ? "valid" : "invalid"}>
    {rule.label}
  </div>
));
```

---

## Usage in Components

### Login Component Example

```javascript
import { validateEmail, validatePassword } from "../../utils/validators";

function Login() {
  const handleBlur = (field) => {
    const err = field === "email" 
      ? validateEmail(email)
      : validatePassword(password);
      
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }
    
    // Proceed with login...
  };
}
```

### Signup Component Example

```javascript
import { validateSignupForm, passwordRules } from "../../utils/validators";

function Signup() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateSignupForm(form);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Proceed with signup...
  };
}
```

---

## Design Decisions

### Why return empty string instead of boolean?

Returning empty string for valid and error message for invalid allows:
1. Single function to handle both validation and error message generation
2. Cleaner conditional rendering: `{error && <p>{error}</p>}`
3. No need for separate error message mapping

### Why separate individual validators and form validators?

- **Individual validators**: For real-time validation (on blur, on change)
- **Form validators**: For complete form validation on submit
- Provides flexibility to use whichever approach fits the use case

---

## Testing

### Manual Testing Checklist

- [ ] Email validation accepts valid emails
- [ ] Email validation rejects invalid formats
- [ ] Password validation enforces all rules
- [ ] Password match validation works correctly
- [ ] Name validation enforces minimum length
- [ ] Form validators return correct error objects
- [ ] Empty fields are properly validated

---

## Future Enhancements

Potential additions:
- Phone number validation
- URL validation
- Workspace name validation
- Collection name validation
- API endpoint URL validation
- Custom regex pattern validator
- Async validation (e.g., check if email exists)

---

## Related Files

- `src/components/auth/Login.jsx` - Uses `validateEmail` and `validatePassword`
- `src/components/auth/Signup.jsx` - Can use `validateSignupForm` and `passwordRules`

---

## Maintenance Notes

When modifying password requirements:
1. Update `validatePassword` function logic
2. Update `passwordRules` array for UI display
3. Update documentation
4. Test both Login and Signup forms

---

## Status

✅ **Created and Integrated**

- File created: `src/utils/validators.js`
- Imported by: `Login.jsx`
- All validation functions implemented
- No errors detected
- Ready for use across the application

