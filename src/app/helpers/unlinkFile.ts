import fs from 'fs';

const unlinkFile = (filePath: string) => {
  // Check if the file exists before attempting to delete it
  if (fs.existsSync(filePath)) {
    // File exists, proceed to delete it
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      } else {
        console.log('File deleted successfully:', filePath);
      }
    });
  } else {
    console.error('File does not exist:', filePath);
  }
};

export default unlinkFile;
