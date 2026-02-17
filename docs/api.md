# HomeCook API

Base URL: `http://localhost:3000`

Protected endpoints require `Authorization: Bearer <token>`.

## Health

- `GET /health`
- Response: `{ "status": "ok" }`

## Auth

- `POST /auth/signup`
  - Body: `{ "email": "user@example.com", "username": "chefkevin", "password": "secret123" }`
  - Response: `{ "message": "Account created. Check your email for your verification code.", "email": "user@example.com" }`
- `POST /auth/resend-verification`
  - Body: `{ "email": "user@example.com" }`
- `POST /auth/verify-email`
  - Body: `{ "email": "user@example.com", "code": "123456" }`
  - Response: `{ "token": "...", "user": { "id": 1, "email": "user@example.com", "username": "chefkevin", "onboardingCompleted": false } }`
- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret123" }`
  - Note: email must be verified first.
- `POST /auth/forgot-password`
  - Body: `{ "email": "user@example.com" }`
- `POST /auth/reset-password`
  - Body: `{ "email": "user@example.com", "code": "123456", "newPassword": "newSecret123" }`
- `POST /auth/profile` (protected)
  - Body: `{ "age": 29, "identity": "Non-binary, they/them" }`
- `GET /auth/me` (protected)

## Pantry

- `GET /pantry` (protected)
- `POST /pantry` (protected)
  - Body: `{ "name": "Tomato", "quantity": 2 }`
- `DELETE /pantry` (protected)
  - Body: `{ "id": 1 }` or `{ "name": "Tomato" }`

## Uploads

- `POST /uploads` (protected)
  - Body: `{ "imageBase64": "<base64>" }`
- `GET /uploads/:id` (protected)

## Nutrition

- `POST /nutrition/barcode` (protected)
  - Body: `{ "barcode": "012345678905" }`
