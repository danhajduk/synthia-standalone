import React from 'react';
import { getGreeting, getSummaryLine } from '../utils/greetingUtils';

const Header = () => {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = now.toLocaleDateString();

  return (
    <div className="flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-gray-100">{getGreeting()}</h2>
      <p className="text-sm text-gray-400">{getSummaryLine()}</p>
      <p className="text-xs text-gray-500 mt-1">Last synced: {formattedDate} at {formattedTime}</p>
    </div>
  );
};

export default Header;
