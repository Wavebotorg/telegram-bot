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
// main keyboard
const buyKeyboard = {
  inline_keyboard: [
    [{ text: "↕️ SwapToken", callback_data: "SwaptokenButton" }],
    [
      { text: "⬇️ Buy", callback_data: "buyButton" },
      { text: "⬆️ Sell", callback_data: "sellButton" },
      { text: "↗️ Transfer", callback_data: "withrawButton" },
    ],
    [
      { text: "✅ Position", callback_data: "positionButton" },
      { text: "❇️ Limit Orders", callback_data: "limitButton" },
      // { text: "DCA Orders", callback_data: "dcaOrdersButton" },
    ],
    [
      { text: "💼 Balance EVM", callback_data: "balanceButton" },
      { text: "💼 Balance Solona", callback_data: "SolonabalanceButton" },
      { text: "💼 Wallet Address", callback_data: "walletAddresses" },
    ],
    [
      { text: "🔄 Refresh", callback_data: "refreshButton" },
      { text: "Logout", callback_data: "logoutButton" },
    ],
  ],
};
// wallet balance keyboard
const evmWalletBalance = {
  inline_keyboard: [
    [
      { text: "Ethereum", callback_data: "1b" },
      { text: "Arbitrum", callback_data: "42161b" },
      { text: "Optimism", callback_data: "10b" },
    ],
    [
      { text: "Polygon", callback_data: "137b" },
      { text: "Base", callback_data: "8453b" },
      { text: "BNB Chain", callback_data: "56b" },
    ],
    [
      { text: "Avalanche", callback_data: "43114b" },
      { text: "Cronos", callback_data: "25b" },
      { text: "Fantom", callback_data: "250b" },
    ],
  ],
};
// wallet addresses keyboard
const walletAddressKeyboard = {
  inline_keyboard: [
    [{ text: "Solona", callback_data: "solanaAddress" }],
    [
      { text: "Ethereum", callback_data: "1Address" },
      { text: "Arbitrum", callback_data: "42161Address" },
      { text: "Optimism", callback_data: "10Address" },
    ],
    [
      { text: "Polygon", callback_data: "137Address" },
      { text: "Base", callback_data: "8453Address" },
      { text: "BNB Chain", callback_data: "56Address" },
    ],
    [
      { text: "Avalanche", callback_data: "43114Address" },
      { text: "Cronos", callback_data: "25Address" },
      { text: "Fantom", callback_data: "250Address" },
    ],
  ],
};
// swap keyboard
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
      { text: "Cronos", callback_data: "25" },
      { text: "Fantom", callback_data: "250" },
    ],
  ],
};
// buy token keyboard
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
      { text: "Cronos", callback_data: "25buy" },
      { text: "Fantom", callback_data: "250buy" },
    ],
  ],
};
// sell token keyboard
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
      { text: "Cronos", callback_data: "25sell" },
      { text: "Fantom", callback_data: "250sell" },
    ],
  ],
};
// withraw token keyboard
const withrawblockchainKeyboard = {
  inline_keyboard: [
    [{ text: "Solona", callback_data: "solwithraw" }],
    [
      { text: "Ethereum", callback_data: "1withraw" },
      { text: "Arbitrum", callback_data: "42161withraw" },
      { text: "Optimism", callback_data: "10withraw" },
    ],
    [
      { text: "Polygon", callback_data: "137withraw" },
      { text: "Base", callback_data: "8453withraw" },
      { text: "BNB Chain", callback_data: "56withraw" },
    ],
    [
      { text: "Avalanche", callback_data: "43114withraw" },
      { text: "Cronos", callback_data: "25withraw" },
      { text: "Fantom", callback_data: "250withraw" },
    ],
  ],
};
// animation function
const animateLoader = async (chatId) => {
  try {
    const frames = ["⏳", "⌛", "⏳", "⌛"];
    let index = 0;
    const loaderMessage = await bot.sendMessage(
      chatId,
      frames[index % frames.length]
    );
    const interval = setInterval(async () => {
      index++;
      try {
        await bot.editMessageText(frames[index % frames.length], {
          chat_id: chatId,
          message_id: loaderMessage.message_id,
        });
      } catch (error) {
        clearInterval(interval); // Ensure the interval is cleared on error
        console.error("Error updating loader message:", error);
      }
    }, 500);
    return { loaderMessage, interval };
  } catch (error) {
    console.log("🚀 ~ animateLoader ~ error:", error);
  }
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
// get evm qr code
async function getQrCode(chatId, wallet) {
  await axios({
    url: `${API_URL}/getQrCode`,
    method: "post",
    data: {
      chatId,
      wallet,
    },
  }).then((res) => {
    if (res?.data?.status) {
      bot.sendPhoto(chatId, res?.data?.path, {
        caption: `wallet:- ${res?.data?.walletAddress}`,
      });
    } else {
      bot.sendMessage(chatId, "somthing has been wrong!!");
    }
  });
}
// Signup Funaction
const startConfirmPasswordRegistration = (chatId, name, email, password) => {
  bot.once("message", async (confirmPasswordMsg) => {
    if (isSigningUp) {
      const confirmPassword = confirmPasswordMsg.text;
      if (password !== confirmPassword) {
        if (isSigningUp) {
          await bot.sendMessage(
            chatId,
            "❌ Passwords do not match. Please try again."
          );
        }
        // if (isSigningUp) {
        //   startPasswordRegistration(chatId, name, email); // Start from password registration
        // }
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
          await bot.sendMessage(
            chatId,
            `👋please register again carefully!!👋`,
            {
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
            }
          );
        }
      } catch (error) {
        console.error("Error:", error.message);
        await bot.sendMessage(
          chatId,
          `❌ An error occurred while registering the user: ${error.message}`
        );
      }
    }
  });
};
// Otp Varification
const startOTPVerification = (chatId, email) => {
  console.log("------------------------------------");
  if (isSigningUp) {
    bot.once("message", async (otpMsg) => {
      if (isSigningUp) {
        const otp = otpMsg.text;
        try {
          const response = await axios.post(`${API_URL}/verify`, {
            email,
            otp,
            chatId,
          });
          if (response.data.status == true) {
            if (isSigningUp) {
              await await bot.sendMessage(
                chatId,
                `✅ User verified successfully`
              );
              await start(chatId);
              await sendWelcomeMessage2(chatId);
              isSigningUp = false;
            }
          } else {
            if (isSigningUp) {
              await bot.sendMessage(
                chatId,
                `❌ Invalid OTP. Please enter a valid OTP.`
              );
              await bot.sendMessage(chatId, `Please enter a valid OTP.`);
              startOTPVerification(chatId, email); // Recall OTP verification process
            }
          }
        } catch (error) {
          if (isSigningUp) {
            console.error("Error:", error.message);
            await bot.sendMessage(
              chatId,
              `❌ An error occurred while verifying the user: ${error.message}`
            );
          }
        }
      }
    });
  }
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
// get email address and wallet address from backend
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
  await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟
  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    {
      reply_markup: JSON.stringify(buyblockchainKeyboard),
    }
  );
};
// wallet addresses button
const walletAddressSelection = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟
  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    {
      reply_markup: JSON.stringify(walletAddressKeyboard),
    }
  );
};
// Sell Token
const sellStartTokenSelection = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟
  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    {
      reply_markup: JSON.stringify(sellblockchainKeyboard),
    }
  );
};
// withraw token Token
const withrawStartTokenSelection = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟
  Great! Let's get started. Please select your preferred blockchain 
  from the options below:`,
    {
      reply_markup: JSON.stringify(withrawblockchainKeyboard),
    }
  );
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
// transfer token function
async function transferEvmToken(chatId, token, toWallet, chain, amount) {
  try {
    const { loaderMessage, interval } = await animateLoader(chatId);
    const receipt = await axios({
      url: `${API_URL}/transferEvmToken`,
      method: "post",
      data: {
        chatId,
        token,
        toWallet,
        chain,
        amount,
      },
    });
    clearInterval(interval);
    if (loaderMessage) {
      await bot.deleteMessage(chatId, loaderMessage.message_id);
    }
    if (!receipt?.data?.status) {
      console.log("🚀 ~ transferEvmToken ~ receipt:", receipt);
      return null;
    }
    return receipt?.data;
  } catch (error) {
    clearInterval(interval);
    if (loaderMessage) {
      await bot.deleteMessage(chatId, loaderMessage.message_id);
    }
    console.log("🚀 ~ transferEvmToken ~ error:", error);
  }
}
// Function to start the bot session
async function start(chatId) {
  flag = null;
  const userInfo = await getEmailAndWalletFromBackend(chatId);
  if (userInfo?.email) {
    const messageText = `Welcome to WaveBot! 🌊\n
  🌊 WaveBot(https://wavebot.app/)\n
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
    flag = null;
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
    flag = null;
    // Start the signup process only if not already in a login process
    await startNameRegistration(chatId);
  }
  // Handle 'Login' command
  else if (msg.text === "Login") {
    isLoggingIn = true;
    isSigningUp = false;
    flag = null;
    // Start the login process only if not already in a signup process
    await startEmailLogin(chatId);
  }
  // Handle 'Start' command
  else if (msg.text === "Start") {
    // Start the bot session
    flag = null;
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
async function fetchTokenBalances(chatId, chainId) {
  try {
    const response = await axios.post(`${API_URL}/fetchbalance`, {
      chatId: chatId,
      chainId: chainId,
    });
    const balances = response.data;
    let message = "Your token balances:\n\n";
    balances?.data?.forEach((balance) => {
      message += `Token Name: ${balance.name}\n`;
      message += `Balance: ${balance.balance_formatted}\n\n`;
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
// all keyborad button handler
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const isUser = await getstartBot(chatId);
  switch (data) {
    case "menuButton":
      if (isUser) {
        flag = null;
        await bot.sendMessage(chatId, "Click Menu Button");
      } else {
        await bot.sendMessage(chatId, "Please login!!", {
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
        flag = null;
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
        flag = null;
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
        flag = null;
        await bot.sendMessage(chatId, `🌟 Choose a network 🌟`, {
          reply_markup: JSON.stringify(evmWalletBalance),
        });
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
        flag = null;
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
        flag = null;
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
    case "withrawButton":
      if (isUser) {
        flag == null;
        withrawStartTokenSelection(chatId);
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
    case "walletAddresses":
      if (isUser) {
        flag = null;
        walletAddressSelection(chatId);
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
    case "refreshButton":
      flag = null;
      await start(chatId);
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
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
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
                      method: "Buy",
                    });
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
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
                  } catch (error) {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    await bot.sendMessage(
                      chatId,
                      `due to some reason you transaction failed!!`
                    );
                  }
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
        await bot.sendMessage(chatId, "Type ARB token that you want to buy:");
        if (flag == "42161buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "42161buy") {
              await bot.sendMessage(
                chatId,
                "Please enter the ARB token amount:"
              );
              if (flag == "42161buy") {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  if (flag == "42161buy") {
                    const { loaderMessage, interval } = await animateLoader(
                      chatId
                    );
                    const tokenRes = await axios.post(
                      `${API_URL}/getEvmTokenPrice`,
                      {
                        token: "0x912CE59144191C1204E64559FE8253a0e49E6548",
                        token2: token0,
                        chain: "0xa4b1",
                      }
                    );
                    const tokensPrice = tokenRes?.data?.finalRes;
                    const buyAmt = amountIn * tokensPrice?.token2;
                    const finalAmt = buyAmt / tokensPrice?.token1;
                    if (tokenRes) {
                      if (flag == "42161buy") {
                        await axios({
                          url: `${API_URL}/EVMswap`,
                          method: "post",
                          data: {
                            tokenIn:
                              "0x912CE59144191C1204E64559FE8253a0e49E6548",
                            tokenOut: token0,
                            chainId: "arbitrum",
                            amount: finalAmt,
                            chain: 42161,
                            chatId: chatId,
                            desCode: "0xa4b1",
                            method: "Buy",
                          },
                        })
                          .then(async (response) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            if (response?.data?.status) {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                              await bot.sendMessage(
                                chatId,
                                `https://arbiscan.io/tx/${response?.data?.tx}`
                              );
                            } else {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                            }
                          })
                          .catch(async (error) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            await bot.sendMessage(
                              chatId,
                              `due to some reason you transaction failed!!`
                            );
                          });
                      }
                    }
                  }
                });
              }
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
        await bot.sendMessage(chatId, "Type Eth token that you want to buy:");
        if (flag == "1buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "1buy") {
              await bot.sendMessage(
                chatId,
                "Please enter the Eth token amount:"
              );
              if (flag == "1buy") {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  if (flag == "1buy") {
                    const { loaderMessage, interval } = await animateLoader(
                      chatId
                    );
                    const tokenRes = await axios.post(
                      `${API_URL}/getEvmTokenPrice`,
                      {
                        token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                        token2: token0,
                        chain: "0x1",
                      }
                    );
                    const tokensPrice = tokenRes?.data?.finalRes;
                    const buyAmt = amountIn * tokensPrice?.token2;
                    const finalAmt = buyAmt / tokensPrice?.token1;
                    if (tokenRes) {
                      if (flag == "1buy") {
                        await axios({
                          url: `${API_URL}/EVMswap`,
                          method: "post",
                          data: {
                            tokenIn:
                              "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                            tokenOut: token0,
                            chainId: "ethereum",
                            amount: finalAmt,
                            chain: 1,
                            chatId: chatId,
                            desCode: "0x1",
                            method: "Buy",
                          },
                        })
                          .then(async (response) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            if (response?.data?.status) {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                              await bot.sendMessage(
                                chatId,
                                `https://etherscan.io/tx/${response?.data?.tx}`
                              );
                            } else {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                            }
                          })
                          .catch(async (error) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            await bot.sendMessage(
                              chatId,
                              `due to some reason you transaction failed!!`
                            );
                          });
                      }
                    }
                  }
                });
              }
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
    case "10buy":
      if (isUser) {
        flag = "10buy";
        await bot.sendMessage(chatId, "Type OP token that you want to buy:");
        if (flag == "10buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "10buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "10buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "10buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0x4200000000000000000000000000000000000042",
                      token2: token0,
                      chain: "0xa",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (tokenRes) {
                    if (flag == "10buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                          tokenOut: token0,
                          chainId: "optimism",
                          amount: finalAmt,
                          chain: 10,
                          chatId: chatId,
                          desCode: "0xa",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://optimistic.etherscan.io/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  }
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
    case "137buy":
      if (isUser) {
        flag = "137buy";
        await bot.sendMessage(chatId, "Type token that you want to buy:");
        if (flag == "137buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "137buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "137buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "137buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                      token2: token0,
                      chain: "0x89",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (tokenRes) {
                    if (flag == "137buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                          tokenOut: token0,
                          chainId: "polygon",
                          amount: finalAmt,
                          chain: 137,
                          chatId: chatId,
                          desCode: "0x89",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  }
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
    case "8453buy":
      if (isUser) {
        flag = "8453buy";
        await bot.sendMessage(chatId, "Type base token that you want to buy:");
        if (flag == "8453buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "8453buy") {
              await bot.sendMessage(
                chatId,
                "Please enter the base token amount:"
              );
              if (flag == "8453buy") {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  if (flag == "8453buy") {
                    const { loaderMessage, interval } = await animateLoader(
                      chatId
                    );
                    const tokenRes = await axios.post(
                      `${API_URL}/getEvmTokenPrice`,
                      {
                        token: "0x4200000000000000000000000000000000000006",
                        token2: token0,
                        chain: "0x2105",
                      }
                    );
                    const tokensPrice = tokenRes?.data?.finalRes;
                    const buyAmt = amountIn * tokensPrice?.token2;
                    const finalAmt = buyAmt / tokensPrice?.token1;
                    if (tokenRes) {
                      if (flag == "8453buy") {
                        await axios({
                          url: `${API_URL}/EVMswap`,
                          method: "post",
                          data: {
                            tokenIn:
                              "0x4200000000000000000000000000000000000006",
                            tokenOut: token0,
                            chainId: "base",
                            amount: finalAmt,
                            chain: 8453,
                            chatId: chatId,
                            desCode: "0x2105",
                            method: "Buy",
                          },
                        })
                          .then(async (response) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            if (response?.data?.status) {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                              await bot.sendMessage(
                                chatId,
                                `https://basescan.org/tx/${response?.data?.tx}`
                              );
                            } else {
                              await bot.sendMessage(
                                chatId,
                                response?.data?.message
                              );
                            }
                          })
                          .catch(async (error) => {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            await bot.sendMessage(
                              chatId,
                              `due to some reason you transaction failed!!`
                            );
                          });
                      }
                    }
                  }
                });
              }
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
    case "56buy":
      if (isUser) {
        flag = "56buy";
        await bot.sendMessage(chatId, "Type token that you want to buy:");
        if (flag == "56buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "56buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "56buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "56buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                      token2: token0,
                      chain: "0x38",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (tokenRes) {
                    if (flag == "56buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                          tokenOut: token0,
                          chainId: "bsc",
                          amount: finalAmt,
                          chain: 56,
                          chatId: chatId,
                          desCode: "0x38",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://bscscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  }
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
    case "43114buy":
      if (isUser) {
        flag = "43114buy";
        await bot.sendMessage(chatId, "Type AVAX token that you want to buy:");
        if (flag == "43114buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "43114buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "43114buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "43114buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
                      token2: token0,
                      chain: "0xa86a",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (finalAmt) {
                    if (flag == "43114buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
                          tokenOut: token0,
                          chainId: "avalanche",
                          amount: finalAmt,
                          chain: 43114,
                          chatId: chatId,
                          desCode: "0xa86a",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://avascan.info/blockchain/c/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  } else {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    await bot.sendMessage(chatId, `token is not supported!!`);
                  }
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
    case "25buy":
      if (isUser) {
        flag = "25buy";
        await bot.sendMessage(
          chatId,
          "Type cronos token that you want to buy:"
        );
        if (flag == "25buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "25buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "25buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "25buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
                      token2: token0,
                      chain: "0x19",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (tokenRes) {
                    if (flag == "25buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
                          tokenOut: token0,
                          chainId: "cronos",
                          amount: finalAmt,
                          chain: 25,
                          chatId: chatId,
                          desCode: "0x19",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://cronoscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  }
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
    case "250buy":
      if (isUser) {
        flag = "250buy";
        await bot.sendMessage(
          chatId,
          "Type fantom token that you want to buy:"
        );
        if (flag == "250buy") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "250buy") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "250buy") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "250buy") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  const tokenRes = await axios.post(
                    `${API_URL}/getEvmTokenPrice`,
                    {
                      token: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
                      token2: token0,
                      chain: "0xfa",
                    }
                  );
                  const tokensPrice = tokenRes?.data?.finalRes;
                  const buyAmt = amountIn * tokensPrice?.token2;
                  const finalAmt = buyAmt / tokensPrice?.token1;
                  if (tokenRes) {
                    if (flag == "250buy") {
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
                          tokenOut: token0,
                          chainId: "fantom",
                          amount: finalAmt,
                          chain: 250,
                          chatId: chatId,
                          desCode: "0xfa",
                          method: "Buy",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://ftmscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed!!`
                          );
                        });
                    }
                  }
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
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  try {
                    const response = await axios.post(`${API_URL}/solanaSwap`, {
                      input,
                      output: "So11111111111111111111111111111111111111112",
                      amount,
                      chatId,
                      method: "Sell",
                    });
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
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
                  } catch (error) {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    await bot.sendMessage(
                      chatId,
                      `due to some reason you transaction failed!!`
                    );
                  }
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
        await bot.sendMessage(chatId, "Enter Eth token that you want to sell:");
        if (flag == "1sell") {
          bot.once("message", async (token1Msg) => {
            const token1 = token1Msg.text;
            if (flag == "1sell") {
              await bot.sendMessage(chatId, "Please enter the sell amount :");
              if (flag == "1sell") {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  if (flag == "1sell") {
                    const { loaderMessage, interval } = await animateLoader(
                      chatId
                    );
                    await axios({
                      url: `${API_URL}/EVMswap`,
                      method: "post",
                      data: {
                        tokenIn: token1,
                        tokenOut: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                        chainId: "ethereum",
                        amount: amountIn,
                        chain: 1,
                        chatId: chatId,
                        desCode: "0x1",
                        method: "Sell",
                      },
                    })
                      .then(async (response) => {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        if (response?.data?.status) {
                          await bot.sendMessage(
                            chatId,
                            response?.data?.message
                          );
                          await bot.sendMessage(
                            chatId,
                            `https://etherscan.io/tx/${response?.data?.tx}`
                          );
                        } else {
                          await bot.sendMessage(
                            chatId,
                            response?.data?.message
                          );
                        }
                      })
                      .catch(async (error) => {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        await bot.sendMessage(
                          chatId,
                          `due to some reason you transaction failed!!`
                        );
                      });
                  }
                });
              }
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
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token1,
                      tokenOut: "0x912CE59144191C1204E64559FE8253a0e49E6548",
                      chainId: "arbitrum",
                      amount: amountIn,
                      chain: 42161,
                      chatId: chatId,
                      desCode: "0xa4b1",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://arbiscan.io/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
        await bot.sendMessage(chatId, "Type OP token that you want to sell:");
        if (flag == "10sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "10sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "10sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "10sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0x4200000000000000000000000000000000000042",
                      chainId: "optimism",
                      amount: amountIn,
                      chain: 10,
                      chatId: chatId,
                      desCode: "0xa",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://optimistic.etherscan.io/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
        await bot.sendMessage(chatId, "Type token that you want to sell:");
        if (flag == "137sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "137sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "137sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "137sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                      chainId: "polygon",
                      amount: amountIn,
                      chain: 137,
                      chatId: chatId,
                      desCode: "0x89",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://polygonscan.com/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
        await bot.sendMessage(chatId, "Type Base token that you want to sell:");
        if (flag == "8453sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "8453sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
              if (flag == "8453sell") {
                bot.once("message", async (amountInMsg) => {
                  const amountIn = Number(amountInMsg.text);
                  if (flag == "8453sell") {
                    const { loaderMessage, interval } = await animateLoader(
                      chatId
                    );
                    await axios({
                      url: `${API_URL}/EVMswap`,
                      method: "post",
                      data: {
                        tokenIn: token0,
                        tokenOut: "0x4200000000000000000000000000000000000006",
                        chainId: "base",
                        amount: amountIn,
                        chain: 8453,
                        chatId: chatId,
                        desCode: "0x2105",
                        method: "Sell",
                      },
                    })
                      .then(async (response) => {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        if (response?.data?.status) {
                          await bot.sendMessage(
                            chatId,
                            response?.data?.message
                          );
                          await bot.sendMessage(
                            chatId,
                            `https://basescan.org/tx/${response?.data?.tx}`
                          );
                        } else {
                          await bot.sendMessage(
                            chatId,
                            response?.data?.message
                          );
                        }
                      })
                      .catch(async (error) => {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        await bot.sendMessage(
                          chatId,
                          `due to some reason you transaction failed!!`
                        );
                      });
                  }
                });
              }
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
    case "56sell":
      if (isUser) {
        flag = "56sell";
        await bot.sendMessage(chatId, "Type BNB token that you want to sell:");
        if (flag == "56sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "56sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "56sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "56sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                      chainId: "bsc",
                      amount: amountIn,
                      chain: 56,
                      chatId: chatId,
                      desCode: "0x38",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://bscscan.com/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
        await bot.sendMessage(chatId, "Type AVAX token that you want to sell:");
        if (flag == "43114sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "43114sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "43114sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "43114sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
                      chainId: "avalanche",
                      amount: amountIn,
                      chain: 43114,
                      chatId: chatId,
                      desCode: "0xa86a",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://avascan.info/blockchain/c/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
    case "25sell":
      if (isUser) {
        flag = "25sell";
        await bot.sendMessage(
          chatId,
          "Type cronos token that you want to sell:"
        );
        if (flag == "25sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "25sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "25sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "25sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
                      chainId: "cronos",
                      amount: amountIn,
                      chain: 25,
                      chatId: chatId,
                      desCode: "0x19",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://cronoscan.com/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
    case "250sell":
      if (isUser) {
        flag = "250sell";
        await bot.sendMessage(
          chatId,
          "Type fantom token that you want to sell:"
        );
        if (flag == "250sell") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "250sell") {
              await bot.sendMessage(chatId, "Please enter the amount:");
            }
            if (flag == "250sell") {
              bot.once("message", async (amountInMsg) => {
                const amountIn = Number(amountInMsg.text);
                if (flag == "250sell") {
                  const { loaderMessage, interval } = await animateLoader(
                    chatId
                  );
                  await axios({
                    url: `${API_URL}/EVMswap`,
                    method: "post",
                    data: {
                      tokenIn: token0,
                      tokenOut: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
                      chainId: "fantom",
                      amount: amountIn,
                      chain: 250,
                      chatId: chatId,
                      desCode: "0xfa",
                      method: "Sell",
                    },
                  })
                    .then(async (response) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      if (response?.data?.status) {
                        await bot.sendMessage(chatId, response?.data?.message);
                        await bot.sendMessage(
                          chatId,
                          `https://ftmscan.com/tx/${response?.data?.tx}`
                        );
                      } else {
                        await bot.sendMessage(chatId, response?.data?.message);
                      }
                    })
                    .catch(async (error) => {
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
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
    // ---------------------------------------------------------------- swap --------------------------------------------------------
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
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      try {
                        const response = await axios.post(
                          `${API_URL}/solanaSwap`,
                          {
                            input,
                            output,
                            amount,
                            chatId,
                            method: "Swap",
                          }
                        );
                        if (response.data.status === true) {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `Solona Swap successful!`
                          );
                          await bot.sendMessage(
                            chatId,
                            `https://solscan.io/account/${response?.data?.transactionCreated?.txid}`
                          );
                        } else {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            response.data.message ||
                              "❌ Swap failed. Please try again."
                          );
                        }
                      } catch (error) {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
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
        await bot.sendMessage(chatId, "Type ethereum From Token:");
        if (flag == "1") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "1") {
              await bot.sendMessage(chatId, "Type ethereum To Token:");
            }
            if (flag == "1") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "1") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "1") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "1") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "ethereum",
                          amount: amountIn,
                          chain: 1,
                          chatId: chatId,
                          desCode: "0x1",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://etherscan.io/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "arbitrum",
                          amount: amountIn,
                          chain: 42161,
                          chatId: chatId,
                          desCode: "0xa4b1",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          if (response?.data?.status) {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://arbiscan.io/tx/${response?.data?.tx}`
                            );
                          } else {
                            clearInterval(interval);
                            await bot.deleteMessage(
                              chatId,
                              loaderMessage.message_id
                            );
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
    case "10":
      if (isUser) {
        flag = "10";
        await bot.sendMessage(chatId, "Type From Token:");
        if (flag == "10") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "10") {
              await bot.sendMessage(chatId, "Type To Token:");
            }
            if (flag == "10") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "10") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "10") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "10") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "optimism",
                          amount: amountIn,
                          chain: 10,
                          chatId: chatId,
                          desCode: "0xa",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://optimistic.etherscan.io/tx${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
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
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
        await bot.sendMessage(chatId, "Type From Token:");
        if (flag == "8453") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "8453") {
              await bot.sendMessage(chatId, "Type To Token:");
            }
            if (flag == "8453") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "8453") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "8453") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "8453") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "base",
                          amount: amountIn,
                          chain: 8453,
                          chatId: chatId,
                          desCode: "0x2105",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://basescan.org/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          await bot.sendMessage(
                            chatId,
                            `due to some reason you transaction failed please try again later!!`
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
    case "56":
      if (isUser) {
        flag = "56";
        await bot.sendMessage(chatId, "Type bsc From Token:");
        if (flag == "56") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "56") {
              await bot.sendMessage(chatId, "Type bsc To Token:");
            }
            if (flag == "56") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "56") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "56") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "56") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "bsc",
                          amount: amountIn,
                          chain: 56,
                          chatId: chatId,
                          desCode: "0x38",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://bscscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
    case "43114":
      if (isUser) {
        flag = "43114";
        await bot.sendMessage(chatId, "Type ava From Token:");
        if (flag == "43114") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "43114") {
              await bot.sendMessage(chatId, "Type ava To Token:");
            }
            if (flag == "43114") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "43114") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "43114") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "43114") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "avalanche",
                          amount: amountIn,
                          chain: 43114,
                          chatId: chatId,
                          desCode: "0xa86a",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://avascan.info/blockchain/c/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
    case "25":
      if (isUser) {
        flag = "25";
        await bot.sendMessage(chatId, "Type cronos From Token:");
        if (flag == "25") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "25") {
              await bot.sendMessage(chatId, "Type cronos To Token:");
            }
            if (flag == "25") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "25") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "25") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "25") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "cronos",
                          amount: amountIn,
                          chain: 25,
                          chatId: chatId,
                          desCode: "0x19",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://cronoscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
    case "250":
      if (isUser) {
        flag = "250";
        await bot.sendMessage(chatId, "Type fantom From Token:");
        if (flag == "250") {
          bot.once("message", async (token0Msg) => {
            const token0 = token0Msg.text;
            if (flag == "250") {
              await bot.sendMessage(chatId, "Type fantom To Token:");
            }
            if (flag == "250") {
              bot.once("message", async (token1Msg) => {
                const token1 = token1Msg.text;
                if (flag == "250") {
                  await bot.sendMessage(
                    chatId,
                    "Please enter the amount to swap:"
                  );
                }
                if (flag == "250") {
                  bot.once("message", async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (flag == "250") {
                      const { loaderMessage, interval } = await animateLoader(
                        chatId
                      );
                      await axios({
                        url: `${API_URL}/EVMswap`,
                        method: "post",
                        data: {
                          tokenIn: token0,
                          tokenOut: token1,
                          chainId: "fantom",
                          amount: amountIn,
                          chain: 250,
                          chatId: chatId,
                          desCode: "0xfa",
                          method: "Swap",
                        },
                      })
                        .then(async (response) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
                          if (response?.data?.status) {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                            await bot.sendMessage(
                              chatId,
                              `https://ftmscan.com/tx/${response?.data?.tx}`
                            );
                          } else {
                            await bot.sendMessage(
                              chatId,
                              response?.data?.message
                            );
                          }
                        })
                        .catch(async (error) => {
                          clearInterval(interval);
                          await bot.deleteMessage(
                            chatId,
                            loaderMessage.message_id
                          );
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
    // ------------------------------------- balance ---------------------------------------------------
    case "1b":
      if (isUser) {
        flag = "1b";
        if (flag == "1b") {
          fetchTokenBalances(chatId, "0x1");
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
    case "42161b":
      if (isUser) {
        flag = "42161b";
        if (flag == "42161b") {
          fetchTokenBalances(chatId, "0xa4b1");
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
    case "10b":
      if (isUser) {
        flag = "10b";
        if (flag == "10b") {
          fetchTokenBalances(chatId, "0xa");
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
    case "137b":
      if (isUser) {
        flag = "137b";
        if (flag == "137b") {
          fetchTokenBalances(chatId, "0x89");
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
    case "8453b":
      if (isUser) {
        flag = "8453b";
        if (flag == "8453b") {
          fetchTokenBalances(chatId, "0x2105");
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
    case "56b":
      if (isUser) {
        flag = "56b";
        if (flag == "56b") {
          fetchTokenBalances(chatId, "0x38");
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
    case "43114b":
      if (isUser) {
        flag = "43114b";
        if (flag == "43114b") {
          fetchTokenBalances(chatId, "0xa86a");
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
    case "25b":
      if (isUser) {
        flag = "25b";
        if (flag == "25b") {
          fetchTokenBalances(chatId, "0x19");
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
    case "250b":
      if (isUser) {
        flag = "250b";
        if (flag == "250b") {
          fetchTokenBalances(chatId, "0xfa");
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
    // ========================================================= wallet address =====================================================
    case "solanaAddress":
      if (isUser) {
        await getQrCode(chatId, 2);
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
    case "1Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "42161Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "10Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "137Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "8453Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "56Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "43114Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "25Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    case "250Address":
      if (isUser) {
        await getQrCode(chatId, 1);
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
    // ------------------------------------------------------ transfer token --------------------------------------------------------
    case "solwithraw":
      if (isUser) {
        flag = "solwithraw";
        await bot.sendMessage(
          chatId,
          "Enter sol token address that you want to transfer:"
        );
        if (flag == "solwithraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "solwithraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "solwithraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "solwithraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "solwithraw") {
                    await bot.once("message", async (amountIn) => {
                      const amount = Number(amountIn.text);
                      if (flag == "solwithraw") {
                        const { loaderMessage, interval } = await animateLoader(
                          chatId
                        );
                        if (flag == "solwithraw") {
                          await axios({
                            url: `${API_URL}/transferSolanaToken`,
                            method: "post",
                            data: {
                              chatId,
                              toWallet: toWallet,
                              token: token,
                              amount: amount,
                            },
                          })
                            .then(async (res) => {
                              clearInterval(interval);
                              await bot.deleteMessage(
                                chatId,
                                loaderMessage.message_id
                              );
                              if (res?.data?.status) {
                                console.log(
                                  "🚀 ~ .then ~ res?.data?.tx:",
                                  res?.data?.tx
                                );
                                await bot.sendMessage(
                                  chatId,
                                  res?.data?.message
                                );
                                await bot.sendMessage(
                                  chatId,
                                  `https://solscan.io/tx/${res?.data?.tx}`
                                );
                              } else {
                                await bot.sendMessage(
                                  chatId,
                                  res?.data?.message
                                );
                              }
                            })
                            .catch(async (error) => {
                              clearInterval(interval);
                              await bot.deleteMessage(
                                chatId,
                                loaderMessage.message_id
                              );
                              console.log("🚀 ~ awaitbot.once ~ error:", error);
                              await bot.sendMessage(
                                chatId,
                                "due to high transaction volume in solana you transaction has been faild!!"
                              );
                            });
                        }
                      }
                    });
                  }
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
    case "1withraw":
      if (isUser) {
        flag = "1withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "1withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "1withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "1withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "1withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "1withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "1withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          1,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://etherscan.io/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
    case "42161withraw":
      if (isUser) {
        flag = "42161withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "42161withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "42161withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "42161withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "42161withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "42161withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "42161withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          42161,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://arbiscan.io/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
    case "10withraw":
      if (isUser) {
        flag = "10withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "10withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "10withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "10withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "10withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "10withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "10withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          137,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://polygonscan.com/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "137withraw":
      if (isUser) {
        flag = "137withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "137withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "137withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "137withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "137withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "137withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "137withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          137,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://polygonscan.com/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "8453withraw":
      if (isUser) {
        flag = "8453withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "8453withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "8453withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "8453withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "8453withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "8453withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "8453withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          8453,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://basescan.org/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "56withraw":
      if (isUser) {
        flag = "56withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "56withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "56withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "56withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "56withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "56withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "56withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          56,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://bscscan.com/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "43114withraw":
      if (isUser) {
        flag = "43114withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "43114withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "43114withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "43114withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "43114withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "43114withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "43114withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          43114,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://avascan.info/blockchain/c/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "25withraw":
      if (isUser) {
        flag = "25withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "25withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "25withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "25withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "25withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "25withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "25withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          25,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://cronoscan.com/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
      break;
    case "250withraw":
      if (isUser) {
        flag = "250withraw";
        await bot.sendMessage(
          chatId,
          "Enter token address that you want to transfer:"
        );
        if (flag == "250withraw") {
          bot.once("message", async (token0Msg) => {
            const token = token0Msg.text;
            if (flag == "250withraw") {
              await bot.sendMessage(
                chatId,
                "Enter the wallet address where you want to get transferred tokens:"
              );
            }
            if (flag == "250withraw") {
              await bot.once("message", async (toWalletAdd) => {
                const toWallet = toWalletAdd.text;
                if (flag == "250withraw") {
                  await bot.sendMessage(chatId, `Enter amount`);
                  if (flag == "250withraw") {
                    await bot.once("message", async (amountIn) => {
                      if (flag == "250withraw") {
                        const amount = Number(amountIn.text);

                        await transferEvmToken(
                          chatId,
                          token,
                          toWallet,
                          250,
                          amount
                        )
                          .then(async (res) => {
                            await bot.sendMessage(chatId, res?.message);
                            await bot.sendMessage(
                              chatId,
                              `https://ftmscan.com/tx/${res?.tx}`
                            );
                          })
                          .catch(async (err) => {
                            console.log("🚀 ~ bot.once ~ err:", err);
                            await bot.sendMessage(
                              chatId,
                              "somthing has been wrong make sure you have a enough balance!!"
                            );
                          });
                      }
                    });
                  }
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
