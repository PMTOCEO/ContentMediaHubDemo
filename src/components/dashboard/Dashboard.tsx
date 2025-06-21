import React from 'react';
import { ContentSubmissionForm } from '@/components/dashboard/NewIdeaSubmissionCard';
import { IdeasTable } from '@/components/dashboard/TeamIdeasTable';
import { TodaysInsights } from '@/components/dashboard/DailyInsightsCard';

const dashboardContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: '32px',
};

export function Dashboard() {
  return (
    <div style={dashboardContainerStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        <ContentSubmissionForm />
        <TodaysInsights />
      </div>
      <div>
        <IdeasTable />
      </div>
    </div>
  );
} 