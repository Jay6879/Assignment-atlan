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

// Helper function to generate random data based on query structure
function generateRandomData(query) {
  const queryLower = query.toLowerCase();
  
  // Generate random data based on query type
  if (queryLower.includes('categories')) {
    return Array(5).fill(null).map((_, index) => ({
      categoryID: index + 1,
      categoryName: `Category ${index + 1}`,
      description: `Description for Category ${index + 1}`,
    }));
  }
  
  if (queryLower.includes('products')) {
    return Array(10).fill(null).map((_, index) => ({
      productID: index + 1,
      name: `Product ${index + 1}`,
      unitPrice: Math.floor(Math.random() * 100) + 10,
      unitsInStock: Math.floor(Math.random() * 100),
      categoryID: Math.floor(Math.random() * 8) + 1,
    }));
  }
  
  if (queryLower.includes('employees')) {
    return Array(8).fill(null).map((_, index) => ({
      employeeID: index + 1,
      firstName: `FirstName${index + 1}`,
      lastName: `LastName${index + 1}`,
      title: Math.random() > 0.5 ? 'Manager' : 'Employee',
      hireDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
    }));
  }
  
  if (queryLower.includes('customers')) {
    const countries = ['USA', 'Germany', 'UK', 'France', 'Japan', 'Canada'];
    return Array(15).fill(null).map((_, index) => ({
      customerID: `CUST${index + 1}`,
      companyName: `Company ${index + 1}`,
      contactName: `Contact ${index + 1}`,
      contactTitle: Math.random() > 0.5 ? 'Manager' : 'Representative',
      address: {
        street: `Street ${index + 1}`,
        city: `City ${index + 1}`,
        country: countries[Math.floor(Math.random() * countries.length)],
      },
      phone: `+${Math.floor(Math.random() * 1000000000)}`,
    }));
  }
  
  // For complex queries, generate appropriate random data
  if (queryLower.includes('join')) {
    return Array(10).fill(null).map((_, index) => ({
      name: `Product ${index + 1}`,
      unitPrice: Math.floor(Math.random() * 100) + 10,
      categoryName: `Category ${Math.floor(Math.random() * 8) + 1}`,
    }));
  }
  
  if (queryLower.includes('group by')) {
    return Array(8).fill(null).map((_, index) => ({
      firstName: `FirstName${index + 1}`,
      lastName: `LastName${index + 1}`,
      orderCount: Math.floor(Math.random() * 50) + 1,
    }));
  }
  
  // Default fallback
  return Array(5).fill(null).map((_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
}

// Helper function to generate random table structure
function generateRandomTable() {
  const possibleColumns = [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'price', type: 'number' },
    { name: 'quantity', type: 'number' },
    { name: 'status', type: 'string' },
    { name: 'date', type: 'date' },
    { name: 'email', type: 'string' },
    { name: 'category', type: 'string' },
    { name: 'rating', type: 'number' },
    { name: 'description', type: 'string' },
    { name: 'location', type: 'string' },
    { name: 'isActive', type: 'boolean' },
    { name: 'createdAt', type: 'date' },
    { name: 'updatedAt', type: 'date' },
    { name: 'priority', type: 'number' }
  ];

  // Randomly select 3-6 columns
  const numColumns = Math.floor(Math.random() * 4) + 3;
  const selectedColumns = shuffleArray(possibleColumns).slice(0, numColumns);

  // Generate 5-15 rows of random data
  const numRows = Math.floor(Math.random() * 11) + 5;
  const rows = Array(numRows).fill(null).map((_, rowIndex) => {
    const row = {};
    selectedColumns.forEach(column => {
      switch (column.type) {
        case 'number':
          row[column.name] = Math.floor(Math.random() * 1000);
          break;
        case 'string':
          row[column.name] = `${column.name.charAt(0).toUpperCase() + column.name.slice(1)} ${rowIndex + 1}`;
          break;
        case 'date':
          row[column.name] = new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0];
          break;
        case 'boolean':
          row[column.name] = Math.random() > 0.5;
          break;
        default:
          row[column.name] = null;
      }
    });
    return row;
  });

  return rows;
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
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(7);
  const [sqlInput, setSqlInput] = useState('SELECT * FROM customers');

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
      // Categories Queries
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
        label: 'SELECT categoryName FROM categories WHERE categoryID > 5',
        query: 'SELECT categoryName FROM categories WHERE categoryID > 5',
        data: jsonData.categories
          .filter(row => row.categoryID > 5)
          .map(row => ({ categoryName: row.categoryName })),
      },

      // Products Queries
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
        label: 'SELECT name, unitPrice FROM products WHERE unitsInStock = 0',
        query: 'SELECT name, unitPrice FROM products WHERE unitsInStock = 0',
        data: jsonData.products
          .filter(row => row.unitsInStock === 0)
          .map(row => ({
            name: row.name,
            unitPrice: row.unitPrice,
          })),
      },
      {
        label: 'SELECT name, unitPrice, unitsInStock FROM products ORDER BY unitPrice DESC LIMIT 5',
        query: 'SELECT name, unitPrice, unitsInStock FROM products ORDER BY unitPrice DESC LIMIT 5',
        data: jsonData.products
          .sort((a, b) => b.unitPrice - a.unitPrice)
          .slice(0, 5)
          .map(row => ({
            name: row.name,
            unitPrice: row.unitPrice,
            unitsInStock: row.unitsInStock,
          })),
      },

      // Employees Queries
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
        label: 'SELECT firstName, lastName, title FROM employees WHERE title LIKE "%Manager%"',
        query: 'SELECT firstName, lastName, title FROM employees WHERE title LIKE "%Manager%"',
        data: jsonData.employees
          .filter(row => row.title.includes('Manager'))
          .map(row => ({
            firstName: row.firstName,
            lastName: row.lastName,
            title: row.title,
          })),
      },
      {
        label: 'SELECT firstName, lastName, hireDate FROM employees ORDER BY hireDate DESC',
        query: 'SELECT firstName, lastName, hireDate FROM employees ORDER BY hireDate DESC',
        data: jsonData.employees
          .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
          .map(row => ({
            firstName: row.firstName,
            lastName: row.lastName,
            hireDate: row.hireDate,
          })),
      },

      // Customers Queries
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
      {
        label: 'SELECT companyName, contactName FROM customers WHERE country = "Germany"',
        query: 'SELECT companyName, contactName FROM customers WHERE country = "Germany"',
        data: jsonData.customers
          .filter(row => row.address.country === 'Germany')
          .map(row => ({
            companyName: row.companyName,
            contactName: row.contactName,
          })),
      },
      {
        label: 'SELECT companyName, contactName, phone FROM customers ORDER BY companyName',
        query: 'SELECT companyName, contactName, phone FROM customers ORDER BY companyName',
        data: jsonData.customers
          .sort((a, b) => a.companyName.localeCompare(b.companyName))
          .map(row => ({
            companyName: row.companyName,
            contactName: row.contactName,
            phone: row.phone,
          })),
      },

      // Complex Queries
      {
        label: 'SELECT p.name, p.unitPrice, c.categoryName FROM products p JOIN categories c ON p.categoryID = c.categoryID',
        query: 'SELECT p.name, p.unitPrice, c.categoryName FROM products p JOIN categories c ON p.categoryID = c.categoryID',
        data: jsonData.products.map(product => {
          const category = jsonData.categories.find(cat => cat.categoryID === product.categoryID);
          return {
            name: product.name,
            unitPrice: product.unitPrice,
            categoryName: category ? category.categoryName : 'Unknown',
          };
        }),
      },
      {
        label: 'SELECT e.firstName, e.lastName, COUNT(o.orderID) as orderCount FROM employees e LEFT JOIN orders o ON e.employeeID = o.employeeID GROUP BY e.employeeID',
        query: 'SELECT e.firstName, e.lastName, COUNT(o.orderID) as orderCount FROM employees e LEFT JOIN orders o ON e.employeeID = o.employeeID GROUP BY e.employeeID',
        data: jsonData.employees.map(employee => ({
          firstName: employee.firstName,
          lastName: employee.lastName,
          orderCount: Math.floor(Math.random() * 50) + 1, // Dummy data for demonstration
        })),
      },
    ];
  }, [jsonData]);

  // When queries update, initialize SQL text area and displayData with customers query data
  useEffect(() => {
    if (queries.length > 0) {
      const customersQueryIndex = queries.findIndex(q => q.query === 'SELECT * FROM customers');
      if (customersQueryIndex !== -1) {
        setSqlInput(queries[customersQueryIndex].query);
        setDisplayData(queries[customersQueryIndex].data);
      }
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeQuery();
    }
  };

  const executeQuery = () => {
    // Randomly select a predefined query index
    const randomIndex = Math.floor(Math.random() * queries.length);
    
    // Get the data from the randomly selected query
    const randomData = queries[randomIndex].data;
    
    // Randomly select a subset of the data
    const numRows = Math.floor(Math.random() * 10) + 5; // Random number between 5 and 15
    const shuffledData = shuffleArray(randomData);
    const selectedData = shuffledData.slice(0, numRows);
    
    setDisplayData(selectedData);
  };

  // Helper function to generate random values based on key name
  const generateRandomValue = (key) => {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('id')) {
      return Math.floor(Math.random() * 1000) + 1;
    }
    if (keyLower.includes('name')) {
      return `Random ${key} ${Math.floor(Math.random() * 1000)}`;
    }
    if (keyLower.includes('price') || keyLower.includes('cost')) {
      return Math.floor(Math.random() * 1000) + 10;
    }
    if (keyLower.includes('date')) {
      return new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0];
    }
    if (keyLower.includes('count')) {
      return Math.floor(Math.random() * 100) + 1;
    }
    if (keyLower.includes('country')) {
      const countries = ['USA', 'Germany', 'UK', 'France', 'Japan', 'Canada'];
      return countries[Math.floor(Math.random() * countries.length)];
    }
    if (keyLower.includes('phone')) {
      return `+${Math.floor(Math.random() * 1000000000)}`;
    }
    if (keyLower.includes('email')) {
      return `user${Math.floor(Math.random() * 1000)}@example.com`;
    }
    if (keyLower.includes('status') || keyLower.includes('state')) {
      return Math.random() > 0.5 ? 'Active' : 'Inactive';
    }
    if (keyLower.includes('description')) {
      return `Random description ${Math.floor(Math.random() * 1000)}`;
    }
    if (keyLower.includes('city')) {
      return `City ${Math.floor(Math.random() * 1000)}`;
    }
    if (keyLower.includes('street')) {
      return `${Math.floor(Math.random() * 1000)} Main St`;
    }
    if (keyLower.includes('title')) {
      return Math.random() > 0.5 ? 'Manager' : 'Employee';
    }
    
    // Default fallback
    return Math.random() > 0.5 ? `Value ${Math.floor(Math.random() * 1000)}` : Math.floor(Math.random() * 1000);
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
            handleKeyPress={handleKeyPress}
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
