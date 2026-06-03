const { execSync } = require('child_process');
try {
  execSync('cmd.exe /c "C:\\Program Files\\nodejs\\npm.cmd" run build', { stdio: 'inherit' });
  console.log("Build succeeded!");
} catch (e) {
  console.log("Build failed!");
}
