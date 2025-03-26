import React from 'react';

function QueryControls({ 
  queries, 
  selectedQueryIndex, 
  handleQueryChange, 
  sqlInput, 
  handleInputChange 
}) {
  return (
    <div className="query-controls">
      <div className="form-group">
        <label htmlFor="querySelect">Select a Predefined Query:</label>
        <select id="querySelect" value={selectedQueryIndex} onChange={handleQueryChange}>
          {queries.map((q, index) => (
            <option key={index} value={index}>
              {q.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="sqlInput">SQL Query:</label>
        <textarea
          id="sqlInput"
          rows="4"
          value={sqlInput}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default QueryControls; 