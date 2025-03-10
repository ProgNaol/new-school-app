
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

// Create a file to stream archive data to
const output = createWriteStream(path.join(process.cwd(), 'project-download.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Project has been packaged successfully!');
  console.log(`Total size: ${archive.pointer()} bytes`);
  console.log('The file is available at: project-download.zip');
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files and directories
const dirsToInclude = ['client', 'server', 'shared', 'scripts'];
const filesToInclude = [
  'package.json',
  'tsconfig.json',
  'drizzle.config.ts',
  'postcss.config.js',
  'tailwind.config.ts',
  'vite.config.ts',
  '.gitignore',
  'README.md'
];

// Add directories
dirsToInclude.forEach(dir => {
  if (fs.existsSync(dir)) {
    archive.directory(dir, dir);
  }
});

// Add individual files
filesToInclude.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  }
});

// Add .env.example with instructions
const envExample = 
`# Local development environment variables
# Replace these with your own values

DATABASE_URL=postgresql://username:password@localhost:5432/dbname
SESSION_SECRET=your_session_secret_key_here
`;

archive.append(envExample, { name: '.env.example' });

// Add README with setup instructions
const readmeContent = 
`# Project Setup Instructions

## Prerequisites
- Node.js v18 or higher
- PostgreSQL database

## Installation Steps

1. Unzip the project files
2. Open a terminal in the project directory
3. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

4. Create a \`.env\` file based on \`.env.example\` with your database credentials:
   \`\`\`
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   SESSION_SECRET=your_session_secret_key_here
   \`\`\`

5. Run database migrations:
   \`\`\`
   npm run migrate
   \`\`\`

6. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

7. Open your browser to http://localhost:5000

## Building for Production

1. Build the application:
   \`\`\`
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`
   npm start
   \`\`\`
`;

archive.append(readmeContent, { name: 'README.md' });

// Finalize the archive
archive.finalize();
