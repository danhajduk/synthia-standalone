import { useBadgeStats } from '../hooks/useBadgeStats';

export default function ClassifierBadges() {
  const { data, loading, error } = useBadgeStats(); // default URL is stats

  if (loading) return <div>Loading badges...</div>;
  if (error || !data) return <div style={{ color: 'red' }}>Failed to load badge data.</div>;

  const badges = [
    { label: "Unread in Gmail", value: "14" },
    { label: "Emails Stored", value: data.total ?? 0 },
    { label: "Unclassified", value: data.unclassified ?? 0 },
    { label: "Last Pre-classify", value: "May 12, 1:34 PM" },
    { label: "Last Trained", value: "May 11, 1:02 AM" }
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      {badges.map((badge, idx) => (
        <div key={idx} style={{
          background: '#1f2937',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
          fontSize: '0.875rem'
        }}>
          <strong>{badge.label}:</strong> {badge.value}
        </div>
      ))}
    </div>
  );
}
