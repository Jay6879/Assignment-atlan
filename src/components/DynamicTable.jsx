import React from 'react';

function DynamicTable({ data }) {
  if (!data || data.length === 0) return <p>No data available.</p>;
  
  // Helper function to flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else if (Array.isArray(obj[key])) {
        acc[pre + key] = obj[key].join(', ');
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };

  // Flatten the first row to get headers
  const firstRow = flattenObject(data[0]);
  const headers = Object.keys(firstRow);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th key={idx}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => {
          const flattenedRow = flattenObject(row);
          return (
            <tr key={rowIndex}>
              {headers.map((header, idx) => (
                <td key={idx}>{flattenedRow[header]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default DynamicTable; 