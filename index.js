const fs = require('node:fs/promises');
const cs = require('node:console');
const path = require('node:path');
const {data, title} = require('./users');

(async (dir) => {
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
        const filePath = path.join(__dirname, `${dir}/${title}_v${files.length + 1}.csv`);

        const date = new Date();
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        await fs.writeFile(filePath, `${dateStr}\n`);
        console.log('File created successfully!');

        await fs.appendFile(filePath, 'id,username,email,password\n');
        for (let user of data) {
            let line = `${user.id},${user.username},${user.email},${user.password}\n`;
            await fs.appendFile(filePath, line);
        }
        console.log('Data appended successfully!\n');

        const fileData = await fs.readFile(filePath, 'utf-8');
        let arr = fileData.split('\n');
        for (let line of arr) {
            console.log(line);
        }
        console.log('\nFile read successfully!');
        cs.timeEnd('create/read');
    } catch (err) {
        console.error(`Error: ${err}`);
    }
})('./reports');

