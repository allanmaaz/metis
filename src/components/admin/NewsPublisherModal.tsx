import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NewsCard } from '../news/NewsCard';
import { Send, Eye, Edit3 } from 'lucide-react';

interface NewsPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onPublish: (data: {
    event_id: string;
    headline: string;
    body: string;
    sector: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const NewsPublisherModal: React.FC<NewsPublisherModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onPublish,
}) => {
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [sector, setSector] = useState('EV & Auto');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectorOptions = [
    'EV & Auto',
    'Banking',
    'Energy',
    'Pharma',
    'FMCG',
    'Technology',
    'Macro / Economy',
    'Global Trade',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || headline.length < 5) {
      setError('Headline must be at least 5 characters.');
      return;
    }
    if (!body.trim() || body.length < 10) {
      setError('Body must be at least 10 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await onPublish({
      event_id: eventId,
      headline: headline.trim(),
      body: body.trim(),
      sector: sector.trim(),
    });
    setIsLoading(false);

    if (res.success) {
      setHeadline('');
      setBody('');
      setIsPreview(false);
      onClose();
    } else {
      setError(res.error || 'Failed to publish news.');
    }
  };

  const previewItem = {
    id: 'preview',
    event_id: eventId,
    headline: headline || 'Sample Headline Here',
    body: body || 'Detailed news body content explaining the market situation and regulatory updates.',
    sector,
    published_by: null,
    published_at: new Date().toISOString(),
    is_published: true,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Market News"
      subtitle="Publish factual market wire to all active participant terminals"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Edit vs Preview */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                !isPreview
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Editor
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                isPreview
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </button>
          </div>
        </div>

        {isPreview ? (
          <div className="py-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
              Participant Feed Preview:
            </span>
            <NewsCard news={previewItem} isBreaking />
          </div>
        ) : (
          <>
            {/* Sector Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Sector / Topic
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {sectorOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(s)}
                    className={`text-xs py-1.5 px-2 rounded-xl border text-center font-medium transition-colors ${
                      sector === s
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <Input
              label="Headline (Concise & Clear)"
              type="text"
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                setError(null);
              }}
              autoFocus
            />

            {/* Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Detailed Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Publish Breaking News
          </Button>
        </div>
      </form>
    </Modal>
  );
};
