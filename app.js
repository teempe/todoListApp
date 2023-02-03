const express = require('express');


const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {});

app.listen(3000, 'localhost', () => console.log('Server listens on port 3000'));