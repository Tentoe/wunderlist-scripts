/* eslint-disable no-alert, no-console */


import tokenID from './tokenID';

const WunderlistSDK = require('wunderlist');

const wunderlistAPI = new WunderlistSDK(tokenID);


const {
  lists,
  notes,
  tasks,
} = wunderlistAPI.http;


const getLists = () => new Promise((resolve, reject) => lists.all().done(resolve).fail(reject));
const getList = id => new Promise((resolve, reject) => lists.getID(id).done(resolve).fail(reject));
const createList = obj =>
    new Promise((resolve, reject) => lists.create(obj).done(resolve).fail(reject));

const getTasks = (id, completed = false) => new Promise((resolve, reject) =>
  tasks.forList(id, completed).done(resolve).fail(reject));
const getNotes = id => new Promise((resolve, reject) =>
  notes.forTask(id).done(resolve).fail(reject));

const getNewest = (acc, l) => {
  if (!acc) return l;
  const lTime = Date.parse(l.created_at).getTime();
  const accTime = Date.parse(acc.created_at).getTime();
  return lTime < accTime ? l : acc;
};
const getLastWorkID = (ls) => {
  const workLists = ls.filter(l => l.title.toLowerCase() === 'work');
  const lastWorkList = workLists.reduce(getNewest);
  return lastWorkList.id;
};
const writeTask = (t) => {
  console.log(t.title);
  t.notes.forEach(n => console.log(` -${n.content}`));
};
const writeTasks = (ts) => {
  console.log('Aufgaben erledigt und offen\n');
  console.log('Offen:');
  ts[0].forEach(writeTask);
  console.log('\nErledigt:');
  ts[1].forEach(writeTask);
};
const addNote = t => getNotes(t.id).then(n => ({ ...t, notes: n }));
const addNotes = taskArray => Promise.all(taskArray.map(addNote));

const getAllTasks = id =>
  Promise.all([getTasks(id).then(addNotes), getTasks(id, true).then(addNotes)]);


const args = process.argv.slice(2);

if (args[0].toLocaleString() === 'report') {
  getLists()
  .then(getLastWorkID)
  .then(getAllTasks)
  .then(writeTasks)
  .then(() => process.exit());
} else if (args[0].toLocaleString() === 'new') {
  getLists()
  .then(getLastWorkID)
  .then(id => getList(id))
  .then(console.log);
  // TODO createList here
  process.exit();
} else {
  console.log('help text');
  process.exit();
}
