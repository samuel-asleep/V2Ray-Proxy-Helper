import https from 'https';
import { promises as dns } from 'dns';
import tls from 'tls';

/**
 * Test if a domain is suitable for SNI spoofing in V2Ray
 * SNI requires:
 * 1. Valid DNS resolution
 * 2. Valid SSL/TLS certificate
 * 3. TLS 1.2+ support
 */

async function testSNI(domain) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Testing SNI Compatibility: ${domain}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    // Test 1: DNS Resolution
    console.log(`[1/4] DNS Resolution...`);
    const addresses = await dns.resolve4(domain);
    console.log(`  ✓ Resolved to IP: ${addresses[0]}`);

    // Test 2: SSL Certificate via HTTPS
    console.log(`\n[2/4] SSL Certificate Check...`);
    
    return new Promise((resolve, reject) => {
      const req = https.request({
        host: domain,
        port: 443,
        method: 'HEAD',
        timeout: 10000,
        servername: domain // SNI hostname
      }, (res) => {
        const socket = res.socket;
        const cert = socket.getPeerCertificate();
        const cipherInfo = socket.getCipher();
        const protocol = socket.getProtocol();

        console.log(`  ✓ SSL Certificate Valid`);
        console.log(`    - Subject CN: ${cert.subject?.CN || 'N/A'}`);
        console.log(`    - Issuer: ${cert.issuer?.O || cert.issuer?.CN || 'N/A'}`);
        console.log(`    - Valid From: ${cert.valid_from}`);
        console.log(`    - Valid To: ${cert.valid_to}`);

        // Test 3: TLS Version
        console.log(`\n[3/4] TLS/Protocol Support...`);
        console.log(`  ✓ TLS Version: ${protocol.toUpperCase()}`);
        
        if (protocol === 'TLSv1.3' || protocol === 'TLSv1.2') {
          console.log(`    ✓ Modern TLS version supported`);
        } else {
          console.log(`    ⚠ Legacy TLS version (consider using modern TLS)`);
        }

        // Test 4: Cipher Suite
        console.log(`\n[4/4] Cipher Suite...`);
        console.log(`  ✓ Cipher: ${cipherInfo?.name || 'Unknown'}`);

        // Final Assessment
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✓ ${domain} is SUITABLE for SNI spoofing`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        console.log(`V2Ray Configuration:`);
        console.log(`  "sni": "${domain}"`);
        console.log(`  "tlsSettings": {`);
        console.log(`    "serverName": "${domain}",`);
        console.log(`    "allowInsecure": false`);
        console.log(`  }`);
        console.log(`\nVMess Config:`);
        console.log(`  "host": "${domain}",`);
        console.log(`  "sni": "${domain}"\n`);

        resolve(true);
      });

      req.on('error', (err) => {
        console.error(`  ✗ Error: ${err.message}`);
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error(`  ✗ Timeout connecting to ${domain}`);
        reject(new Error('Connection timeout'));
      });

      req.end();
    });

  } catch (error) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✗ ${domain} is NOT suitable for SNI spoofing`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`Error: ${error.message}\n`);
    throw error;
  }
}

// Test multiple domains
async function runTests() {
  const domains = [
    'www.airtel.africa',
    'www.google.com',
    'www.youtube.com'// Control test
  ];

  for (const domain of domains) {
    try {
      await testSNI(domain);
    } catch (error) {
      console.log(`Skipping ${domain}\n`);
    }
  }
}

runTests().catch(console.error);
