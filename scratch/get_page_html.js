const http = require('http');

http.get('http://localhost:3000/tin-tuc/10-tips-for-healthier-life', (res) => {
  let html = '';
  res.on('data', (chunk) => html += chunk);
  res.on('end', () => {
    const index = html.toLowerCase().indexOf('10 tips for');
    if (index !== -1) {
      console.log("Found title section at index:", index);
      console.log(html.substring(index - 200, index + 2500));
    } else {
      console.log("Could not find title in HTML");
      console.log("Headers:", res.headers);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
