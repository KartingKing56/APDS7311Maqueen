const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint to archive files
app.post('/archive', (req, res) => {
    const output = fs.createWriteStream(path.join(__dirname, 'web_project.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Event listener when archiving is complete
    output.on('close', function() {
        console.log(`Archive created successfully! Total size: ${archive.pointer()} bytes`);
        res.json({ message: 'Archive created successfully', size: archive.pointer() });
    });

    // Event listener for errors
    archive.on('error', function(err) {
        console.error('Error during archiving:', err);
        res.status(500).json({ error: 'Archiving failed', details: err.message });
    });

    // Pipe the archive data to the output file
    archive.pipe(output);

    // Append files in the frontend directory to the archive
    archive.directory(path.join(__dirname, '../frontend'), false);

    // Finalize the archive (complete the process)
    archive.finalize();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
