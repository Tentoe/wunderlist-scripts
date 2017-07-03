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
const getTasks = (id, completed = false) => new Promise((resolve, reject) =>
  tasks.forList(id, completed).done(resolve).fail(reject));

const getNewest = (acc, l) => {
  if (!acc) return l;
  const lTime = Date.parse(l.created_at).getTime();
  const accTime = Date.parse(acc.created_at).getTime();
  return lTime < accTime ? l : acc;
};
const mapNotes = t => notes.forTask(t.id).then(ns => Object.assign(t, {
  notes: ns,
}));

getLists().then((ls) => {
  const workLists = ls.filter(l => l.title.toLowerCase() === 'work');
  const lastWorkList = workLists.reduce(getNewest);
  return lastWorkList.id;
}).then(id => Promise.all([getTasks(id), getTasks(id, true)])).then((ts) => {
  console.log('Aufgaben erledigt und offen\n');
  console.log('Offen:');
  ts[0].forEach(t => console.log(t.title));
  console.log('\nErledigt:');
  ts[1].forEach(t => console.log(t.title));
});

// Promise.all(lists.all()).then(ls => Promise.resolve(4)).then(console.log).catch(console.warn);
// .then((ls) => {
//   const workLists = ls.filter(l => l.title.toLowerCase() === 'work');
//   const lastWorkList = workLists.reduce(getNewest);
//   return tasks.forList(lastWorkList.id);
// }).then(console.log);


// .then(id => ).then(console.log);
// ts => Promise.all(ts.map(mapNotes)))
