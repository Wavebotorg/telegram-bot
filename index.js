const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');
const express = require('express')
const app = express();

const PORT = process.env.PORT || 3333;
const TOKEN = process.env.TOKEN; // Telegram Token
const API_URL = process.env.BACKEND_URL; // Backend URL

const bot = new TelegramBot(TOKEN, { polling: true });

const buyKeyboard = {
  inline_keyboard: [
    [
      { text: 'Menu', callback_data: 'menuButton' },
      { text: 'Close', callback_data: 'closeButton' },
    ],
    [
      { text: 'Swap Token', callback_data: 'SwaptokenButton' },
    ],
    [
      { text: '🗘Refresh', callback_data: 'refreshButton' },
      { text: '💼Balance', callback_data: 'balanceButton' },
    ],
  ],
};

const blockchainKeyboard = {
  inline_keyboard: [
    [
      { text: 'Ethereum', callback_data: '1' },
      { text: 'Arbitrum', callback_data: '42161 ' },
      { text: 'Optimism', callback_data: '10' },
    ],
    [
      { text: 'Polygon', callback_data: '137' },
      { text: 'Base', callback_data: '8453' },
      { text: 'BNB Chain', callback_data: '56' },
    ],
    [
      { text: 'Avalanche', callback_data: '43114' },
      { text: 'Celo', callback_data: '42220' },
      { text: 'Blast', callback_data: '238' },
    ],
  ],
};


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log("🚀 ~ bot.on ~ chatId:", chatId)
  const userId = msg.from.id;
  console.log("🚀 ~ bot.on ~ userId:", userId)
  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot! Type something in the textbox:', {
      reply_markup: {
        keyboard: [
          [{ text: 'SignUp', request_contact: false, request_location: false }],
          [{ text: 'Login', request_contact: false, request_location: false }],
          [{ text: 'Start', request_contact: false, request_location: false }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  } else if (msg.text === 'SignUp') {
    bot.onText(/SignUp/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, '👋 Welcome! Please provide your name:');
      bot.once('message', async (nameMsg) => {
        const name = nameMsg.text;
        console.log("🚀 ~ bot.once ~ name:", name)
        bot.sendMessage(chatId, `Great, thanks ${name}! Next, please provide your email address:`);
        bot.once('message', async (emailMsg) => {
          const email = emailMsg.text;
          console.log("🚀 ~ bot.once ~ email:", email)
          bot.sendMessage(chatId, 'Awesome! Now, please create a password:');
          bot.once('message', async (passwordMsg) => {
            const password = passwordMsg.text;
            bot.sendMessage(chatId, 'Got it! Please confirm your password:');
            bot.once('message', async (confirmPasswordMsg) => {
              const confirmPassword = confirmPasswordMsg.text;
              try {
                const response = await axios.post(`${API_URL}/signup`, {
                  name,
                  email,
                  password,
                  confirmPassword,
                  chatId
                });
                const { message, data } = response.data;
                if (data && data.email) {
                  await bot.sendMessage(chatId, `🎉 User registered successfully. Email: ${data.email}`);
                  bot.sendMessage(chatId, '📧 Please check your email for a verification code:');
                  bot.once('message', async (otpMsg) => {
                    const otp = otpMsg.text;
                    try {
                      const response = await axios.post(`${API_URL}/verify`, {
                        email,
                        otp,
                      });
                      if (response.data.status === true) {
                        await bot.sendMessage(chatId, `✅ User verified successfully`);
                      } else if (response.data.status === false) {
                        bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
                      }
                    } catch (error) {
                      console.error('Error:', error.message);
                      bot.sendMessage(chatId, `❌ An error occurred while verifying the user: ${error.message}`);
                    }
                  });
                } else {
                  bot.sendMessage(chatId, `❌ Failed to register user. Please try again.`);
                }
              } catch (error) {
                console.error('Error:', error.message);
                bot.sendMessage(chatId, `❌ An error occurred while registering the user: ${error.message}`);
              }
            });
          });
        });
      });
    });

  } else if (msg.text === 'Login') {
    bot.sendMessage(chatId, '🔐 Please enter your email to log in:');
    bot.once('message', async (emailMsg) => {
      const email = emailMsg.text;
      bot.sendMessage(chatId, '🔑 Now, please enter your password:');
      bot.once('message', async (passwordMsg) => {
        const password = passwordMsg.text;
        try {
          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
            chatId,
          });
          if (response.data.status === true) {
            bot.sendMessage(chatId, `✅ Login successful!`);
          } else {
            bot.sendMessage(chatId, '❌ Invalid email or password. Please try again.');
          }
        } catch (error) {
          console.error('Error:', error.message);
          bot.sendMessage(chatId, `❌ An error occurred while logging in: ${error.message}`);
        }
      });
    });
  }
  else if (msg.text === 'Start') {
    async function start() {
      // const user = await UserModel.findOne({ chatId: chatId });
      const messageText = `*Welcome to WaveBot*
🌊 WaveBot(https://wavebot.app/)
📊 Dashbord(https://dashobaord.wavebot.app/)
🌊 WebSite(https://marketing-dashboard-beta.vercel.app/)
‧‧────────────────‧‧
*Your Email Address:* 
*Your Wallet Address:* `;

      bot.sendMessage(chatId, messageText, { reply_markup: JSON.stringify(buyKeyboard) });
    }
    start()
  } else {
    bot.sendMessage(chatId, `You typed: ${msg.text}`);
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  switch (data) {
    case 'menuButton': {
      // const user = await UserModel.findOne({ chatId: chatId });
      // console.log("🚀 ~ start ~ user:", user)
      bot.sendMessage(chatId,
        `*Welcome to WaveBot*
🌊 WaveBot(https://wavebot.app/)
📊 Dashbord(https://dashobaord.wavebot.app/)
🌊 WebSite(https://marketing-dashboard-beta.vercel.app/)
‧‧────────────────‧‧
*Your Email Address:* 
*Your Wallet Address:* `
        , { reply_markup: JSON.stringify(buyKeyboard) });
      break;
    }
    case 'closeButton':
      bot.editMessageText('Menu closed.', { chat_id: chatId, message_id: messageId });
      break;
    case 'SwaptokenButton':
      bot.sendMessage(chatId, 'Choose a blockchain', { reply_markup: JSON.stringify(blockchainKeyboard) });
      bot.on('callback_query', async (callbackQuery) => {
        const data = callbackQuery.data;
        chainId = data;
        bot.sendMessage(chatId, ' Type To From Token::');
        bot.once('message', async (token0Msg) => {
          const token0 = token0Msg.text;
          bot.sendMessage(chatId, ' Type To To Token:');
          bot.once('message', async (token1Msg) => {
            const token1 = token1Msg.text;
            bot.sendMessage(chatId, ' Please enter the amount to swap:');
            bot.once('message', async (amountInMsg) => {
              const amountIn = Number(amountInMsg.text);
              try {
                const response = await axios.post(`${API_URL}/mainswap`, {
                  token0,
                  token1,
                  amountIn,
                  chainId,
                  chatId,
                });
                if (response.data.status === true) {
                  bot.sendMessage(chatId, `Swap successful!`);
                } else {
                  bot.sendMessage(chatId, response.data.message || '❌ Swap failed. Please try again.');
                }
              } catch (error) {
                bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
              }
            });
          });
        });
      });
      break;
    case 'balanceButton':
      // const user = await UserModel.findOne({ chatId: chatId });
      // const balancedata = await controller.fetchBalance(user.wallet)
      // let message = "Balance:\n";
      // balancedata.forEach((item, index) => {
      //   message += `${index + 1}. Name: ${item.name}, Amount: ${item.balance}\n`; // Modify this based on your object structure
      // });
      // bot.sendMessage(chatId, message);
      break;
    default:
      console.log(`Unknown button clicked: ${data}`);
  }
});


app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log('Bot started!');

