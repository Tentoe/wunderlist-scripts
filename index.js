/* eslint-disable no-alert, no-console, linebreak-style, no-useless-escape */
import {
  execFile,
} from 'child_process';
import encodeUrl from 'encodeurl';
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
const writeTask = (acc, t) => {
  let ret = acc;
  ret += `${t.title}\n`;
  ret += t.notes.reduce((acc2, n) => `${acc2} -${n.content}\n`, '');
  return ret;
};
const writeTasks = (ts) => {
  let msg = '';
  msg += 'werkstattleitung@ctl.de?subject=Aufgaben erledigt und offen';
  msg += '&body=Offen:\n';
  msg += ts[0].reduce(writeTask, '');
  msg += '\n\nErledigt:\n';
  msg += ts[1].reduce(writeTask, '');
  return encodeUrl(msg);
};
const addNote = t => getNotes(t.id).then(n => ({ ...t,
  notes: n,
}));
const addNotes = taskArray => Promise.all(taskArray.map(addNote));

const getAllTasks = id =>
  Promise.all([getTasks(id).then(addNotes), getTasks(id, true).then(addNotes)]);

const openOutlook = (msg) => {
  execFile('C:\\Program Files (x86)\\Microsoft Office\\Office16\\OUTLOOK.exe', ['/c', 'ipm.note', '/m', msg], () => process.exit());
};

const args = process.argv.slice(2);
if (!args[0]) {
  console.log('test');
  process.exit();
}
if (args[0] && args[0].toLocaleString() === 'report') {
  getLists()
    .then(getLastWorkID)
    .then(getAllTasks)
    .then(writeTasks)
    .then(openOutlook);
} else if (args[0] && args[0].toLocaleString() === 'new') {
  getLists()
    .then(getLastWorkID)
    .then(id => getList(id))
    .then(console.log);
  // TODO createList here
  process.exit();
}
