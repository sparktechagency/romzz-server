import fs from 'fs';

// Utility function to create directory if it doesn't exist
const createDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Ensure all directories are created
  }
};

export default createDirectory;
