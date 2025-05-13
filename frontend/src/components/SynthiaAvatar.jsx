import React from 'react';
import avatar from '../assets/synthia.png';

const SynthiaAvatar = () => {
  return (
    <div
      style={{
        width: '140px',
        height: '140px',
        borderRadius: '9999px',
        overflow: 'hidden',
        border: '2px solid #a855f7',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}
    >
      <img
        src={avatar}
        alt="Synthia Avatar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 15%', // lower her face
        }}
      />
    </div>
  );
};

export default SynthiaAvatar;
