/**
 * Server Diagnostic Tool
 * 
 * This script helps diagnose connection issues with the backend server.
 * It will test binding to different network interfaces and check for
 * potential firewall or port issues.
 */

const http = require('http');
const os = require('os');

// Get all network interfaces
const networkInterfaces = os.networkInterfaces();
console.log('Network Interfaces:');
Object.keys(networkInterfaces).forEach(interfaceName => {
  console.log(`\n${interfaceName}:`);
  networkInterfaces[interfaceName].forEach(interface => {
    if (interface.family === 'IPv4') {
      console.log(`  - ${interface.address} (${interface.internal ? 'internal' : 'external'})`);
    }
  });
});

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Check if port 5000 is already in use
async function checkPort() {
  console.log('\nChecking port 5000 availability:');
  const inUse = await isPortInUse(5000);
  console.log(inUse ? '❌ Port 5000 is already in use!' : '✅ Port 5000 is available');
  return inUse;
}

// Create a temporary server on different interfaces to test connectivity
async function testInterfaces() {
  console.log('\nTesting server on different interfaces:');
  
  // Test localhost (127.0.0.1)
  await testInterface('127.0.0.1', 5000);
  
  // Test all interfaces (0.0.0.0)
  await testInterface('0.0.0.0', 5000);
  
  // Test specific external interfaces
  Object.values(networkInterfaces).forEach(interfaces => {
    interfaces.forEach(interface => {
      if (interface.family === 'IPv4' && !interface.internal) {
        testInterface(interface.address, 5000);
      }
    });
  });
}

async function testInterface(host, port) {
  if (await isPortInUse(port)) {
    console.log(`⚠️  Cannot test ${host}:${port} - port already in use`);
    return;
  }
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Server is running',
      host: host,
      port: port 
    }));
  });
  
  return new Promise((resolve) => {
    // Try to listen on the specific host and port
    server.once('error', (err) => {
      console.log(`❌ Failed to bind server to ${host}:${port} - ${err.message}`);
      resolve();
    });
    
    server.once('listening', () => {
      console.log(`✅ Successfully bound server to ${host}:${port}`);
      console.log(`   Test URL: http://${host}:${port}`);
      
      // Keep server running for 2 seconds to allow manual testing
      setTimeout(() => {
        server.close();
        resolve();
      }, 2000);
    });
    
    server.listen(port, host);
  });
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('=== Server Connection Diagnostics ===\n');
  
  const portInUse = await checkPort();
  
  if (portInUse) {
    console.log('\nRecommendation: Stop any running server instances on port 5000 first.');
  } else {
    await testInterfaces();
    
    console.log('\nServer Connection Recommendations:');
    console.log('1. For Android Emulator: Use 10.0.2.2:5000');
    console.log('2. For iOS Simulator: Use localhost:5000');
    console.log('3. For physical devices: Use your computer\'s local IP address (see above)');
    console.log('4. Check your firewall settings to ensure port 5000 is allowed');
    console.log('5. Make sure both the device and server are on the same network');
    console.log('\nIn your backend server.js, use:');
    console.log('app.listen(PORT, \'0.0.0.0\', () => {\n  console.log(`Server running on port ${PORT}`);\n});');
  }
}

runDiagnostics();