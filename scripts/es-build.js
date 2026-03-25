/*eslint no-undef: "off"*/
const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./es'); // Adjust the path if needed

files.forEach((file) => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/from '(.+?)'/g, (match, p1) => {
      // If it's an absolute path, a module or URL, or it already ends with .js, don't change it
      if (!p1.startsWith('.') || p1.endsWith('.js')) {
        return match;
      }
      // If it's referencing a directory (implying index.js inside that directory)
      if (
        fs.existsSync(path.join(path.dirname(file), p1)) &&
        fs.statSync(path.join(path.dirname(file), p1)).isDirectory()
      ) {
        return `from '${p1}/index.js'`;
      }
      // Otherwise, append .js
      return `from '${p1}.js'`;
    });
    fs.writeFileSync(file, content);
  }
});

// Write the package.json file in the es directory
fs.writeFileSync(
  './es/package.json',
  JSON.stringify({ type: 'module' }, null, 2),
);
