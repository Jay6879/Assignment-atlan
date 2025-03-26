import React from 'react';

function QueryExecutor({ executeQuery }) {
  return (
    <button 
      onClick={executeQuery} 
      style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
    >
      <span>Run Query</span>
    </button>
  );
}

export default QueryExecutor; 