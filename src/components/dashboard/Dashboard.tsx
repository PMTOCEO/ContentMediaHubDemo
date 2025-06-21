import React from 'react';
import { ContentSubmissionForm } from './NewIdeaSubmissionCard';
import { IdeasTable } from './TeamIdeasTable';
import { TodaysInsights } from './DailyInsightsCard';

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