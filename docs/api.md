# HomeCook API

Base URL: `http://localhost:3000`

All endpoints except `/health` require `Authorization: Bearer <token>`.

## Health

- `GET /health`
- Response: `{ "status": "ok" }`

## Auth

- `POST /auth/signup`
  - Body: `{ "email": "user@example.com", "password": "secret123" }`
  - Response: `{ "token": "...", "user": { "id": 1, "email": "user@example.com" } }`
- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret123" }`
  - Response: `{ "token": "...", "user": { "id": 1, "email": "user@example.com" } }`

## Pantry

- `GET /pantry`
  - Response: `{ "items": [{ "id": 1, "name": "Tomato", "quantity": 2, "created_at": "..." }] }`
- `POST /pantry`
  - Body: `{ "name": "Tomato", "quantity": 2 }`
  - Response: `{ "item": { "id": 1, "name": "Tomato", "quantity": 2 } }`
- `DELETE /pantry`
  - Body: `{ "id": 1 }` or `{ "name": "Tomato" }`
  - Response: `{ "deleted": 1 }`

## Uploads

- `POST /uploads`
  - Body: `{ "imageBase64": "<base64>" }`
  - Response: `{ "id": 1, "ingredients": ["tomato", "onion", "garlic"] }`
- `GET /uploads/:id`
  - Response: `{ "id": 1, "imageBase64": "<base64>", "ingredients": ["..."], "createdAt": "..." }`

## Nutrition

- `POST /nutrition/barcode`
  - Body: `{ "barcode": "012345678905" }`
  - Response: `{ "barcode": "...", "productName": "...", "calories": 120, "protein": 5, "carbs": 14, "fat": 3 }`
