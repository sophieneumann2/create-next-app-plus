#!/usr/bin/env node

const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
const runCommand = (command, options = {}) => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
};

// Main function to create the project
const createNextAppPlus = async () => {
  // Ask for project name
  const projectName = process.argv[2] || 'my-next-app';
  
  // Run create-next-app
  runCommand(`npx create-next-app@latest ${projectName}`);

  // Change to the project directory
  const projectPath = path.join(process.cwd(), projectName);
  process.chdir(projectPath);

  // Install Prettier
  runCommand('npm install --save-dev prettier');

  // Create Prettier configuration file
  const prettierConfig = {
    "semi": true,
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 2
  };
  fs.writeFileSync(path.join(projectPath, '.prettierrc'), JSON.stringify(prettierConfig, null, 2));
  

  // Initialize Git repository
  const git = simpleGit();
  await git.init();
  runCommand('git add .');
  runCommand('git commit -m "Initial commit from Create Next App Plus"');

  // Install Husky and configure pre-commit hook
  runCommand('npx husky-init && npm install');
  
  // Customize the pre-commit hook
  const preCommitHookPath = path.join(projectPath, '.husky', 'pre-commit');
  const preCommitHookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check prettier formatting, print issues, and then fix them
npx prettier --check . || {
  echo "Prettier found issues in the files listed above. Fixing them now..."
  npx prettier --write .
  echo "Prettier issues have been fixed."
}

# Check eslint issues, print issues, and then fix them
npx eslint . || {
  echo "ESLint found issues in the files listed above. Fixing them now..."
  npx eslint . --fix
  echo "ESLint issues have been fixed."
}
`;
  fs.writeFileSync(preCommitHookPath, preCommitHookContent);

  console.log('Next.js project setup complete with Prettier and Husky!');
};

createNextAppPlus();
