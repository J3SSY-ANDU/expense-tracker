const fs = require('node:fs/promises');
const cs = require('node:console');
const path = require('node:path');

(async () => {
    const dir = 'data';
    cs.time('create/read');

    try {
        await fs.access(dir);
        console.log('Directory already exists.\n');
    } catch (err) {
        console.log('Directory does not exists. Creating it...');
        await fs.mkdir(dir);
        console.log(`Directory created successfully!\n`);
    }

    try {
        
        const files = await fs.readdir(dir, {recursive: true});
        const filePath = path.join(__dirname, `${dir}/users_v${files.length + 1}.csv`);

        const content = 'Users:\n';
        await fs.writeFile(filePath, content);
        console.log('File created successfully!');

        const data = `${files.length + 1},Jessy,jessy.andujar@upr.edu,1234`;
        await fs.appendFile(filePath, data);
        console.log('Data appended successfully!\n');

        const fileData = await fs.readFile(filePath, 'utf-8');
        let arr = fileData.split('\n');
        for (let line of arr) {
            console.log(line);
        }
        console.log('\nFile read successfully!\n');
        cs.timeEnd('create/read');
    } catch (err) {
        console.error(`Error: ${err}`);
    }
})();

