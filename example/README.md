# Mobility Form Backend Mockup

This is a simple FastAPI backend to demonstrate the integration with the Mobility Form frontend.

## Features

- **Auth**: Login, Signup, Me, Verify Email (Mock), Password Reset (Mock).
- **File Storage**: Mock file upload endpoint returning fake URLs.
- **Database**: In-memory storage for submissions.

## Setup

1.  **Install dependencies** (if not already done):

    ```bash
    uv sync
    ```

2.  **Run the server**:

    ```bash
    uv run uvicorn main:app --reload --port 8000
    ```

3.  **Explore API**:
    Open [http://localhost:8000/docs](http://localhost:8000/docs) to see the Swagger UI.

## Integration with Frontend

Ensure your frontend `.env` (or `.env.local`) has:

```env
VITE_AUTH_STRATEGY=fastapi
VITE_DATABASE_STRATEGY=fastapi
VITE_FILE_STORAGE_STRATEGY=fastapi
VITE_CUSTOM_CDN_BASE_URL=http://localhost:8000
```
