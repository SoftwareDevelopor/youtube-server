# User Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Endpoints

### 1. Register User
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phonenumber": 1234567890,
  "logo": "avatar-url.png" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phonenumber": 1234567890,
      "logo": "avatar-url.png"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Login User
**POST** `/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phonenumber": 1234567890,
      "logo": "avatar-url.png"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get User Profile
**GET** `/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phonenumber": 1234567890,
      "logo": "avatar-url.png"
    },
    "stats": {
      "points": 100,
      "isPremium": false,
      "premiumExpiry": null
    }
  }
}
```

### 4. Update User Profile
**PUT** `/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phonenumber": 9876543210,
  "logo": "new-avatar.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Updated",
      "email": "john@example.com",
      "phonenumber": 9876543210,
      "logo": "new-avatar.png"
    }
  }
}
```

### 5. Change Password
**PUT** `/change-password`

Change user password.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Logout
**POST** `/logout`

Logout user (client-side token removal).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Management Endpoints

### 1. Get All Users (Admin)
**GET** `/user/userdata/users`

Get all users (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phonenumber": 1234567890,
      "logo": "avatar1.png"
    },
    {
      "id": "user_id_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phonenumber": 9876543210,
      "logo": "avatar2.png"
    }
  ]
}
```

### 2. Get User by ID
**GET** `/user/userdata/users/:userId`

Get specific user by ID.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phonenumber": 1234567890,
    "logo": "avatar.png"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication with 7-day expiration
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
5. **Data Sanitization**: Passwords are never returned in responses

## Usage Examples

### Frontend Integration

```javascript
// Register user
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Login user
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Get profile (with token)
const getProfile = async (token) => {
  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.json();
};
```

## Environment Variables

Set the following environment variables in production:

```env
JWT_SECRET=your_secure_jwt_secret_here
DB_URL=your_mongodb_connection_string
``` # youtube-server
# youtube-server
