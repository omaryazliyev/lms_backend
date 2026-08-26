const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === "node_modules" || file === ".git" || file === ".next") return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (file.endsWith(".pem") || file.endsWith(".key") || file.includes("id_rsa") || file.includes("deploy")) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

try {
  console.log("Searching keys in root...");
  const keys = walk("c:\\Users\\User\\OneDrive\\Desktop\\BIZLER");
  console.log("Keys found:", keys);
} catch (e) {
  console.error(e);
}
