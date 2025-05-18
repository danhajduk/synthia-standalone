import React from 'react';
import { getGreeting, getSummaryLine } from '../utils/greetingUtils';

const Header = () => {
  const now = new Date();
  const isValidDate = !isNaN(now.getTime()); // Check if the date is valid
  const formattedTime = isValidDate ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const formattedDate = isValidDate ? now.toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-2xl font-semibold text-gray-100">{getGreeting()}</h1>
      <h2 className="text-sm text-gray-400">{getSummaryLine()}</h2>
      <p className="text-xs text-gray-500 mt-1">Last synced: {formattedDate} at {formattedTime}</p>
    </div>
  );
};

export default Header;
