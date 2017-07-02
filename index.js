/* eslint-disable no-alert, no-console */


import tokenID from './tokenID';

const WunderlistSDK = require('wunderlist');

const wunderlistAPI = new WunderlistSDK(tokenID);


const { lists, notes, tasks } = wunderlistAPI.http;


lists.getID(308101424).then(data => console.log(data));

const logNote = taskID => notes.forTask(taskID).then(n => n[0] && console.log(` -${n[0].content}`));


tasks.forList(308101424).then(ts => ts.forEach((t) => {
  console.log(t.title);
  logNote(t.id);
}));
