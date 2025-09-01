# Student Academic Exchange Application

This is a web application designed to streamline the application process for a student exchange program. It provides a user-friendly interface for students to submit their applications and for administrators to review and manage them.

## Overview

The platform allows students to fill out a detailed application form, upload required documents, and track the status of their submission. Administrators have access to a dashboard where they can view, filter, sort, and export all applications.

## Tech Stack

### Frontend

- **Framework:** [Vue.js 3](https://vuejs.org/) (with Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **UI Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [PrimeVue](https://primevue.org/) + Custom Components
- **Icons:** [Heroicons](https://heroicons.com/)

### Backend

The application uses a "Backend as a Service" (BaaS) architecture:

- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore)
- **File Storage:** [Supabase Storage](https://supabase.com/docs/guides/storage)

## Features

- **Student Authentication:** Secure sign-up, login, email verification, and password reset functionality.
- **Application Form:** A comprehensive, multi-step form for submitting personal details, academic preferences, and required documents.
- **File Uploader:** A robust file upload system with validation for file types and size.
- **Admin Dashboard:** A powerful interface for administrators to manage all submissions with searching, sorting, and filtering capabilities.
- **Data Export:** Admins can export individual or bulk submission data in JSON format.
- **Responsive Design:** The UI is fully responsive and works on all screen sizes.

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/Hermann-web/exchange-form.git
    cd exchange-form
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Environment Configuration

1.  **Create a `.env` file:**
    Duplicate the example environment file `example.env` and rename it to `.env`.

    ```sh
    cp example.env .env
    ```

2.  **Set up backend services:**
    This project requires Firebase and Supabase for backend functionality.
    - Create a **Firebase** project and enable **Authentication** (with the Email/Password provider) and **Firestore**.
    - Create a **Supabase** project and create a **Storage Bucket** named `submissions`.

3.  **Fill in your environment variables** in the `.env` file with your credentials from Firebase and Supabase:

    ```env
    # Supabase configuration
    VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key

    # Allowed email domain for authentication
    # Example: "centrale-casablanca.ma" or "gmail.com" or others
    VITE_ALLOWED_EMAIL_DOMAIN=your-email-domain.com
    ```

4.  **Add your Firebase configuration** directly into `src/lib/firebase.ts`. Replace the placeholder configuration with your own.

    > **Note:** For a production environment, it is strongly recommended to use a more secure method for handling these keys rather than hardcoding them in the client-side application.

### Running the Application

Once the installation and configuration are complete, you can run the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Compiles and bundles the application for production.
- `npm run preview`: Serves the production build locally for previewing.
- `npm run format`: Formats all files using Prettier.
