const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute Python video conversion script with auto language detection
 * @param {string} videoUrl - URL of the video to convert
 * @param {string} targetLanguage - Target language code
 * @param {string} outputPath - Path where converted video will be saved
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise} - Resolves with conversion result
 */
const executePythonConverter = (videoUrl, targetLanguage, outputPath, progressCallback) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../python/online_converter.py');
    
    // Spawn Python process (only video URL and target language needed)
    const pythonProcess = spawn('python', [
      pythonScriptPath,
      videoUrl,
      targetLanguage
    ]);

    let outputData = '';
    let errorData = '';

    // Handle stdout
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python output:', output);
      
      outputData += output;

      // Parse progress updates
      const progressMatch = output.match(/\[(\d+)%\] (.+)/);
      if (progressMatch && progressCallback) {
        const progress = parseInt(progressMatch[1]);
        const message = progressMatch[2];
        progressCallback(progress, message);
      }
    });

    // Handle stderr
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Python error:', error);
      errorData += error;
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        return;
      }

      // Parse JSON result
      try {
        const jsonMatch = outputData.match(/JSON_RESULT:({.+})/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[1]);
          resolve(result);
        } else {
          reject(new Error('Failed to parse Python output'));
        }
      } catch (error) {
        reject(new Error(`Failed to parse result: ${error.message}`));
      }
    });

    // Handle errors
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

/**
 * Check if Python and required packages are installed
 * @returns {Promise<boolean>}
 */
const checkPythonEnvironment = async () => {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python', ['--version']);
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Python is installed');
        resolve(true);
      } else {
        console.error('Python is not installed or not in PATH');
        resolve(false);
      }
    });

    pythonProcess.on('error', () => {
      console.error('Failed to check Python installation');
      resolve(false);
    });
  });
};

module.exports = {
  executePythonConverter,
  checkPythonEnvironment
};