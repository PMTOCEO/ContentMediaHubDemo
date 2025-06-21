import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { eventBus } from '@/lib/events';
import { Modal } from '@/components/ui/PopupModal';
import tableStyles from '@/styles/table.module.css';
import popupStyles from '@/styles/popup.module.css';
import { LuRefreshCw } from 'react-icons/lu';

// --- Type definition for our new view ---
export type DetailedIdea = {
  id: number;
  title: string;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  project_status: 'New' | 'In Review' | 'In Progress' | 'Complete' | 'On Hold';
  created_at: string;
  user_email: string;
  score: number | null;
  analysis: string | null;
};

// --- Helper for badge colors ---
const projectStatusColors = {
  'New': { bg: '#e0f2fe', text: '#0c4a6e' },
  'In Review': { bg: '#fef9c3', text: '#854d0e' },
  'In Progress': { bg: '#e0e7ff', text: '#3730a3' },
  'Complete': { bg: '#dcfce7', text: '#166534' },
  'On Hold': { bg: '#f1f5f9', text: '#64748b' },
};

const analysisStatusColors = {
    pending: { bg: '#f1f5f9', text: '#64748b' },
    analyzing: { bg: '#fef9c3', text: '#854d0e' },
    completed: { bg: '#dcfce7', text: '#166534' },
    failed: { bg: '#fee2e2', text: '#991b1b' },
  };

// --- Sub-components for a clean structure ---

function StatusDropdown({ ideaId, currentStatus }: { ideaId: number; currentStatus: DetailedIdea['project_status'] }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as DetailedIdea['project_status'];
    setLoading(true);
    setStatus(newStatus);
    const { error } = await supabase.from('content_ideas').update({ project_status: newStatus }).eq('id', ideaId);
    if (error) {
      console.error('Error updating project status:', error);
      setStatus(currentStatus);
    }
    setLoading(false);
  };
  
  const colors = projectStatusColors[status] || projectStatusColors['New'];

  return (
    <div className={tableStyles.projectStatusBadge} style={{ backgroundColor: colors.bg, color: colors.text }}>
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        style={{
          opacity: loading ? 0.7 : 1,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          fontWeight: 'inherit',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          paddingRight: '16px',
          cursor: 'pointer',
        }}
      >
        {Object.keys(projectStatusColors).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: '8px', pointerEvents: 'none'}}>▾</span>
    </div>
  );
}

function IdeaRow({ idea, onSelectIdea }: { idea: DetailedIdea; onSelectIdea: (idea: DetailedIdea) => void }) {
  const analysisColors = analysisStatusColors[idea.analysis_status];
  return (
    <tr>
      <td className={tableStyles.td}>{idea.user_email}</td>
      <td className={tableStyles.td} style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{idea.title}</td>
      <td className={tableStyles.td}>{new Date(idea.created_at).toLocaleDateString()}</td>
      <td className={tableStyles.td}><StatusDropdown ideaId={idea.id} currentStatus={idea.project_status} /></td>
      <td className={tableStyles.td} style={{ textAlign: 'center' }}>
        {idea.analysis_status === 'completed' && idea.score !== null ? (
          <button onClick={() => onSelectIdea(idea)} className={tableStyles.clickableText}>
            {`${idea.score} / 100`}
          </button>
        ) : (
          <span className={tableStyles.analysisStatusBadge} style={{ backgroundColor: analysisColors.bg, color: analysisColors.text }}>
            {idea.analysis_status}
          </span>
        )}
      </td>
    </tr>
  );
}

// --- Main Table Component ---

export function IdeasTable() {
  const [ideas, setIdeas] = useState<DetailedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<DetailedIdea | null>(null);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('detailed_content_ideas').select('*').order('created_at', { ascending: false });
    if (!error) setIdeas(data as DetailedIdea[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIdeas();

    const channel = supabase
      .channel('public:content_ideas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_ideas' }, (payload) => {
        if (payload.new && 'id' in payload.new) {
          const newIdea = payload.new as DetailedIdea;
          setIdeas((currentIdeas) =>
            currentIdeas.map((idea) => (idea.id === newIdea.id ? { ...idea, ...newIdea } : idea))
          );
        }
      })
      .subscribe();

    eventBus.on('refreshIdeas', fetchIdeas);
    return () => {
      channel.unsubscribe();
      eventBus.off('refreshIdeas', fetchIdeas);
    };
  }, [fetchIdeas]);

  if (loading && ideas.length === 0) return <Card><p style={{ fontSize: '1rem' }}>Loading initial ideas...</p></Card>;

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Team Ideas</h2>
          <button onClick={fetchIdeas} disabled={loading} className={tableStyles.refreshButton} style={{ opacity: loading ? 0.7 : 1 }}>
            <LuRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        {ideas.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className={tableStyles.th}>Submitted By</th>
                  <th className={tableStyles.th}>Idea</th>
                  <th className={tableStyles.th}>Date</th>
                  <th className={tableStyles.th}>Project Status</th>
                  <th className={tableStyles.th} style={{ textAlign: 'center' }}>AI Analysis</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} onSelectIdea={setSelectedIdea} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1rem' }}>No ideas submitted yet. Be the first!</p>
        )}
      </Card>

      <Modal isOpen={!!selectedIdea} onClose={() => setSelectedIdea(null)}>
        {selectedIdea?.analysis && <div className={popupStyles.reportContainer} dangerouslySetInnerHTML={{ __html: selectedIdea.analysis }} />}
      </Modal>
    </>
  );
} 