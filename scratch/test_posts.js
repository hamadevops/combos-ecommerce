const http = require('http');

http.get('http://localhost:3333/api/v1/posts', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Status Code:", res.statusCode);
      console.log("Posts response keys:", Object.keys(parsed));
      const posts = parsed.data || parsed;
      console.log("Total posts found:", Array.isArray(posts) ? posts.length : typeof posts);
      if (Array.isArray(posts)) {
        posts.forEach(p => {
          console.log(`- Title: "${p.title}"\n  Thumbnail: "${p.thumbnail}"\n  Slug: "${p.slug}"`);
        });
      } else {
        console.log("Response sample:", JSON.stringify(posts).substring(0, 500));
      }
    } catch (e) {
      console.error("Parse error:", e.message);
      console.log("Response text:", data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error("Request error:", err.message);
});
