const fs = require('fs');


// write a function to convert orbis-sdk.js to base64 and takes export variable name as parameter
// and file name
function convertToBase64(fileName) {
    // read orbis-sdk.js
    var file = fs.readFileSync(`./${fileName}`, 'utf8');

    // remove extension from file name and turn it to camel case
    var exportVariableName = fileName.split('.')[0].replace(/-([a-z])/g, g => g[1].toUpperCase());

    // append b64- to variable name
    exportVariableName = `b64${exportVariableName[0].toUpperCase()}${exportVariableName.slice(1)}`;

    // convert to base64
    const buffer = Buffer.from(file).toString('base64');

    fs.writeFileSync(`./b64-${fileName}`, `export const ${exportVariableName} = '${buffer}';`);
}

// // read orbis-sdk.js
// const orbisSdk = fs.readFileSync('./orbis-sdk.js', 'utf8');

// // convert to base64

// // turn it to buffer string
// const orbisSdkBuffer = Buffer.from(orbisSdk).toString('base64');

// // write orbis-sdk.js to str-orbis-sdk.js and export const strOrbisSdk
// fs.writeFileSync('./str-orbis-sdk.js', `export const strOrbisSdk = '${orbisSdkBuffer}';`);

convertToBase64('orbis-sdk.js');
convertToBase64('tile-action.js');