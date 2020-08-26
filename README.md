# Discord Stenographer
This bot will join a discord channel, record the audio, and transcribe it into text. Depending on the mode it is in, it will either send the transcribed message to a text channel, or it will save messages to a file that will be posted after it is shut off.

## Dependencies
+ [NodeJS](https://nodejs.org/)
+ [node-opus](https://www.npmjs.com/package/node-opus)
+ [Discord.js](https://discord.js.org)
+ [Python](https://www.python.org/)
+ [SpeechRecognition](https://pypi.python.org/pypi/SpeechRecognition/)

## Usage

#### Setup
+ Create a [Discord Bot](https://discordapp.com/developers/) and add it to your server.
+ ```git clone https://github.com/nfsmith/DiscordStenographer.git```
+ ```npm install```
+ ```pip install SpeechRecognition```
+ In the '.env' file, replace 'YOUR_TOKEN_GOES_HERE' with the token for your bot
+ ```node DiscordStenographer.js```

#### Commands
Once your bot is up and running you need to tell it what you want it to do in discord. Since this bot is meant to transcribe audio, the commands will only work if you are already in a voice channel.
+ ```!echo``` the bot will join your voice channel and start listening. Successfully transcribed messages will be immediately sent to the text channel this command was sent in.
+ ```!record``` the bot will join your voice channel and start listening. Successfully transcribed messages will be saved to a file.
+ ```!off``` the bot will leave your voice channel. If the bot was in record mode, the file containing saved messages will be sent to the text channel the record command was sent in.


#### Potential Bugs/Issues

+ Transcribing audio from multiple channels or servers at once is untested.
+ If SpeechRecognition cannot understand the recorded audio, the bot ignores that message. If the bot is not transcribing you might need to speak more clearly or use a better microphone. However, I used a cheap webcam microphone to test this so you shouldn't need studio quality equipment.
+ I ran into a bug where seemingly at random the bot wouldn't work. The 'guildMemberSpeaking' event wouldn't trigger so no audio would be recorded. This could be fixed by simply restarting the bot, and I could not consistently recreate it for easy testing. I was never able to figure out what caused this issue, but when I made it so the bot played a sound when it joins a channel, it stopped happening. I haven't had this issue in a while but I never figured out the cause of it so I figure its worth mentioning here.
+ I'm sure you could find a way to break the bot by intentionally sending commands at the wrong time or situation. Don't do that and it should be fine.

#### Questions?
Email me at nickfsmith96@gmail.com
