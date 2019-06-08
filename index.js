// add proper projectId and KeyFilename path!
const projectId = project-id;
const keyFilename = path;

const voices = [
  'en-AU-Wavenet-A',
  'en-AU-Wavenet-B',
  'en-AU-Wavenet-C',
  'en-Au-Wavenet-D',
  'en-GB-Wavenet-A',
  'en-GB-Wavenet-B',
  'en-GB-Wavenet-C',
  'en-GB-Wavenet-D',
  'en-IN-Wavenet-A',
  'en-IN-Wavenet-B',
  'en-IN-Wavenet-C',
  'en-US-Wavenet-A',
  'en-US-Wavenet-B',
  'en-US-Wavenet-C',
  'en-US-Wavenet-D',
  'en-US-Wavenet-E',
  'en-US-Wavenet-F',
];

var express = require('express');
require('express-async-errors');
const textToSpeech = require('@google-cloud/text-to-speech');
var player = require('play-sound')((opts = {}));
const fs = require('fs');
const util = require('util');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');

let audio;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const ttsClient = new textToSpeech.TextToSpeechClient({
  projectId,
  keyFilename,
});

app.post('/say', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const outputFile =
    'sounds/' +
    new Date().toLocaleString().replace(new RegExp('/', 'g'), '-') +
    '.mp3';
  const body = {
    audioConfig: {
      audioEncoding: 'MP3',
      pitch: 0,
      speakingRate: 1,
    },
    input: {
      text: req.body.text,
      // text:
      // 'Google Cloud Text-to-Speech enables developers to synthesize natural-sounding speech with 100+ voices, available in multiple languages and variants. It applies DeepMind’s groundbreaking research in WaveNet and Google’s powerful neural networks to deliver the highest fidelity possible. As an easy-to-use API, you can create lifelike interactions with your users, across many applications and devices.',
    },
    voice: {
      languageCode: 'en-US',
      // name: req.body.voiceName
      name: req.body.voiceName
        ? voices.includes(req.body.voiceName)
          ? req.body.voiceName
          : 'en-US-Wavenet-F'
        : 'en-US-Wavenet-F',
    },
  };

  const [response] = await ttsClient.synthesizeSpeech(body);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outputFile, response.audioContent, 'binary');
  try {
    audio.kill();
  } catch (error) {}
  audio = player.play(outputFile, function(err) {
    console.error(err);
  });

  res.send(
    JSON.stringify({
      text: req.body.text || null,
      voiceName: req.body.voiceName || 'en-US-Wavenet-D',
    }),
  );

  console.log(req.body);
  console.log('you posted: Text: ' + req.body.text);
  console.log('voice: ' + req.body.voiceName);
});

app.get('/stopSpeaking', function(req, res) {
  try {
    audio.kill();
    res.send('stopped successfully');
  } catch (error) {
    res.send(`couldn't stop speaking`);
  }
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
