require('dotenv').config();
const fs = require('fs');
const path = require('path');
const opus = require('node-opus');
const Discord = require('discord.js');
const bot = new Discord.Client();
const child = require('child_process');

const transcribePCM = 'transcribePCM.py';
const deletePCM = 'deletePCM.py';
const debugLog = 'debug.log';

let voiceConnections = {};
let logStream = fs.createWriteStream(debugLog);

const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg =>{
  if(msg.content.charAt(0) === '!'){
    let req = msg.content.slice(1);
    let textChannel = msg.channel;
    console.log('Request received: '+req);
    if (req === 'record') {
      start(msg.member, textChannel, false);
    } else if (req === 'off') {
      stop(msg.member);
    } else if (req === 'echo') {
      start(msg.member, textChannel, true);
    } else if (req === 'debug') {
      debug(textChannel);
    }
  }
});

bot.on('debug', (info) => {
  logStream.write(info+'\n');
});

let debug = (textChannel) => {
  textChannel.send({
    files: [{
      attachment: debugLog,
      name: debugLog
    }]
  });
}

let manualDebug = (info) => {
    logStream.write(info+'\n');
}

bot.on('guildMemberSpeaking', (member, speaking) => {
  manualDebug('GMS');
  if(speaking.bitfield){
    const ts = new Date(Date.now()).toLocaleString();
    const conInfo = voiceConnections[member.voice.channelID];
    const rec = conInfo.receiver;
    const audio = rec.createStream(member, {mode: 'pcm', end: 'silence'});
    const pcmName = `${Date.now()}.pcm`;
    const outputStream = fs.createWriteStream(pcmName);
    audio.pipe(outputStream);
    audio.on('end', () => {
      let py = child.spawn('python', [transcribePCM, pcmName]);
      py.stdout.on('data', function(data){
        const message = data.toString();
        console.log("transcribePCM returned: "+message);
        if(message[0]!=='!'){
          const echo = conInfo.echo;
          if(echo){
            conInfo.textChannel.send(member.displayName+": "+message);
          } else {
            conInfo.saveStream.write(ts+" "+member.displayName+": "+message);
          }
        }
        outputStream.destroy();
        child.spawn('python', [deletePCM]);
      });
    })
  }
});

let start = (member, textChannel, echo) => {
  if(!member || !member.voice.channel) {
    console.log('Member does not exist or is not in a voice channel');
    return;
  }

  member.voice.channel.join().then((voiceConnection) => {
    let channelID = member.voice.channelID;
    voiceConnections[channelID] = {};
    voiceConnections[channelID].echo = echo;
    voiceConnections[channelID].textChannel = textChannel;
    voiceConnections[channelID].connection = voiceConnection;
    voiceConnections[channelID].receiver = voiceConnection.receiver;
    if(!echo){
      let saveName = member.voice.channel.name+Date.now()+'.txt';
      voiceConnections[channelID].saveName = saveName;
      voiceConnections[channelID].saveStream = fs.createWriteStream(saveName);
    }
  }).catch((error) => {
    console.log("error on channel join");
  });
}

let stop = (member) => {
  if(!member || !member.voice.channel) {
    console.log('Member does not exist or is not in a voice channel');
    return;
  }
  let channelID = member.voice.channelID;
  let echo = voiceConnections[channelID].echo;
  if(!echo) {
    let saveName = voiceConnections[channelID].saveName;
    let textChannel = voiceConnections[channelID].textChannel;
    voiceConnections[channelID].saveStream.destroy();
    textChannel.send({
      files: [{
        attachment: saveName,
        name: saveName
      }]
    }).then(()=>{
      fs.unlinkSync(saveName);
    });
  }
  child.spawn('python', [deletePCM]);
  voiceConnections[channelID].connection.disconnect();
  delete voiceConnections[channelID];
}
