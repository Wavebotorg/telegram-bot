const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { default: axios } = require("axios");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3333;
const TOKEN = process.env.TOKEN; // Telegram Token
const API_URL = process.env.BACKEND_URL; // Backend URL

const bot = new TelegramBot(TOKEN, { polling: true });

// ================================ main flag ===========================================
let flag = null;

let isSigningUp = false;
let isLoggingIn = false;

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
const startNameRegistration = async (chatId) => {
  await bot.sendMessage(chatId, "👋 Welcome! Please provide your name:");
  if (isSigningUp) {
    bot.once("message", async (nameMsg) => {
      const name = nameMsg.text;
      if (isSigningUp) {
        await bot.sendMessage(
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
          await bot.sendMessage(
            chatId,
            "❌ Invalid email address. Please enter a valid email."
          );
          await bot.sendMessage(chatId, "Please renter a valid email.");
          return startEmailRegistration(chatId, name);
        }
      }
    }
    if (isSigningUp) {
      await bot.sendMessage(chatId, "Awesome! Now, please create a password:");
    }
    if (isSigningUp) {
      await startPasswordRegistration(chatId, name, email); // Pass name and email to password registration
    }
  });
};

// Signup Funaction
const startPasswordRegistration = (chatId, name, email) => {
  bot.once("message", async (passwordMsg) => {
    const password = passwordMsg.text;
    if (isSigningUp) {
      if (!isValidPassword(password)) {
        if (isSigningUp) {
          await bot.sendMessage(
            chatId,
            "❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
          );
        }
        if (isSigningUp) {
          startPasswordRegistration(chatId, name, email); // Reset password registration process
        }
      }
    }

    if (isSigningUp) {
      await bot.sendMessage(chatId, "Got it! Please confirm your password:");
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
        await bot.sendMessage(
          chatId,
          "❌ Passwords do not match. Please try again."
        );
        // if (isSigningUp) {
        //   startPasswordRegistration(chatId, name, email); // Start from password registration
        // }
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
        await await bot.sendMessage(
          chatId,
          `🎉 User registered successfully. Email: ${data.email}`
        );
        await bot.sendMessage(
          chatId,
          "📧 Please check your email for a verification code:"
        );
        startOTPVerification(chatId, email); // Start OTP verification process
      } else {
        await bot.sendMessage(
          chatId,
          `❌ Failed to register user. Please try again.`
        );
        isSigningUp = false;
        await bot.sendMessage(chatId, `👋please register again carefully!!👋`, {
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
      await bot.sendMessage(
        chatId,
        `❌ An error occurred while registering the user: ${error.message}`
      );
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
        await await bot.sendMessage(chatId, `✅ User verified successfully`);
        await start(chatId);
        await sendWelcomeMessage2(chatId);
        isSigningUp = false;
      } else {
        await bot.sendMessage(
          chatId,
          `❌ Invalid OTP. Please enter a valid OTP.`
        );
        await bot.sendMessage(chatId, `Please enter a valid OTP.`);
        startOTPVerification(chatId, email); // Recall OTP verification process
      }
    } catch (error) {
      console.error("Error:", error.message);
      await bot.sendMessage(
        chatId,
        `❌ An error occurred while verifying the user: ${error.message}`
      );
    }
  });
};

// Star Login
const startEmailLogin = async (chatId) => {
  await bot.sendMessage(chatId, "🔐 Please enter your email to log in:");

  if (isLoggingIn) {
    bot.once("message", async (emailMsg) => {
      const email = emailMsg.text;
      if (isLoggingIn) {
        startPasswordLogin(chatId, email); // Proceed to password login
      }
    });
  }
};

// star Login
const startPasswordLogin = async (chatId, email) => {
  await bot.sendMessage(chatId, "🔑 Please enter your password:");
  if (isLoggingIn) {
    bot.once("message", async (passwordMsg) => {
      const password = passwordMsg.text;
      if (isLoggingIn) {
        try {
          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
            chatId,
          });
          if (response.data.status === true) {
            await bot.sendMessage(chatId, `✅ Login successfull!`);
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
              await bot.sendMessage(chatId, messageText, {
                reply_markup: JSON.stringify(buyKeyboard),
              });
            }
            await sendWelcomeMessage2(chatId);
            isLoggingIn = false;
          } else {
            await bot.sendMessage(
              chatId,
              "❌ Invalid email or password. Please try again."
            );
            await startEmailLogin(chatId); // Restart login process from email if credentials are invalid
          }
        } catch (error) {
          console.error("Error:", error.message);
          await bot.sendMessage(
            chatId,
            `❌ An error occurred while logging in: ${error.message}`
          );
        }
      }
    });
  }
};

// Start Swap
const startSwapProcess = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟

  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    { reply_markup: JSON.stringify(blockchainKeyboard) }
  );
};

// select chainId
const startTokenSelection = async (chatId, chainId) => {
  await bot.sendMessage(chatId, "Type From Token:");
  bot.once("message", async (token0Msg) => {
    const token0 = token0Msg.text;
    await bot.sendMessage(chatId, "Type To Token:");
    bot.once("message", async (token1Msg) => {
      const token1 = token1Msg.text;
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
      await bot.sendMessage(
        chatId,
        `Transaction successful Your Hash is ${response.data.data}`
      );
    } else {
      await bot.sendMessage(
        chatId,
        response.data.message || "❌ Swap failed. Please try again."
      );
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
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
      await bot.sendMessage(
        chatId,
        `Swap successful Your Hash is ${response.data.data}`
      );
    } else {
      await bot.sendMessage(
        chatId,
        response.data.message || "❌ Swap failed. Please try again."
      );
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ An error occurred: ${error.message}`); // Provide more specific error message if possible
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
    await bot.sendMessage(chatId, "An error occurred while fetching data."); // Sending an error message
  }
}

// Buy Token
const buyStartTokenSelection = async (chatId) => {
  await bot.sendMessage(chatId, `Buy Token`, {
    reply_markup: JSON.stringify(buyblockchainKeyboard),
  });
};

// Sell Token
const sellStartTokenSelection = async (chatId) => {
  await bot.sendMessage(chatId, `Sell Token`, {
    reply_markup: JSON.stringify(sellblockchainKeyboard),
  });
};

//Logout
async function logoutfunaction(chatId) {
  try {
    const finddata = await axios.post(`${API_URL}/logoutBotUser`, { chatId });
    if (finddata?.data?.status) {
      return chatId, finddata?.data?.status;
    } else {
      return "Network Error";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    await bot.sendMessage(chatId, "An error occurred while fetching data."); // Sending an error message
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
  await bot.sendMessage(
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
  const keyboard = [
    [{ text: "Start", request_contact: false, request_location: false }],
  ];

  await bot.sendMessage(chatId, `👋 Welcome to the Wavebot!👋`, {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

// Function to start the bot session
async function loginLogOutButton(chatId) {
  await bot.sendMessage(chatId, `👋please login!!👋`, {
    reply_markup: {
      keyboard: [
        [{ text: "SignUp", request_contact: false, request_location: false }],
        [{ text: "Login", request_contact: false, request_location: false }],
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
    await bot.sendMessage(chatId, messageText, {
      reply_markup: JSON.stringify(buyKeyboard),
    });
  } else {
    await loginLogOutButton(chatId);
  }
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
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
      await sendWelcomeMessage2(chatId);
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
  // else {
  //   await bot.sendMessage(chatId, `You typed: ${msg.text}`);
  // }
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
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching balance:", error);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
}

// Function to fetch token balances
async function fetchTokenBalances(chatId) {
  try {
    const response = await axios.post(`${API_URL}/fetchbalance`, {
      chatId: chatId,
    });
    const balances = response.data;
    let message = "Your token balances:\n\n";
    balances?.slice(0, 4)?.forEach((balance) => {
      message += `Token Name: ${balance.name}\n`;
      message += `Balance: ${balance.balance}\n\n`;
    });
    message += "Thank you for using our service! ✌️";
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error fetching balance:", error);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
}

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const isUser = await getstartBot(chatId);
  switch (data) {
    case "menuButton":
      if (isUser) {
        await bot.sendMessage(chatId, "Click Menu Button");
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "SwaptokenButton":
      if (isUser) {
        startSwapProcess(chatId);
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "SolonabalanceButton":
      if (isUser) {
        fetchSolanaBalance(chatId);
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "balanceButton":
      if (isUser) {
        fetchTokenBalances(chatId);
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "logoutButton":
      if (isUser) {
        isSigningUp = false;
        isLoggingIn = false;
        flag = null;
        await logoutfunaction(chatId).then(async (res) => {
          await bot.sendMessage(chatId, "logout successfull!", {
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
      } else {
        flag = null;
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "buyButton":
      if (isUser) {
        isSwap = false;
        buyStartTokenSelection(chatId);
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "sellButton":
      if (isUser) {
        isSwap = false;
        sellStartTokenSelection(chatId);
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    // -------------------------------------------------- buy ------------------------------------------------------

    case "solBuy":
      if (isUser) {
        flag = "solBuy";
        await bot.sendMessage(
          chatId,
          "Enter solBuy a Token that you want to Buy:"
        );
        if (flag == "solBuy") {
          bot.once("message", async (outputMsg) => {
            const output = outputMsg.text;
            if (flag == "solBuy") {
              await bot.sendMessage(
                chatId,
                " Please enter the solBuy amount to Buy:"
              );
            }
            if (flag == "solBuy") {
              bot.once("message", async (amountMsg) => {
                const amount = amountMsg.text;
                if (flag == "solBuy") {
                  await bot.sendMessage(
                    chatId,
                    `please wait your transaction is processing...`
                  );
                  try {
                    const tokenRes = await axios.post(
                      `${API_URL}/getSolanaTokenPrice`,
                      {
                        token: "So11111111111111111111111111111111111111112",
                        token2: output,
                      }
                    );
                    const tokensPrice = tokenRes?.data?.finalRes;
                    const buyAmt = amount * tokensPrice?.to;
                    const finalAmt = buyAmt / tokensPrice?.sol;
                    const response = await axios.post(`${API_URL}/solanaSwap`, {
                      input: "So11111111111111111111111111111111111111112",
                      output,
                      amount: finalAmt,
                      chatId,
                      desBot: 9,
                    });
                    if (response?.data?.status) {
                      await bot.sendMessage(chatId, `Token buy successful!`);
                      await bot.sendMessage(
                        chatId,
                        `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                      );
                    } else {
                      await bot.sendMessage(
                        chatId,
                        response.data.message ||
                          "❌ Swap failed. Please try again."
                      );
                    }
                  } catch (error) {}
                }
                //
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "42161buy":
      if (isUser) {
        flag = "42161buy";
        console.log("-------------- EVM--------------------");
        await bot.sendMessage(
          chatId,
          "Enter a ARB token that you want to buy from :"
        );
        if (flag == "42161buy") {
          bot.once("message", async (token1Msg) => {
            const token1 = token1Msg.text;
            if (flag == "42161buy") {
              await bot.sendMessage(
                chatId,
                "Please enter the ARB amount that you want to buy:"
              );
            }
            if (flag == "42161buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "42161buy") {
                  await bot.sendMessage(
                    chatId,
                    `please wait your transaction is processing...`
                  );
                  buyToken(
                    chatId,
                    42161,
                    "0x912CE59144191C1204E64559FE8253a0e49E6548",
                    token1,
                    amountIn
                  );
                }
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "1buy":
      if (isUser) {
        flag = "1buy";
        if (flag == "1buy") {
          await bot.sendMessage(chatId, "Ethereum is comming soon....");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "10buy":
      if (isUser) {
        flag = "10buy";
        if (flag == "10buy") {
          await bot.sendMessage(
            chatId,
            "Optimism Ethereum is comming soon...."
          );
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "137buy":
      if (isUser) {
        flag = "137buy";
        if (flag == "137buy") {
          await bot.sendMessage(chatId, "Polygon Ethereum is comming soon....");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "8453buy":
      if (isUser) {
        flag = "8453buy";
        if (flag == "8453buy") {
          await bot.sendMessage(chatId, "Base Ethereum is comming soon....");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "56buy":
      if (isUser) {
        flag = "56buy";
        if (flag == "56buy") {
          await bot.sendMessage(
            chatId,
            "BNB Chain Ethereum is comming soon...."
          );
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "43114buy":
      if (isUser) {
        flag = "43114buy";
        if (flag == "43114buy") {
          await bot.sendMessage(
            chatId,
            "AvakancheEthereum is comming soon...."
          );
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "42220buy":
      if (isUser) {
        flag = "42220buy";
        if (flag == "42220buy") {
          await bot.sendMessage(chatId, "Celo Ethereum is comming soon....");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "238buy":
      if (isUser) {
        flag = "238buy";
        if (flag == "238buy") {
          await bot.sendMessage(chatId, "Blast Ethereum is comming soon....");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    // ------------------------------------------------ sell -----------------------------------------------------------

    case "solSell":
      if (isUser) {
        flag = "solSell";
        console.log("--------------------- Sellllllllllllllllll ");
        await bot.sendMessage(
          chatId,
          "solSell Enter a Token that you want to sell:"
        );
        if (flag == "solSell") {
          bot.once("message", async (inputMsg) => {
            const input = inputMsg.text;
            if (flag == "solSell") {
              await bot.sendMessage(
                chatId,
                "Please enter the solSell amount to Buy:"
              );
            }
            if (flag == "solSell") {
              bot.once("message", async (amountMsg) => {
                const amount = amountMsg.text;
                if (flag == "solSell") {
                  await bot.sendMessage(
                    chatId,
                    `please wait your transaction is processing...`
                  );
                  try {
                    const response = await axios.post(`${API_URL}/solanaSwap`, {
                      input,
                      output: "So11111111111111111111111111111111111111112",
                      amount,
                      chatId,
                    });
                    if (response.data.status === true) {
                      await bot.sendMessage(chatId, `Token sell successful!`);
                      await bot.sendMessage(
                        chatId,
                        `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                      );
                    } else {
                      await bot.sendMessage(
                        chatId,
                        response.data.message ||
                          "❌ Swap failed. Please try again."
                      );
                    }
                  } catch (error) {}
                } //
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "1sell":
      if (isUser) {
        flag = "1sell";
        if (flag == "1sell") {
          await bot.sendMessage(chatId, "Ethereum is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "42161sell":
      if (isUser) {
        flag = "42161sell";
        await bot.sendMessage(chatId, "Enter ARB token that you want to sell:");
        if (flag == "42161sell") {
          bot.once("message", async (token1Msg) => {
            const token1 = token1Msg.text;
            if (flag == "42161sell") {
              await bot.sendMessage(chatId, "Please enter the sell amount :");
            }
            if (flag == "42161sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "42161sell") {
                  await bot.sendMessage(
                    chatId,
                    `please wait your transaction is processing...`
                  );
                  startAmountEntry(
                    chatId,
                    42161,
                    token1,
                    "0x912CE59144191C1204E64559FE8253a0e49E6548",
                    amountIn
                  );
                }
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "10sell":
      if (isUser) {
        flag = "10sell";
        if (flag == "10sell") {
          await bot.sendMessage(chatId, "Optimism is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "137sell":
      if (isUser) {
        flag = "137sell";
        if (flag == "137sell") {
          await bot.sendMessage(chatId, "Polygon is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "8453sell":
      if (isUser) {
        flag = "8453sell";
        if (flag == "8453sell") {
          await bot.sendMessage(chatId, "Base is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "56sell":
      if (isUser) {
        flag = "56sell";
        if (flag == "56sell") {
          await bot.sendMessage(chatId, "BNB Chain is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "43114sell":
      if (isUser) {
        flag = "43114sell";
        if (flag == "43114sell") {
          await bot.sendMessage(chatId, "Avalanche is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "42220sell":
      if (isUser) {
        flag = "42220sell";
        if (flag == "42220sell") {
          await bot.sendMessage(chatId, "Celo is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "238sell":
      if (isUser) {
        flag = "238sell";
        if (flag == "238sell") {
          await bot.sendMessage(chatId, "Blast is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    // ---------------------------------------------------------------- swap--------------------------------------------------------

    case "solana":
      if (isUser) {
        flag = "solana";
        await bot.sendMessage(chatId, " Type From Token:");
        if (flag == "solana") {
          bot.once("message", async (inputMsg) => {
            const input = inputMsg.text;
            if (flag == "solana") {
              await bot.sendMessage(chatId, " Type To Token:");
            }
            if (flag == "solana") {
              bot.once("message", async (outputMsg) => {
                const output = outputMsg.text;
                if (flag == "solana") {
                  await bot.sendMessage(
                    chatId,
                    " Please enter the amount to swap:"
                  );
                }
                if (flag == "solana") {
                  bot.once("message", async (amountMsg) => {
                    const amount = Number(amountMsg.text);
                    if (flag == "solana") {
                      await bot.sendMessage(
                        chatId,
                        `please wait your transaction is processing...`
                      );
                      try {
                        const response = await axios.post(
                          `${API_URL}/solanaSwap`,
                          {
                            input,
                            output,
                            amount,
                            chatId,
                          }
                        );
                        if (response.data.status === true) {
                          await bot.sendMessage(
                            chatId,
                            `Solona Swap successful!`
                          );
                          await bot.sendMessage(
                            chatId,
                            `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                          );
                        } else {
                          await bot.sendMessage(
                            chatId,
                            response.data.message ||
                              "❌ Swap failed. Please try again."
                          );
                        }
                      } catch (error) {
                        await bot.sendMessage(
                          chatId,
                          `❌ An error occurred: ${error.message}`
                        ); // Provide more specific error message if possible
                      }
                    }
                  });
                }
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }

      break;

    case "1":
      if (isUser) {
        flag = "1";
        if (flag == "1") {
          await bot.sendMessage(chatId, "Ethereum is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;
    case "42161":
      if (isUser) {
        flag = "42161";
        await bot.sendMessage(chatId, "Type From Token:");
        if (flag == "42161") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "42161") {
              await bot.sendMessage(chatId, "Type To Token:");
            }
            if (flag == "42161") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "42161") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "42161") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "42161") {
                      await bot.sendMessage(
                        chatId,
                        `please wait your transaction is processing...`
                      );
                      startAmountEntry(chatId, 42161, token0, token1, amountIn);
                    }
                  });
                }
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "10":
      if (isUser) {
        flag = "10";
        if (flag == "10") {
          await bot.sendMessage(chatId, "Optimism is comming soon...");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "137":
      if (isUser) {
        flag = "137";
        await bot.sendMessage(chatId, "Type From Token:");
        if (flag == "137") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "137") {
              await bot.sendMessage(chatId, "Type To Token:");
            }
            if (flag == "137") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "137") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "137") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "137") {
                      await bot.sendMessage(
                        chatId,
                        `please wait your transaction is processing...`
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "polygon",
                          amount: amountIn,
                          chain: 137,
                          chatId: chatId,
                          desCode: "0x89",
                        },
                      })
                        .then(async (response) => {
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://polygonscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  });
                }
              });
            }
          });
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "8453":
      if (isUser) {
        flag = "8453";
        if (flag == "8453") {
          await bot.sendMessage(chatId, "Base is comming soon!!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "56":
      if (isUser) {
        flag = "56";
        if (flag == "56") {
          await bot.sendMessage(chatId, "BNB chain is comming soon !!");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "43114":
      if (isUser) {
        flag = "43114";
        if (flag == "43114") {
          await bot.sendMessage(chatId, "Avalanche is comming soon");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "42220":
      if (isUser) {
        flag = "42220";
        if (flag == "42220") {
          await bot.sendMessage(chatId, "Celo is comming soon");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
      }
      break;

    case "238":
      if (isUser) {
        flag = "238";
        if (flag == "238") {
          await bot.sendMessage(chatId, "Blast is comming soon");
        }
      } else {
        await bot.sendMessage(chatId, "please login!!", {
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
