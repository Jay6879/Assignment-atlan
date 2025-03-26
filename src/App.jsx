import React, { useState, useEffect, useMemo } from 'react';
import QueryControls from './components/QueryControls';
import QueryExecutor from './components/QueryExecutor';
import QueryResult from './components/QueryResult';
import './App.css';

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const newArray = array.slice(); // create a copy
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function App() {
  // State to hold JSON data from multiple files
  const [jsonData, setJsonData] = useState({
    categories: [],
    products: [],
    employees: [],
    customers: [],
  });
  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [sqlInput, setSqlInput] = useState('');

  // Fetch JSON data concurrently on mount
  useEffect(() => {
    Promise.all([
      fetch('/categories.json').then((res) => res.json()),
      fetch('/products.json').then((res) => res.json()),
      fetch('/employees.json').then((res) => res.json()),
      fetch('/customers.json').then((res) => res.json()),
    ])
      .then(([categoriesData, productsData, employeesData, customersData]) => {
        setJsonData({
          categories: categoriesData,
          products: productsData,
          employees: employeesData,
          customers: customersData,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading JSON data:', error);
        setLoading(false);
      });
  }, []);

  // Define multiple dummy queries using the loaded JSON data
  const queries = useMemo(() => {
    return [
      {
        label: 'SELECT * FROM categories',
        query: 'SELECT * FROM categories',
        data: jsonData.categories,
      },
      {
        label: 'SELECT categoryName, description FROM categories',
        query: 'SELECT categoryName, description FROM categories',
        data: jsonData.categories.map((row) => ({
          categoryName: row.categoryName,
          description: row.description,
        })),
      },
      {
        label: 'SELECT * FROM products',
        query: 'SELECT * FROM products',
        data: jsonData.products,
      },
      {
        label: 'SELECT name, unitPrice, unitsInStock FROM products',
        query: 'SELECT name, unitPrice, unitsInStock FROM products',
        data: jsonData.products.map((row) => ({
          name: row.name,
          unitPrice: row.unitPrice,
          unitsInStock: row.unitsInStock,
        })),
      },
      {
        label: 'SELECT name, unitPrice, unitsInStock FROM products WHERE unitPrice > 20',
        query: 'SELECT name, unitPrice, unitsInStock FROM products WHERE unitPrice > 20',
        data: jsonData.products
          .filter((row) => {
            const price = parseFloat(row.unitPrice);
            return price > 20;
          })
          .map((row) => ({
            name: row.name,
            unitPrice: row.unitPrice,
            unitsInStock: row.unitsInStock,
          })),
      },
      {
        label: 'SELECT * FROM employees',
        query: 'SELECT * FROM employees',
        data: jsonData.employees,
      },
      {
        label: 'SELECT firstName, lastName, title FROM employees',
        query: 'SELECT firstName, lastName, title FROM employees',
        data: jsonData.employees.map((row) => ({
          firstName: row.firstName,
          lastName: row.lastName,
          title: row.title,
        })),
      },
      {
        label: 'SELECT * FROM customers',
        query: 'SELECT * FROM customers',
        data: jsonData.customers,
      },
      {
        label: 'SELECT companyName, contactName, contactTitle FROM customers',
        query: 'SELECT companyName, contactName, contactTitle FROM customers',
        data: jsonData.customers.map((row) => ({
          companyName: row.companyName,
          contactName: row.contactName,
          contactTitle: row.contactTitle,
        })),
      },
      {
        label: 'SELECT companyName, contactName, address.city, address.country FROM customers',
        query: 'SELECT companyName, contactName, address.city, address.country FROM customers',
        data: jsonData.customers.map((row) => ({
          companyName: row.companyName,
          contactName: row.contactName,
          'address.city': row.address.city,
          'address.country': row.address.country,
        })),
      },
    ];
  }, [jsonData]);

  // When queries update, initialize SQL text area and displayData with first query's data
  useEffect(() => {
    if (queries.length > 0) {
      setSqlInput(queries[0].query);
      setDisplayData(queries[0].data);
    }
  }, [queries]);

  const handleQueryChange = (e) => {
    const index = parseInt(e.target.value, 10);
    setSelectedQueryIndex(index);
    setSqlInput(queries[index].query);
    setDisplayData(queries[index].data);
  };

  const handleInputChange = (e) => {
    setSqlInput(e.target.value);
  };

  const executeQuery = () => {
    const currentData = queries[selectedQueryIndex].data;
    const randomized = shuffleArray(currentData);
    setDisplayData(randomized);
  };

  const resetResults = () => {
    setDisplayData([]);
    setSqlInput('');
  };

  return (
    <div className="app-container">
      <h1>Atlan Frontend Assignment</h1>
      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <QueryControls
            queries={queries}
            selectedQueryIndex={selectedQueryIndex}
            handleQueryChange={handleQueryChange}
            sqlInput={sqlInput}
            handleInputChange={handleInputChange}
          />

          <div className="query-actions">
            <QueryExecutor executeQuery={executeQuery} />
            <button 
              onClick={resetResults}
              style={{ 
                background: 'linear-gradient(135deg, #64748b, #94a3b8)',
                opacity: displayData.length === 0 ? 0.7 : 1
              }}
            >
              <span>Reset Results</span>
            </button>
          </div>

          <div className="table-container">
            <QueryResult result={displayData} />
          </div>
          <div className="result-count">
            Showing {displayData.length} results
          </div>
        </>
      )}
    </div>
  );
}

export default App;
