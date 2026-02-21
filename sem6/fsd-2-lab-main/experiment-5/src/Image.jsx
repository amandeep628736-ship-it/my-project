import React from 'react';

function Image() {
  return (
    <div>
      <h2>This is the Image Component</h2>
      <img
        src="/vite.svg"
        alt="Vite Logo"
        loading="lazy"
        style={{ width: '200px', height: '200px' }}
      />
    </div>
  );
}

