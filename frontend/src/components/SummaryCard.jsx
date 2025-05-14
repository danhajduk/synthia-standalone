import React from 'react';
import '../styles.css';

const SummaryCard = ({ title, details, actions }) => {
  return (
    <div className="summary-card">
      <h3>{title}</h3>

      <ul>
        {details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>

      <div>
        {actions.map((action, index) => (
          <button key={index} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;
