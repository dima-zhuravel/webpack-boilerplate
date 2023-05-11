const { exec } = require('child_process');

exec('cross-env NODE_ENV=production webpack --config config/webpack.prod.js', { maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
        console.error('Error executing the build command:', error);
    }

    if (stderr) {
        console.error('Stderr:', stderr);
    }

    console.log('Stdout:', stdout);
});
