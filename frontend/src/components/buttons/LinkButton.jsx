import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseButton from './BaseButton';

export default function LinkButton({ label, icon, navigateTo, ...props }) {
  const navigate = useNavigate();
  return (
    <BaseButton
      icon={icon}
      label={label}
      onClick={() => navigate(navigateTo)}
      {...props}
    />
  );
}
