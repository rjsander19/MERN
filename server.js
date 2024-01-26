const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));



// MongoDB model for the assigned lists
const AssignedList = mongoose.model('AssignedList', {
    date: String,
    lists: [
      {
        title: String,
        tasks: [String]
      }
    ]
  });

const lists = [
    { title: 'Shopping List', tasks: ['Buy groceries', 'Pick up dry cleaning'] },
    { title: 'Work Tasks', tasks: ['Finish report', 'Schedule meeting'] }
  ];



mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.set('view engine', 'ejs');
app.set('views', 'views');


//Routes below...


app.get('/', (req, res) => {
  res.render('landing');
});


app.get('/index', (req, res) => {
    res.render('index', { lists });
  });
  
  app.get('/new', (req, res) => {
    res.render('new');
  });
  
  app.post('/create', (req, res) => {
    const title = req.body.title;
    const tasks = req.body.tasks;
  
    if (typeof tasks === 'string' || Array.isArray(tasks)) {
      // If tasks is a string or an array, convert it to a string and then split it
      const tasksArray = Array.isArray(tasks) ? tasks : [tasks];
      const newList = { title, tasks: tasksArray.join(',').split(',').map(task => task.trim()) };
      lists.push(newList);
      res.redirect('/index');
    } else {
      // Handle the case where tasks is neither a string nor an array
      console.error('Invalid tasks format:', tasks);
      res.status(400).send('Bad Request');
    }
  });



  app.get('/index/:date', async (req, res) => {
    const selectedDate = req.params.date;
    const endDate = req.query.endDate; // Extract endDate from query parameters
    const dateLists = await getListsForDate(selectedDate, endDate);
    console.log(dateLists);
    res.render('dateLists', { date: selectedDate, dateLists });
  });
  
  async function getListsForDate(date, endDate) {
    try {
      const assignedLists = await AssignedList.find({
        date: {
          $gte: date, // Greater than or equal to the selected date
          $lte: endDate || date, // Less than or equal to the end date or the selected date
        },
      }).exec();
      const dateLists = assignedLists.map((assigned) => assigned.lists).flat();
      return dateLists;
    } catch (error) {
      console.error('Error retrieving lists:', error);
      return [];
    }
  }
  
  app.post('/assign-date', async (req, res) => {
    const selectedDate = req.body.selectedDate;
    const endDate = req.body.endDate;
    const listTitle = req.body.listTitle;
    const listTasks = req.body.listTasks.split(',').map(task => task.trim());
    const date = req.body.date;  // Add this line to extract the 'date' variable
    console.log(`Assigned to-do list "${listTitle}" to date(s): ${selectedDate} to ${endDate || 'N/A'}`);
  
    // Check if the date already has assigned lists
    let existingAssignedList = await AssignedList.findOne({ date }).exec();
  
    // If not, create a new AssignedList
    if (!existingAssignedList) {
      existingAssignedList = new AssignedList({
        date,
        lists: [{ title: listTitle, tasks: listTasks }]
      });
    } else {
      // If yes, append the new list to the existing ones
      existingAssignedList.lists.push({ title: listTitle, tasks: listTasks });
    }
  
    // Save or update the assignment in the MongoDB database
    try {
      await existingAssignedList.save();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  
    res.redirect('/index');
  });
  






app.get('/edit/:index', (req, res) => {
  const index = req.params.index;
  const list = lists[index];
  res.render('edit', { list, listIndex: index });
});

app.get('/delete/:index', (req, res) => {
  const index = req.params.index;

  if (index >= 0 && index < lists.length) {
    lists.splice(index, 1);
    res.redirect('/index');
  } else {
    res.status(404).send('Not Found');
  }
});

app.post('/edit/:index', (req, res) => {
  const index = req.params.index;
  const updatedTitle = req.body.title;
  const updatedTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [req.body.tasks];
  lists[index].title = updatedTitle;
  lists[index].tasks = updatedTasks;
  res.redirect('/index');
});

app.get('/show/:index', (req, res) => {
  const index = req.params.index;
  const list = lists[index];
  res.render('show', { list, listIndex: index });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
