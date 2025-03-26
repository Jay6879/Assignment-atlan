import React from 'react';
import DynamicTable from './DynamicTable';

function QueryResult({ result }) {
  if (!result || result.length === 0) {
    return <p>No data available.</p>;
  }

  return <DynamicTable data={result} />;
}

export default QueryResult; 