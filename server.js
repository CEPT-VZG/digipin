require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`DIGIPIN API is running on http://${HOST}:${PORT}`);
    console.log(`API docs can be found at http://${HOST}:${PORT}/api-docs`);
});
