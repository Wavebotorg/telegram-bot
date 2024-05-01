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
      { text: '💼Balance', callback_data: 'balanceButton' },
    ],
    [
      { text: '🗘Refresh', callback_data: 'refreshButton' },
      { text: '<- Back', callback_data: 'backButton' },
    ],
  ],
};

const blockchainKeyboard = {
  inline_keyboard: [
    [{ text: "Solana", callback_data: 'Solana' }],
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

    // bot.onText(/SignUp/, (msg) => {
    //   const chatId = msg.chat.id;
    //   bot.sendMessage(chatId, '👋 Welcome! Please provide your name:');
    //   bot.once('message', async (nameMsg) => {
    //     const name = nameMsg.text;
    //     console.log("🚀 ~ bot.once ~ name:", name)
    //     bot.sendMessage(chatId, `Great, thanks ${name}! Next, please provide your email address:`);
    //     bot.once('message', async (emailMsg) => {
    //       const email = emailMsg.text;
    //       console.log("🚀 ~ bot.once ~ email:", email)
    //       bot.sendMessage(chatId, 'Awesome! Now, please create a password:');
    //       bot.once('message', async (passwordMsg) => {
    //         const password = passwordMsg.text;
    //         bot.sendMessage(chatId, 'Got it! Please confirm your password:');
    //         bot.once('message', async (confirmPasswordMsg) => {
    //           const confirmPassword = confirmPasswordMsg.text;
    //           try {
    //             const response = await axios.post(`${API_URL}/signup`, {
    //               name,
    //               email,
    //               password,
    //               confirmPassword,
    //               chatId
    //             });
    //             const { message, data } = response.data;
    //             if (data && data.email) {
    //               await bot.sendMessage(chatId, `🎉 User registered successfully. Email: ${data.email}`);
    //               bot.sendMessage(chatId, '📧 Please check your email for a verification code:');
    //               bot.once('message', async (otpMsg) => {
    //                 const otp = otpMsg.text;
    //                 try {
    //                   const response = await axios.post(`${API_URL}/verify`, {
    //                     email,
    //                     otp,
    //                   });
    //                   if (response.data.status === true) {
    //                     await bot.sendMessage(chatId, `✅ User verified successfully`);
    //                   } else if (response.data.status === false) {
    //                     bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
    //                   }
    //                 } catch (error) {
    //                   console.error('Error:', error.message);
    //                   bot.sendMessage(chatId, `❌ An error occurred while verifying the user: ${error.message}`);
    //                 }
    //               });
    //             } else {
    //               bot.sendMessage(chatId, `❌ Failed to register user. Please try again.`);
    //             }
    //           } catch (error) {
    //             console.error('Error:', error.message);
    //             bot.sendMessage(chatId, `❌ An error occurred while registering the user: ${error.message}`);
    //           }
    //         });
    //       });
    //     });
    //   });
    // });

    bot.onText(/SignUp/, (msg) => {
      const chatId = msg.chat.id;
      console.log("🚀 ~ bot.onText ~ chatId:", chatId);
      startNameRegistration(chatId); // Start registration process from name
    });


  } else if (msg.text === 'Login') {
    // bot.sendMessage(chatId, '🔐 Please enter your email to log in:');
    // bot.once('message', async (emailMsg) => {
    //   const email = emailMsg.text;
    //   bot.sendMessage(chatId, '🔑 Now, please enter your password:');
    //   bot.once('message', async (passwordMsg) => {
    //     const password = passwordMsg.text;
    //     try {
    //       const response = await axios.post(`${API_URL}/login`, {
    //         email,
    //         password,
    //         chatId,
    //       });
    //       if (response.data.status === true) {
    //         bot.sendMessage(chatId, `✅ Login successful!`);
    //       } else {
    //         bot.sendMessage(chatId, '❌ Invalid email or password. Please try again.');
    //       }
    //     } catch (error) {
    //       console.error('Error:', error.message);
    //       bot.sendMessage(chatId, `❌ An error occurred while logging in: ${error.message}`);
    //     }
    //   });
    // });
    
    const chatId = msg.chat.id;
    console.log("🚀 ~ bot.onText ~ chatId:", chatId);
    startEmailLogin(chatId); // Start login process from email
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
*Your Wallet Address:*`
        , { reply_markup: JSON.stringify(buyKeyboard) });
      break;
    }
    case 'closeButton':
      bot.editMessageText('Menu closed.', { chat_id: chatId, message_id: messageId });
      break;
    case 'SwaptokenButton':
      bot.sendMessage(chatId, 'Choose a blockchain', { reply_markup: JSON.stringify(blockchainKeyboard) });
      console.log("🚀 ~ bot.on ~ chatId:", chatId)
      bot.on('callback_query', async (callbackQuery) => {
        const data = callbackQuery.data;
        chainId = data;
        console.log("🚀 ~ bot.on ~ chainId:", chainId)
        bot.sendMessage(chatId, ' Type To From Token::');
        bot.once('message', async (token0Msg) => {
          const token0 = token0Msg.text;
          console.log("🚀 ~ bot.once ~ token0:", token0)
          bot.sendMessage(chatId, ' Type To To Token:');
          bot.once('message', async (token1Msg) => {
            const token1 = token1Msg.text;
            console.log("🚀 ~ bot.once ~ token1:", token1)
            bot.sendMessage(chatId, ' Please enter the amount to swap:');
            bot.once('message', async (amountInMsg) => {
              const amountIn = Number(amountInMsg.text);
              console.log("🚀 ~ bot.once ~ amountIn:", amountIn)
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

