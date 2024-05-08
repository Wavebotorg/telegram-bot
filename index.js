const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');
const express = require('express')
const app = express();

const PORT = process.env.PORT || 3333;
const TOKEN = process.env.TOKEN; // Telegram Token
const API_URL = process.env.BACKEND_URL; // Backend URL


const bot = new TelegramBot(TOKEN, { polling: true });

let isSigningUp = false; // Flag to track signup process
let isLoggingIn = false; // Flag to track login process

const buyKeyboard = {
  inline_keyboard: [
    [
      { text: 'Buy', callback_data: 'buyButton' },
      { text: 'Sell', callback_data: 'sellButton' },
    ],
    [
      { text: 'Position', callback_data: 'positionButton' },
      { text: 'Limit Orders', callback_data: 'limitButton' },
      { text: 'DCA Orders', callback_data: 'dcaOrdersButton' },
    ],
    [
      { text: 'SwapToken', callback_data: 'SwaptokenButton' },
      { text: '🗓Menu', callback_data: 'menuButton' },
    ],
    [
      { text: '💼Balance EVM', callback_data: 'balanceButton' },
      { text: '💼Balance Solona', callback_data: 'SolonabalanceButton' },
    ],
    [
      { text: '🔄Refresh', callback_data: 'refreshButton' },
      { text: '👈Back', callback_data: 'backButton' },
      { text: 'Logout', callback_data: 'logoutButton' },
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

const buyblockchainKeyboard = {
  inline_keyboard: [
    [
      { text: 'Solona', callback_data: 'solBuy/buy' },
    ],
    [
      { text: 'Ethereum', callback_data: '1/buy' },
      { text: 'Arbitrum', callback_data: '42161/buy ' },
      { text: 'Optimism', callback_data: '10/buy' },
    ],
    [
      { text: 'Polygon', callback_data: '137/buy' },
      { text: 'Base', callback_data: '8453/buy' },
      { text: 'BNB Chain', callback_data: '56/buy' },
    ],
    [
      { text: 'Avalanche', callback_data: '43114/buy' },
      { text: 'Celo', callback_data: '42220/buy' },
      { text: 'Blast', callback_data: '238/buy' },
    ],
  ],
};

const sellblockchainKeyboard = {
  inline_keyboard: [
    [
      { text: 'Solona', callback_data: 'solSell/sell' },
    ],
    [
      { text: 'Ethereum', callback_data: '1/sell' },
      { text: 'Arbitrum', callback_data: '42161/sell ' },
      { text: 'Optimism', callback_data: '10/sell' },
    ],
    [
      { text: 'Polygon', callback_data: '137/sell' },
      { text: 'Base', callback_data: '8453/sell' },
      { text: 'BNB Chain', callback_data: '56/sell' },
    ],
    [
      { text: 'Avalanche', callback_data: '43114/sell' },
      { text: 'Celo', callback_data: '42220/sell' },
      { text: 'Blast', callback_data: '238/sell' },
    ],
  ],
};

// Email Validation 
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

//Password Validation
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Signup Funaction
const startNameRegistration = (chatId) => {

  if (isSigningUp) {
    bot.sendMessage(chatId, '👋 Welcome! Please provide your name:');
  }
  if (isSigningUp) {
    bot.once('message', async (nameMsg) => {
      const name = nameMsg.text;
      bot.sendMessage(chatId, `Great, thanks ${name}! Next, please provide your email address:`);
      startEmailRegistration(chatId, name); // Pass name to email registration
    });
  }
};

// Signup Funaction
const startEmailRegistration = (chatId, name) => {
  bot.once('message', async (emailMsg) => {
    const email = emailMsg.text;
    if (isSigningUp) {

      if (!isValidEmail(email)) {
        bot.sendMessage(chatId, '❌ Invalid email address. Please enter a valid email.');
        startEmailRegistration(chatId, name); // Reset email registration process
        return; // Exit the function to prevent further execution
      }
    }
    if (isSigningUp) {

      bot.sendMessage(chatId, 'Awesome! Now, please create a password:');
      startPasswordRegistration(chatId, name, email); // Pass name and email to password registration
    }
  });
};

// Signup Funaction
const startPasswordRegistration = (chatId, name, email) => {
  bot.once('message', async (passwordMsg) => {
    const password = passwordMsg.text;
    if (isSigningUp) {

      if (!isValidPassword(password)) {
        bot.sendMessage(chatId, '❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.');
        startPasswordRegistration(chatId, name, email); // Reset password registration process
        return; // Exit the function to prevent further execution
      }
    }

    if (isSigningUp) {

      bot.sendMessage(chatId, 'Got it! Please confirm your password:');
      startConfirmPasswordRegistration(chatId, name, email, password); // Pass name, email, and password to confirm password registration
    }
  });
};

// Signup Funaction
const startConfirmPasswordRegistration = (chatId, name, email, password) => {
  bot.once('message', async (confirmPasswordMsg) => {
    const confirmPassword = confirmPasswordMsg.text;
    if (isSigningUp) {

      if (password !== confirmPassword) {
        bot.sendMessage(chatId, '❌ Passwords do not match. Please try again.');
        startPasswordRegistration(chatId, name, email); // Start from password registration
        return; // Exit the function to prevent further execution
      }
    }
    // Continue with registration process
    try {
      isSigningUp = true; // Set signup flag to true
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
        if (isSigningUp) {

          bot.sendMessage(chatId, `❌ Failed to register user. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while registering the user: ${error.message}`);
    } finally {
      isSigningUp = false; // Reset signup flag
    }
  });
};

// Otp Varification
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
        if (isSigningUp) {
          bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
          startOTPVerification(chatId, email); // Recall OTP verification process
        } else {
          bot.sendMessage(chatId, "you have to start a new session click /start")
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while verifying the user: ${error.message}`);
    }
  });
};

// Star Login
const startEmailLogin = (chatId) => {
  bot.sendMessage(chatId, '🔐 Please enter your email to log in:');

  bot.once('message', async (emailMsg) => {
    const email = emailMsg.text;
    if (isLoggingIn) {

      if (!isValidEmail(email)) {
        bot.sendMessage(chatId, '❌ Invalid email format. Please enter a valid email.');
        startEmailLogin(chatId); // Restart login process from email if email is invalid
        isLoggingIn = false; // Reset login flag
        return;
      }
    }

    if (isLoggingIn) {

      startPasswordLogin(chatId, email); // Proceed to password login
    }
  });
};

// star Login
const startPasswordLogin = (chatId, email) => {
  bot.sendMessage(chatId, '🔑 Please enter your password:');
  bot.once('message', async (passwordMsg) => {
    const password = passwordMsg.text;
    if (isLoggingIn) {

      if (!isValidPassword(password)) {
        bot.sendMessage(chatId, '❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.');
        startPasswordLogin(chatId, email); // Restart login process from password if password is invalid
        isLoggingIn = false; // Reset login flag
        return;
      }
    }
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        chatId,
      });
      if (response.data.status === true) {
        bot.sendMessage(chatId, `✅ Login successful!`);
        const userInfo = await getEmailAndWalletFromBackend(chatId);

        if (userInfo?.email) {
          const messageText = `Welcome to WaveBot! 🌊\n
🌊 WaveBot(https://wavebot.app/)\n
📖 Dashboard(https://dashboard.wavebot.app/)\n
🌐 Website(https://marketing-dashboard-d22655001f93.herokuapp.com/)
‧‧────────────────‧‧
*Your Email Address: ${userInfo?.email}\n
*Your Wallet Address (EVM): ${userInfo?.EVMwallet}\n
*Your Wallet Address (Solana): ${userInfo?.solanaWallets}`;
          bot.sendMessage(chatId, messageText, { reply_markup: JSON.stringify(buyKeyboard) });

        }
      } else {
        if (isLoggingIn) {

          bot.sendMessage(chatId, '❌ Invalid email or password. Please try again.');
          startEmailLogin(chatId); // Restart login process from email if credentials are invalid
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      bot.sendMessage(chatId, `❌ An error occurred while logging in: ${error.message}`);
    } finally {
      isLoggingIn = false; // Reset login flag
    }
  });
};

// Start Swap
const startSwapProcess = (chatId) => {
  bot.sendMessage(chatId, `🌟 Choose a blockchain 🌟

  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`, { reply_markup: JSON.stringify(blockchainKeyboard) });
  console.log("🚀 ~ bot.on ~ chatId:", chatId);

  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chainId = data;

    if (chainId == "solana") {
      bot.sendMessage(chatId, ' Type From Token:');
      bot.once('message', async (inputMsg) => {
        const input = inputMsg.text;
        console.log("🚀 ~ bot.once ~ input:", input)
        bot.sendMessage(chatId, ' Type To Token:');
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
                bot.sendMessage(chatId, `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`);
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

// select chainId
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

// Enter Amount
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


const buyToken = (chatId, chainId, token0, token1) => {
  bot.sendMessage(chatId, 'Please enter the amount to swap:');
  bot.once('message', async (amountInMsg) => {
    const amountIn = Number(amountInMsg.text);
    console.log("🚀 ~ bot.once ~ amountIn:", amountIn);
    try {
      const tokenRes = await axios.post(`${API_URL}/getEvmTokenPrice`, {
        token: token0,
        token2: token1,
        chain: chainId
      });
      const tokensPrice = tokenRes?.data?.finalRes
      const buyAmt = amountIn * tokensPrice?.token2
      const finalAmt = buyAmt / tokensPrice?.token1
      const response = await axios.post(`${API_URL}/mainswap`, {
        token0,
        token1,
        amountIn: finalAmt,
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

// get User Data
async function getEmailAndWalletFromBackend(chatId) {
  try {
    const finddata = await axios.post(`${API_URL}/getUserBotData`, { chatId });
    if (finddata?.data?.status) {
      const email = finddata?.data?.walletDetails?.email;
      const EVMwallet = finddata?.data?.walletDetails?.wallet;
      const solanaWallets = finddata?.data?.walletDetails?.solanawallet;
      return { email, EVMwallet, solanaWallets };
    } else {
      return finddata?.data?.message; // Sending an appropriate message if data is missing
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching data.'); // Sending an error message
  }
}

// Buy Token 
const buyStartTokenSelection = (chatId) => {
  bot.sendMessage(chatId, `Buy Token`, { reply_markup: JSON.stringify(buyblockchainKeyboard) });
  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chainId = data?.substring(0, data?.indexOf("/"));
    console.log("🚀 ~ bot.on ~ chainId:", chainId)
    buyTokensEvm(chatId, chainId)
  });
};

// Sell Token 
const sellStartTokenSelection = (chatId) => {
  bot.sendMessage(chatId, `Sell Token`, { reply_markup: JSON.stringify(sellblockchainKeyboard) });
  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chainId = data?.substring(0, data?.indexOf("/"));
    console.log("🚀 ~ bot.on ~ chainId:", chainId)
    buyTokensEvm(chatId, chainId)
  });
};

// Buy Token
const buyTokensEvm = (chatId, chainId) => {
  if (chainId == "solBuy") {
    bot.sendMessage(chatId, 'Enter a Token that you want to Buy:');
    bot.once('message', async (outputMsg) => {
      const output = outputMsg.text;
      console.log("🚀 ~ bot.once ~ output:", output)
      bot.sendMessage(chatId, ' Please enter the amount to swap:');
      bot.once('message', async (amountMsg) => {
        const amount = amountMsg.text;
        console.log("🚀 ~ bot.once ~ amount:", amount)
        try {
          const tokenRes = await axios.post(`${API_URL}/getSolanaTokenPrice`, {
            token: "So11111111111111111111111111111111111111112",
            token2: output,
          });
          const tokensPrice = tokenRes?.data?.finalRes
          const buyAmt = amount * tokensPrice?.to
          const finalAmt = buyAmt / tokensPrice?.sol
          console.log("🚀 ~ bot.once ~ finalAmt:", finalAmt)
          const response = await axios.post(`${API_URL}/solanaSwap`, {
            input: "So11111111111111111111111111111111111111112",
            output,
            amount: finalAmt,
            chatId,
            desBot: 9
          });
          if (response.data.status === true) {
            bot.sendMessage(chatId, `Solona Swap successful!`);
            bot.sendMessage(chatId, `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`);
          } else {
            bot.sendMessage(chatId, response.data.message || '❌ Swap failed. Please try again.');
          }
        } catch (error) {
          console.log("🚀 ~ bot.once ~ error:", error)
        }
        // 
      });
    });
  }
  else if (chainId != "solBuy" && chainId !== "solSell") {
    console.log("-------------- EVM--------------------")
    bot.sendMessage(chatId, 'Type To Token:');
    bot.once('message', async (token1Msg) => {
      const token1 = token1Msg.text;
      console.log("🚀 ~ bot.once ~ token1:", token1);
      buyToken(chatId, chainId, '0x912CE59144191C1204E64559FE8253a0e49E6548', token1); // Proceed to amount entry
    });

  } else if (chainId == "solSell") {
    console.log("--------------------- Sellllllllllllllllll ")
    bot.sendMessage(chatId, 'Enter a Token that you want to sell:');
    bot.once('message', async (inputMsg) => {
      const input = inputMsg.text;
      console.log("🚀 ~ bot.once ~ input:", input)
      bot.sendMessage(chatId, ' Please enter the amount to swap:');
      bot.once('message', async (amountMsg) => {
        const amount = amountMsg.text;
        console.log("🚀 ~ bot.once ~ amount:", amount)
        try {

          const response = await axios.post(`${API_URL}/solanaSwap`, {
            input,
            output: "So11111111111111111111111111111111111111112",
            amount,
            chatId,
          });
          if (response.data.status === true) {
            bot.sendMessage(chatId, `Solona Swap successful!`);
            bot.sendMessage(chatId, `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`);
          } else {
            bot.sendMessage(chatId, response.data.message || '❌ Swap failed. Please try again.');
          }
        } catch (error) {
          console.log("🚀 ~ bot.once ~ error:", error)
        }
        // 
      });
    });
  }

};


//Logout 
async function logoutfunaction(chatId) {
  console.log("🚀 ~ logoutfunaction ~ chatId:", chatId)
  try {
    const finddata = await axios.post(`${API_URL}/logoutBotUser`, { chatId });
    if (finddata?.data?.status) {
      console.log("🚀 ~ logoutfunaction ~ finddata:", finddata)
      bot.sendMessage(chatId, finddata?.data?.msg)
      //return finddata?.data?.data?.msg;
    } else {
      return "Network Error";
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching data.'); // Sending an error message
  }
}

//Send welcome Msg
function sendWelcomeMessage(chatId) {
  bot.sendMessage(chatId, `👋 Welcome to the Wavebot! 👋
  
  Thank you for joining us! To get started, simply press start Button. 
  Our bot is here to assist you with anything you need!🤖💬`, {
    reply_markup: {
      keyboard: [
        [{ text: 'SignUp', request_contact: false, request_location: false }],
        [{ text: 'Login', request_contact: false, request_location: false }],
        //[{ text: 'Start', request_contact: false, request_location: false }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}


// get User Data
async function getstartBot(chatId) {
  try {
    const finddata = await axios.post(`${API_URL}/startBot`, { chatId });
    if (finddata?.data?.status) {
      return finddata?.data?.message;
    } else {
      return finddata?.data?.message; // Sending an appropriate message if data is missing
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching data.'); // Sending an error message
  }
}


// Function to start the bot session
async function start(chatId) {
  const userInfo = await getEmailAndWalletFromBackend(chatId);

  if (userInfo?.email) {
    const messageText = `Welcome to WaveBot! 🌊\n
      🌊 WaveBot(https://wavebot.app/)\n
      📖 Dashboard(https://dashboard.wavebot.app/)\n
      🌐 Website(https://marketing-dashboard-d22655001f93.herokuapp.com/)
      ‧‧────────────────‧‧
      *Your Email Address: ${userInfo?.email}\n
      *Your Wallet Address (EVM): ${userInfo?.EVMwallet}\n
      *Your Wallet Address (Solana): ${userInfo?.solanaWallets}`;
    bot.sendMessage(chatId, messageText, { reply_markup: JSON.stringify(buyKeyboard) });
  } else {
    bot.sendMessage(chatId, userInfo);
  }
}


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  console.log("🚀 ~ bot.on ~ chatId:", chatId)
  const userId = msg.from.id;

  // Handle '/start' command
  if (msg.text === '/start') {
    isLoggingIn = false
    isSigningUp = false
    await sendWelcomeMessage(chatId);
  }
  // Handle 'SignUp' command
  else if (msg.text === 'SignUp') {
    isLoggingIn = false
    isSigningUp = true
    // Start the signup process only if not already in a login process
    if (!isLoggingIn) {
      await startNameRegistration(chatId);
    } else {
      bot.sendMessage(chatId, 'you have to start a new session to switch.');
    }
  }
  // Handle 'Login' command
  else if (msg.text === 'Login') {
    isLoggingIn = true
    isSigningUp = false
    // Start the login process only if not already in a signup process
    if (!isSigningUp) {
      await startEmailLogin(chatId);
    } else {
      bot.sendMessage(chatId, 'Please complete your current signup process before starting a login.');
    }
  }
  // Handle 'Start' command
  else if (msg.text === 'Start') {
    // Start the bot session
    await start(chatId);
  }
  // Handle other messages
  else {
    bot.sendMessage(chatId, `You typed: ${msg.text}`);
  }
});

// Function to fetch Solana balance 
async function fetchSolanaBalance(chatId) {
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

// Function to fetch token balances
async function fetchTokenBalances(chatId) {
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


bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  switch (data) {

    case 'menuButton':
      bot.sendMessage(chatId, 'Click Menu Button');
      break;

    case 'SwaptokenButton':
      startSwapProcess(chatId);
      break;

    case 'SolonabalanceButton':
      fetchSolanaBalance(chatId);
      break;

    case 'balanceButton':
      fetchTokenBalances(chatId);
      break;

    case 'logoutButton':
      logoutfunaction(chatId);
      break;

    case 'buyButton':
      buyStartTokenSelection(chatId)
      break;

    case 'sellButton':
      sellStartTokenSelection(chatId)
      break;

    default:
      console.log(`Unknown button clicked: ${data}`);
  }
});





app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log('Bot started!');

