const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Path to your output ZIP file
const output = fs.createWriteStream(path.join(__dirname, 'web_project.zip'));
const archive = archiver('zip', { zlib: { level: 9 } }); // Set compression level

// Event listener for when the zip file is finished
output.on('close', function() {
    console.log(`Archive created successfully! Total size: ${archive.pointer()} bytes`);
});

// Event listener for any errors during archiving
archive.on('error', function(err) {
    throw err;
});

// Pipe the archive data to the output file
archive.pipe(output);

// Append all files in the project directory to the archive
archive.directory(__dirname, false);

// Finalize the archive (finish writing the zip file)
archive.finalize();
