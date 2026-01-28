/**
 * Test the GET /api/auth/users endpoint
 */

import http from 'http';

function testGetUsers() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/users',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:');
      try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log(data);
      }
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });

  req.end();
}

setTimeout(testGetUsers, 500);
