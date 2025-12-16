const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute Python video conversion script with auto language detection
 * @param {string} videoUrl - URL of the video to convert
 * @param {string} targetLanguage - Target language code (e.g., 'hi', 'es')
 * @param {string} outputPath - Path where converted video will be saved
 * @param {Function} progressCallback - Callback for progress updates (progress, message)
 * @param {boolean} enableLipsync - Whether to enable lip-sync (optional, slower)
 * @returns {Promise} - Resolves with conversion result
 */
const executePythonConverter = (videoUrl, targetLanguage, outputPath, progressCallback, enableLipsync = false) => {
  return new Promise((resolve, reject) => {
    // Path to Python script - UPDATED TO converter.py
    const pythonScriptPath = path.join(__dirname, '../python/converter.py');
    
    // Build command arguments
    const args = [pythonScriptPath, videoUrl, targetLanguage];
    
    // Add lip-sync flag if enabled
    if (enableLipsync) {
      args.push('--lipsync');
    }
    
    console.log(`[Python Executor] Starting conversion...`);
    console.log(`[Python Executor] Video URL: ${videoUrl}`);
    console.log(`[Python Executor] Target Language: ${targetLanguage}`);
    console.log(`[Python Executor] Lip-sync: ${enableLipsync ? 'Enabled' : 'Disabled'}`);
    
    // Spawn Python process
    const pythonProcess = spawn('python', args, {
      env: { ...process.env, PYTHONUNBUFFERED: '1' } // Ensure real-time output
    });

    let outputData = '';
    let errorData = '';
    let lastProgress = 0;

    // Handle stdout (main output)
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Python] ${output.trim()}`);
      
      outputData += output;

      // Parse progress updates: [XX%] Message
      const progressMatch = output.match(/\[(\d+)%\] (.+)/);
      if (progressMatch && progressCallback) {
        const progress = parseInt(progressMatch[1]);
        const message = progressMatch[2].trim();
        
        // Only call callback if progress changed
        if (progress !== lastProgress) {
          lastProgress = progress;
          progressCallback(progress, message);
        }
      }
      
      // Parse step messages: [STEP X/Y] Message
      const stepMatch = output.match(/\[STEP (\d+)\/(\d+)\] (.+)/);
      if (stepMatch && progressCallback) {
        const currentStep = parseInt(stepMatch[1]);
        const totalSteps = parseInt(stepMatch[2]);
        const message = stepMatch[3].trim();
        const stepProgress = Math.floor((currentStep / totalSteps) * 100);
        
        if (stepProgress !== lastProgress) {
          lastProgress = stepProgress;
          progressCallback(stepProgress, message);
        }
      }

      // Parse info messages: [INFO] Message
      const infoMatch = output.match(/\[INFO\] (.+)/);
      if (infoMatch && progressCallback) {
        const message = infoMatch[1].trim();
        progressCallback(lastProgress, message);
      }

      // Parse success messages: [SUCCESS] Message
      const successMatch = output.match(/\[SUCCESS\] (.+)/);
      if (successMatch && progressCallback) {
        const message = successMatch[1].trim();
        progressCallback(lastProgress, message);
      }
    });

    // Handle stderr (errors and warnings)
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Python Error] ${error.trim()}`);
      errorData += error;
      
      // Parse warning messages
      const warningMatch = error.match(/\[WARNING\] (.+)/);
      if (warningMatch && progressCallback) {
        const message = warningMatch[1].trim();
        progressCallback(lastProgress, `Warning: ${message}`);
      }
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      console.log(`[Python Executor] Process exited with code ${code}`);

      if (code !== 0) {
        const errorMessage = errorData || 'Python process failed';
        console.error(`[Python Executor] Error: ${errorMessage}`);
        reject(new Error(`Conversion failed (exit code ${code}): ${errorMessage}`));
        return;
      }

      // Parse JSON result from output
      try {
        // Look for JSON_RESULT: marker
        const jsonMatch = outputData.match(/JSON_RESULT:(\{.+\})/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[1];
          const result = JSON.parse(jsonString);
          
          console.log(`[Python Executor] Conversion result:`, result);
          
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Conversion failed'));
          }
        } else {
          console.error(`[Python Executor] No JSON result found in output`);
          console.error(`[Python Executor] Output was:`, outputData);
          reject(new Error('Failed to parse Python output - no JSON result found'));
        }
      } catch (parseError) {
        console.error(`[Python Executor] JSON parse error:`, parseError);
        console.error(`[Python Executor] Raw output:`, outputData);
        reject(new Error(`Failed to parse conversion result: ${parseError.message}`));
      }
    });

    // Handle process errors (e.g., Python not found)
    pythonProcess.on('error', (error) => {
      console.error(`[Python Executor] Process error:`, error);
      
      if (error.code === 'ENOENT') {
        reject(new Error('Python is not installed or not in PATH. Please install Python 3.7+'));
      } else {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      }
    });

    // Set timeout (30 minutes max)
    const timeout = setTimeout(() => {
      console.error(`[Python Executor] Conversion timeout after 30 minutes`);
      pythonProcess.kill('SIGTERM');
      reject(new Error('Conversion timeout - process took too long (>30 minutes)'));
    }, 30 * 60 * 1000);

    // Clear timeout on process completion
    pythonProcess.on('close', () => {
      clearTimeout(timeout);
    });
  });
};

/**
 * Check if Python and required packages are installed
 * @returns {Promise<Object>} - { pythonInstalled, packagesInstalled, missingPackages }
 */
const checkPythonEnvironment = async () => {
  return new Promise((resolve) => {
    console.log('[Environment Check] Checking Python installation...');
    
    const pythonProcess = spawn('python', ['--version']);
    let versionOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      versionOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      versionOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`[Environment Check] ${versionOutput.trim()}`);
        
        // Check for required packages
        checkPythonPackages().then(packagesResult => {
          resolve({
            pythonInstalled: true,
            version: versionOutput.trim(),
            ...packagesResult
          });
        });
      } else {
        console.error('[Environment Check] Python is not installed or not in PATH');
        resolve({
          pythonInstalled: false,
          packagesInstalled: false,
          missingPackages: []
        });
      }
    });

    pythonProcess.on('error', () => {
      console.error('[Environment Check] Failed to execute Python');
      resolve({
        pythonInstalled: false,
        packagesInstalled: false,
        missingPackages: []
      });
    });
  });
};

/**
 * Check if required Python packages are installed
 * @returns {Promise<Object>} - { packagesInstalled, missingPackages }
 */
const checkPythonPackages = () => {
  return new Promise((resolve) => {
    const requiredPackages = [
      'whisper',
      'googletrans',
      'gtts',
      'moviepy',
      'torch',
      'requests'
    ];

    const checkScript = `
import sys
packages = ${JSON.stringify(requiredPackages)}
missing = []
for package in packages:
    try:
        __import__(package)
    except ImportError:
        missing.append(package)
print('MISSING:' + ','.join(missing))
`;

    const pythonProcess = spawn('python', ['-c', checkScript]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        const missingMatch = output.match(/MISSING:(.+)/);
        const missingPackages = missingMatch ? 
          missingMatch[1].split(',').filter(p => p.trim()) : 
          [];

        if (missingPackages.length === 0) {
          console.log('[Environment Check] ✅ All required packages installed');
          resolve({
            packagesInstalled: true,
            missingPackages: []
          });
        } else {
          console.warn('[Environment Check] ⚠️ Missing packages:', missingPackages);
          resolve({
            packagesInstalled: false,
            missingPackages
          });
        }
      } else {
        resolve({
          packagesInstalled: false,
          missingPackages: requiredPackages
        });
      }
    });
  });
};

/**
 * Check if FFmpeg is installed
 * @returns {Promise<boolean>}
 */
const checkFFmpeg = () => {
  return new Promise((resolve) => {
    const ffmpegProcess = spawn('ffmpeg', ['-version']);
    
    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('[Environment Check] ✅ FFmpeg is installed');
        resolve(true);
      } else {
        console.error('[Environment Check] ❌ FFmpeg is not installed');
        resolve(false);
      }
    });

    ffmpegProcess.on('error', () => {
      console.error('[Environment Check] ❌ FFmpeg is not installed or not in PATH');
      resolve(false);
    });
  });
};

/**
 * Run complete environment check
 * @returns {Promise<Object>} - Complete environment status
 */
const runEnvironmentCheck = async () => {
  console.log('='.repeat(60));
  console.log('VIDEO CONVERTER ENVIRONMENT CHECK');
  console.log('='.repeat(60));

  const pythonCheck = await checkPythonEnvironment();
  const ffmpegInstalled = await checkFFmpeg();

  const result = {
    ...pythonCheck,
    ffmpegInstalled,
    ready: pythonCheck.pythonInstalled && 
           pythonCheck.packagesInstalled && 
           ffmpegInstalled
  };

  console.log('='.repeat(60));
  console.log('ENVIRONMENT STATUS:');
  console.log(`Python: ${result.pythonInstalled ? '✅' : '❌'}`);
  console.log(`Packages: ${result.packagesInstalled ? '✅' : '❌'}`);
  console.log(`FFmpeg: ${result.ffmpegInstalled ? '✅' : '❌'}`);
  console.log(`Overall: ${result.ready ? '✅ READY' : '❌ NOT READY'}`);
  
  if (!result.ready) {
    console.log('\nTO FIX:');
    if (!result.pythonInstalled) {
      console.log('- Install Python 3.7+ from https://www.python.org/');
    }
    if (!result.packagesInstalled) {
      console.log('- Install Python packages: pip install -r requirements.txt');
      if (result.missingPackages.length > 0) {
        console.log(`  Missing: ${result.missingPackages.join(', ')}`);
      }
    }
    if (!result.ffmpegInstalled) {
      console.log('- Install FFmpeg from https://ffmpeg.org/');
    }
  }
  
  console.log('='.repeat(60));

  return result;
};

module.exports = {
  executePythonConverter,
  checkPythonEnvironment,
  checkFFmpeg,
  runEnvironmentCheck
};