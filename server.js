require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
    res.send(`
        <h1>DIGIPIN API is running</h1>
        <p>API documentation can be found at <a href="/api-docs">/api-docs</a>.</p>
        <p>Encode example: <a href="/api/digipin/encode?latitude=12.9716&longitude=77.5946">/api/digipin/encode?latitude=12.9716&longitude=77.5946</a></p>
        <p>Decode example: <a href="/api/digipin/decode?digipin=K6J4-T4K-8T">/api/digipin/decode?digipin=K6J4-T4K-8T</a></p>
    `);
});

app.listen(PORT, HOST, () => {
    console.log(`DIGIPIN API is running on http://${HOST}:${PORT}`);
    console.log(`API docs can be found at http://${HOST}:${PORT}/api-docs`);
});
