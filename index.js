const { Client, LocalAuth, Chat, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const colors = require('colors');
const fs = require('fs');
const https = require('https');
const http = require('http');


function removeSpecialCharacters(str) {
  if (typeof str !== 'string') {
    throw new Error('Input is not a valid string.');
  }

  // Define the regular expression pattern to match special characters
  const regex = /[!@#$%^&*(),.?":{}|<>]/g;

  // Replace special characters with an empty string
  const result = str.replace(regex, '');

  return result;
}

// Usage example


function removeWordFromString(str, word) {
  // Escape special characters in the word

  word = removeSpecialCharacters(word);
  str = removeSpecialCharacters(str);

  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create the regular expression pattern to match the word
  const regex = new RegExp('\\b' + escapedWord + '\\b', 'gi');

  // Remove all occurrences of the word from the string
  const result = str.replace(regex, '');

  return result;
}

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    },
    ffmpeg: './ffmpeg.exe',
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./config/config.json');

client.on('qr', (qr) => {
    console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Scan the QR below : `);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    const consoleText = './config/console.txt';
    fs.readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`.yellow);
            console.log(` VermaGPT is running ! Search - Sticker - GPT Powered`.green);
        } else {
            console.log(data.green);
            console.log(` VermaGPT is running ! Search - Sticker - GPT Powered`.green);
        }
    });
});

client.on('message', async (message) => {

// OpenAI ChatGPT Integration


const { Configuration, OpenAIApi } = require("openai");
const readlineSync = require("readline-sync");
require("dotenv").config();

(async () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const history = [];
    const user_input = message.body;

    const messages = [];
    for (const [input_text, completion_text] of history) {
      messages.push({ role: "user", content: input_text });
      messages.push({ role: "assistant", content: completion_text });
    }

    messages.push({ role: "user", content: user_input });

    
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const completion_text = completion.data.choices[0].message.content;
      message.reply(completion_text);
     
    
})();


// Google Search
    if(message.body.includes("!search")){
        searchQuery = removeWordFromString(message.body, "!search");


const query = searchQuery;
const options = {
  hostname: 'www.googleapis.com',
  path: `/customsearch/v1?key=AIzaSyAhkn6YhpIT0Ts4oR8JQapbZCOpDu6A6WQ&cx=c132509ef734d55df&q=${encodeURIComponent(query)}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);
    const links = json.items.map(item => item.link).join('\n\n');
    message.reply(links); // Links separated by new lines
  });
});

req.on('error', (error) => {
  message.reply(error);
});

req.end();

    }


if(message.body.includes("!book")){
        searchQuery = removeWordFromString(message.body, "!book");

const query = "filetype:pdf intitle:'"+searchQuery+"'";
const options = {
  hostname: 'www.googleapis.com',
  path: `/customsearch/v1?key=AIzaSyAhkn6YhpIT0Ts4oR8JQapbZCOpDu6A6WQ&cx=c132509ef734d55df&q=${encodeURIComponent(query)}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);
    const links = json.items.map(item => item.link).join('\n\n');
    message.reply("Searching for E-Books of : "+searchQuery+"...")
    message.reply(links); // Links separated by new lines
    message.reply("Here are the results!")
  });
});

req.on('error', (error) => {
  message.reply(error);
});

req.end();

    }

if(message.body === "Thanks"){
    message.reply("Your Most welcome, I'm happy that I was able to help you!")
}


    const isGroups = message.from.endsWith('@g.us') ? true : false;
    if(message.body === 'Hello') {
        message.reply('Hey! How are you? Send any photo with !s as caption');
    }
    if ((isGroups && config.groups) || !isGroups) {
        if ((message.type == "image" || message.type == "video" || message.type  == "gif") && message.body === "!s") {
            client.sendMessage(message.from, "*[⏳]* Loading..");
            try {
                const media = await message.downloadMedia();
                client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                    stickerAuthor: config.author // Sticker Author = Edit in 'config/config.json'
                }).then(() => {
                    client.sendMessage(message.from, "*[✅]* Sticker Generated !");
                });
            } catch {
                client.sendMessage(message.from, "*[❎]* Failed To Generate!");
            }
        } else if (message.type == "sticker") {
            client.sendMessage(message.from, "*[⏳]* Sending...");
            try {
                const media = await message.downloadMedia();
                client.sendMessage(message.from, media).then(() => {
                    client.sendMessage(message.from, "*[✅]* Image Generated !");
                });  
            } catch {
                client.sendMessage(message.from, "*[❎]* Failed To Generate!");
            }
        } else {
            client.getChatById(message.id.remote).then(async (chat) => {
                await chat.sendSeen();
            });
        }
    }
});

client.initialize();
