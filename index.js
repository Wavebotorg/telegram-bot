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
const userStates = {};
const resetUserState = (chatId) => {
  userStates[chatId] = {
    flag: null,
    fromToken: null,
    toToken: null,
    amount: null,
    currentStep: null,
    method: null,
    network: null,
    desCode: null,
    email: null,
    password: null,
    confirmPassword: null,
    otp: null,
    name: null,
    referral: null,
    toMsg: null,
    fromMsg: null,
    amountMsg: null,
    toBuyAddresName: null,
    statusFalse: null,
  };
};

// Function to handle swapping for Solana
const handleSwap = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenSwap";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type From Token:"
  );
};
const handleBuy = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenBuy";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type Token You Want To Buy:"
  );
};
const handleSell = async (chatId) => {
  userStates[chatId].currentStep = "toTokenSell";
  userStates[chatId].toMsg = await bot.sendMessage(
    chatId,
    "Type Token You Want To Sell:"
  );
};
const handleTransfer = async (chatId) => {
  userStates[chatId].currentStep = "tokenTransfer";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type Token You Want To Transfer:"
  );
};
const handleLogin = async (chatId) => {
  userStates[chatId].currentStep = "loginEmail";
  await bot.sendMessage(chatId, "🔐Please enter your email to log in:");
};
const handleSignUp = async (chatId) => {
  userStates[chatId].currentStep = "signupHandle";
  await bot.sendMessage(chatId, "🔐Please enter your name:");
};

// main keyboard
const buyKeyboard = {
  inline_keyboard: [
    [{ text: "🔄 SwapToken", callback_data: "SwaptokenButton" }],
    [
      { text: "📈 Buy", callback_data: "buyButton" },
      { text: "📉 Sell", callback_data: "sellButton" },
      { text: "💵 Withdraw", callback_data: "withrawButton" },
    ],
    [
      { text: "📊 Position", callback_data: "positionButton" },
      { text: "📋 Limit Orders", callback_data: "limitButton" },
      // { text: "DCA Orders", callback_data: "dcaOrdersButton" },
    ],
    [
      { text: "💰 Balance EVM", callback_data: "balanceButton" },
      { text: "💰 Balance Solona", callback_data: "SolonabalanceButton" },
      { text: "🏦 Wallet Address", callback_data: "walletAddresses" },
    ],
    [
      { text: "⚙️ Setting", callback_data: "settingButton" },
      { text: "🔄 Refresh", callback_data: "refreshButton" },
      { text: "🚪 Logout", callback_data: "logoutButton" },
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
      { text: "Ethereum", callback_data: "addressEVM" },
      { text: "Arbitrum", callback_data: "addressEVM" },
      { text: "Optimism", callback_data: "addressEVM" },
    ],
    [
      { text: "Polygon", callback_data: "addressEVM" },
      { text: "Base", callback_data: "addressEVM" },
      { text: "BNB Chain", callback_data: "addressEVM" },
    ],
    [
      { text: "Avalanche", callback_data: "addressEVM" },
      { text: "Cronos", callback_data: "addressEVM" },
      { text: "Fantom", callback_data: "addressEVM" },
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

// get evm qr code
async function getQrCode(chatId, wallet) {
  await axios({
    url: `${API_URL}/getQrCode`,
    method: "post",
    data: {
      chatId,
      wallet,
    },
  }).then(async (res) => {
    if (res?.data?.status) {
      await bot.sendPhoto(chatId, res?.data?.path, {
        // caption: `${wallet == 2 ? "Solana wallet" : "Eth Wallet"}:- ${
        //   res?.data?.walletAddress
        // }`,
      });
      await bot.sendMessage(
        chatId,
        `${wallet == 2 ? "Solana wallet" : "EVM Wallet"}:- ${
          res?.data?.walletAddress
        }`
      );
    } else {
      bot.sendMessage(chatId, "somthing has been wrong!!");
    }
  });
}

// get referral QR code
async function getreferralQrCode(chatId, referralId) {
  console.log("🚀 ~ getreferralQrCode ~ referralId:", referralId);

  try {
    const res = await axios.post(`${API_URL}/getInviteQrCode`, { referralId });

    if (res?.data?.status) {
      console.log("🚀 ~ getreferralQrCode ~ res?.data:", res?.data);

      // Fetch the image as a buffer
      const imageResponse = await axios.get(res?.data?.path, {
        responseType: "arraybuffer",
      });

      if (imageResponse.status === 200) {
        const imageBuffer = Buffer.from(imageResponse.data, "binary");
        await bot.sendPhoto(chatId, imageBuffer, {
          caption: `<code>${res.data.url}</code>`,
          parse_mode: "HTML",
        });
      } else {
        throw new Error("Image URL is not accessible");
      }
    } else {
      await bot.sendMessage(chatId, "Something went wrong!!");
    }
  } catch (err) {
    console.log("🚀 ~ getreferralQrCode ~ err:", err.message);
    await bot.sendMessage(chatId, "Something went wrong!!");
  }
}
// Start Swap
const startSwapProcess = async (chatId) => {
  userStates[chatId].methodTransactions = await bot.sendMessage(
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
      const referralId = finddata?.data?.walletDetails?.referralId;
      return { email, EVMwallet, solanaWallets, referralId };
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
  userStates[chatId].methodTransactions = await bot.sendMessage(
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
  userStates[chatId].methodTransactions = await bot.sendMessage(
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
  userStates[chatId].methodTransactions = await bot.sendMessage(
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
  userStates[chatId].methodTransactions = await bot.sendMessage(
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
  await bot.sendMessage(chatId, `please Login!!🤖💬`, {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
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
    console.log("🚀 ~ getstartBot ~ finddata:", finddata?.data);
    if (finddata?.data?.status) {
      return finddata?.data;
    } else {
      return finddata?.data; // Sending an appropriate message if data is missing
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// solana swap function
async function solanaSwapHandle(chatId, input, output, amount, method, desBot) {
  try {
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios
      .post(`${API_URL}/solanaSwap`, {
        input,
        output,
        amount,
        chatId,
        desBot,
        method,
      })
      .then(async (response) => {
        resetUserState(chatId);
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        if (response?.data?.status) {
          await bot.sendMessage(chatId, `✅ Token buy successful!`);
          await bot.sendMessage(
            chatId,
            `https://solscan.io/tx/${response?.data?.transactionCreated?.txid}`
          );
        } else {
          await bot.sendMessage(
            chatId,
            response.data.message || "❌ buy failed. Please try again."
          );
        }
      })
      .catch(async (err) => {
        console.log("🚀 ~ bot.on ~ err:", err);
        resetUserState(chatId);
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        await bot.sendMessage(
          chatId,
          `due to some reason you transaction failed!!`
        );
      });
  } catch (error) {
    console.log("🚀 ~ solanaSwapHandle ~ error:", error);
  }
}
// EVM swap function
async function evmSwapHandle(amount, chatId, method) {
  try {
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios({
      url: `${API_URL}/EVMswap`,
      method: "post",
      data: {
        tokenIn: userStates[chatId]?.fromToken,
        tokenOut: userStates[chatId]?.toToken,
        chainId: userStates[chatId]?.network,
        amount,
        chain: userStates[chatId]?.flag,
        chatId,
        method,
      },
    })
      .then(async (response) => {
        resetUserState(chatId);
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        if (response?.data?.status) {
          await bot.sendMessage(chatId, `✅ ${response?.data?.message}`);
          return await bot.sendMessage(chatId, response?.data?.txUrl);
        } else {
          await bot.sendMessage(chatId, response?.data?.message);
        }
      })
      .catch(async (error) => {
        resetUserState(chatId);
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        await bot.sendMessage(
          chatId,
          `due to some reason you transaction failed!!`
        );
      });
  } catch (error) {
    console.log("🚀 ~ evmSwapHandle ~ error:", error);
  }
}

// setting function
async function setting(chatId) {
  const userInfo = await getEmailAndWalletFromBackend(chatId);
  if (userInfo?.email) {
    const messageText = `🌊 personal Info! 🌊\n
  *Your Email Address: <code>${userInfo?.email}</code>\n
  *Your referralId: <code>${userInfo?.referralId}</code>\n
  *Your Wallet Address (EVM): <code>${userInfo?.EVMwallet}</code>\n
  *Your Wallet Address (Solana): <code>${userInfo?.solanaWallets}</code>`;
    await bot.sendMessage(chatId, messageText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Invite",
              callback_data: "referralQr",
            },
            { text: "❗️ Help", callback_data: "helpButton" },
          ],
        ],
      },
    });
  } else {
    await loginLogOutButton(chatId);
  }
}
// Function to start the bot session
async function start(chatId) {
  flag = null;
  const userInfo = await getEmailAndWalletFromBackend(chatId);
  if (userInfo?.email) {
    const messageText = `🌊 Follow WaveBotApp on Social Media! 🌊\n
🌊 WaveBot(https://wavebot.app/)\n
🐦 Twitter: https://x.com/WaveBotApp\n
💬 Discord: https://discord.gg/w4tFdAA7\n
👥 Telegram Community: https://t.me/+MX1exQQYjWkxZjBl\n
📢 Telegram Announcements: https://t.me/WaveAnnouncements\n
📸 Instagram: https://www.instagram.com/wavebotapp/\n
🎵 TikTok: https://www.tiktok.com/@wavebotapp\n
📺 YouTube: https://www.youtube.com/@WaveBotApp\n
👾 Reddit: https://www.reddit.com/user/wavebotapp/\n
✍️ Medium: https://medium.com/@wavebotapp\n
💼 LinkedIn: https://www.linkedin.com/company/wave_protocol/?viewAsMember=true\n
📘 Facebook: https://www.facebook.com/profile.php?id=61560842638941\n
  ‧‧────────────────‧‧\n`;
    sendWelcomeMessage2(chatId);
    await bot.sendMessage(chatId, messageText, {
      reply_markup: JSON.stringify(buyKeyboard),
    });
  } else {
    await loginLogOutButton(chatId);
  }
}
// Function to fetch Solana balance
async function fetchSolanaBalance(chatId) {
  try {
    const response = await axios.post(`${API_URL}/solanaBalance`, {
      chatId: chatId,
    });
    const balances = response?.data;
    let message = "Your Solana Wallet balances:\n\n";
    if (balances) {
      message += `Token Name: Sol\n`;
      message += `Balance: ${
        response?.data?.native ? response?.data?.native : "0.00000"
      }\n\n`;

      balances?.data?.slice(0, 4)?.forEach((balance) => {
        message += `Token Name: ${balance?.name}\n`;
        message += `Balance: ${balance?.amount}\n\n`;
      });
      if (balances?.data?.length > 4) {
        message += `For More info (https://solscan.io/account/${response?.data?.walletAddress})\n\n`;
        message += "Thank you for using our service! ✌️";
      }
      await bot.sendMessage(chatId, message);
    }
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

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  // Handle '/start' command
  if (msg.text === "/start") {
    resetUserState(chatId);
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      await sendWelcomeMessage(chatId);
    } else {
      await start(chatId);
    }
  }
  // Handle 'SignUp' command
  else if (msg.text === "SignUp") {
    resetUserState(chatId);
    userStates[chatId].method = "signupUser";
    userStates[chatId].flag = "signupUser";
    await handleSignUp(chatId);
  }
  // Handle 'Login' command
  else if (msg.text === "Login") {
    resetUserState(chatId);
    userStates[chatId].method = "loginUser";
    userStates[chatId].flag = "loginUser";
    await handleLogin(chatId);
  }
  // Handle 'Start' command
  else if (msg.text === "Start") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await start(chatId);
  } else if (msg.text === "/buy") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    buyStartTokenSelection(chatId);
  } else if (msg.text === "/sell") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    sellStartTokenSelection(chatId);
  } else if (msg.text === "/withdraw") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    withrawStartTokenSelection(chatId);
  } else if (msg.text === "/invite") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await setting(chatId);
  } else if (msg.text === "/swap") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await startSwapProcess(chatId);
  }
});

// take input from user for swap , sell, buy, transfer, logoutUser, signupUser
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!userStates[chatId] || !userStates[chatId].flag) {
    return;
  }
  const state = userStates[chatId];
  const text = msg.text;
  switch (state.method) {
    case "swap":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }

      switch (state.currentStep) {
        case "fromTokenSwap":
          state.fromToken = text;
          state.currentStep = "toTokenSwap";
          await bot.sendMessage(chatId, "Type To Token:");
          break;

        case "toTokenSwap":
          state.toToken = text;
          state.currentStep = "amountSwap";
          await bot.sendMessage(chatId, "Please enter the amount to swap:");
          break;

        case "amountSwap":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.amount = Number(text);
            const { loaderMessage, interval } = await animateLoader(chatId);
            if (state.flag == 19999) {
              await axios
                .post(`${API_URL}/solanaSwap`, {
                  input: state?.fromToken,
                  output: state?.toToken,
                  amount: state?.amount,
                  chatId,
                  method: "Swap",
                })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    resetUserState(chatId);
                    await bot.sendMessage(chatId, "✅ solana swap successfull");
                  } else {
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      "somthing has been wrong in solana swap!!!"
                    );
                  }
                })
                .catch(async (err) => {
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  await bot.sendMessage(chatId, err?.message);
                });
            } else {
              response = await axios
                .post(`${API_URL}/EVMswap`, {
                  tokenIn: state?.fromToken,
                  tokenOut: state?.toToken,
                  chainId: state?.network,
                  amount: state?.amount,
                  chain: state?.flag,
                  chatId,
                  method: "Swap",
                })
                .then(async (res) => {
                  // await deleteAllmessages(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  resetUserState(chatId);
                  if (res?.data?.status) {
                    await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
                    return await bot.sendMessage(chatId, res?.data?.txUrl);
                  } else {
                    await bot.sendMessage(
                      chatId,
                      `somthing has been wrong in swap!!!`
                    );
                  }
                })
                .catch(async (err) => {
                  // await deleteAllmessages(chatId);
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  return await bot.sendMessage(chatId, err?.message);
                });
            }
          }
          break;
      }
      break;
    case "buy":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }
      switch (state.currentStep) {
        case "fromTokenBuy":
          state.toToken = text;
          try {
            const { loaderMessage, interval } = await animateLoader(chatId);
            if (state?.flag == 19999) {
              await axios
                .post(`${API_URL}/getSolanaSingleTokenPrice`, {
                  address: state?.toToken,
                })
                .then(async (res) => {
                  console.log("🚀 ~ bot.on ~ res:", res?.data?.data);
                  if (res?.data?.status) {
                    await axios
                      .post(`${API_URL}/solanaBalance`, {
                        chatId,
                      })
                      .then(async (response) => {
                        state.toBuyAddresName = res?.data?.data?.name;
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        await bot.sendMessage(
                          chatId,
                          `Balance : ${Number(response?.data?.native)?.toFixed(
                            5
                          )}sol
Token : ${res?.data?.data?.name} <code>${res?.data?.data?.address}</code>
${res?.data?.data?.name} price : ${Number(res?.data?.data?.price)?.toFixed(
                            6
                          )}$
https://dexscreener.com/solana/${state.toToken}`,
                          {
                            parse_mode: "HTML",
                            reply_markup: {
                              inline_keyboard: [
                                [
                                  {
                                    text: "⬅️ Back",
                                    callback_data: "buyButton",
                                  },
                                  {
                                    text: "🔄 Refresh",
                                    callback_data: "refreshButton",
                                  },
                                ],
                                [
                                  {
                                    text: "0.5 SOL",
                                    callback_data: "0.5Sol",
                                  },
                                  {
                                    text: "1 SOL",
                                    callback_data: "1Sol",
                                  },
                                  {
                                    text: "3 SOL",
                                    callback_data: "3Sol",
                                  },
                                ],
                                [
                                  {
                                    text: "5 SOL",
                                    callback_data: "5Sol",
                                  },
                                  {
                                    text: "10 SOL",
                                    callback_data: "10Sol",
                                  },
                                  {
                                    text: "SOL ✏️",
                                    callback_data: "customSol",
                                  },
                                ],
                              ],
                            },
                          }
                        );
                      })
                      .catch(async (err) => {
                        clearInterval(interval);
                        await bot.deleteMessage(
                          chatId,
                          loaderMessage.message_id
                        );
                        console.log("🚀 ~ .then ~ err:", err);
                        await bot.sendMessage(
                          chatId,
                          "somthing has been wrong plase try again later!!"
                        );
                      });
                  } else {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      "Token you entered is not supported!!"
                    );
                  }
                })
                .catch(async (error) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  console.log("🚀 ~ .then ~ error:", error?.message);
                  await bot.sendMessage(
                    chatId,
                    "somthing has been wrong while fetching token price!!"
                  );
                });
            } else {
              await axios
                .post(`${API_URL}/getSingleTokenPrice`, {
                  chain: state.flag,
                  address: state.toToken,
                  nativeToken: state?.fromToken,
                  chatId,
                })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    state.toBuyAddresName = res?.data?.data?.tokenSymbol;
                    await bot.sendMessage(
                      chatId,
                      `${
                        res?.data?.nativeToken[0]
                          ? res?.data?.nativeToken[0]?.symbol
                          : ""
                      } Balance: ${Number(
                        res?.data?.nativeToken[0]
                          ? res?.data?.nativeToken[0]?.balance_formatted
                          : 0.0
                      ).toFixed(4)}(${Number(
                        res?.data?.nativeToken[0]
                          ? res?.data?.nativeToken[0]?.usd_value
                          : 0
                      ).toFixed(4)} USD)
Token : ${res?.data?.data?.tokenSymbol}  <code>${
                        res?.data?.data?.tokenAddress
                      }</code>
${res?.data?.data?.tokenName} price : ${Number(
                        res?.data?.data?.usdPriceFormatted
                      )?.toFixed(5)}$
24hrPercentChange : ${Number(res?.data?.data["24hrPercentChange"])?.toFixed(3)}%
network : ${state?.network}
${
  !res?.data?.nativeToken[0]
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${state?.network}/${state.toToken}`,
                      {
                        parse_mode: "HTML",
                        reply_markup: {
                          inline_keyboard: [
                            [
                              {
                                text: "⬅️ Back",
                                callback_data: "buyButton",
                              },
                              {
                                text: "🔄 Refresh",
                                callback_data: "refreshButton",
                              },
                            ],
                            [
                              {
                                text: `0.5 ${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                }`,
                                callback_data: "0.5EVM",
                              },
                              {
                                text: `1 ${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                }`,
                                callback_data: "1EVM",
                              },
                              {
                                text: `3 ${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                }`,
                                callback_data: "3EVM",
                              },
                            ],
                            [
                              {
                                text: `5 ${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                }`,
                                callback_data: "5EVM",
                              },
                              {
                                text: `10 ${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                }`,
                                callback_data: "10EVM",
                              },
                              {
                                text: `${
                                  res?.data?.nativeToken[0]
                                    ? res?.data?.nativeToken[0]?.symbol
                                    : ""
                                } ✏️`,
                                callback_data: "customEVM",
                              },
                            ],
                          ],
                        },
                      }
                    );
                  } else {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      "🔴Token you entered is not supported!!"
                    );
                  }
                })
                .catch(async (error) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  console.log("🚀 ~ .then ~ error:", error?.message);
                  await bot.sendMessage(
                    chatId,
                    "🔴somthing has been wrong while fetching token price!!"
                  );
                });
            }
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error);
            resetUserState(chatId);
            await bot.sendMessage(
              chatId,
              "🔴Token you entered is not supported or may be wrong!!"
            );
          }
          break;
        case "amountBuy":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.amount = Number(text);
            if (state.flag == 19999) {
              await solanaSwapHandle(
                chatId,
                "So11111111111111111111111111111111111111112",
                state?.toToken,
                Number(state.amount?.toFixed(5)),
                "Buy",
                9
              );
            } else {
              evmSwapHandle(state.amount, chatId, "Buy");
            }
          }
          break;
      }
      break;

    case "sell":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }

      switch (state.currentStep) {
        case "toTokenSell":
          state.fromToken = text;
          state.currentStep = "amountSell";
          await bot.sendMessage(chatId, "Please enter amount:");
          break;

        case "amountSell":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.amount = Number(text);
            const { loaderMessage, interval } = await animateLoader(chatId);
            if (state.flag == 19999) {
              response = await axios
                .post(`${API_URL}/solanaSwap`, {
                  input: state?.fromToken,
                  output: "So11111111111111111111111111111111111111112",
                  amount: state?.amount,
                  chatId,
                  method: "Sell",
                })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      "✅ Transaction Successfull!!"
                    );
                    return await bot.sendMessage(
                      chatId,
                      `https://solscan.io/tx/${res?.data?.transactionCreated?.txid}`
                    );
                  } else {
                    resetUserState(chatId);
                    return await bot.sendMessage(chatId, res?.data?.message);
                  }
                })
                .catch(async (err) => {
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  return await bot.sendMessage(chatId, err?.message);
                });
            } else {
              response = await axios
                .post(`${API_URL}/EVMswap`, {
                  tokenIn: state?.fromToken,
                  tokenOut: state?.toToken,
                  chainId: state?.network,
                  amount: state?.amount,
                  chain: state?.flag,
                  chatId,
                  method: "Sell",
                })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  resetUserState(chatId);
                  if (res?.data?.status) {
                    await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
                    return await bot.sendMessage(chatId, res?.data?.txUrl);
                  } else {
                    return await bot.sendMessage(
                      chatId,
                      `somthing has been wrong in swap!!!`
                    );
                  }
                })
                .catch(async (err) => {
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  return await bot.sendMessage(chatId, err?.message);
                });
            }
          }
          break;
      }
      break;
    case "transfer":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }

      switch (state.currentStep) {
        case "tokenTransfer":
          state.fromToken = text;
          state.currentStep = "toWalletTransfer";
          await bot.sendMessage(chatId, "Type To Wallet Address:");
          break;

        case "toWalletTransfer":
          state.toToken = text;
          state.currentStep = "amountTransfer";
          await bot.sendMessage(chatId, "Please enter amount:");
          break;

        case "amountTransfer":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.amount = Number(text);
            const { loaderMessage, interval } = await animateLoader(chatId);
            if (state.flag == 19999) {
              await axios({
                url: `${API_URL}/transferSolanaToken`,
                method: "post",
                data: {
                  chatId,
                  toWallet: state?.toToken,
                  token: state?.fromToken,
                  amount: state.amount,
                },
              })
                .then(async (res) => {
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    console.log("🚀 ~ .then ~ res?.data?.tx:", res?.data?.tx);
                    await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
                    await bot.sendMessage(
                      chatId,
                      `https://solscan.io/tx/${res?.data?.tx}`
                    );
                  } else {
                    await bot.sendMessage(chatId, res?.data?.message);
                  }
                })
                .catch(async (error) => {
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  console.log("🚀 ~ awaitbot.once ~ error:", error);
                  await bot.sendMessage(
                    chatId,
                    "due to high transaction volume in solana you transaction has been faild!!"
                  );
                });
            } else {
              await axios({
                url: `${API_URL}/transferEvmToken`,
                method: "post",
                data: {
                  chatId,
                  token: state?.fromToken,
                  toWallet: state?.toToken,
                  chain: state?.flag,
                  amount: state?.amount,
                },
              })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
                    await bot.sendMessage(chatId, res?.data?.txUrl);
                  } else {
                    await bot.sendMessage(
                      chatId,
                      "somthing has been wrong make sure you have a enough balance!!"
                    );
                  }
                })
                .catch(async (error) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  console.log("🚀 ~ bot.on ~ error:", error?.message);
                  await bot.sendMessage(
                    chatId,
                    "somthing has been wrong please try again latter!!"
                  );
                });
            }
          }
          break;
      }
      break;
    case "loginUser":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }
      switch (state.currentStep) {
        case "loginEmail":
          state.currentStep = "userPasswordLogin";
          break;
        case "userPasswordLogin":
          if (!isValidEmail(text)) {
            state.currentStep = "userPasswordLogin";
            return await bot.sendMessage(
              chatId,
              "🔐invalid email please re-enter your email:"
            );
          }
          state.email = text;
          state.currentStep = "loginApi";
          await bot.sendMessage(chatId, "🔐 please enter your password:");
          break;

        case "loginApi":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.password = text;
            const { loaderMessage, interval } = await animateLoader(chatId);
            await axios
              .post(`${API_URL}/login`, {
                email: state?.email,
                password: state?.password,
                chatId,
              })
              .then(async (response) => {
                resetUserState(chatId);
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                if (response.data.status === true) {
                  await bot.sendMessage(chatId, `✅ Login successfull!`);
                  await start(chatId);
                } else {
                  await bot.sendMessage(
                    chatId,
                    `❌ Invalid email or password. Please try again.`,
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
              })
              .catch(async (error) => {
                resetUserState(chatId);
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                console.error("Error:", error.message);
                await bot.sendMessage(
                  chatId,
                  `❌ An error occurred while logging in: ${error.message}`,
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
              });
          }

          break;
      }
      break;
    case "signupUser":
      if (!userStates[chatId] || !userStates[chatId].flag) {
        return;
      }

      switch (state.currentStep) {
        case "signupHandle":
          state.currentStep = "userNameSignup";
          break;
        case "userNameSignup":
          state.name = text;
          state.currentStep = "userEmailSignup";
          await bot.sendMessage(chatId, "🔐 please enter your email:");
          break;
        case "userEmailSignup":
          if (!isValidEmail(text)) {
            state.currentStep = "userEmailSignup";
            return await bot.sendMessage(
              chatId,
              "🔐invalid email please re-enter your email:"
            );
          }
          state.email = text;
          state.currentStep = "userPasswordSignUp";
          await bot.sendMessage(chatId, "🔐 please enter your password:");
          break;
        case "userPasswordSignUp":
          if (!isValidPassword(text)) {
            await bot.sendMessage(
              chatId,
              "❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
            );
            state.currentStep = "userPasswordSignUp";
            return await bot.sendMessage(
              chatId,
              "🔐please re-enter your password:"
            );
          }
          state.password = text;
          state.currentStep = "userConfirmPasswordSignUp";
          await bot.sendMessage(
            chatId,
            "🔐 please enter confirm your password:"
          );
          break;

        case "userConfirmPasswordSignUp":
          if (state?.password != text) {
            state.currentStep = "userPasswordSignUp";
            return await bot.sendMessage(
              chatId,
              "🔐 Password and confirm password does not match please re-enter password:"
            );
          }
          state.confirmPassword = text;
          state.currentStep = "userReferralSignUp";
          await bot.sendMessage(
            chatId,
            "Enter referral code If you have otherwise type 0 to continue"
          );
          break;
        case "userReferralSignUp":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            if (text != 0) {
              state.referral = text;
            } else {
              state.referral = null;
            }
            await axios
              .post(`${API_URL}/signup`, {
                name: state?.name,
                email: state?.email,
                password: state?.password,
                confirmPassword: state?.confirmPassword,
                chatId,
                refferal: state?.referral?.toString(),
              })
              .then(async (res) => {
                if (res?.data?.status) {
                  state.currentStep = "userOtpSignUp";
                  await bot.sendMessage(
                    chatId,
                    "📧 Please check your email and enter verification code:"
                  );
                } else {
                  resetUserState(chatId);
                  await bot.sendMessage(
                    chatId,
                    `${res?.data?.msg} please register again!!`,
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
              })
              .catch(async (error) => {
                resetUserState(chatId);
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                console.log("🚀 ~ .then ~ error:", error);
                await bot.sendMessage(
                  chatId,
                  "❌ An error occurred while register in please try again",
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
                        //[{ text: 'Start', request_contact: false, request_location: false }],
                      ],
                      resize_keyboard: true,
                      one_time_keyboard: true,
                    },
                  }
                );
              });
          }
          break;
        case "userOtpSignUp":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite"
          ) {
            resetUserState(chatId);
          } else {
            state.otp = text;
            const { loaderMessage, interval } = await animateLoader(chatId);
            await axios
              .post(`${API_URL}/verify`, {
                email: state?.email,
                otp: state?.otp,
                chatId,
              })
              .then(async (res) => {
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                if (res?.data?.status) {
                  await bot.sendMessage(
                    chatId,
                    `🎉 User registered successfully.`
                  );
                  await start(chatId);
                } else {
                  state.currentStep = "userOtpSignUp";
                  await bot.sendMessage(
                    chatId,
                    `🔐 Invalid OTP. Please re-enter a valid OTP.`
                  );
                }
              })
              .catch(async (error) => {
                resetUserState(chatId);
                await bot.sendMessage(
                  chatId,
                  "❌ An error occurred while register in please try again",
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
                        //[{ text: 'Start', request_contact: false, request_location: false }],
                      ],
                      resize_keyboard: true,
                      one_time_keyboard: true,
                    },
                  }
                );
              });
          }
          break;
      }
      break;
    default:
      break;
  }
});

// all keyborad button handler
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const isUser = await getstartBot(chatId);
  console.log("🚀 ~ bot.on ~ isUser:", isUser);
  if (!isUser?.status) {
    return await bot.sendMessage(chatId, "please login!!", {
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
  // await deleteAllmessages(chatId);
  // Ensure there is a state object for the user
  if (!userStates[chatId]) {
    resetUserState(chatId);
  }
  switch (data) {
    case "menuButton":
      resetUserState(chatId);
      await bot.sendMessage(chatId, "Click Menu Button");
      break;
    case "SwaptokenButton":
      resetUserState(chatId);
      await startSwapProcess(chatId);
      break;
    case "settingButton":
      resetUserState(chatId);
      await setting(chatId);
      break;
    case "referralQr":
      resetUserState(chatId);
      await getreferralQrCode(chatId, isUser?.isLogin?.referralId);
      break;
    case "SolonabalanceButton":
      resetUserState(chatId);
      fetchSolanaBalance(chatId);
      break;
    case "balanceButton":
      resetUserState(chatId);
      userStates[chatId].methodTransactions = await bot.sendMessage(
        chatId,
        `🌟 Choose a network 🌟`,
        {
          reply_markup: JSON.stringify(evmWalletBalance),
        }
      );

      break;
    case "logoutButton":
      resetUserState(chatId);
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

      break;
    case "buyButton":
      resetUserState(chatId);
      buyStartTokenSelection(chatId);
      break;
    case "0.5Sol":
      if (userStates[chatId]?.flag == 19999) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          0.5,
          "Buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "1Sol":
      if (userStates[chatId]?.flag == 19999) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          1,
          "Buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "3Sol":
      if (userStates[chatId]?.flag == 19999) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          3,
          "Buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "5Sol":
      if (userStates[chatId]?.flag == 19999) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          5,
          "Buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10Sol":
      if (userStates[chatId]?.flag == 19999) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          10,
          "Buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customSol":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].currentStep = "amountBuy";
        await bot.sendMessage(chatId, "please enter a sol Qty");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "0.5EVM":
      if (userStates[chatId]?.flag) {
        evmSwapHandle(0.5, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "1EVM":
      if (userStates[chatId]?.flag) {
        evmSwapHandle(1, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "3EVM":
      if (userStates[chatId]?.flag) {
        evmSwapHandle(3, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "5EVM":
      if (userStates[chatId]?.flag) {
        evmSwapHandle(5, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10EVM":
      if (userStates[chatId]?.flag) {
        evmSwapHandle(10, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customEVM":
      if (userStates[chatId]?.flag) {
        userStates[chatId].currentStep = "amountBuy";
        await bot.sendMessage(chatId, "please enter Qty");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "sellButton":
      resetUserState(chatId);
      sellStartTokenSelection(chatId);

      break;
    case "withrawButton":
      resetUserState(chatId);
      withrawStartTokenSelection(chatId);
      break;
    case "walletAddresses":
      resetUserState(chatId);
      walletAddressSelection(chatId);

      break;
    case "refreshButton":
      resetUserState(chatId);
      await start(chatId);
      break;
    // -------------------------------------------------- buy ------------------------------------------------------
    case "solBuy":
      resetUserState(chatId);
      userStates[chatId].flag = 19999;
      userStates[chatId].method = "buy";
      handleBuy(chatId);
      break;
    case "42161buy":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xa4b1";
      userStates[chatId].fromToken =
        "0x912CE59144191C1204E64559FE8253a0e49E6548";
      handleBuy(chatId);

      break;
    case "1buy":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ethereum";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x1";
      userStates[chatId].fromToken =
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      handleBuy(chatId);

      break;
    case "10buy":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xa";
      userStates[chatId].fromToken =
        "0x4200000000000000000000000000000000000042";
      handleBuy(chatId);

      break;
    case "137buy":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].network = "polygon";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x89";
      userStates[chatId].fromToken =
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
      handleBuy(chatId);
      break;
    case "8453buy":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x2105";
      userStates[chatId].fromToken =
        "0x4200000000000000000000000000000000000006";
      handleBuy(chatId);

      break;
    case "56buy":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x38";
      userStates[chatId].fromToken =
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      handleBuy(chatId);

      break;
    case "43114buy":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].network = "avalanche";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xa86a";
      userStates[chatId].fromToken =
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
      handleBuy(chatId);

      break;
    case "25buy":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x19";
      userStates[chatId].fromToken =
        "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";
      handleBuy(chatId);

      break;
    case "250buy":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xfa";
      userStates[chatId].fromToken =
        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
      handleBuy(chatId);

      break;
    // ------------------------------------------------ sell -----------------------------------------------------------
    case "solSell":
      resetUserState(chatId);
      userStates[chatId].flag = 19999;
      userStates[chatId].method = "sell";
      handleSell(chatId);

      break;
    case "1sell":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ethereum";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      handleSell(chatId);

      break;
    case "42161sell":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x912CE59144191C1204E64559FE8253a0e49E6548";
      handleSell(chatId);

      break;
    case "10sell":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x4200000000000000000000000000000000000042";
      handleSell(chatId);

      break;
    case "137sell":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].network = "polygon";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
      handleSell(chatId);

      break;
    case "8453sell":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x4200000000000000000000000000000000000006";
      handleSell(chatId);

      break;
    case "56sell":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      handleSell(chatId);

      break;
    case "43114sell":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].method = "sell";
      userStates[chatId].network = "avalanche";
      userStates[chatId].toToken = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
      handleSell(chatId);

      break;
    case "25sell":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";
      handleSell(chatId);

      break;
    case "250sell":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
      handleSell(chatId);

      break;
    // ---------------------------------------------------------------- swap --------------------------------------------------------
    case "solana":
      resetUserState(chatId);
      userStates[chatId].flag = 19999;
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "1":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ethereum";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "42161":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "10":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "137":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].method = "swap";
      userStates[chatId].network = "polygon";
      handleSwap(chatId);

      break;
    case "8453":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "56":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "43114":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].network = "avalanche";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "25":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    case "250":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "swap";
      handleSwap(chatId);

      break;
    // ------------------------------------- balance ---------------------------------------------------
    case "1b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0x1");
      break;
    case "42161b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0xa4b1");

      break;
    case "10b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0xa");

      break;
    case "137b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0x89");

      break;
    case "8453b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0x2105");

      break;
    case "56b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0x38");

      break;
    case "43114b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0xa86a");

      break;
    case "25b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0x19");

      break;
    case "250b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0xfa");

      break;
    // ========================================================= wallet address =====================================================
    case "solanaAddress":
      resetUserState(chatId);
      await getQrCode(chatId, 2);

      break;
    case "addressEVM":
      resetUserState(chatId);
      await getQrCode(chatId, 1);

      break;
    // ------------------------------------------------------ transfer token --------------------------------------------------------
    case "solwithraw":
      resetUserState(chatId);
      userStates[chatId].flag = 19999;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "1withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "42161withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "10withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "137withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "8453withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "56withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "43114withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "25withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    case "250withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].method = "transfer";
      handleTransfer(chatId);

      break;
    default:
      console.log(`Unknown button clicked meet: ${data}`);
  }
});

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log("Bot started!");
