const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800', // Candidate AI
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'  // Candidate TS
];

urls.forEach(url => {
  https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log('---');
  }).on('error', (err) => {
    console.error(`Error for ${url}:`, err.message);
  }).end();
});
