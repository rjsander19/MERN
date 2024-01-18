const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Dummy data for demonstration purposes
const lists = [
  { title: 'Shopping List', tasks: ['Buy groceries', 'Pick up dry cleaning'] },
  { title: 'Work Tasks', tasks: ['Finish report', 'Schedule meeting'] }
];

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Route to render the 'index' page
app.get('/', (req, res) => {
  res.render('index', { lists });
});

// Route to render the 'new' page
app.get('/new', (req, res) => {
  res.render('new');
});

// Route to handle form submission and create a new to-do list
app.post('/create', (req, res) => {
  const title = req.body.title;
  const tasks = req.body.tasks.split(',').map(task => task.trim());

  const newList = { title, tasks };
  lists.push(newList);

  res.redirect('/');
});

// Route to render the 'edit' page
app.get('/edit/:index', (req, res) => {
  const index = req.params.index;
  const list = lists[index];
  res.render('edit', { list, listIndex: index });
});


app.post('/edit/:index', (req, res) => {
  const index = req.params.index;
  const updatedTitle = req.body.title;
  const updatedTasks = req.body.tasks.split(',').map(task => task.trim());

  lists[index].title = updatedTitle;
  lists[index].tasks = updatedTasks;

  res.redirect('/');
});

//Show
app.get('/show/:index', (req, res) => {
    const index = req.params.index;
    const list = lists[index];
    res.render('show', { list });
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
