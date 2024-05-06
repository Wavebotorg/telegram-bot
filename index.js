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
      { text: '🗓Menu', callback_data: 'menuButton' },
      { text: '❌Close', callback_data: 'closeButton' },
    ],
    // [
    //   { text: '↔️SwapToken EVM ', callback_data: 'SwaptokenButton' },
    // ],
    // [
    //   { text: '↔️SwapToken Solona', callback_data: 'solonaButton' },
    // ],
    [
      { text: 'SwapToken', callback_data: 'SwaptokenButton' },
    ],
    [
      { text: '💼Balance EVM', callback_data: 'balanceButton' },
      { text: '💼Balance Solona', callback_data: 'SolonabalanceButton' },
    ],
    [
      { text: '🔄Refresh', callback_data: 'refreshButton' },
      { text: '👈Back', callback_data: 'backButton' },
    ],
  ],
};

const blockchainKeyboard = {
  inline_keyboard: [
    [
      { text: 'Solona', callback_data: 'solana' },
    ],
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


const isValidEmail = (email) => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // Regular expression for password validation (example: at least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const startNameRegistration = (chatId) => {
  bot.sendMessage(chatId, '👋 Welcome! Please provide your name:');
  bot.once('message', async (nameMsg) => {
    const name = nameMsg.text;
    bot.sendMessage(chatId, `Great, thanks ${name}! Next, please provide your email address:`);
    startEmailRegistration(chatId, name); // Pass name to email registration
  });
};

const startEmailRegistration = (chatId, name) => {
  bot.once('message', async (emailMsg) => {
    const email = emailMsg.text;


    if (!isValidEmail(email)) {
      bot.sendMessage(chatId, '❌ Invalid email address. Please enter a valid email.');
      startEmailRegistration(chatId, name); // Reset email registration process
      return; // Exit the function to prevent further execution
    }


    bot.sendMessage(chatId, 'Awesome! Now, please create a password:');
    startPasswordRegistration(chatId, name, email); // Pass name and email to password registration
  });
};

const startPasswordRegistration = (chatId, name, email) => {
  bot.once('message', async (passwordMsg) => {
    const password = passwordMsg.text;


    if (!isValidPassword(password)) {
      bot.sendMessage(chatId, '❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.');
      startPasswordRegistration(chatId, name, email); // Reset password registration process
      return; // Exit the function to prevent further execution
    }


    bot.sendMessage(chatId, 'Got it! Please confirm your password:');
    startConfirmPasswordRegistration(chatId, name, email, password); // Pass name, email, and password to confirm password registration
  });
};

const startConfirmPasswordRegistration = (chatId, name, email, password) => {
  bot.once('message', async (confirmPasswordMsg) => {
    const confirmPassword = confirmPasswordMsg.text;
    if (password !== confirmPassword) {
      bot.sendMessage(chatId, '❌ Passwords do not match. Please try again.');
      startPasswordRegistration(chatId, name, email); // Start from password registration
      return; // Exit the function to prevent further execution
    }
    // Continue with registration process
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
        startOTPVerification(chatId, email); // Start OTP verification process
      } else {
        bot.sendMessage(chatId, `❌ Failed to register user. Please try again.`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while registering the user: ${error.message}`);
    }
  });
};

const startOTPVerification = (chatId, email) => {
  console.log("------------------------------------")
  bot.once('message', async (otpMsg) => {
    const otp = otpMsg.text;
    try {
      const response = await axios.post(`${API_URL}/verify`, {
        email,
        otp,
      });
      if (response.data.status == true) {
        await bot.sendMessage(chatId, `✅ User verified successfully`);
      } else {
        bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
        startOTPVerification(chatId, email); // Recall OTP verification process
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while verifying the user: ${error.message}`);
    }
  });
};

const startEmailLogin = (chatId) => {
  bot.sendMessage(chatId, '🔐 Please enter your email to log in:');
  bot.once('message', async (emailMsg) => {
    const email = emailMsg.text;
    if (!isValidEmail(email)) {
      bot.sendMessage(chatId, '❌ Invalid email format. Please enter a valid email.');
      startEmailLogin(chatId); // Restart login process from email if email is invalid
      return;
    }
    startPasswordLogin(chatId, email); // Proceed to password login
  });
};

const startPasswordLogin = (chatId, email) => {
  bot.sendMessage(chatId, '🔑 Please enter your password:');
  bot.once('message', async (passwordMsg) => {
    const password = passwordMsg.text;
    if (!isValidPassword(password)) {
      bot.sendMessage(chatId, '❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.');
      startPasswordLogin(chatId, email); // Restart login process from password if password is invalid
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        chatId,
      });
      console.log("🚀 ~ bot.once ~ chatId:", chatId)
      console.log("🚀 ~ bot.once ~ password:", password)
      console.log("🚀 ~ bot.once ~ email:", email)
      if (response.data.status === true) {
        bot.sendMessage(chatId, `✅ Login successful!`);
      } else {
        bot.sendMessage(chatId, '❌ Invalid email or password. Please try again.');
        startEmailLogin(chatId); // Restart login process from email if credentials are invalid
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while logging in: ${error.message}`);
    }
  });
};

// Function to start the swapping process
const startSwapProcess = (chatId) => {
  bot.sendMessage(chatId, `🌟 Choose a blockchain 🌟

  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`, { reply_markup: JSON.stringify(blockchainKeyboard) });
  console.log("🚀 ~ bot.on ~ chatId:", chatId);


  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chainId = data;

    if (chainId == "solana") {

      bot.sendMessage(chatId, ' Type To input Token:');
      bot.once('message', async (inputMsg) => {
        const input = inputMsg.text;
        console.log("🚀 ~ bot.once ~ input:", input)
        bot.sendMessage(chatId, ' Type To output Token:');
        bot.once('message', async (outputMsg) => {
          const output = outputMsg.text;
          console.log("🚀 ~ bot.once ~ output:", output)
          bot.sendMessage(chatId, ' Please enter the amount to swap:');
          bot.once('message', async (amountMsg) => {
            const amount = Number(amountMsg.text);
            console.log("🚀 ~ bot.once ~ amount:", amount)
            try {
              const response = await axios.post(`${API_URL}/solanaSwap`, {
                input,
                output,
                amount,
                chatId,
              });
              if (response.data.status === true) {
                bot.sendMessage(chatId, `Solona Swap successful!`);
              } else {
                bot.sendMessage(chatId, response.data.message || '❌ Swap failed. Please try again.');
              }
            } catch (error) {
              bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
            }
          });
        });
      });
      
    } else {
      console.log("🚀 ~ bot.on ~ chainId:", chainId);
      startTokenSelection(chatId, chainId); // Proceed to token selection
    }
  });
};

// Function to select tokens for swapping
const startTokenSelection = (chatId, chainId) => {
  bot.sendMessage(chatId, 'Type From Token:');
  bot.once('message', async (token0Msg) => {
    const token0 = token0Msg.text;
    console.log("🚀 ~ bot.once ~ token0:", token0);
    bot.sendMessage(chatId, 'Type To Token:');
    bot.once('message', async (token1Msg) => {
      const token1 = token1Msg.text;
      console.log("🚀 ~ bot.once ~ token1:", token1);
      startAmountEntry(chatId, chainId, token0, token1); // Proceed to amount entry
    });
  });
};

// Function to enter the amount for swapping
const startAmountEntry = (chatId, chainId, token0, token1) => {
  bot.sendMessage(chatId, 'Please enter the amount to swap:');
  bot.once('message', async (amountInMsg) => {
    const amountIn = Number(amountInMsg.text);
    console.log("🚀 ~ bot.once ~ amountIn:", amountIn);
    try {
      const response = await axios.post(`${API_URL}/mainswap`, {
        token0,
        token1,
        amountIn,
        chainId,
        chatId,
      });
      if (response.data.status === true) {
        bot.sendMessage(chatId, `Swap successful Your Hash is ${response.data.data}`);
      } else {
        bot.sendMessage(chatId, response.data.message || '❌ Swap failed. Please try again.');
      }
    } catch (error) {
      bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
    }
  });
};


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (msg.text === '/start') {
    bot.sendMessage(chatId, `👋 Welcome to the Wavebot! 👋

    Thank you for joining us! To get started, simply press start Button. 
    Our bot is here to assist you with anything you need!🤖💬`, {
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
      console.log("🚀 ~ bot.onText ~ chatId:", chatId);
      startNameRegistration(chatId); // Start registration process from name
    });
  } else if (msg.text === 'Login') {
    const chatId = msg.chat.id;
    console.log("🚀 ~ bot.onText ~ chatId:", chatId);
    startEmailLogin(chatId); // Start login process from email
  }
  else if (msg.text === 'Start') {
    async function start() {
      const messageText = `Welcome to WaveBot! 🌊
🌊 WaveBot(https://wavebot.app/)
📖 Dashbord(https://dashobaord.wavebot.app/)
🌐 WebSite(https://marketing-dashboard-d22655001f93.herokuapp.com/)
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
      bot.sendMessage(chatId,
        `*Welcome to WaveBot! 🌊
🌊 WaveBot(https://wavebot.app/)
📖 Dashbord(https://dashobaord.wavebot.app/)
🌐 WebSite(https://marketing-dashboard-d22655001f93.herokuapp.com/)
‧‧────────────────‧‧
*Your Email Address:* 
*Your Wallet Address:* `
        , { reply_markup: JSON.stringify(buyKeyboard) });
      break;
    }

    case 'closeButton':
      bot.editMessageText('Menu closed.', { chat_id: chatId, message_id: messageId });
      break;

    case 'solonaButton':
      break;

    case 'SwaptokenButton':
      startSwapProcess(chatId); // Start swapping process
      break;


    case 'SolonabalanceButton':
      bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const action = callbackQuery.data;
        if (action === 'SolonabalanceButton') {
          try {
            const response = await axios.post(`${API_URL}/solanaBalance`, {
              chatId: chatId
            });
            const balances = response?.data?.data;
            let message = 'Your Solana Wallet balances:\n\n';

            if (balances && balances.length > 0) {
              balances?.slice(0, 4)?.forEach(balance => {
                message += `Token Name: ${balance.name}\n`;
                message += `Balance: ${balance.amount}\n\n`;
              });
              message += `For More info (https://solscan.io/account/${response?.data?.walletAddress})\n\n`
              message += 'Thank you for using our service! ✌️';
            } else {
              message = 'No balances found.';
            }
            bot.sendMessage(chatId, message);
          } catch (error) {
            console.error('Error fetching balance:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching your balance.');
          }
        }
      });
      break;

    case 'balanceButton':
      bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const action = callbackQuery.data;
        if (action === 'balanceButton') {
          try {
            const response = await axios.post(`${API_URL}/fetchbalance`, {
              chatId: chatId
            });
            const balances = response.data;
            console.log("🚀 ~ bot.on ~ balances:", balances)
            let message = 'Your token balances:\n\n';
            balances?.slice(0, 4)?.forEach(balance => {
              message += `Token Name: ${balance.name}\n`;
              message += `Balance: ${balance.balance}\n\n`;
            });
            message += 'Thank you for using our service! ✌️';
            bot.sendMessage(chatId, message);
          } catch (error) {
            console.error('Error fetching balance:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching your balance.');
          }
        }
      });
      break;
    default:
      console.log(`Unknown button clicked: ${data}`);
  }
});


app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log('Bot started!');

