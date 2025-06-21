import React, { useState, FormEvent } from 'react';
import { supabase } from '@/services/supabase';
import { Card, CardHeader } from '@/components/ui/Card';
import { eventBus } from '@/lib/events';
import cardStyles from '@/styles/card.module.css';

export function ContentSubmissionForm() {
    const [title, setTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const { error } = await supabase.functions.invoke('submit-idea', {
                body: { title },
            });

            if (error) throw new Error(error.message);

            setTitle('');

            setTimeout(() => {
                eventBus.emit('refreshIdeas');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="mb-8" style={{ height: '100%' }}>
            <CardHeader>
              <h3 className="font-semibold" style={{ fontSize: '1.25rem' }}>Submit a New Idea 💡</h3>
            </CardHeader>
            <form onSubmit={handleSubmit} className={cardStyles.submissionForm}>
                <textarea
                  className={cardStyles.textarea}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Describe your content idea in detail..."
                  required
                />
                <button 
                  type="submit" 
                  className={cardStyles.submitButton}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting || !title}
                >
                    {submitting ? 'Submitting...' : 'Submit for Analysis'}
                </button>
                {error && <p style={{ color: 'red', fontSize: '1rem' }}>Error: {error}</p>}
            </form>
        </Card>
    );
} 