export default function ClassifierBadges({ data, loading, error }) {
  if (loading) return <div>Loading badges...</div>;
  if (error || !data) return <div style={{ color: 'red' }}>Failed to load badge data.</div>;

  console.log("✅ Badge stats:", data);

  const badges = [
    { label: "Unread in Gmail", value: data.unread ?? "?" },
    { label: "Emails Stored", value: data.total ?? 0 },
    { label: "Unclassified", value: data.unclassified ?? 0 },
    { label: "Last Pre-classify", value: data.last_preclassify ?? "?" },
    { label: "Last Trained", value: data.last_trained ?? "?" }
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
