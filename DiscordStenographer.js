require('dotenv').config();
const fs = require('fs');
const path = require('path');
const opus = require('node-opus');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
//const botCommands = require('./commands');
const child = require('child_process');

const transcribePCM = 'transcribePCM.py'
const deletePCM = 'deletePCM.py'

let voiceConnections = new Map();
let voiceReceivers = new Map();
let writeStreams = new Map();
var saveStream;
var saveName;
var echo;

// Object.keys(botCommands).map(key => {
//   bot.commands.set(botCommands[key].name, botCommands[key]);
// });

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if(msg.content.charAt(0) === '!'){
    let req = msg.content.slice(1);
    textChannel = msg.channel;
    if (req === 'record') {
      console.log('Recording');
      start(msg.member);
      echo = false;
    } else if (req === 'off') {
      stop(msg.member);
    } else if (req === 'echo') {
      console.log("Echoing");
      start(msg.member);
      echo = true;
    }
  }
});




bot.on('guildMemberSpeaking', (member, speaking) => {
  // this event triggers both when someone starts and stops speaking. we only care if they are speaking
  if(speaking.bitfield){
    const ts = new Date(Date.now()).toLocaleString();
    const rec = voiceReceivers.get(member.voice.channelID);
    const audio = rec.createStream(member, {mode: 'pcm', end: 'silence' });
    const pcmName = `${Date.now()}.pcm`;
    const outputStream = fs.createWriteStream(pcmName);
    audio.pipe(outputStream);
    audio.on('end', () => {
      let py = child.spawn('python', [transcribePCM, pcmName]);
      py.stdout.on('data', function (data){
        const message = data.toString();
        if(message[0]!=='!'){ //ignore message if it couldnt be transcribed
          if(echo){
            textChannel.send(member.displayName+": "+message);
          }else{
            saveStream.write(ts+" "+member.displayName+": "+message);
          }
        }
        outputStream.destroy();
        child.spawn('python', [deletePCM]);
      });
    });
  }
});

let start = (member) => {
  if (!member || !member.voice.channel) {
    console.log('no member or vc');
    return;
  }

  member.voice.channel.join().then((voiceConnection) => {
    voiceConnections.set(member.voice.channelID, voiceConnection);
    voiceReceivers.set(member.voice.channelID, voiceConnection.receiver);
    if(!echo){
      saveName = member.voice.channel.name+Date.now()+'.txt';
      saveStream = fs.createWriteStream(saveName);
    }
  }).catch((error) => {
    console.log("error on channel join");
  })
}

let stop = (member) => {

  if (!member || !member.voice.channel) {
    return;
  }
  if(!echo){
    console.log(saveName);
    saveStream.destroy();
    textChannel.send({
      files: [{
        attachment: saveName,
        name: saveName
      }]
    }).then(()=>{
      fs.unlinkSync(saveName);
    });




  }
  child.spawn('python', [deletePCM]); //clean up
  if (voiceReceivers.get(member.voice.channelID)) {
    voiceReceivers.delete(member.voice.channelID);
    voiceConnections.get(member.voice.channelID).disconnect();
    voiceConnections.delete(member.voice.channelID);
  }

}
