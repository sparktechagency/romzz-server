import fs from 'fs';

// Helper function to create a directory if it doesn't already exist
const createDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};
export default createDirectory;
