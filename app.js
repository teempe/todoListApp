const express = require('express');
const hbs = require('express-handlebars');


const app = express();

app.use(express.static('public'));

app.engine('.hbs', hbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
    res.render('todolist');
});

app.listen(3000, 'localhost', () => console.log('Server listens on port 3000'));