import React from 'react';

export default function ModelMetricsTable({ data }) {
  if (!data || !data.report) return <p>Loading metrics...</p>;

  const classNames = Object.keys(data.report).filter(key => !['accuracy', 'macro avg', 'weighted avg'].includes(key));

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <h3 style={{ marginBottom: '1rem' }}>Model Metrics</h3>
      <p><strong>Train Size:</strong> {data.train_size} | <strong>Test Size:</strong> {data.test_size} | <strong>Accuracy:</strong> {(data.accuracy * 100).toFixed(2)}%</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={thStyle}>Label</th>
            <th style={thStyle}>Precision</th>
            <th style={thStyle}>Recall</th>
            <th style={thStyle}>F1-score</th>
            <th style={thStyle}>Support</th>
          </tr>
        </thead>
        <tbody>
          {classNames.map((name, idx) => {
            const m = data.report[name];
            return (
              <tr key={idx}>
                <td style={tdStyle}>{name}</td>
                <td style={tdStyle}>{(m["precision"] * 100).toFixed(1)}%</td>
                <td style={tdStyle}>{(m["recall"] * 100).toFixed(1)}%</td>
                <td style={tdStyle}>{(m["f1-score"] * 100).toFixed(1)}%</td>
                <td style={tdStyle}>{m["support"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
        <p><strong>Precision:</strong> % of relevant emails correctly identified as belonging to a class.</p>
        <p><strong>Recall:</strong> % of actual emails of that class correctly identified.</p>
        <p><strong>F1-score:</strong> Harmonic mean of precision and recall.</p>
        <p><strong>Support:</strong> Number of test samples of the given class.</p>
      </div> */}
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '0.5rem',
  background: '#374151',
  color: '#fff',
  borderBottom: '2px solid #4b5563'
};

const tdStyle = {
  padding: '0.5rem',
  borderBottom: '1px solid #4b5563',
  color: '#e5e7eb'
};
