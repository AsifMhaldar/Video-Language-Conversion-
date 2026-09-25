const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';

const quoteArg = (arg) => `"${arg}"`;

const runJsonScript = async (scriptArgs, execOptions = {}) => {
  const args = scriptArgs.map(quoteArg).join(' ');
  const command = `${PYTHON_BIN} ${args}`;

  const { stdout, stderr } = await execAsync(command, {
    env: { ...process.env },
    ...execOptions
  });

  if (stderr) {
    console.error('Python script stderr:', stderr.slice(0, 500));
  }

  let result;
  try {
    result = JSON.parse(stdout);
  } catch (err) {
    throw new Error(
      `Python script returned invalid JSON. Output: ${stdout.slice(0, 300)}`
    );
  }

  if (!result.success) {
    throw new Error(result.error || 'Python script failed');
  }

  return result.data;
};

module.exports = { runJsonScript, PYTHON_BIN };
