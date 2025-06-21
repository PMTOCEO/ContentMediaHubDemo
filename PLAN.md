# Content Idea Management Dashboard: Implementation Plan

This document outlines the step-by-step plan to build the Content Idea Management Dashboard. We will use this as our source of truth throughout the development process.

## Prerequisites

Before we begin, ensure you have:
1.  **Supabase Project**: A live Supabase project.
2.  **API Keys**:
    -   OpenAI API Key
    -   Brave Search API Key (optional, but part of the full implementation)
3.  **Local Environment Setup**:
    -   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a `.env.local` file in the project root for the frontend.
    -   The Supabase CLI installed and linked to your project (`supabase login`, `supabase link`).

---

## **Phase 1: Backend Foundation (Supabase Setup)**

*Goal: Prepare the Supabase backend, database schema, and serverless function.*

### **Step 1.1: Create Database Schema**

We will execute the following SQL in the **Supabase SQL Editor** to create our tables and enable Row Level Security.

```sql
-- Core content ideas table
CREATE TABLE content_ideas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('blog', 'video', 'social', 'email')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  user_id uuid REFERENCES auth.users(id),
  raw_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analysis results with comprehensive scoring
CREATE TABLE content_analysis (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_idea_id bigint REFERENCES content_ideas(id) ON DELETE CASCADE,
  analysis_type text NOT NULL, -- 'openai_analysis', 'trend_research', 'final_score'
  score numeric(3,2) CHECK (score >= 0 AND score <= 10),
  insights jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_content_ideas_user_status ON content_ideas(user_id, status);
CREATE INDEX idx_analysis_content_type ON content_analysis(content_idea_id, analysis_type);

-- Row Level Security policies
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ideas" ON content_ideas
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view analysis of own ideas" ON content_analysis
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM content_ideas 
    WHERE id = content_analysis.content_idea_id 
    AND user_id = auth.uid()
  ));
```

### **Step 1.2: Set Up Supabase Edge Function**

We will create the placeholder for our serverless function using the Supabase CLI.

```bash
# Run this command in your terminal at the project root
supabase functions new analyze-content
```
This will create the file `supabase/functions/analyze-content/index.ts`.

### **Step 1.3: Configure Environment Variables**

In your Supabase project dashboard, navigate to **Settings -> Edge Functions** and set the following secrets. Our function will use these to access external APIs securely.
- `OPENAI_API_KEY`: Your key from OpenAI.
- `BRAVE_API_KEY`: Your key from Brave Search.
- `SUPABASE_SERVICE_ROLE_KEY`: Your project's service role key (found in Project Settings -> API).

---

## **Phase 2: Frontend Development (React UI)**

*Goal: Build the user-facing components for submitting and viewing content ideas.*

### **Step 2.1: Install Frontend Dependencies**

We'll install the necessary libraries for our React application.

```bash
npm install @supabase/supabase-js @tremor/react @heroicons/react react-hot-toast
```

### **Step 2.2: Generate TypeScript Types from Schema**

We'll use the Supabase CLI to generate TypeScript types from our database schema, ensuring type safety.

```bash
# Run this command after setting up the tables in Step 1.1
supabase gen types typescript --project-id <your-project-ref> --schema public > src/types/database.types.ts
```

### **Step 2.3: Implement Content Submission Form**

We will create a new file at `src/components/ContentSubmissionForm.tsx`. This component will contain a form that inserts new entries into the `content_ideas` table.

### **Step 2.4: Implement Initial Content Dashboard**

We will create a new file at `src/components/ContentDashboard.tsx`. This component will fetch and display all entries from the `content_ideas` table.

### **Step 2.5: Assemble the Main Application View**

We will update `src/App.tsx` to render the `ContentSubmissionForm` and `ContentDashboard` components, creating the primary application UI. We will also add a simple authentication layer.

---

## **Phase 3: Backend Logic (Edge Function Implementation)**

*Goal: Build the server-side logic that analyzes content ideas.*

### **Step 3.1: Build the Core Edge Function**

We will implement the logic in `supabase/functions/analyze-content/index.ts`. The function will:
1.  Receive a `content_id` from a POST request.
2.  Use the Supabase service role client to fetch the content idea from the database.
3.  Update the idea's status to `analyzing`.

### **Step 3.2: Integrate OpenAI and Brave Search APIs**

Inside the Edge Function, we will add the logic to:
1.  Make a call to the OpenAI API with a prompt to analyze the content's quality.
2.  Make a call to the Brave Search API to find recent articles and trends related to the content's title.

### **Step 3.3: Synthesize and Store Analysis Results**

Finally, the function will:
1.  Make a final call to OpenAI, providing the initial analysis and the trend data, asking it to synthesize a final score and recommendations.
2.  Store these results in our `content_analysis` table.
3.  Update the content idea's status to `completed`.

---

## **Phase 4: Integration and Real-time Updates**

*Goal: Automate the analysis pipeline and enable a real-time user experience.*

### **Step 4.1: Automate Analysis with Database Webhook**

We will create a database function and trigger in the **Supabase SQL Editor**. This will automatically invoke our Edge Function whenever a new content idea is created.

```sql
-- This function is called by the trigger
CREATE OR REPLACE FUNCTION request_content_analysis()
RETURNS trigger AS $$
BEGIN
  -- We use pg_net to make an async HTTP request to our Edge Function
  PERFORM net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/analyze-content',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object('content_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This trigger fires after a new row is inserted into content_ideas
CREATE TRIGGER on_new_content_idea
  AFTER INSERT ON content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION request_content_analysis();
```
**Note:** You must run `ALTER SYSTEM SET app.service_role_key = '<your-service-role-key>'` once as a superuser in the SQL editor to allow the trigger to access the key. You will also need to enable the `pg_net` extension in your Supabase project under **Database -> Extensions**.

### **Step 4.2: Enable Real-time Dashboard Updates**

We will update `src/components/ContentDashboard.tsx` to use Supabase Realtime. We will subscribe to changes in the `content_ideas` table, so the UI updates automatically as the analysis status changes without needing a page refresh.

### **Step 4.3: Display Final Analysis and Visualizations**

We will complete the dashboard by:
1.  Fetching the associated data from the `content_analysis` table.
2.  Displaying the final scores, insights, and key themes.
3.  Using Tremor's `<BarChart>` component to create a visual representation of the content scores.