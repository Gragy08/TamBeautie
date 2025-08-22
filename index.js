const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Trang Chủ');
})

app.listen(port, () => {
    console.log(`TamBeautie app listening at http://localhost:${port}`);
})