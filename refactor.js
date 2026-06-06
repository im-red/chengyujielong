const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir('src/util');

// Move utils files
if (fs.existsSync('src/utils/generateAvatarColor.ts')) {
  fs.renameSync('src/utils/generateAvatarColor.ts', 'src/util/generateAvatarColor.ts');
}
if (fs.existsSync('src/utils/getAppVersionInfo.ts')) {
  fs.renameSync('src/utils/getAppVersionInfo.ts', 'src/util/getAppVersionInfo.ts');
}

// Remove src/utils directory
if (fs.existsSync('src/utils')) {
  try { fs.rmdirSync('src/utils'); } catch (e) {}
}

// Move idiomLib.ts
if (fs.existsSync('src/idiomLib.ts')) {
  fs.renameSync('src/idiomLib.ts', 'src/util/idiomLib.ts');
}

// Move utils.tsx
if (fs.existsSync('src/utils.tsx')) {
  fs.renameSync('src/utils.tsx', 'src/util/utils.tsx');
}

// Remove types.ts (it's duplicated in models/index.ts)
if (fs.existsSync('src/types.ts')) {
  fs.unlinkSync('src/types.ts');
}

// Function to recursively find files
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  }
  return filelist;
}

const allFiles = walkSync('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace '../types' with '../models'
  newContent = newContent.replace(/from '\.\.\/types'/g, "from '../models'");
  newContent = newContent.replace(/from '\.\/types'/g, "from './models'");
  newContent = newContent.replace(/from '\.\.\/\.\.\/types'/g, "from '../../models'");

  // Replace '../utils/...' with '../util/...'
  newContent = newContent.replace(/from '\.\.\/utils\//g, "from '../util/");
  newContent = newContent.replace(/from '\.\/utils\//g, "from './util/");
  
  // Replace '../utils' with '../util/utils'
  newContent = newContent.replace(/from '\.\.\/utils'/g, "from '../util/utils'");
  newContent = newContent.replace(/from '\.\/utils'/g, "from './util/utils'");
  
  // Replace idiomLib imports
  newContent = newContent.replace(/from '\.\.\/idiomLib'/g, "from '../util/idiomLib'");
  newContent = newContent.replace(/from '\.\/idiomLib'/g, "from './util/idiomLib'");

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}

// Also update tests
const allTests = walkSync('tests').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
for (const file of allTests) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  newContent = newContent.replace(/from '\.\.\/src\/types'/g, "from '../src/models'");
  newContent = newContent.replace(/from '\.\.\/src\/idiomLib'/g, "from '../src/util/idiomLib'");
  newContent = newContent.replace(/from '\.\.\/src\/utils\//g, "from '../src/util/");
  newContent = newContent.replace(/from '\.\.\/src\/utils'/g, "from '../src/util/utils'");
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}
