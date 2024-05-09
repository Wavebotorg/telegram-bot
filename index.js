const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3333;
const TOKEN = process.env.TOKEN; // Telegram Token
const API_URL = process.env.BACKEND_URL; // Backend URL

const bot = new TelegramBot(TOKEN, { polling: true });
let isloginKeyboard = false;
let isSigningUp = false; // Flag to track signup process
let isLoggingIn = false; // Flag to track login process
let isSwap = false

// ------------------------------ buy-----------------------------

let isSolBuy = false;
let is1Buy = false
let is42161Buy = false
let is10Buy = false
let is137Buy = false
let is8453Buy = false
let is56Buy = false
let is43114Buy = false
let is42220Buy = false
let is238Buy = false

// -------------------------------------- sell -----------------------------------

let isSolSell = false;
let is1Sell = false
let is42161Sell = false
let is10Sell = false
let is137Sell = false
let is8453Sell = false
let is56Sell = false
let is43114Sell = false
let is42220Sell = false
let is238Sell = false

// --------------------------------------- swap --------------------------------------
let isSolana = false
let is1 = false
let is42161 = false
let is10 = false
let is137 = false
let is8453 = false
let is56 = false
let is43114 = false
let is42220 = false
let is238 = false

const buyKeyboard = {
  inline_keyboard: [
    [
      { text: "Buy", callback_data: "buyButton" },
      { text: "Sell", callback_data: "sellButton" },
    ],
    [
      { text: "Position", callback_data: "positionButton" },
      { text: "Limit Orders", callback_data: "limitButton" },
      { text: "DCA Orders", callback_data: "dcaOrdersButton" },
    ],
    [
      { text: "SwapToken", callback_data: "SwaptokenButton" },
      { text: "🗓Menu", callback_data: "menuButton" },
    ],
    [
      { text: "💼Balance EVM", callback_data: "balanceButton" },
      { text: "💼Balance Solona", callback_data: "SolonabalanceButton" },
    ],
    [
      { text: "🔄Refresh", callback_data: "refreshButton" },
      { text: "👈Back", callback_data: "backButton" },
      { text: "Logout", callback_data: "logoutButton" },
    ],
  ],
};

const blockchainKeyboard = {
  inline_keyboard: [
    [{ text: "Solona", callback_data: "solana" }],
    [
      { text: "Ethereum", callback_data: "1" },
      { text: "Arbitrum", callback_data: "42161" },
      { text: "Optimism", callback_data: "10" },
    ],
    [
      { text: "Polygon", callback_data: "137" },
      { text: "Base", callback_data: "8453" },
      { text: "BNB Chain", callback_data: "56" },
    ],
    [
      { text: "Avalanche", callback_data: "43114" },
      { text: "Celo", callback_data: "42220" },
      { text: "Blast", callback_data: "238" },
    ],
  ],
};

const buyblockchainKeyboard = {
  inline_keyboard: [
    [{ text: "Solona", callback_data: "solBuy" }],
    [
      { text: "Ethereum", callback_data: "1buy" },
      { text: "Arbitrum", callback_data: "42161buy" },
      { text: "Optimism", callback_data: "10buy" },
    ],
    [
      { text: "Polygon", callback_data: "137buy" },
      { text: "Base", callback_data: "8453buy" },
      { text: "BNB Chain", callback_data: "56buy" },
    ],
    [
      { text: "Avalanche", callback_data: "43114buy" },
      { text: "Celo", callback_data: "42220buy" },
      { text: "Blast", callback_data: "238buy" },
    ],
  ],
};

const sellblockchainKeyboard = {
  inline_keyboard: [
    [{ text: "Solona", callback_data: "solSell" }],
    [
      { text: "Ethereum", callback_data: "1sell" },
      { text: "Arbitrum", callback_data: "42161sell" },
      { text: "Optimism", callback_data: "10sell" },
    ],
    [
      { text: "Polygon", callback_data: "137sell" },
      { text: "Base", callback_data: "8453sell" },
      { text: "BNB Chain", callback_data: "56sell" },
    ],
    [
      { text: "Avalanche", callback_data: "43114sell" },
      { text: "Celo", callback_data: "42220sell" },
      { text: "Blast", callback_data: "238sell" },
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
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Signup Funaction
const startNameRegistration = (chatId) => {
  bot.sendMessage(chatId, "👋 Welcome! Please provide your name:");
  if (isSigningUp) {
    bot.once("message", async (nameMsg) => {
      const name = nameMsg.text;
      if (isSigningUp) {
        bot.sendMessage(
          chatId,
          `Great, thanks ${name}! Next, please provide your email address:`
        );
      }
      if (isSigningUp) {
        startEmailRegistration(chatId, name); // Pass name to email registration
      }
    });
  }
};

// Signup Funaction
const startEmailRegistration = (chatId, name) => {
  bot.once("message", async (emailMsg) => {
    const email = emailMsg.text;
    if (isSigningUp) {
      if (!isValidEmail(email)) {
        if (isSigningUp) {
          bot.sendMessage(
            chatId,
            "❌ Invalid email address. Please enter a valid email."
          );
        }
        if (isSigningUp) {
          startEmailRegistration(chatId, name); // Reset email registration process
        }
      }
    }
    if (isSigningUp) {
      bot.sendMessage(chatId, "Awesome! Now, please create a password:");
    }
    if (isSigningUp) {
      startPasswordRegistration(chatId, name, email); // Pass name and email to password registration
    }
  });
};

// Signup Funaction
const startPasswordRegistration = (chatId, name, email) => {
  bot.once("message", async (passwordMsg) => {
    const password = passwordMsg.text;
    if (isSigningUp) {
      if (!isValidPassword(password)) {
        bot.sendMessage(
          chatId,
          "❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
        );
        if (isSigningUp) {
          startPasswordRegistration(chatId, name, email); // Reset password registration process
        }
      }
    }

    if (isSigningUp) {
      bot.sendMessage(chatId, "Got it! Please confirm your password:");
    }
    if (isSigningUp) {
      startConfirmPasswordRegistration(chatId, name, email, password); // Pass name, email, and password to confirm password registration
    }
  });
};

// Signup Funaction
const startConfirmPasswordRegistration = (chatId, name, email, password) => {
  bot.once("message", async (confirmPasswordMsg) => {
    const confirmPassword = confirmPasswordMsg.text;
    if (isSigningUp) {
      if (password !== confirmPassword) {
        bot.sendMessage(chatId, "❌ Passwords do not match. Please try again.");
        if (isSigningUp) {
          startPasswordRegistration(chatId, name, email); // Start from password registration
        }
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
        chatId,
      });
      const { message, data } = response.data;
      if (data && data.email) {
        await bot.sendMessage(
          chatId,
          `🎉 User registered successfully. Email: ${data.email}`
        );
        bot.sendMessage(
          chatId,
          "📧 Please check your email for a verification code:"
        );
        startOTPVerification(chatId, email); // Start OTP verification process
      } else {
        bot.sendMessage(
          chatId,
          `❌ Failed to register user. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
      bot.sendMessage(
        chatId,
        `❌ An error occurred while registering the user: ${error.message}`
      );
    } finally {
      isSigningUp = false; // Reset signup flag
    }
  });
};

// Otp Varification
const startOTPVerification = (chatId, email) => {
  console.log("------------------------------------");
  bot.once("message", async (otpMsg) => {
    const otp = otpMsg.text;
    try {
      const response = await axios.post(`${API_URL}/verify`, {
        email,
        otp,
        chatId,
      });
      if (response.data.status == true) {
        await bot.sendMessage(chatId, `✅ User verified successfully`);
        await start(chatId);
      } else {
        bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
        startOTPVerification(chatId, email); // Recall OTP verification process
      }
    } catch (error) {
      console.error("Error:", error.message);
      bot.sendMessage(
        chatId,
        `❌ An error occurred while verifying the user: ${error.message}`
      );
    }
  });
};

// Star Login
const startEmailLogin = (chatId) => {
  bot.sendMessage(chatId, "🔐 Please enter your email to log in:");

  if (isLoggingIn) {
    bot.once("message", async (emailMsg) => {
      const email = emailMsg.text;
      if (isLoggingIn) {
        if (!isValidEmail(email)) {
          bot.sendMessage(
            chatId,
            "❌ Invalid email format. Please enter a valid email."
          );
          if (isLoggingIn) {
            startEmailLogin(chatId); // Restart login process from email if email is invalid
          }
          return;
        }
      }

      if (isLoggingIn) {
        startPasswordLogin(chatId, email); // Proceed to password login
      }
    });
  }
};

// star Login
const startPasswordLogin = (chatId, email) => {
  bot.sendMessage(chatId, "🔑 Please enter your password:");
  if (isLoggingIn) {
    bot.once("message", async (passwordMsg) => {
      const password = passwordMsg.text;
      if (isLoggingIn) {
        if (!isValidPassword(password)) {
          bot.sendMessage(
            chatId,
            "❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
          );
          if (isLoggingIn) {
            startPasswordLogin(chatId, email); // Restart login process from password if password is invalid
          }
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
            bot.sendMessage(chatId, messageText, {
              reply_markup: JSON.stringify(buyKeyboard),
            });
          }
          await sendWelcomeMessage2(chatId)
        } else {
          if (isLoggingIn) {
            bot.sendMessage(
              chatId,
              "❌ Invalid email or password. Please try again."
            );
            startEmailLogin(chatId); // Restart login process from email if credentials are invalid
          }
        }
      } catch (error) {
        console.error("Error:", error.message);
        bot.sendMessage(
          chatId,
          `❌ An error occurred while logging in: ${error.message}`
        );
      } finally {
        isLoggingIn = false; // Reset login flag
      }
    });
  }
};

// Start Swap
const startSwapProcess = (chatId) => {
  bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟

  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    { reply_markup: JSON.stringify(blockchainKeyboard) }
  );
};

// select chainId
const startTokenSelection = (chatId, chainId) => {
  bot.sendMessage(chatId, "Type From Token:");
  bot.once("message", async (token0Msg) => {
    const token0 = token0Msg.text;
    console.log("🚀 ~ bot.once ~ token0:", token0);
    bot.sendMessage(chatId, "Type To Token:");
    bot.once("message", async (token1Msg) => {
      const token1 = token1Msg.text;
      console.log("🚀 ~ bot.once ~ token1:", token1);
      startAmountEntry(chatId, chainId, token0, token1); // Proceed to amount entry
    });
  });
};

// Enter Amount
const startAmountEntry = async (chatId, chainId, token0, token1, amountIn) => {
  try {
    const response = await axios.post(`${API_URL}/mainswap`, {
      token0,
      token1,
      amountIn,
      chainId,
      chatId,
    });
    if (response.data.status === true) {
      bot.sendMessage(
        chatId,
        `Swap successful Your Hash is ${response.data.data}`
      );
    } else {
      bot.sendMessage(
        chatId,
        response.data.message || "❌ Swap failed. Please try again."
      );
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
  }
};

const buyToken = async (chatId, chainId, token0, token1, amountIn) => {
  try {
    const tokenRes = await axios.post(`${API_URL}/getEvmTokenPrice`, {
      token: token0,
      token2: token1,
      chain: chainId,
    });
    const tokensPrice = tokenRes?.data?.finalRes;
    const buyAmt = amountIn * tokensPrice?.token2;
    const finalAmt = buyAmt / tokensPrice?.token1;
    const response = await axios.post(`${API_URL}/mainswap`, {
      token0,
      token1,
      amountIn: finalAmt,
      chainId,
      chatId,
    });
    if (response.data.status === true) {
      bot.sendMessage(
        chatId,
        `Swap successful Your Hash is ${response.data.data}`
      );
    } else {
      bot.sendMessage(
        chatId,
        response.data.message || "❌ Swap failed. Please try again."
      );
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
  }

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
    console.error("Error fetching data:", error);
    bot.sendMessage(chatId, "An error occurred while fetching data."); // Sending an error message
  }
}

// Buy Token
const buyStartTokenSelection = (chatId) => {
  bot.sendMessage(chatId, `Buy Token`, {
    reply_markup: JSON.stringify(buyblockchainKeyboard),
  });
};

// Sell Token
const sellStartTokenSelection = (chatId) => {
  bot.sendMessage(chatId, `Sell Token`, {
    reply_markup: JSON.stringify(sellblockchainKeyboard),
  });
};


//Logout
async function logoutfunaction(chatId) {
  console.log("🚀 ~ logoutfunaction ~ chatId:", chatId);
  try {
    const finddata = await axios.post(`${API_URL}/logoutBotUser`, { chatId });
    if (finddata?.data?.status) {
      return chatId, finddata?.data?.status;
    } else {
      return "Network Error";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    bot.sendMessage(chatId, "An error occurred while fetching data."); // Sending an error message
  }
}

//Send welcome Msg
async function sendWelcomeMessage(chatId) {
  const isUser = await getstartBot(chatId);
  const keyboard = isUser
    ? [[{ text: "Start", request_contact: false, request_location: false }]]
    : [
      [{ text: "SignUp", request_contact: false, request_location: false }],
      [{ text: "Login", request_contact: false, request_location: false }],
    ];
  bot.sendMessage(
    chatId,
    `👋 Welcome to the Wavebot! 👋
  
  Thank you for joining us! To get started, simply press start Button. 
  Our bot is here to assist you with anything you need!🤖💬`,
    {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}
//Send welcome Msg
async function sendWelcomeMessage2(chatId) {
  const keyboard =
    [[{ text: "Start", request_contact: false, request_location: false }]]

  bot.sendMessage(
    chatId,
    `👋 Welcome to the Wavebot!👋`,
    {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// Function to start the bot session
async function loginLogOutButton(chatId) {
  const keyboard =
    [
      [{ text: "SignUp", request_contact: false, request_location: false }],
      [{ text: "Login", request_contact: false, request_location: false }],
    ];
  bot.sendMessage(
    chatId,
    `👋please login!!👋`,
    {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// get User Data
async function getstartBot(chatId) {
  console.log("🚀 ~ getstartBot ~ chatId:", chatId);
  try {
    const finddata = await axios.post(`${API_URL}/startBot`, { chatId });
    if (finddata?.data?.status) {
      return finddata?.data?.status;
    } else {
      return finddata?.data?.status; // Sending an appropriate message if data is missing
    }
  } catch (error) {
    console.error("Error fetching data:", error);
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
    bot.sendMessage(chatId, messageText, {
      reply_markup: JSON.stringify(buyKeyboard),
    });
  } else {
    await loginLogOutButton(chatId);
  }
}


bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  console.log("🚀 ~ bot.on ~ chatId:", chatId);
  const userId = msg.from.id;

  // Handle '/start' command
  if (msg.text === "/start") {
    isLoggingIn = false;
    isSigningUp = false;
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      await sendWelcomeMessage(chatId);
    } else {
      await start(chatId);
      await sendWelcomeMessage2(chatId)
    }
  }
  // Handle 'SignUp' command
  else if (msg.text === "SignUp") {
    isLoggingIn = false;
    isSigningUp = true;
    // Start the signup process only if not already in a login process
    await startNameRegistration(chatId);
  }
  // Handle 'Login' command
  else if (msg.text === "Login") {
    isLoggingIn = true;
    isSigningUp = false;
    // Start the login process only if not already in a signup process
    await startEmailLogin(chatId);
  }
  // Handle 'Start' command
  else if (msg.text === "Start") {
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
      chatId: chatId,
    });
    const balances = response?.data?.data;
    let message = "Your Solana Wallet balances:\n\n";

    if (balances && balances.length > 0) {
      balances?.slice(0, 4)?.forEach((balance) => {
        message += `Token Name: ${balance.name}\n`;
        message += `Balance: ${balance.amount}\n\n`;
      });
      message += `For More info (https://solscan.io/account/${response?.data?.walletAddress})\n\n`;
      message += "Thank you for using our service! ✌️";
    } else {
      message = "No balances found.";
    }
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching balance:", error);
    bot.sendMessage(chatId, "An error occurred while fetching your balance.");
  }
}

// Function to fetch token balances
async function fetchTokenBalances(chatId) {
  try {
    const response = await axios.post(`${API_URL}/fetchbalance`, {
      chatId: chatId,
    });
    const balances = response.data;
    console.log("🚀 ~ bot.on ~ balances:", balances);
    let message = "Your token balances:\n\n";
    balances?.slice(0, 4)?.forEach((balance) => {
      message += `Token Name: ${balance.name}\n`;
      message += `Balance: ${balance.balance}\n\n`;
    });
    message += "Thank you for using our service! ✌️";
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching balance:", error);
    bot.sendMessage(chatId, "An error occurred while fetching your balance.");
  }
}

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  console.log("🚀 ~ bot.on ~ data: meet", data)

  switch (data) {
    case "menuButton":
      bot.sendMessage(chatId, "Click Menu Button");
      break;

    case "SwaptokenButton":
      startSwapProcess(chatId);
      break;

    case "SolonabalanceButton":
      fetchSolanaBalance(chatId);
      break;

    case "balanceButton":
      fetchTokenBalances(chatId);
      break;

    case "logoutButton":
      await logoutfunaction(chatId).then(async (res) => {
        bot.sendMessage(chatId, "logout successfull!", {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "SignUp",
                  request_contact: false,
                  request_location: false,
                },
              ],
              [
                {
                  text: "Login",
                  request_contact: false,
                  request_location: false,
                },
              ],
              //[{ text: 'Start', request_contact: false, request_location: false }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      });
      break;

    case "buyButton":
      isSwap = false
      buyStartTokenSelection(chatId);
      break;

    case "sellButton":
      isSwap = false
      sellStartTokenSelection(chatId);
      break;
    // -------------------------------------------------- buy ------------------------------------------------------

    case "solBuy":
      isSolBuy = true;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      bot.sendMessage(chatId, "Enter solBuy a Token that you want to Buy:");
      if (isSolBuy) {
        bot.once("message", async (outputMsg) => {
          const output = outputMsg.text;
          console.log("🚀 ~ bot.once ~ output:", output);
          if (isSolBuy) {
            bot.sendMessage(chatId, " Please enter the solBuy amount to Buy:");
          }
          if (isSolBuy) {
            bot.once("message", async (amountMsg) => {
              const amount = amountMsg.text;
              console.log("🚀 ~ bot.once ~ amount:", amount);
              if (isSolBuy) {
                try {
                  const tokenRes = await axios.post(`${API_URL}/getSolanaTokenPrice`, {
                    token: "So11111111111111111111111111111111111111112",
                    token2: output,
                  });
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amount * tokensPrice?.to;
                  const finalAmt = buyAmt / tokensPrice?.sol;
                  console.log("🚀 ~ bot.once ~ finalAmt:", finalAmt);
                  const response = await axios.post(`${API_URL}/solanaSwap`, {
                    input: "So11111111111111111111111111111111111111112",
                    output,
                    amount: finalAmt,
                    chatId,
                    desBot: 9,
                  });
                  if (response.data.status === true) {
                    bot.sendMessage(chatId, `Solona Swap successful!`);
                    bot.sendMessage(
                      chatId,
                      `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                    );
                  } else {
                    bot.sendMessage(
                      chatId,
                      response.data.message || "❌ Swap failed. Please try again."
                    );
                  }
                } catch (error) {
                  console.log("🚀 ~ bot.once ~ error:", error);
                }
              }
              //
            });
          }
        });

      }
      break;

    case "42161buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = true
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      console.log("-------------- EVM--------------------");
      bot.sendMessage(chatId, "Enter a ARB token that you want to buy from :");
      if (is42161Buy) {
        bot.once("message", async (token1Msg) => {
          const token1 = token1Msg.text;
          console.log("🚀 ~ bot.once ~ token1:", token1);
          if (is42161Buy) {
            bot.sendMessage(chatId, "Please enter the ARB amount that you want to buy:");
          }
          if (is42161Buy) {
            bot.once("message", async (amountInMsg) => {
              const amountIn = Number(amountInMsg.text);
              if (is42161Buy) {
                buyToken(
                  chatId,
                  42161,
                  "0x912CE59144191C1204E64559FE8253a0e49E6548",
                  token1,
                  amountIn
                );
              }
            })
          }
        });
      }
      break;

    case "1buy":
      isSolBuy = false;
      is1Buy = true
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      if (is1Buy) {
        bot.sendMessage(chatId, "Ethereum is comming soon....")
      }
      break;

    case "10buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = true
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      if (is10Buy) {
        bot.sendMessage(chatId, "Optimism Ethereum is comming soon....")
      }
      break;

    case "137buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = true
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      if (is137Buy) {
        bot.sendMessage(chatId, "Polygon Ethereum is comming soon....")
      }
      break;
    case "8453buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = true
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      if (is8453Buy) {
        bot.sendMessage(chatId, "Base Ethereum is comming soon....")
      }
      break;
    case "56buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = true
      is43114Buy = false
      is42220Buy = false
      is238Buy = false
      if (is56Buy) {
        bot.sendMessage(chatId, "BNB Chain Ethereum is comming soon....")
      }
      break;
    case "43114buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = true
      is42220Buy = false
      is238Buy = false
      if (is43114Buy) {
        bot.sendMessage(chatId, "AvakancheEthereum is comming soon....")
      }
      break;
    case "42220buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = true
      is238Buy = false
      if (is42220Buy) {
        bot.sendMessage(chatId, "Celo Ethereum is comming soon....")
      }
      break;
    case "238buy":
      isSolBuy = false;
      is1Buy = false
      is42161Buy = false
      is10Buy = false
      is137Buy = false
      is8453Buy = false
      is56Buy = false
      is43114Buy = false
      is42220Buy = false
      is238Buy = true
      if (is238Buy) {
        bot.sendMessage(chatId, "Blast Ethereum is comming soon....")
      }
      break;

    // ------------------------------------------------ sell -----------------------------------------------------------

    case "solSell":
      isSolSell = true
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      console.log("--------------------- Sellllllllllllllllll ");
      bot.sendMessage(chatId, "solSell Enter a Token that you want to sell:");
      if (isSolSell) {

        bot.once("message", async (inputMsg) => {
          const input = inputMsg.text;
          console.log("🚀 ~ bot.once ~ input:", input);
          if (isSolSell) {

            bot.sendMessage(chatId, "Please enter the solSell amount to Buy:");
          }
          if (isSolSell) {
            bot.once("message", async (amountMsg) => {
              const amount = amountMsg.text;
              console.log("🚀 ~ bot.once ~ amount:", amount);
              if (isSolSell) {
                try {
                  const response = await axios.post(`${API_URL}/solanaSwap`, {
                    input,
                    output: "So11111111111111111111111111111111111111112",
                    amount,
                    chatId,
                  });
                  if (response.data.status === true) {
                    bot.sendMessage(chatId, `Solona Swap successful!`);
                    bot.sendMessage(
                      chatId,
                      `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                    );
                  } else {
                    bot.sendMessage(
                      chatId,
                      response.data.message || "❌ Swap failed. Please try again."
                    );
                  }
                } catch (error) {
                  console.log("🚀 ~ bot.once ~ error:", error);
                }
              }              //
            });
          }
        });
      }
      break;

    case "1sell":
      isSolSell = false
      is1Sell = true
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is1Sell) {
        bot.sendMessage(chatId, "Ethereum is comming soon!!")
      }
      break;
    case "42161sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = true
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is42161Sell) {
        bot.sendMessage(chatId, "Arbitrum is comming soon!!")
      }
      break;
    case "10sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = true
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is10Sell) {
        bot.sendMessage(chatId, "Optimism is comming soon!!")
      }
      break;
    case "137sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = true
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is137Sell) {
        bot.sendMessage(chatId, "Polygon is comming soon!!")
      }
      break;
    case "8453sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = true
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is8453Sell) {
        bot.sendMessage(chatId, "Base is comming soon!!")
      }
      break;
    case "56sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = true
      is43114Sell = false
      is42220Sell = false
      is238Sell = false
      if (is56Sell) {
        bot.sendMessage(chatId, "BNB Chain is comming soon!!")
      }
      break;
    case "43114sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = true
      is42220Sell = false
      is238Sell = false
      if (is43114Sell) {
        bot.sendMessage(chatId, "Avalanche is comming soon!!")
      }
      break;
    case "42220sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = true
      is238Sell = false
      if (is42220Sell) {
        bot.sendMessage(chatId, "Celo is comming soon!!")
      }
      break;
    case "238sell":
      isSolSell = false
      is1Sell = false
      is42161Sell = false
      is10Sell = false
      is137Sell = false
      is8453Sell = false
      is56Sell = false
      is43114Sell = false
      is42220Sell = false
      is238Sell = true
      if (is238Sell) {
        bot.sendMessage(chatId, "Blast is comming soon!!")
      }
      break;


    // ---------------------------------------------------------------- swap--------------------------------------------------------

    case "solana":
      isSolana = true
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false

      bot.sendMessage(chatId, " Type From Token:");
      if (isSolana) {
        bot.once("message", async (inputMsg) => {
          const input = inputMsg.text;
          console.log("🚀 ~ bot.once ~ input:", input);
          if (isSolana) {
            bot.sendMessage(chatId, " Type To Token:");
          }
          if (isSolana) {
            bot.once("message", async (outputMsg) => {
              const output = outputMsg.text;
              console.log("🚀 ~ bot.once ~ output:", output);
              if (isSolana) {

                bot.sendMessage(chatId, " Please enter the amount to swap:");
              }
              if (isSolana) {
                bot.once("message", async (amountMsg) => {
                  const amount = Number(amountMsg.text);
                  console.log("🚀 ~ bot.once ~ amount:", amount);
                  if (isSolana) {
                    try {
                      const response = await axios.post(`${API_URL}/solanaSwap`, {
                        input,
                        output,
                        amount,
                        chatId,
                      });
                      if (response.data.status === true) {
                        bot.sendMessage(chatId, `Solona Swap successful!`);
                        bot.sendMessage(
                          chatId,
                          `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                        );
                      } else {
                        bot.sendMessage(
                          chatId,
                          response.data.message || "❌ Swap failed. Please try again."
                        );
                      }
                    } catch (error) {
                      bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
                    }
                  }
                });
              }
            });
          }
        });
      }

      break;

    case "1":
      isSolana = false
      is1 = true
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false
      if (is1) {
        bot.sendMessage(chatId, "Ethereum is comming soon!!")
      }
      break
    case "42161":
      isSolana = false
      is1 = false
      is42161 = true
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false
      bot.sendMessage(chatId, "Type From Token:");
      if (is42161) {
        bot.once("message", async (token0Msg) => {
          const token0 = token0Msg.text;
          console.log("🚀 ~ bot.once ~ token0:", token0);
          if (is42161) {
            bot.sendMessage(chatId, "Type To Token:");
          }
          if (is42161) {
            bot.once("message", async (token1Msg) => {
              const token1 = token1Msg.text;
              console.log("🚀 ~ bot.once ~ token1:", token1);
              if (is42161) {
                bot.sendMessage(chatId, "Please enter the amount to swap:");
              }
              if (is42161) {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  console.log("🚀 ~ bot.once ~ amountIn:", amountIn);
                  if (is42161) {
                    startAmountEntry(chatId, 42161, token0, token1, amountIn);
                  }
                });
              }
            });
          }
        });
      }
      break;

    case "10":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = true
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false
      if (is10) {
        bot.sendMessage(chatId, "Optimism is comming soon...")
      }
      break;

    case "137":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = true
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false
      if (is137) {
        bot.sendMessage(chatId, "Polygon is comming soon!!")
      }
      break;

    case "8453":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = true
      is56 = false
      is43114 = false
      is42220 = false
      is238 = false
      if (is8453) {
        bot.sendMessage(chatId, "Base is comming soon!!")
      }
      break;

    case "56":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = true
      is43114 = false
      is42220 = false
      is238 = false
      if (is56) {
        bot.sendMessage(chatId, "BNB chain is comming soon !!")
      }
      break;

    case "43114":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = true
      is42220 = false
      is238 = false
      if (is43114) {
        bot.sendMessage(chatId, "Avalanche is comming soon")
      }
      break;

    case "42220":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = true
      is238 = false
      if (is42220) {
        bot.sendMessage(chatId, "Celo is comming soon")
      }
      break;

    case "238":
      isSolana = false
      is1 = false
      is42161 = false
      is10 = false
      is137 = false
      is8453 = false
      is56 = false
      is43114 = false
      is42220 = false
      is238 = true
      if (is238) {
        bot.sendMessage(chatId, "Blast is comming soon")
      }
      break;


    default:
      console.log(`Unknown button clicked meet: ${data}`);
  }
});

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log("Bot started!");

