const fs = require('fs');
const path = 'components/GameDashboard.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');
console.log('Total lines:', lines.length);
const result = lines.filter((_, i) => i < 9598 || i > 9658).join('\n');
fs.writeFileSync(path, result);
console.log('Cleanup complete.');
