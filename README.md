# HubSpot Content Media Hub AI Demo

This is a demo application that showcases a modern, AI-powered web application using a stack that includes React, Supabase, and various AI services. The application serves as an internal tool for the Content Media team at HubSpot, allowing them to submit new ideas, view team-wide submissions, receive daily AI-generated insights on the latest industry trends, and search local and global databases from one location.

## Key Features

-   **AI-Powered Daily Insights**: A serverless function runs daily to fetch the latest trends in digital marketing and technology using the Brave Search API. This content is then analyzed by OpenAI's GPT-4o to generate actionable insights for the content team.
-   **Team Idea Submission & Collaboration**: Authenticated users can submit new content ideas through a simple form. All ideas are stored in a shared database and displayed in a table for team visibility.
-   **Content Analysis**: (Future implementation) Submitted ideas can be automatically analyzed for relevance, originality, and potential impact using AI.
-   **Secure User Authentication**: User management and authentication are handled by Supabase Auth, providing a secure and easy-to-use login system.

## Tech Stack

-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tremor](https://www.tremor.so/) for UI components & dashboards.
-   **Backend**:
    -   [Supabase](https://supabase.io/)
        -   **Auth**: User authentication and management.
        -   **Postgres Database**: Storing user data, ideas, and daily insights.
        -   **Edge Functions**: Deno-based serverless functions for backend logic.
-   **AI Services**:
    -   [OpenAI GPT-4o](https://openai.com/gpt-4o/): For generating daily insights from search results.
    -   [Brave Search API](https://brave.com/search/api/): For fetching real-time, relevant web content.

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   A Supabase account and a new project created.
-   API keys for OpenAI and Brave Search.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hubspot-ai-demo.git
cd hubspot-ai-demo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

You will need to set up both local environment variables for the frontend and secrets for the Supabase functions.

**For the Frontend:**

Create a `.env` file in the root of the project and add your Supabase Project URL and Anon Key.

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

You can find these in your Supabase project's "Project Settings" > "API" section.

**For Supabase Edge Functions:**

You need to set secrets for the Supabase CLI. This is more secure than committing them to a file.

```bash
supabase secrets set OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
supabase secrets set BRAVE_API_KEY="YOUR_BRAVE_API_KEY"
```

### 4. Set Up the Database

You will need to create the necessary tables in your Supabase database. You can use the SQL statements from the `supabase/migrations` directory or define them in the Supabase table editor.

-   `daily_insights` (id, created_at, content)
-   `ideas` (id, created_at, title, description, user_id)

### 5. Deploy Supabase Functions

The backend logic resides in Supabase Edge Functions. Deploy them using the Supabase CLI:

```bash
supabase functions deploy --project-ref YOUR_PROJECT_REF
```

The `generate-daily-insights` function is designed to be called on a schedule. You can set this up using Supabase Cron Jobs to run it once a day.

### 6. Run the Application

Now you can run the frontend development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
