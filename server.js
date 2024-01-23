const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
// const dateListsTemplate = require('./views/dateLists.ejs');


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



//ROUTES

// Route to render the landing page
app.get('/', (req, res) => {
    res.render('landing');
  });





//NEW BELOW


app.get('/index/:date', (req, res) => {
    const selectedDate = req.params.date;
    const dateLists = getListsForDate(selectedDate);
  
    // Use res.render without specifying the file extension
    res.render('dateLists', { date: selectedDate, dateLists });
  });
  

// Function to get to-do lists for a specific date (replace this with your actual data retrieval logic)
function getListsForDate(date) {
  // Example: Assume you have an array of objects with 'date' and 'lists' properties
  // where 'date' is the date string and 'lists' is an array of to-do lists for that date
  const dateLists = [
    { date: '2024-01-21', lists: [{ title: 'List 1', tasks: ['Task 1', 'Task 2'] }] },
    // Add more objects for other dates
  ];

  // Find the lists for the specified date
  const selectedDateLists = dateLists.find(item => item.date === date);

  return selectedDateLists ? selectedDateLists.lists : [];
}








//NEW ABOVE













// Route to render the 'index' page
app.get('/index', (req, res) => {
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

  res.redirect('/index');
});



// Route to render the 'edit' page
app.get('/edit/:index', (req, res) => {
    const index = req.params.index;
    const list = lists[index];
  res.render('edit', { list, listIndex: index });
});


// Route to handle delete request for a to-do list
app.get('/delete/:index', (req, res) => {
    const index = req.params.index;
  
    // Assuming lists is your array of to-do lists
    if (index >= 0 && index < lists.length) {
      // Remove the to-do list at the specified index
      lists.splice(index, 1);
      res.redirect('/index');
    } else {
      // Handle the case where the index is out of bounds
      res.status(404).send('Not Found');
    }
  });



// Route to handle form submission and update the to-do list
app.post('/edit/:index', (req, res) => {
    const index = req.params.index;
    const updatedTitle = req.body.title;
    const updatedTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [req.body.tasks];
  
    lists[index].title = updatedTitle;
    lists[index].tasks = updatedTasks;
  
  res.redirect('/index');
});



// Route to render the 'show' page
app.get('/show/:index', (req, res) => {
    const index = req.params.index;
    const list = lists[index];
  res.render('show', { list, listIndex: index });
});











// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
