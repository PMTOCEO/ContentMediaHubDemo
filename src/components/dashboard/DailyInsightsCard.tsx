import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { supabase } from '@/services/supabase';
import { LuRefreshCw } from "react-icons/lu";
import cardStyles from '@/styles/card.module.css';
import buttonStyles from '@/styles/table.module.css';


export function TodaysInsights() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetchInsights() {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('daily_insights')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      setInsights(data?.content || '<p>No insights found. Click Refresh to generate them!</p>');

    } catch (err: any) {
      setError(err.message);
      setInsights('<p>Could not load insights.</p>');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const { error: invokeError } = await supabase.functions.invoke('generate-daily-insights');
      if (invokeError) throw invokeError;

      // Wait a moment for the new insight to be available, then fetch it
      setTimeout(() => {
        fetchInsights();
      }, 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold" style={{ fontSize: '1.25rem' }}>Daily Insights 📈</h3>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || loading} 
          className={buttonStyles.refreshButton}
          style={{ opacity: (refreshing || loading) ? 0.6 : 1 }}
        >
          <LuRefreshCw style={{ animation: (refreshing || loading) ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </CardHeader>
      <div className={cardStyles.insightsContainer}>
        {(loading || refreshing) && (
          <div className={cardStyles.loadingOverlay}>
            <p style={{ fontSize: '1rem' }}>{loading ? 'Loading...' : 'Generating the latest insights...'}</p>
          </div>
        )}
        {error && <p style={{ color: 'red', fontSize: '1rem' }}>Error: {error}</p>}
        {!loading && insights && (
          <div 
            className="report-container"
            dangerouslySetInnerHTML={{ __html: insights }}
          />
        )}
      </div>
    </Card>
  );
} 