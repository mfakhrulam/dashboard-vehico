# Error Handling Test Guide

## Overview
This document describes the error handling implementation for backend validation responses in the Vehico PWA frontend.

## Implementation Details

### Error Parsing Utility (`src/utils/error.ts`)
The `parseApiError()` function handles three types of backend errors:

1. **Field Validation Errors** - Multiple validation failures per field
   ```json
   {
     "success": false,
     "message": "Validation error",
     "errors": [
       { "field": "email", "message": "Email sudah terdaftar" },
       { "field": "password", "message": "Password must contain at least one uppercase letter" }
     ]
   }
   ```
   → Returns: `{ message, formErrors: { email: ["Email sudah terdaftar"], password: [...] } }`

2. **Single Error Messages** - Rate limiting, server errors
   ```json
   {
     "success": false,
     "message": "Terlalu banyak percobaan. Silakan coba lagi nanti."
   }
   ```
   → Returns: `{ message: "Terlalu banyak percobaan..." }` (no formErrors)

3. **HTTP Status Codes** - Fallback handling
   - **429 (Too Many Requests)**: "Terlalu banyak percobaan. Silakan coba lagi nanti."
   - **500 (Server Error)**: "Server error. Silakan coba lagi nanti."

### Authentication Pages Error Display

#### Login Page (`src/pages/Login.tsx`)
- **Global Error Alert**: Shows when multiple validation errors exist (field-level errors box)
- **Field-Level Errors**: Each field shows its backend error message + client validation errors
- **Toast Notification**: Shows general error message for non-validation errors

#### Register Page (`src/pages/Register.tsx`)
- Same error handling as Login page
- Fields: name, email, password

### State Management (`src/hooks/useAuth.ts`)
- `formErrors` state: Tracks backend validation errors
- Cleared on successful login/register
- Populated on mutation error
- Passed to components for field-level display

## Test Scenarios

### Scenario 1: Multiple Field Validation Errors (Register)
**Setup**: Mock backend endpoint with validation errors

```bash
# Request
POST /auth/register
{
  "name": "",
  "email": "notanemail",
  "password": "weak"
}

# Response (400)
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "name", "message": "Nama minimal 2 karakter" },
    { "field": "email", "message": "Email tidak valid" },
    { "field": "password", "message": "Password harus mengandung huruf besar, angka, dan karakter khusus" }
  ]
}
```

**Expected UI Behavior**:
1. ✅ Global alert shows with field errors grouped by field name
2. ✅ Each field shows first error message in red
3. ✅ Toast shows "Registrasi gagal: Validation error"
4. ✅ User can fix errors and try again

### Scenario 2: Single Field Error (Login)
**Setup**: Mock backend endpoint with single field error

```bash
# Request
POST /auth/login
{
  "email": "admin@example.com",
  "password": "wrongpassword"
}

# Response (401)
{
  "success": false,
  "message": "Invalid credentials",
  "errors": [
    { "field": "email", "message": "Email atau password tidak sesuai" }
  ]
}
```

**Expected UI Behavior**:
1. ✅ Global alert shows with single field error
2. ✅ Email field highlighted in red with error message
3. ✅ Toast shows "Login gagal: Invalid credentials"

### Scenario 3: Rate Limiting Error (No Field Errors)
**Setup**: Make 10+ rapid login attempts

```bash
# Response (429)
{
  "success": false,
  "message": "Terlalu banyak percobaan. Silakan coba lagi nanti."
}
```

**Expected UI Behavior**:
1. ✅ NO global alert (no field errors)
2. ✅ Toast shows "Login gagal: Terlalu banyak percobaan. Silakan coba lagi nanti."
3. ✅ Form fields NOT highlighted

### Scenario 4: Server Error
**Setup**: Backend returns 500

```bash
# Response (500)
{
  "success": false,
  "message": "Internal server error"
}
```

**Expected UI Behavior**:
1. ✅ Toast shows error message
2. ✅ NO form validation display
3. ✅ User can retry without clearing form

### Scenario 5: Successful Login (Errors Clear)
**Setup**: User successfully logs in after previous errors

**Expected UI Behavior**:
1. ✅ Global error alert disappears
2. ✅ Form errors cleared
3. ✅ Toast shows success (if any)
4. ✅ Redirect to dashboard

### Scenario 6: Client-Side Validation Only
**Setup**: User types invalid input in form fields without submitting

**Expected UI Behavior**:
1. ✅ Fields show client-side validation errors (Zod schema)
2. ✅ Example: empty name → "Nama minimal 2 karakter"
3. ✅ NO backend call made yet

### Scenario 7: Mixed Client + Backend Errors
**Setup**: Form has client validation error, but backend returns different error on same field

**Expected UI Behavior**:
1. ✅ Combined error array shown (backend + client errors)
2. ✅ First error displayed in field
3. ✅ All errors visible in global alert

## Manual Testing Steps

### 1. Test Register with Multiple Errors
1. Open http://localhost:5173/register
2. Submit form without filling any fields
3. Observe client validation errors on each field
4. Fill fields with invalid data (e.g., "a@b", "weak")
5. Mock backend to return multiple field errors
6. Observe global alert with all field errors grouped
7. Fix errors and successfully register

### 2. Test Login with Field Error
1. Open http://localhost:5173/login
2. Enter wrong credentials
3. Mock backend to return field-level error
4. Observe error display in email field + global alert
5. Try again with correct credentials
6. Errors should clear on success

### 3. Test Rate Limiting
1. Mock rate limit response with 429 status
2. Attempt login 3+ times rapidly
3. Observe toast shows rate limit message
4. Form fields should NOT be highlighted (no field errors)
5. Wait and retry

### 4. Monitor Network Tab
- Check `Content-Type: application/json` in request
- Verify error response format matches expectations
- Confirm Authorization header attached to requests

## Code Changes Summary

### Files Modified
1. **`src/pages/Register.tsx`**
   - Added import: `parseApiError, Alert, useEffect`
   - Added formErrors state from useAuth
   - Added useEffect listener on registerError
   - Updated form fields to display backend + client errors
   - Added global error alert component

2. **`src/pages/Login.tsx`**
   - Same changes as Register.tsx
   - Fields: email, password

3. **`src/hooks/useAuth.ts`**
   - Added formErrors state management
   - Parse errors in mutation onError callbacks
   - Clear errors on successful login/register/logout

4. **`src/utils/error.ts`**
   - Removed unused axios import (export AxiosError only)

### Error Display Components
- **Global Alert**: Shows all field validation errors in grouped format
- **Field Errors**: Each field shows first error message
- **Toast Notifications**: Shows general messages for non-validation errors

## Integration with Other Features

### Vehicle Create/Edit Forms
Future implementations should follow the same pattern:
1. Import `parseApiError, FormErrors, useEffect, Alert`
2. Add `formErrors, setFormErrors` from custom mutation hook
3. Add useEffect listener on error state
4. Display formErrors in form fields and global alert

### Service Record Forms
Same pattern applies for service creation forms.

### Vehicle Sharing
API might return permission-related validation errors - use same error handling.

## Known Limitations

1. **Field name matching**: Backend field names must match form field names for proper display
2. **Multiple errors per field**: All errors shown in global alert, but only first shown in field
3. **Toast stacking**: Multiple rapid errors might show multiple toasts
4. **Refresh token errors**: Handled separately in axios interceptor (redirects to login)

## Future Improvements

1. Add field name translation (backend sends "email", display as "Email")
2. Implement error message i18n with error codes instead of messages
3. Add rate limit countdown timer in UI
4. Implement form-level retry mechanism
5. Add error analytics/logging
6. Cache field validation for offline-first PWA support
