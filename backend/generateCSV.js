const fs = require('node:fs/promises');
const cs = require('node:console');
const path = require('node:path');
// const {clients, title} = require('./database/');

module.exports = async (account) => {
    cs.time('create/read');
    const dir = './database/user_files';
    const accountPath = path.join(dir, account.id);
    try {
        await fs.access(dir);
        console.log('Directory already exists.\n');
    } catch (err) {
        console.log('Directory does not exists. Creating it...');
        await fs.mkdir(dir);
        console.log(`Directory created successfully!\n`);
    }

    try {
        await fs.access(accountPath);
        console.log('Directory already exists.\n');
    } catch (err) {
        console.log('Directory does not exists. Creating it...');
        await fs.mkdir(accountPath);
        console.log(`Directory created successfully!\n`);
    }

    try {
        const files = await fs.readdir(accountPath, {recursive: true});
        const filePath = path.join(accountPath, `${title}_v${files.length + 1}.csv`);

        const date = new Date();
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        await fs.writeFile(filePath, `${dateStr}\n`);
        console.log('File created successfully!');

        await fs.appendFile(filePath, 'id,name,address,phone,email,accountNumber,balance\n');
        for (let client of clients) {
            let line = `${client.id},${client.name},${client.address},${client.phone},${client.email},${client.accountNumber},${client.balance}\n`;
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
        return filePath;
    } catch (err) {
        console.error(`Error: ${err}`);
        return null;
    }
};

