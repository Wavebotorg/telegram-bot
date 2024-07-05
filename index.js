const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { default: axios } = require("axios");
const express = require("express");
const { removeKeyboard } = require("telegraf/markup");
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
    passwordAction: null,
    toToken: null,
    amount: null,
    currentStep: null,
    method: null,
    network: null,
    desCode: null,
    email: null,
    sellSolanaTokensDex: null,
    password: null,
    sellTokensList: userStates[chatId]?.sellTokensList,
    sellSolanaTokensList: userStates[chatId]?.sellSolanaTokensList,
    positionList: userStates[chatId]?.positionList,
    selectedSellSolanaToken: null,
    allSellTokens: null,
    confirmPassword: null,
    otp: null,
    allSellSolanaToken: null,
    name: null,
    refId: null,
    referral: null,
    nativeBalance: null,
    toMsg: null,
    fromMsg: null,
    amountMsg: null,
    toBuyAddresName: null,
    statusFalse: null,
    solanaBuyMessage: null,
    evmSellMessage: userStates[chatId]?.evmSellMessage,
    evmBuyMessage: null,
    buyPrice: null,
    sellPrice: null,
    selectedSellToken: null,
    buyTokenNativename: null,
    customAmountSellEvm: null,
  };
};
const resetUserStateRef = (chatId) => {
  userStates[chatId] = {
    flag: null,
    fromToken: null,
    toToken: null,
    passwordAction: null,
    amount: null,
    currentStep: null,
    allSellTokens: null,
    method: null,
    network: null,
    sellSolanaTokensDex: null,
    sellTokensList: userStates[chatId]?.sellTokensList,
    sellSolanaTokensList: userStates[chatId]?.sellSolanaTokensList,
    positionList: userStates[chatId]?.positionList,
    selectedSellSolanaToken: null,
    desCode: null,
    email: null,
    password: null,
    allSellSolanaToken: null,
    confirmPassword: null,
    otp: null,
    name: null,
    refId: userStates[chatId]?.refId,
    referral: null,
    nativeBalance: null,
    toMsg: null,
    fromMsg: null,
    amountMsg: null,
    toBuyAddresName: null,
    statusFalse: null,
    solanaBuyMessage: null,
    evmSellMessage: userStates[chatId]?.evmSellMessage,
    evmBuyMessage: null,
    buyPrice: null,
    selectedSellToken: null,
    sellPrice: null,
    buyTokenNativename: null,
    customAmountSellEvm: null,
  };
};

// Function to handle swapping for Solana
const handleSwap = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenSwap";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type From Token Address:"
  );
};
const handleBuy = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenBuy";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type Token Address You Want To Buy:"
  );
};
const handleSell = async (chatId) => {
  userStates[chatId].currentStep = "toTokenSellSingle";
  userStates[chatId].toMsg = await bot.sendMessage(
    chatId,
    "Type Token Address You Want To Sell:"
  );
};
const handleTransfer = async (chatId) => {
  userStates[chatId].currentStep = "tokenTransfer";
  userStates[chatId].fromMsg = await bot.sendMessage(
    chatId,
    "Type Token Address You Want To Transfer:"
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

const handleResetPassword = async (chatId, action, email) => {
  console.log("🚀 ~ handleResetPassword ~ action:", action);
  console.log("🚀 ~ handleResetPassword ~ chatId:", chatId);
  console.log("🚀 ~ handleResetPassword ~ email:", email);
  await axios({
    url: `${API_URL}/sendOtp`,
    method: "post",
    data: {
      email: action == "forgot" ? email : null,
      chatId: action == "reset" ? chatId : null,
    },
  }).then(async (res) => {
    if (res?.data?.status) {
      userStates[chatId].currentStep = "getOtp";
      await bot.sendMessage(chatId, "Check you mail and enter the OTP!!");
    } else {
      await bot.sendMessage(
        chatId,
        "🔴 something went wrong please try again later!!"
      );
    }
  });
};

const handleToSell = async (chatId, chainId) => {
  try {
    if (userStates[chatId]?.evmSellMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmSellMessage?.message_id
      );
      userStates[chatId].evmSellMessage = null;
    }
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    await fetchWalletTokenBalances(chatId, chainId);
  } catch (error) {
    console.log("🚀 ~ handleToSell ~ error:", error?.message);
  }
};

const handleToSellSolana = async (chatId) => {
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    if (userStates[chatId]?.evmSellMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmSellMessage?.message_id
      );
      userStates[chatId].evmSellMessage = null;
    }
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    const response = await axios.post(`${API_URL}/solanaBalance`, {
      chatId: chatId,
    });
    const balances = response?.data;
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    let message = "Your Solana tokens:\n\n";
    if (balances) {
      userStates[chatId].allSellSolanaToken = balances?.data;
      message += `Token Name: <code>Sol</code>\n`;
      message += `Balance: <code>${
        response?.data?.native ? response?.data?.native : "0.00000"
      }</code>\n\n`;

      balances?.data?.forEach((balance) => {
        message += `Token Name: <code>${balance?.name}</code>\n`;
        message += `Balance: <code>${balance?.amount}</code>\n\n`;
      });

      const buttons = balances?.data?.map((item) => ({
        text: item.symbol,
        callback_data: `${item.symbol}SellSolana`,
      }));

      const keyboard = [];

      // add dynamic buttons in the keyboard
      for (let i = 0; i < buttons.length; i += 4) {
        keyboard.push(buttons.slice(i, i + 4));
      }

      // add static buttons
      keyboard.push([
        { text: "⬅️ Back", callback_data: "sellButton" },
        { text: "🔄 Refresh", callback_data: "refreshSellButton" },
      ]);

      userStates[chatId].sellTokensList = await bot.sendMessage(
        chatId,
        message,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );
    }
  } catch (error) {
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    console.error("Error fetching balance:", error?.message);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
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
      { text: "🔁 New Pairs", callback_data: "newPairsButton" },
      { text: "📋 Limit Orders", callback_data: "limitButton" },
    ],
    [
      { text: "💰 Balance", callback_data: "balanceButton" },
      { text: "🏦 Wallet Address", callback_data: "walletAddresses" },
    ],
    [
      { text: "👨‍👧‍👦 referrals", callback_data: "totalReferrals" },
      { text: "⚙️ Setting", callback_data: "settingButton" },
    ],
    [
      { text: "🔄 Refresh", callback_data: "refreshButton" },
      { text: "🚪 Logout", callback_data: "logoutButton" },
    ],
  ],
};

// wallet balance keyboard
const evmWalletBalance = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "SolonabalanceButton" },
      { text: "Ethereum", callback_data: "1b" },
      { text: "Base", callback_data: "8453b" },
    ],
    [
      { text: "BSC", callback_data: "56b" },
      { text: "Avalanche", callback_data: "43114b" },
      { text: "Arbitrum", callback_data: "42161b" },
    ],
    [
      { text: "Fantom", callback_data: "250b" },
      { text: "blast", callback_data: "81457b" },
      { text: "Polygon", callback_data: "137b" },
    ],
    [
      { text: "Optimism", callback_data: "10b" },
      { text: "Cronos", callback_data: "25b" },
      { text: "Linea", callback_data: "59144b" },
    ],
  ],
};
// wallet addresses keyboard
const walletAddressKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "solanaAddress" },
      { text: "Ethereum", callback_data: "addressEVM" },
      { text: "Base", callback_data: "addressEVM" },
    ],
    [
      { text: "BSC", callback_data: "addressEVM" },
      { text: "Avalanche", callback_data: "addressEVM" },
      { text: "Arbitrum", callback_data: "addressEVM" },
    ],
    [
      { text: "Fantom", callback_data: "addressEVM" },
      { text: "blast", callback_data: "addressEVM" },
      { text: "Polygon", callback_data: "addressEVM" },
    ],
    [
      { text: "Optimism", callback_data: "addressEVM" },
      { text: "Linea", callback_data: "addressEVM" },
      { text: "Cronos", callback_data: "addressEVM" },
    ],
  ],
};

// positions keyboard
const positionsKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "PositionSolana" },
      { text: "Ethereum", callback_data: "1+Ethereum+Position" },
      { text: "Base", callback_data: "8453+Base+Position" },
    ],
    [
      { text: "BSC", callback_data: "56+Bsc+Position" },
      { text: "Avalanche", callback_data: "43114+Avalanche+Position" },
      { text: "Arbitrum", callback_data: "42161+Arbitrum+Position" },
    ],
    [
      { text: "Fantom", callback_data: "250+Fantom+Position" },
      { text: "blast", callback_data: "PositionBlast" },
      { text: "Polygon", callback_data: "137+Polygon+Position" },
    ],
    [
      { text: "Optimism", callback_data: "10+Optimism+Position" },
      { text: "Linea", callback_data: "59144+Linea+Position" },
      { text: "Cronos", callback_data: "25+Cronos+Position" },
    ],
  ],
};
// swap keyboard
const blockchainKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "solana" },
      { text: "Ethereum", callback_data: "1" },
      { text: "Base", callback_data: "8453" },
    ],
    [
      { text: "BSC", callback_data: "56" },
      { text: "Avalanche", callback_data: "43114" },
      { text: "Arbitrum", callback_data: "42161" },
    ],
    [
      { text: "Fantom", callback_data: "250" },
      { text: "blast", callback_data: "81457" },
      { text: "Polygon", callback_data: "137" },
    ],
    [
      { text: "Optimism", callback_data: "10" },
      { text: "Linea", callback_data: "59144" },
      { text: "Cronos", callback_data: "25" },
    ],
  ],
};
// buy token keyboard
const buyblockchainKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "solBuy" },
      { text: "Ethereum", callback_data: "1buy" },
      { text: "Base", callback_data: "8453buy" },
    ],
    [
      { text: "BSC", callback_data: "56buy" },
      { text: "Avalanche", callback_data: "43114buy" },
      { text: "Arbitrum", callback_data: "42161buy" },
    ],
    [
      { text: "Fantom", callback_data: "250buy" },
      { text: "blast", callback_data: "81457buy" },
      { text: "Polygon", callback_data: "137buy" },
    ],
    [
      { text: "Optimism", callback_data: "10buy" },
      { text: "Linea", callback_data: "59144buy" },
      { text: "Cronos", callback_data: "25buy" },
    ],
  ],
};
// sell token keyboard
const sellblockchainKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "solSellToken" },
      { text: "Ethereum", callback_data: "1sell" },
      { text: "Base", callback_data: "8453sell" },
    ],
    [
      { text: "BSC", callback_data: "56sell" },
      { text: "Avalanche", callback_data: "43114sell" },
      { text: "Arbitrum", callback_data: "42161sell" },
    ],
    [
      { text: "Fantom", callback_data: "250sell" },
      { text: "blast", callback_data: "81457sell" },
      { text: "Polygon", callback_data: "137sell" },
    ],
    [
      { text: "Optimism", callback_data: "10sell" },
      { text: "Linea", callback_data: "59144sell" },
      { text: "Cronos", callback_data: "25sell" },
    ],
  ],
};
// withraw token keyboard
const withrawblockchainKeyboard = {
  inline_keyboard: [
    [
      { text: "Solona", callback_data: "solwithraw" },
      { text: "Ethereum", callback_data: "1withraw" },
      { text: "Base", callback_data: "8453withraw" },
    ],
    [
      { text: "BSC", callback_data: "56withraw" },
      { text: "Avalanche", callback_data: "43114withraw" },
      { text: "Arbitrum", callback_data: "42161withraw" },
    ],
    [
      { text: "Fantom", callback_data: "250withraw" },
      { text: "blast", callback_data: "81457withraw" },
      { text: "Polygon", callback_data: "137withraw" },
    ],
    [
      { text: "Optimism", callback_data: "10withraw" },
      { text: "Linea", callback_data: "59144withraw" },
      { text: "Cronos", callback_data: "25withraw" },
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
  } catch (error) {}
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
        caption: `${wallet == 2 ? "Solana wallet" : "Eth Wallet"}:- <code>${
          res?.data?.walletAddress
        }</code>(Tap to copy)`,
        parse_mode: "HTML",
      });
    } else {
      bot.sendMessage(chatId, "somthing has been wrong!!");
    }
  });
}

// get referral QR code
async function getreferralQrCode(chatId, referralId) {
  try {
    const res = await axios.post(`${API_URL}/getInviteQrCode`, { referralId });

    if (res?.data?.status) {
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

// position keyboard
const positionsChainSelection = async (chatId) => {
  userStates[chatId].methodTransactions = await bot.sendMessage(
    chatId,
    `🌟 Choose a blockchain 🌟
Great! Let's get started. Please select your preferred blockchain 
from the options below:`,
    {
      reply_markup: JSON.stringify(positionsKeyboard),
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
        [
          {
            text: "ForgotPassword",
            request_contact: false,
            request_location: false,
          },
        ],
      ];
  await bot.sendMessage(chatId, `please Login!!🤖💬`, {
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
        [
          {
            text: "ForgotPassword",
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
// get User Data
async function getstartBot(chatId) {
  try {
    const finddata = await axios.post(`${API_URL}/startBot`, { chatId });
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
  if (
    userStates[chatId]?.nativeBalance < amount ||
    !userStates[chatId]?.nativeBalance
  ) {
    resetUserState(chatId);
    return bot.sendMessage(
      chatId,
      "🔴 You do not have sufficient fund + gas to perform this transaction!!",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back",
                callback_data: "buyButton",
              },
              {
                text: "⬆️ Main Menu",
                callback_data: "refreshButton",
              },
            ],
          ],

          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    try {
      const { loaderMessage, interval } = await animateLoader(chatId);
      await axios
        .post(`${API_URL}/solanaSwap`, {
          input,
          output,
          amount: Number(amount),
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
              `🔴 ${response.data.message}` ||
                "🔴 buy failed. Please try again later."
            );
          }
        })
        .catch(async (err) => {
          resetUserState(chatId);
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          await bot.sendMessage(
            chatId,
            `🔴due to some reason you transaction failed please try again later!!`
          );
        });
    } catch (error) {
      await bot.sendMessage(
        chatId,
        `🔴due to some reason you transaction failed please try again later!!`
      );
    }
  }
}
// EVM swap function
async function evmSwapHandle(amount, chatId, method) {
  if (
    userStates[chatId]?.buyTokenNativename?.balance_formatted < amount ||
    !userStates[chatId]?.buyTokenNativename?.balance_formatted
  ) {
    resetUserState(chatId);
    return bot.sendMessage(
      chatId,
      "🔴 You do not have sufficient fund+gas to perform this transaction!!",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back",
                callback_data: "buyButton",
              },
              {
                text: "⬆️ Main Menu",
                callback_data: "refreshButton",
              },
            ],
          ],

          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    try {
      const { loaderMessage, interval } = await animateLoader(chatId);
      await axios({
        url: `${API_URL}/EVMBuy`,
        method: "post",
        data: {
          tokenIn: userStates[chatId]?.fromToken,
          tokenOut: userStates[chatId]?.toToken,
          chainId: userStates[chatId]?.network,
          amount: Number(amount),
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
            await bot.sendMessage(chatId, `🔴 ${response?.data?.message}`);
          }
        })
        .catch(async (error) => {
          resetUserState(chatId);
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          await bot.sendMessage(
            chatId,
            `🔴 due to some reason you transaction failed!!`
          );
        });
    } catch (error) {}
  }
}

// EVM sell function

async function evmSellHandle(amount, chatId) {
  if (
    userStates[chatId]?.selectedSellToken?.balance_formatted < amount ||
    !userStates[chatId]?.selectedSellToken?.balance_formatted
  ) {
    resetUserState(chatId);
    return bot.sendMessage(
      chatId,
      "🔴 You do not have sufficient fund+gas to perform this transaction!!",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back",
                callback_data: "sellButton",
              },
              {
                text: "⬆️ Main Menu",
                callback_data: "refreshButton",
              },
            ],
          ],

          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios
      .post(`${API_URL}/EVMswap`, {
        tokenIn: userStates[chatId]?.selectedSellToken?.token_address,
        tokenOut: userStates[chatId]?.toToken,
        chainId: userStates[chatId]?.network,
        amount: amount,
        chain: userStates[chatId]?.flag,
        chatId,
        method: "sell",
      })
      .then(async (res) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        resetUserState(chatId);
        if (res?.data?.status) {
          await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
          return await bot.sendMessage(chatId, res?.data?.txUrl);
        } else {
          return await bot.sendMessage(chatId, `🔴 ${res?.data?.message}`);
        }
      })
      .catch(async (err) => {
        resetUserState(chatId);
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        return await bot.sendMessage(chatId, `🔴 ${err?.message}`);
      });
  }
}

async function solanaSellHandle(chatId) {
  console.log(
    "solana balance",
    userStates[chatId]?.selectedSellSolanaToken?.amount
  );
  console.log("amount that you entered", userStates[chatId]?.sellPrice);
  if (
    Number(userStates[chatId]?.selectedSellSolanaToken?.amount) <
    Number(userStates[chatId]?.sellPrice)
  ) {
    resetUserState(chatId);
    return bot.sendMessage(
      chatId,
      "🔴 You do not have sufficient fund + gas to perform this transaction solana!!",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back",
                callback_data: "sellButton",
              },
              {
                text: "⬆️ Main Menu",
                callback_data: "refreshButton",
              },
            ],
          ],

          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    const { loaderMessage, interval } = await animateLoader(chatId);
    try {
      await axios
        .post(`${API_URL}/solanaSwap`, {
          input: userStates[chatId]?.selectedSellSolanaToken?.mint,
          output: "So11111111111111111111111111111111111111112",
          amount: userStates[chatId]?.sellPrice,
          chatId,
          method: "sell",
        })
        .then(async (res) => {
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          if (res?.data?.status) {
            resetUserState(chatId);
            await bot.sendMessage(chatId, "✅ Transaction Successfull!!");
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
    } catch (error) {
      resetUserState(chatId);
      clearInterval(interval);
      await bot.deleteMessage(chatId, loaderMessage.message_id);
      console.log("🚀 ~ solanaSellHandle ~ error:", error);
      await bot.sendMessage(
        chatId,
        "🔴 somthing went wrong plase try again later!!"
      );
    }
  }
}

// setting function
async function setting(chatId) {
  const userInfo = await getEmailAndWalletFromBackend(chatId);
  if (userInfo?.email) {
    const messageText = `🌊 personal Info! 🌊\n
  *Your Email Address: <code>${userInfo?.email}</code> (Tap to copy)\n
  *Your referralId: <code>${userInfo?.referralId}</code> (Tap to copy)\n
  *Your bot Invite Link: <code>https://t.me/onchain_wavebot?start=${userInfo?.referralId}</code> (Tap to copy)\n
  *Your Wallet Address (EVM): <code>${userInfo?.EVMwallet}</code> (Tap to copy)\n
  *Your Wallet Address (Solana): <code>${userInfo?.solanaWallets}</code> (Tap to copy)`;
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
            { text: "resetPassword", callback_data: "resetPassword" },
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
  const userInfo = await getEmailAndWalletFromBackend(chatId);
  if (userInfo?.email) {
    const messageText = `🌊 Follow WaveBotApp on Social Media! 🌊\n
Join Our Telegram Group: https://t.me/WaveUsers\n
Wave Socials : https://linktr.ee/wavebot
  ‧‧────────────────‧‧
*Your Wallet Address (EVM): <code>${userInfo?.EVMwallet}</code> (Tap to copy)\n
*Your Wallet Address (Solana): <code>${userInfo?.solanaWallets}</code> (Tap to copy)`;
    await bot.sendMessage(chatId, messageText, {
      reply_markup: JSON.stringify(buyKeyboard),
      parse_mode: "HTML",
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

// Function to fetch wallet tokens balances
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

// Function to fetch wallet balances
async function fetchWalletTokenBalances(chatId, chainId) {
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    const response = await axios.post(`${API_URL}/fetchbalance`, {
      chatId: chatId,
      chainId: chainId,
    });
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage?.message_id);

    const balances = response?.data?.data;
    const tokens = balances?.filter((item) => item?.usd_price != null);
    userStates[chatId].allSellTokens = tokens;

    let message = "✨ Your Tokens:\n\n";
    if (tokens) {
      tokens?.forEach((balance) => {
        message += `🏷 Token Name: <code>${balance?.symbol}</code>\n`;
        message += `💰 Balance: <code>${Number(
          balance?.balance_formatted
        ).toFixed(4)}</code>(${Number(balance?.usd_value).toFixed(5)}$)\n\n`;
      });
    }
    const buttons = tokens.map((item) => ({
      text: item.symbol,
      callback_data: `${item.symbol}Sell`,
    }));

    const keyboard = [];

    // add dynamic buttons in the keyboard
    for (let i = 1; i < buttons.length; i += 4) {
      keyboard.push(buttons.slice(i, i + 4));
    }

    // add static buttons
    keyboard.push([
      { text: "⬅️ Back", callback_data: "sellButton" },
      { text: "🔄 Refresh", callback_data: "refreshSellButton" },
    ]);

    userStates[chatId].sellTokensList = await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
      parse_mode: "HTML",
    });
  } catch (error) {
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    console.error("Error fetching balance:", error.message);
    await bot.sendMessage(
      chatId,
      "🔴 Something went wrong, please try again after some time!!"
    );
  }
}

// Function to handle dynamic sell token button
async function handleDynamicSellToken(chatId, token) {
  try {
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    const tokenDetails = await userStates[chatId]?.allSellTokens?.filter(
      (item) => item.symbol == token
    );
    if (tokenDetails) {
      userStates[chatId].selectedSellToken = tokenDetails[0];
      userStates[chatId].sellPrice = Number(
        (userStates[chatId].selectedSellToken?.usd_value * 10) / 100
      );
      userStates[chatId].evmSellMessage = await bot.sendMessage(
        chatId,
        `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
          userStates[chatId].selectedSellToken?.balance_formatted
        )?.toFixed(5)}</code>(${Number(
          userStates[chatId].selectedSellToken?.usd_value
        ).toFixed(3)}$)
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
          userStates[chatId].selectedSellToken?.usd_price
        )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
          userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
        )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice
        ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
          userStates[chatId].selectedSellToken?.token_address
        }`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                    5
                  )} ${tokenDetails[0]?.symbol}`,
                  callback_data: "10EvmSellPer",
                },
                {
                  text: `Sell 25% ${tokenDetails[0]?.symbol}`,
                  callback_data: "25EvmSellPer",
                },
                {
                  text: `Sell 50% ${tokenDetails[0]?.symbol}`,
                  callback_data: "50EvmSellPer",
                },
              ],
              [
                {
                  text: `Sell 70% ${tokenDetails[0]?.symbol}`,
                  callback_data: "70EvmSellPer",
                },
                {
                  text: `Sell 100% ${tokenDetails[0]?.symbol}`,
                  callback_data: "100EvmSellPer",
                },
                {
                  text: `Sell X amount of${tokenDetails[0]?.symbol} ✏️`,
                  callback_data: "customEvmSellPer",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "finalSellEvm",
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.log("🚀 ~ handleDynamicSellToken ~ error:", error?.message);
    await bot.sendMessage(
      chatId,
      "🔴 Something went wrong, please try again after some time!!"
    );
  }
}

async function handleDynamicSellSolana(chatId, token) {
  console.log("🚀 ~ handleDynamicSellSolana ~ token:", token);
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    const tokenDetails = await userStates[chatId]?.allSellSolanaToken?.filter(
      (item) => item.symbol == token
    );
    console.log("🚀 ~ handleDynamicSellSolana ~ tokenDetails:", tokenDetails);
    if (tokenDetails) {
      userStates[chatId].selectedSellSolanaToken = tokenDetails[0];
      userStates[chatId].sellPrice = Number(
        (tokenDetails[0]?.amount * 10) / 100
      );
      await axios
        .post(`${API_URL}/dexSol`, {
          token: tokenDetails[0]?.mint,
          chatId,
        })
        .then(async (res) => {
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          userStates[chatId].sellSolanaTokensDex = res?.data?.data;
          const balanceInUSD = Number(
            userStates[chatId].selectedSellSolanaToken?.amount *
              userStates[chatId]?.sellSolanaTokensDex?.price
          );
          userStates[chatId].evmSellMessage = await bot.sendMessage(
            chatId,
            `💰 Balance : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana
            )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
              userStates[chatId]?.selectedSellSolanaToken?.amount
            ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(
              4
            )}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
              userStates[chatId]?.sellSolanaTokensDex?.address
            }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price
            )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation24h
            )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.totalSupply
            )?.toFixed()}</code>
🗃  mcap : ${
              userStates[chatId]?.sellSolanaTokensDex?.mcap
                ? Number(
                    userStates[chatId]?.sellSolanaTokensDex?.mcap
                  )?.toFixed()
                : "not available!!"
            }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice
            ).toFixed(5)}$)
https://dexscreener.com/solana/${
              userStates[chatId]?.sellSolanaTokensDex?.address
            }`,
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                        5
                      )} ${tokenDetails[0]?.symbol}`,
                      callback_data: "10EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 25% ${tokenDetails[0]?.symbol}`,
                      callback_data: "25EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 50% ${tokenDetails[0]?.symbol}`,
                      callback_data: "50EvmSellSolanaPer",
                    },
                  ],
                  [
                    {
                      text: `Sell 70% ${tokenDetails[0]?.symbol}`,
                      callback_data: "70EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 100% ${tokenDetails[0]?.symbol}`,
                      callback_data: "100EvmSellSolanaPer",
                    },
                    {
                      text: `Sell X amount of${tokenDetails[0]?.symbol} ✏️`,
                      callback_data: "customEvmSellSolanaPer",
                    },
                  ],
                  [
                    {
                      text: `Sell`,
                      callback_data: "sellSolanafinal",
                    },
                  ],
                ],
              },
            }
          );
        })
        .catch(async (err) => {
          console.log("🚀 ~ .then ~ err:", err?.message);
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          await bot.sendMessage(
            chatId,
            "🔴 somthing wen wrong please try again later!!"
          );
        });
    }
  } catch (error) {
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    console.log("🚀 ~ handleDynamicSellToken ~ error:", error?.message);
    await bot.sendMessage(
      chatId,
      "🔴 Something went wrong, please try again after some time!!"
    );
  }
}

// positions function
async function handlePositions(chatId, chainId, network) {
  console.log("🚀 ~ handlePositions ~ chainId:", chainId);
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    const response = await axios.post(`${API_URL}/getPositions`, {
      chatId: chatId,
      chainId: chainId,
    });
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage?.message_id);

    if (response?.data?.status) {
      const balances = response?.data?.data;
      console.log("🚀 ~ handlePositions ~ balances:", balances);
      userStates[chatId].allPositionTokens = balances?.tokensData;

      let message = "✨ Your Tokens:\n\n";
      message += `🔗 Chain: ${network}\n\n`;
      message += `🏷 Token Name: <code>${
        balances?.nativeToken?.symbol
      }</code>(Native Token)  
💰 Balance: <code>${Number(balances?.nativeToken?.balance_formatted).toFixed(
        4
      )}</code>(${Number(balances?.nativeToken?.usd_value).toFixed(5)}$)
💵 Price: <code>${Number(balances?.nativeToken?.usd_price).toFixed(5)}</code>
${
  balances?.nativeToken?.usd_price_24hr_percent_change >= 0 ? "📉" : "📈"
} usd_price_24hr_percent_change: <code>${Number(
        balances?.nativeToken?.usd_price_24hr_percent_change
      ).toFixed(4)}%</code>
${
  balances?.nativeToken?.usd_price_24hr_usd_change >= 0 ? "📉" : "📈"
} usd_price_24hr_usd_change: <code>${Number(
        balances?.nativeToken?.usd_price_24hr_usd_change
      ).toFixed(4)}%</code>
${
  balances?.nativeToken?.usd_value_24hr_usd_change >= 0 ? "📉" : "📈"
} usd_value_24hr_usd_change: <code>${Number(
        balances?.nativeToken?.usd_value_24hr_usd_change
      ).toFixed(4)}$</code>
📊 portfolio_percentage: <code>${Number(
        balances?.nativeToken?.portfolio_percentage
      ).toFixed(4)}%</code>\n\n
    `;
      if (balances?.tokensData) {
        balances?.tokensData?.forEach((balance) => {
          message += `🏷 Token Name: <code>${balance?.symbol}</code>\n`;
          message += `💰 Balance: <code>${Number(balance?.qty).toFixed(
            4
          )}</code>(${Number(balance?.value_in_usd).toFixed(5)}$)\n`;
          message += `💵 Price_at_buy: <code>${Number(
            balance?.price_at_invested
          ).toFixed(5)}</code>\n`;
          message += `💵 current Price: <code>${Number(
            balance?.currentPrice
          ).toFixed(5)}</code>\n`;
          message += `📊 P&L: <code>${
            Number(balance?.percentage_of_growth) > 0 ? "+" : ""
          }${Number(balance?.percentage_of_growth).toFixed(5)}%</code>\n`;
          message += `${
            balance?.usd_price_24hr_percent_change >= 0 ? "📉" : "📈"
          } usd_price_24hr_percent_change: <code>${Number(
            balance?.usd_price_24hr_percent_change
          ).toFixed(4)}%</code>\n`;
          message += `${
            balance?.usd_price_24hr_usd_change >= 0 ? "📉" : "📈"
          } usd_price_24hr_usd_change: <code>${Number(
            balance?.usd_price_24hr_usd_change
          ).toFixed(4)}%</code>\n`;
          message += `${
            balance?.usd_value_24hr_usd_change >= 0 ? "📉" : "📈"
          } usd_value_24hr_usd_change: <code>${Number(
            balance?.usd_value_24hr_usd_change
          ).toFixed(4)}$</code>\n`;
          message += `📊 portfolio_percentage: <code>${Number(
            balance?.portfolio_percentage
          ).toFixed(4)}%</code>\n\n`;
        });
      }
      userStates[chatId].positionList = await bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
      });
    } else {
      await bot.sendMessage(chatId, "🔴 You do not have any holdings!!");
    }
  } catch (error) {
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    console.error("Error fetching balance:", error.message);
    await bot.sendMessage(
      chatId,
      "🔴 Something went wrong, please try again after some time!!"
    );
  }
}

async function handleSolanaPosition(chatId) {
  try {
    const response = await axios.post(`${API_URL}/solanaBalance`, {
      chatId: chatId,
    });
    const balances = response?.data;
    console.log("🚀 ~ handleSolanaPosition ~ balances:", balances);
    // let message = "Your Solana Wallet balances:\n\n";
    // if (balances) {
    //   message += `Token Name: Sol\n`;
    //   message += `Balance: ${response?.data?.native ? response?.data?.native : "0.00000"
    //     }\n\n`;

    //   balances?.data?.slice(0, 4)?.forEach((balance) => {
    //     message += `Token Name: ${balance?.name}\n`;
    //     message += `Balance: ${balance?.amount}\n\n`;
    //   });
    //   await bot.sendMessage(chatId, message);
    // }
  } catch (error) {
    console.error("Error fetching balance:", error?.message);
    await bot.sendMessage(
      chatId,
      "🔴 Somthing went wrong please try again later!!."
    );
  }
}
// signup by referral
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const pattern = /^\/start\s+\S+/;
  if (pattern.test(msg.text)) {
    resetUserState(chatId);
    const referralLink = msg.text?.split(" ")[1];
    userStates[chatId].refId = referralLink;
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      await sendWelcomeMessage(chatId);
    } else {
      await start(chatId);
    }
  }
});

// main buttons
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
    resetUserStateRef(chatId);
    userStates[chatId].method = "signupUser";
    userStates[chatId].flag = "signupUser";
    await handleSignUp(chatId);
  }
  // Handle 'Login' command
  else if (msg.text === "Login") {
    resetUserStateRef(chatId);
    userStates[chatId].method = "loginUser";
    userStates[chatId].flag = "loginUser";
    await handleLogin(chatId);
  }
  // Handle 'ForgotPassword' command
  else if (msg.text === "ForgotPassword") {
    resetUserState(chatId);
    userStates[chatId].currentStep = "forgotEmail";
    userStates[chatId].passwordAction = "forgot";
    userStates[chatId].method = "resetPasswordHandle";
    userStates[chatId].flag = "resetPasswordHandle";
    await bot.sendMessage(chatId, "Enter your email address: ");
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
  } else if (msg.text === "/evmbalance") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await bot.sendMessage(chatId, `🌟 Choose a network 🌟`, {
      reply_markup: JSON.stringify(evmWalletBalance),
    });
  } else if (msg.text === "/solbalance") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await fetchSolanaBalance(chatId);
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
          await bot.sendMessage(chatId, "Type To Token Address:");
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
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
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
                  method: "swap",
                })
                .then(async (res) => {
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  if (res?.data?.status) {
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      "✅ Transaction successfull!!"
                    );
                    return await bot.sendMessage(
                      chatId,
                      `https://solscan.io/tx/${res?.data?.transactionCreated?.txid}`
                    );
                  } else {
                    resetUserState(chatId);
                    await bot.sendMessage(
                      chatId,
                      ` 🔴 ${res?.data?.message}!!!`
                    );
                  }
                })
                .catch(async (err) => {
                  console.log("🚀 ~ bot.on ~ err:", err?.message);
                  resetUserState(chatId);
                  clearInterval(interval);
                  await bot.deleteMessage(chatId, loaderMessage.message_id);
                  await bot.sendMessage(
                    chatId,
                    "🔴 somthing has been wrong please try again later!!!"
                  );
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
                  method: "swap",
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
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            try {
              const { loaderMessage, interval } = await animateLoader(chatId);
              if (state?.flag == 19999) {
                await axios
                  .post(`${API_URL}/dexSol`, {
                    token: state?.toToken,
                    chatId,
                  })
                  .then(async (res) => {
                    if (res?.data?.status) {
                      state.toBuyAddresName = res?.data?.data?.name;
                      clearInterval(interval);
                      await bot.deleteMessage(chatId, loaderMessage.message_id);
                      state.nativeBalance =
                        res?.data?.data?.nativeTokenDetails?.solana;
                      userStates[chatId].buyPrice = Number(
                        (userStates[chatId]?.nativeBalance * 10) / 100
                      ).toFixed(6);
                      state.solanaBuyMessage = await bot.sendMessage(
                        chatId,
                        `✨ <b>Information of ${res?.data?.data?.name}</b>\n
💰 Balance : <code>${Number(
                          res?.data?.data?.nativeTokenDetails?.solana
                        )?.toFixed(5)}</code>sol
🏷  Name : ${res?.data?.data?.name} 
📭 <code>${res?.data?.data?.address}</code>
💵 ${res?.data?.data?.name} price : <code>${Number(
                          res?.data?.data?.price
                        )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(res?.data?.data?.variation24h)?.toFixed(
                          3
                        )}%</code>
🛒 totalSupply : <code>${Number(res?.data?.data?.totalSupply)?.toFixed()}</code>
🗃 mcap : <code>${
                          res?.data?.data?.mcap
                            ? Number(res?.data?.data?.mcap)?.toFixed()
                            : "not available!!"
                        }</code>
🔗 Chain : "Solana"
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
                                  callback_data: "refreshButtonBuySolana",
                                },
                              ],
                              [
                                {
                                  text: "✅ Buy 10% SOL",
                                  callback_data: "10SolPer",
                                },
                                {
                                  text: "Buy 25% SOL",
                                  callback_data: "25SolPer",
                                },
                                {
                                  text: "Buy 50% SOL",
                                  callback_data: "50SolPer",
                                },
                              ],
                              [
                                {
                                  text: "Buy 75% SOL",
                                  callback_data: "70SolPer",
                                },
                                {
                                  text: "Buy 100% SOL",
                                  callback_data: "100SolPer",
                                },
                                {
                                  text: "Buy X SOL ✏️",
                                  callback_data: "customSolPer",
                                },
                              ],
                              [
                                {
                                  text: `Buy`,
                                  callback_data: "solanaFinalBuy",
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
                        "🔴 Token you entered is not supported!!"
                      );
                    }
                  })
                  .catch(async (error) => {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    await bot.sendMessage(
                      chatId,
                      "🔴 somthing has been wrong while fetching token price!!"
                    );
                  });
              } else {
                await axios
                  .post(`${API_URL}/dexEVM`, {
                    chain: state.flag,
                    token: state.toToken,
                    nativeToken: state?.fromToken,
                    chatId,
                    network: state?.network,
                  })
                  .then(async (res) => {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    if (res?.data?.status) {
                      state.toBuyAddresName = res?.data?.data?.symbol;
                      state.buyTokenNativename =
                        res?.data?.data?.nativeTokenDetails;
                      userStates[chatId].buyPrice =
                        (userStates[chatId]?.buyTokenNativename
                          ?.balance_formatted *
                          10) /
                        100;
                      userStates[chatId].evmBuyMessage = await bot.sendMessage(
                        chatId,
                        `✨ <b>Information of ${
                          state?.buyTokenNativename?.symbol
                        }</b>\n
💰 ${
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.symbol
                            : ""
                        } Balance: <code>${Number(
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.balance_formatted
                            : 0.0
                        ).toFixed(5)}</code>(<code>${Number(
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.usd_value
                            : 0
                        ).toFixed(4)}</code> USD)
🏷  Name : ${res?.data?.data?.symbol}  
📭 Address: <code>${res?.data?.data?.address}</code>
💵 ${res?.data?.data?.name} price : <code>${Number(
                          res?.data?.data?.price
                        )?.toFixed(5)}$</code>
📊 24hrPercentChange : <code>${Number(
                          res?.data?.data?.variation24h
                            ? res?.data?.data?.variation24h
                            : 0
                        )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(res?.data?.data?.totalSupply)?.toFixed()}</code>
🗃 mcap : <code>${
                          res?.data?.data?.mcap
                            ? Number(res?.data?.data?.mcap)?.toFixed()
                            : "not available!!"
                        }</code>
🔗 Chain : <code>${state?.network}</code>
${
  res?.data?.data?.nativeTokenDetails?.balance_formatted <= 0
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
                                  callback_data: "refreshEvmButton",
                                },
                              ],
                              [
                                {
                                  text: `✅ Buy 10% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "10EVMPer",
                                },
                                {
                                  text: `Buy 25% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "25EVMPer",
                                },
                                {
                                  text: `Buy 50% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "50EVMPer",
                                },
                              ],
                              [
                                {
                                  text: `Buy 75% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "70EVMPer",
                                },
                                {
                                  text: `Buy 10% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "100EVMPer",
                                },
                                {
                                  text: `Buy X ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  } ✏️`,
                                  callback_data: "customEVMPer",
                                },
                              ],
                              [
                                {
                                  text: `Buy`,
                                  callback_data: "evmFinalBuy",
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
                    await bot.sendMessage(
                      chatId,
                      "🔴somthing has been wrong while fetching token price!!"
                    );
                  });
              }
            } catch (error) {
              resetUserState(chatId);
              await bot.sendMessage(
                chatId,
                "🔴Token you entered is not supported or may be wrong!!"
              );
            }
          }

          break;
        case "customAmountBuy":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            if (userStates[chatId]?.flag) {
              userStates[chatId].buyPrice = text;
              await bot.deleteMessage(
                chatId,
                state?.customAmountEvm?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "⬅️ Back",
                        callback_data: "buyButton",
                      },
                      {
                        text: "🔄 Refresh",
                        callback_data: "refreshEvmButton",
                      },
                    ],
                    [
                      {
                        text: `Buy 0.5 ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "0.5EVM",
                      },
                      {
                        text: `Buy 1 ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "1EVM",
                      },
                      {
                        text: `Buy 3 ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "3EVM",
                      },
                    ],
                    [
                      {
                        text: `Buy 5 ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "5EVM",
                      },
                      {
                        text: `Buy 10 ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "10EVM",
                      },
                      {
                        text: `✅ ${userStates[chatId].buyPrice} ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "customEVM",
                      },
                    ],
                    [
                      {
                        text: `Buy 10% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "10EVMPer",
                      },
                      {
                        text: `Buy 25% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "25EVMPer",
                      },
                      {
                        text: `Buy 50% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "50EVMPer",
                      },
                    ],
                    [
                      {
                        text: `Buy 70% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "70EVMPer",
                      },
                      {
                        text: `Buy 100% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "100EVMPer",
                      },
                      {
                        text: `Buy X %${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        } ✏️`,
                        callback_data: "customEVMPer",
                      },
                    ],
                    [
                      {
                        text: `Buy`,
                        callback_data: "evmFinalBuy",
                      },
                    ],
                  ],
                },
                {
                  chat_id: chatId,
                  message_id: userStates[chatId].evmBuyMessage.message_id,
                }
              );
            } else {
              resetUserState(chatId);
              buyStartTokenSelection(chatId);
            }
          }
          break;
        case "customAmountBuyPer":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            if (userStates[chatId]?.flag) {
              userStates[chatId].buyPrice = text;
              console.log(
                "--------------------------->",
                userStates[chatId].buyPrice
              );
              await bot.deleteMessage(
                chatId,
                state?.customAmountEvm?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "⬅️ Back",
                        callback_data: "buyButton",
                      },
                      {
                        text: "🔄 Refresh",
                        callback_data: "refreshEvmButton",
                      },
                    ],
                    [
                      {
                        text: `Buy 10% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "10EVMPer",
                      },
                      {
                        text: `Buy 25% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "25EVMPer",
                      },
                      {
                        text: `Buy 50% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "50EVMPer",
                      },
                    ],
                    [
                      {
                        text: `Buy 75% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "70EVMPer",
                      },
                      {
                        text: `Buy 100% ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "100EVMPer",
                      },
                      {
                        text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                          5
                        )} ${
                          userStates[chatId].buyTokenNativename
                            ? userStates[chatId].buyTokenNativename?.symbol
                            : ""
                        }`,
                        callback_data: "customEVMPer",
                      },
                    ],
                    [
                      {
                        text: `Buy`,
                        callback_data: "evmFinalBuy",
                      },
                    ],
                  ],
                },
                {
                  chat_id: chatId,
                  message_id: userStates[chatId].evmBuyMessage.message_id,
                }
              );
            } else {
              resetUserState(chatId);
              buyStartTokenSelection(chatId);
            }
          }
          break;
        case "customAmountBuySol":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            if (userStates[chatId]?.flag == 19999) {
              userStates[chatId].buyPrice = text;
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.customAmountBuySol?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "⬅️ Back",
                        callback_data: "buyButton",
                      },
                      {
                        text: "🔄 Refresh",
                        callback_data: "refreshButtonBuySolana",
                      },
                    ],
                    [
                      {
                        text: "Buy0.5 SOL",
                        callback_data: "0.5Sol",
                      },
                      {
                        text: "Buy1 SOL",
                        callback_data: "1Sol",
                      },
                      {
                        text: "Buy3 SOL",
                        callback_data: "3Sol",
                      },
                    ],
                    [
                      {
                        text: "Buy5 SOL",
                        callback_data: "5Sol",
                      },
                      {
                        text: "Buy10 SOL",
                        callback_data: "10Sol",
                      },
                      {
                        text: `✅ ${userStates[chatId].buyPrice} Buy SOL`,
                        callback_data: "customSol",
                      },
                    ],
                    [
                      {
                        text: "Buy 10% SOL",
                        callback_data: "10SolPer",
                      },
                      {
                        text: "Buy 25% SOL",
                        callback_data: "25SolPer",
                      },
                      {
                        text: "Buy 50% SOL",
                        callback_data: "50SolPer",
                      },
                    ],
                    [
                      {
                        text: "Buy 70% SOL",
                        callback_data: "70SolPer",
                      },
                      {
                        text: "Buy 100% SOL",
                        callback_data: "100SolPer",
                      },
                      {
                        text: "Buy X %SOL ✏️",
                        callback_data: "customSolPer",
                      },
                    ],
                    [
                      {
                        text: `Buy`,
                        callback_data: "solanaFinalBuy",
                      },
                    ],
                  ],
                },
                {
                  chat_id: chatId,
                  message_id: userStates[chatId].solanaBuyMessage.message_id,
                }
              );
            } else {
              resetUserState(chatId);
              buyStartTokenSelection(chatId);
            }
          }
          break;
        case "customAmountBuySolPer":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            if (userStates[chatId]?.flag == 19999) {
              userStates[chatId].buyPrice = text;
              console.log(
                "--------------------------->",
                userStates[chatId].buyPrice
              );
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.customAmountBuySol?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "⬅️ Back",
                        callback_data: "buyButton",
                      },
                      {
                        text: "🔄 Refresh",
                        callback_data: "refreshButtonBuySolana",
                      },
                    ],
                    [
                      {
                        text: "Buy 10% SOL",
                        callback_data: "10SolPer",
                      },
                      {
                        text: "Buy 25% SOL",
                        callback_data: "25SolPer",
                      },
                      {
                        text: "Buy 50% SOL",
                        callback_data: "50SolPer",
                      },
                    ],
                    [
                      {
                        text: "Buy 75% SOL",
                        callback_data: "70SolPer",
                      },
                      {
                        text: "Buy 100% SOL",
                        callback_data: "100SolPer",
                      },
                      {
                        text: `✅ Buy ${Number(
                          userStates[chatId].buyPrice
                        ).toFixed(5)}SOL`,
                        callback_data: "customSolPer",
                      },
                    ],
                    [
                      {
                        text: `Buy`,
                        callback_data: "solanaFinalBuy",
                      },
                    ],
                  ],
                },
                {
                  chat_id: chatId,
                  message_id: userStates[chatId].solanaBuyMessage.message_id,
                }
              );
            } else {
              resetUserState(chatId);
              buyStartTokenSelection(chatId);
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
        case "toTokenSellSingle":
          state.fromToken = text;
          state.currentStep = "amountSell";
          await bot.sendMessage(chatId, "Please enter amount:");
          break;
        case "toTokenSell":
          state.sellPrice = text;
          await bot.deleteMessage(
            chatId,
            state?.customAmountSellEvm?.message_id
          );
          await bot.deleteMessage(chatId, msg.message_id);
          await bot.editMessageText(
            `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
              userStates[chatId].selectedSellToken?.balance_formatted
            )?.toFixed(5)}</code>(${Number(
              userStates[chatId].selectedSellToken?.usd_value
            ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
              userStates[chatId].selectedSellToken?.usd_price
            )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
              userStates[chatId].selectedSellToken
                ?.usd_price_24hr_percent_change
            )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId].selectedSellToken?.usd_price *
                userStates[chatId].sellPrice
            ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
              userStates[chatId].selectedSellToken?.token_address
            }`,
            {
              chat_id: chatId,
              message_id: userStates[chatId]?.evmSellMessage?.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "10EvmSellPer",
                    },
                    {
                      text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "25EvmSellPer",
                    },
                    {
                      text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "50EvmSellPer",
                    },
                  ],
                  [
                    {
                      text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "70EvmSellPer",
                    },
                    {
                      text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "100EvmSellPer",
                    },
                    {
                      text: `✅ ${Number(userStates[chatId]?.sellPrice).toFixed(
                        5
                      )} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                      callback_data: "customEvmSellPer",
                    },
                  ],
                  [
                    {
                      text: `Sell`,
                      callback_data: "finalSellEvm",
                    },
                  ],
                ],
              },
            }
          );
          break;
        case "toTokenSellSolana":
          state.sellPrice = Number(text);
          await bot.deleteMessage(
            chatId,
            state?.customAmountSellEvm?.message_id
          );
          await bot.deleteMessage(chatId, msg.message_id);
          const balanceInUSD = Number(
            userStates[chatId].selectedSellSolanaToken?.amount *
              userStates[chatId]?.sellSolanaTokensDex?.price
          );
          await bot.editMessageText(
            `💰 Balance : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana
            )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
              userStates[chatId]?.selectedSellSolanaToken?.amount
            ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(
              4
            )}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
              userStates[chatId]?.sellSolanaTokensDex?.address
            }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price
            )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation24h
            )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
              userStates[chatId]?.sellSolanaTokensDex?.totalSupply
            )?.toFixed()}</code>
🗃  mcap : ${
              userStates[chatId]?.sellSolanaTokensDex?.mcap
                ? Number(
                    userStates[chatId]?.sellSolanaTokensDex?.mcap
                  )?.toFixed()
                : "not available!!"
            }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice
            ).toFixed(5)}$)
https://dexscreener.com/solana/${
              userStates[chatId]?.sellSolanaTokensDex?.address
            }`,
            {
              chat_id: chatId,
              message_id: userStates[chatId].evmSellMessage.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                      callback_data: "10EvmSellSolanaPer",
                    },
                    {
                      text: `sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                      callback_data: "25EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                      callback_data: "50EvmSellSolanaPer",
                    },
                  ],
                  [
                    {
                      text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                      callback_data: "70EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                      callback_data: "100EvmSellSolanaPer",
                    },
                    {
                      text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                        5
                      )} ${
                        userStates[chatId]?.selectedSellSolanaToken?.symbol
                      }`,
                      callback_data: "customEvmSellPer",
                    },
                  ],
                  [
                    {
                      text: `Sell`,
                      callback_data: "sellSolanafinal",
                    },
                  ],
                ],
              },
            }
          );
          break;
        case "amountSell":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
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
                  method: "sell",
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
                  method: "sell",
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
                      `🔴 somthing has been wrong while selling!!!`
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
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
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
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
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
                  await bot.sendMessage(chatId, `✅ Login successfull!`, {
                    reply_markup: {
                      remove_keyboard: true,
                    },
                  });
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
                          [
                            {
                              text: "ForgotPassword",
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
                        [
                          {
                            text: "ForgotPassword",
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
          if (state?.refId) {
            state.currentStep = "userConfirmPasswordSignUpRef";
          } else {
            state.currentStep = "userConfirmPasswordSignUp";
          }
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

        // for referral signup
        case "userConfirmPasswordSignUpRef":
          if (state?.password != text) {
            state.currentStep = "userPasswordSignUp";
            return await bot.sendMessage(
              chatId,
              "🔐 Password and confirm password does not match please re-enter password:"
            );
          }
          state.confirmPassword = text;
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            await axios
              .post(`${API_URL}/signup`, {
                name: state?.name,
                email: state?.email,
                password: state?.password,
                confirmPassword: state?.confirmPassword,
                chatId,
                refferal: state?.refId?.toString(),
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
                          [
                            {
                              text: "ForgotPassword",
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
                        [
                          {
                            text: "ForgotPassword",
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
        case "userReferralSignUp":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/evmbalance" ||
            text == "/solbalance" ||
            text == "/swap"
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
                          [
                            {
                              text: "ForgotPassword",
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
                        [
                          {
                            text: "ForgotPassword",
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
                    `🎉 User registered successfully.`,
                    {
                      reply_markup: {
                        remove_keyboard: true,
                      },
                    }
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
                        [
                          {
                            text: "ForgotPassword",
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
    case "resetPasswordHandle":
      switch (state.currentStep) {
        case "getOtp":
          state.otp = text;

          await axios({
            url: `${API_URL}/verifyUser`,
            method: "post",
            data: {
              chatId:
                userStates[chatId].passwordAction == "reset" ? chatId : null,
              email:
                userStates[chatId].passwordAction == "forgot"
                  ? userStates[chatId]?.forgotEmail
                  : null,
              otp: text,
            },
          })
            .then(async (res) => {
              if (res.data.status) {
                state.currentStep = "resetNewPassword";
                await bot.sendMessage(chatId, "Enter your new password:");
              } else {
                state.currentStep = "getOtp";
                await bot.sendMessage(
                  chatId,
                  "❌ Wrong otp please re-enter the OTP!!"
                );
              }
            })
            .catch(async (e) => {
              console.log("🚀 ~ bot.on ~ e:", e?.message);
              await bot.sendMessage(chatId, "❌ Something went wrong");
            });
          break;
        case "resetNewPassword":
          if (!isValidPassword(text)) {
            await bot.sendMessage(
              chatId,
              "❌ Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
            );
            state.currentStep = "resetNewPassword";
            return await bot.sendMessage(
              chatId,
              "🔐please re-enter your password:"
            );
          }
          state.currentStep = "resetCurrentPassword";
          state.resetNewPassword = text;
          await bot.sendMessage(chatId, "Enter your confirm password:");

          break;
        case "forgotEmail":
          state.currentStep = "forgotEmailHandle";
          break;
        case "forgotEmailHandle":
          if (!isValidEmail(text)) {
            state.currentStep = "forgotEmailHandle";
            return await bot.sendMessage(
              chatId,
              "🔐invalid email please re-enter your email:"
            );
          }
          state.forgotEmail = text;
          handleResetPassword(chatId, "forgot", text);
          break;
        case "resetCurrentPassword":
          if (!isValidPassword(text)) {
            state.currentStep = "resetCurrentPassword";
            await bot.sendMessage(chatId, "");
          }
          state.resetConfirmPassword = text;
          if (state.resetNewPassword !== text) {
            state.currentStep = "resetNewPassword";
            return await bot.sendMessage(
              chatId,
              "password and confirmPassword does not match. Please Re-enter your password"
            );
          }
          const { loaderMessage, interval } = await animateLoader(chatId);
          await axios({
            url: `${API_URL}/resetPassword`,
            method: "post",
            data: {
              chatId:
                userStates[chatId].passwordAction == "reset" ? chatId : null,
              email:
                userStates[chatId].passwordAction == "forgot"
                  ? userStates[chatId]?.forgotEmail
                  : null,
              password: state?.resetNewPassword,
              confirmPassword: text,
            },
          })
            .then(async (res) => {
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              if (res.data.status) {
                if (state.passwordAction == "forgot") {
                  await bot.sendMessage(chatId, "Reset Password Successfully", {
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
                        [
                          {
                            text: "ForgotPassword",
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
                } else {
                  await bot.sendMessage(
                    chatId,
                    "✅ Reset Password Successfully"
                  );
                }
                resetUserState(chatId);
              } else {
                await bot.sendMessage(chatId, "❌ Something went wrong");
              }
            })
            .catch(async (e) => {
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              console.log("🚀 ~ bot.on ~ e:", e?.message);
              await bot.sendMessage(chatId, "❌ Something went wrong");
            });
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
          [
            {
              text: "ForgotPassword",
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
  // Ensure there is a state object for the user
  if (!userStates[chatId]) {
    resetUserState(chatId);
  }

  //  handle sell dynamic buttons
  if (data?.slice(-4) == "Sell") {
    return await handleDynamicSellToken(chatId, data?.slice(0, -4));
  }
  //   handle solana sell
  if (data?.slice(-10) == "SellSolana") {
    return await handleDynamicSellSolana(chatId, data?.slice(0, -10));
  }
  // handle position
  if (data?.slice(-8) == "Position") {
    resetUserState(chatId);
    const positionData = data?.split("+");
    await handlePositions(chatId, Number(positionData[0]), positionData[1]);
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
    case "resetPassword":
      userStates[chatId].passwordAction = "reset";
      userStates[chatId].method = "resetPasswordHandle";
      userStates[chatId].flag = "resetPasswordHandle";
      await handleResetPassword(chatId, "reset");
      break;
    case "positionButton":
      resetUserState(chatId);
      await positionsChainSelection(chatId);
      break;
    // case "PositionSolana":
    //   resetUserState(chatId)
    //   await handleSolanaPosition(chatId)
    //   break;
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
    case "totalReferrals":
      try {
        await axios({
          url: `${API_URL}/getUserReferals`,
          method: "post",
          data: {
            email: isUser?.isLogin?.email,
          },
        }).then(async (res) => {
          if (res?.data?.status) {
            await bot.sendMessage(
              chatId,
              `💰 Referal Rewards💰\n
🔗<code>https://t.me/onchain_wavebot?start=${
                isUser?.isLogin?.referralId
              }</code>\n
Referrals(Level-1) : ${
                res?.data?.data ? res?.data?.data?.level1?.length : 0
              }🧍\n
Net Referral Rate: 25%
Active Referrals: 0\n
Total Unclaimed: <code>$0</code>
*Eth: <code>0.000 ($0)</code>
*SOL: <code>0.000 ($0)</code>
*Base: <code>0.000 ($0)</code>
*AVAX: <code>0.000 ($0)</code>
*Blast: <code>0.000 ($0)</code>\n
Lifetime Rewards: <code>$0</code>
*ETH: <code>0.000 ($0)</code>
*SOL: <code>0.000 ($0)</code>
*Base: <code>0.000 ($0)</code>
*AVAX: <code>0.000 ($0)</code>
*Blast: <code>0.000 ($0)</code>\n
📅 Weekly Stats
Total Traded Volume Usd: $0
Volume Left: $10,000\n
You need to trade at least $10k USD by the
 end of the week to get boost in your
referral rate.`,
              { parse_mode: "HTML" }
            );
          } else {
            await bot.sendMessage(chatId, "🔴 something went wrong!!");
          }
        });
      } catch (error) {
        await bot.sendMessage(chatId, "🔴 something went wrong!!");
      }
      break;
    case "balanceButton":
      resetUserState(chatId);
      await bot.sendMessage(chatId, `🌟 Choose a network 🌟`, {
        reply_markup: JSON.stringify(evmWalletBalance),
      });
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
              [
                {
                  text: "ForgotPassword",
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
        userStates[chatId].buyPrice = 0.5;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "✅ Buy 0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy 1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy 3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy 5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "Buy 10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "1Sol":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = 1;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "✅ Buy 1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy 3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy 5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "Buy 10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "3Sol":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = 3;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy 1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "✅ Buy 3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy 5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "Buy 10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "5Sol":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = 5;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy 1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy 3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "✅ Buy 5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "Buy 10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10Sol":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = 10;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy 1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy 3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy 5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "✅ Buy 10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customSol":
      if (userStates[chatId]?.flag == 19999) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy5 SOL",
                  callback_data: "5Sol",
                },
                {
                  text: "Buy10 SOL",
                  callback_data: "10Sol",
                },
                {
                  text: "✅ Buy SOL ✏️",
                  callback_data: "customSol",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 70% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X %SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
        userStates[chatId].currentStep = "customAmountBuySol";
        userStates[chatId].customAmountBuySol = await bot.sendMessage(
          chatId,
          "please enter a sol Qty"
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10SolPer":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = Number(
          (userStates[chatId]?.nativeBalance * 10) / 100
        ).toFixed(6);
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );

        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                    5
                  )} SOL`,
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 75% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "25SolPer":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = Number(
          (userStates[chatId]?.nativeBalance * 25) / 100
        ).toFixed(6);
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                    5
                  )} SOL`,
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 75% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "50SolPer":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = Number(
          (userStates[chatId]?.nativeBalance * 50) / 100
        ).toFixed(6);
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                    5
                  )} SOL`,
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 75% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "70SolPer":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = Number(
          (userStates[chatId]?.nativeBalance * 75) / 100
        ).toFixed(6);
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                    5
                  )} SOL`,
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "100SolPer":
      if (userStates[chatId]?.flag == 19999) {
        userStates[chatId].buyPrice = Number(userStates[chatId]?.nativeBalance);
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy 10% SOL",
                  callback_data: "10SolPer",
                },
                {
                  text: "Buy 25% SOL",
                  callback_data: "25SolPer",
                },
                {
                  text: "Buy 50% SOL",
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: "Buy 75% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(
                    5
                  )} SOL`,
                  callback_data: "100SolPer",
                },
                {
                  text: "Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customSolPer":
      if (userStates[chatId]?.flag == 19999) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshButtonBuySolana",
                },
              ],
              [
                {
                  text: "Buy0.5 SOL",
                  callback_data: "0.5Sol",
                },
                {
                  text: "Buy1 SOL",
                  callback_data: "1Sol",
                },
                {
                  text: "Buy3 SOL",
                  callback_data: "3Sol",
                },
              ],
              [
                {
                  text: "Buy 75% SOL",
                  callback_data: "70SolPer",
                },
                {
                  text: "Buy 100% SOL",
                  callback_data: "100SolPer",
                },
                {
                  text: "✅ Buy X SOL ✏️",
                  callback_data: "customSolPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "solanaFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].solanaBuyMessage.message_id,
          }
        );
        userStates[chatId].currentStep = "customAmountBuySolPer";
        userStates[chatId].customAmountBuySol = await bot.sendMessage(
          chatId,
          "please enter a % or sol"
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "solanaFinalBuy":
      if (userStates[chatId]?.flag) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          userStates[chatId]?.buyPrice,
          "buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }

      break;
    case "0.5EVM":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice = 0.5;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `✅ Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "1EVM":
      if (userStates[chatId]?.flag) {
        // evmSwapHandle(1, chatId, "Buy");
        userStates[chatId].buyPrice = 1;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `✅ Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "3EVM":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice = 3;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `✅ Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "5EVM":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice = 5;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `✅ Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10EVM":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice = 10;
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `✅ Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customEVM":
      if (userStates[chatId]?.flag) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 0.5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "0.5EVM",
                },
                {
                  text: `Buy 1 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "1EVM",
                },
                {
                  text: `Buy 3 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "3EVM",
                },
              ],
              [
                {
                  text: `Buy 5 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "5EVM",
                },
                {
                  text: `Buy 10 ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVM",
                },
                {
                  text: `✅ Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVM",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 70% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X %${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
        userStates[chatId].currentStep = "customAmountBuy";
        userStates[chatId].customAmountEvm = await bot.sendMessage(
          chatId,
          "please enter Qty"
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "10EVMPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted * 10) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],

              [
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(6)} ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 75% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "25EVMPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted * 25) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],

              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)} ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 75% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "50EVMPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted * 50) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)} ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 75% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "70EVMPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted * 75) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],
              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)} ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "100EVMPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted * 100) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],

              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 75% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)} ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "customEVMPer":
      if (userStates[chatId]?.flag) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Back",
                  callback_data: "buyButton",
                },
                {
                  text: "🔄 Refresh",
                  callback_data: "refreshEvmButton",
                },
              ],

              [
                {
                  text: `Buy 10% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `Buy 25% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `Buy 50% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `Buy 75% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `Buy 100% ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `✅ Buy X ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  } ✏️`,
                  callback_data: "customEVMPer",
                },
              ],
              [
                {
                  text: `Buy`,
                  callback_data: "evmFinalBuy",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmBuyMessage.message_id,
          }
        );
        userStates[chatId].currentStep = "customAmountBuyPer";
        userStates[chatId].customAmountEvm = await bot.sendMessage(
          chatId,
          "please enter amount"
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "evmFinalBuy":
      if (userStates[chatId]?.flag && userStates[chatId]?.buyPrice) {
        evmSwapHandle(userStates[chatId]?.buyPrice, chatId, "Buy");
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;
    case "sellButton":
      resetUserState(chatId);
      sellStartTokenSelection(chatId);
      break;
    case "10EvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellSolanaToken?.amount * 10) / 100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                      5
                    )} ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "25EvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellSolanaToken?.amount * 25) / 100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                      5
                    )} ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "50EvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellSolanaToken?.amount * 50) / 100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                      5
                    )} ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "70EvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellSolanaToken?.amount * 70) / 100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                      5
                    )} ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "100EvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = Number(
          userStates[chatId]?.selectedSellSolanaToken?.amount
        );
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                      5
                    )} ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "customEvmSellSolanaPer":
      if (userStates[chatId]?.flag) {
        const balanceInUSD = Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        );
        await bot.editMessageText(
          `💰 Balance : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
          )?.toFixed(5)}</code> sol
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : <code>${Number(
            userStates[chatId]?.selectedSellSolanaToken?.amount
          ).toFixed(5)}</code>(<code>${Number(balanceInUSD).toFixed(4)}$</code>)
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.name} <code>${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }</code>
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price
          )?.toFixed(6)}$</code>
📊 variation24h : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.variation24h
          )?.toFixed(3)}%</code>
🛒 totalSupply : <code>${Number(
            userStates[chatId]?.sellSolanaTokensDex?.totalSupply
          )?.toFixed()}</code>
🗃  mcap : ${
            userStates[chatId]?.sellSolanaTokensDex?.mcap
              ? Number(userStates[chatId]?.sellSolanaTokensDex?.mcap)?.toFixed()
              : "not available!!"
          }
🔗 Chain : "Solana"
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/solana/${
            userStates[chatId]?.sellSolanaTokensDex?.address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "10EvmSellSolanaPer",
                  },
                  {
                    text: `sell 25% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "25EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "50EvmSellSolanaPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "70EvmSellSolanaPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                    callback_data: "100EvmSellSolanaPer",
                  },
                  {
                    text: `✅ Sell X amount of${userStates[chatId]?.selectedSellSolanaToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "sellSolanafinal",
                  },
                ],
              ],
            },
          }
        );
        userStates[chatId].currentStep = "toTokenSellSolana";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "10EvmSellPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = (
          (userStates[chatId]?.selectedSellToken?.balance_formatted * 10) /
          100
        ).toFixed(5);
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        await bot.editMessageText(
          `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
            userStates[chatId].selectedSellToken?.balance_formatted
          )?.toFixed(5)}</code>(${Number(
            userStates[chatId].selectedSellToken?.usd_value
          ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price
          )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
          )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId].selectedSellToken?.usd_price *
              userStates[chatId].sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
            userStates[chatId].selectedSellToken?.token_address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `✅ ${userStates[chatId]?.sellPrice} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "10EvmSellPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "25EvmSellPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "50EvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "70EvmSellPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "100EvmSellPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "finalSellEvm",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "25EvmSellPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = (
          (userStates[chatId]?.selectedSellToken?.balance_formatted * 25) /
          100
        ).toFixed(5);
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        await bot.editMessageText(
          `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
            userStates[chatId].selectedSellToken?.balance_formatted
          )?.toFixed(5)}</code>(${Number(
            userStates[chatId].selectedSellToken?.usd_value
          ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price
          )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
          )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId].selectedSellToken?.usd_price *
              userStates[chatId].sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
            userStates[chatId].selectedSellToken?.token_address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "10EvmSellPer",
                  },
                  {
                    text: `✅ ${userStates[chatId]?.sellPrice} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "25EvmSellPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "50EvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "70EvmSellPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "100EvmSellPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "finalSellEvm",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "50EvmSellPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = (
          (userStates[chatId]?.selectedSellToken?.balance_formatted * 50) /
          100
        ).toFixed(5);
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        await bot.editMessageText(
          `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
            userStates[chatId].selectedSellToken?.balance_formatted
          )?.toFixed(5)}</code>(${Number(
            userStates[chatId].selectedSellToken?.usd_value
          ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price
          )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
          )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId].selectedSellToken?.usd_price *
              userStates[chatId].sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
            userStates[chatId].selectedSellToken?.token_address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "10EvmSellPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "25EvmSellPer",
                  },
                  {
                    text: `✅ ${userStates[chatId]?.sellPrice} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "50EvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "70EvmSellPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "100EvmSellPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "finalSellEvm",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "70EvmSellPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = (
          (userStates[chatId]?.selectedSellToken?.balance_formatted * 70) /
          100
        ).toFixed(5);
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        await bot.editMessageText(
          `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
            userStates[chatId].selectedSellToken?.balance_formatted
          )?.toFixed(5)}</code>(${Number(
            userStates[chatId].selectedSellToken?.usd_value
          ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price
          )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
          )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId].selectedSellToken?.usd_price *
              userStates[chatId].sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
            userStates[chatId].selectedSellToken?.token_address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "10EvmSellPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "25EvmSellPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "50EvmSellPer",
                  },
                ],
                [
                  {
                    text: `✅ ${userStates[chatId]?.sellPrice} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "70EvmSellPer",
                  },
                  {
                    text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "100EvmSellPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "finalSellEvm",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "100EvmSellPer":
      if (userStates[chatId]?.flag) {
        userStates[chatId].sellPrice = Number(
          userStates[chatId]?.selectedSellToken?.balance_formatted
        ).toFixed(5);
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
        await bot.editMessageText(
          `🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
            userStates[chatId].selectedSellToken?.balance_formatted
          )?.toFixed(5)}</code>(${Number(
            userStates[chatId].selectedSellToken?.usd_value
          ).toFixed(3)})
💵 ${userStates[chatId].selectedSellToken?.symbol} price : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price
          )?.toFixed(6)}</code>$
📊 variation24h : <code>${Number(
            userStates[chatId].selectedSellToken?.usd_price_24hr_percent_change
          )?.toFixed(3)}</code>%
🔗 Chain: <code>${userStates[chatId]?.network}</code>
📉 Sell amount : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
            userStates[chatId].selectedSellToken?.usd_price *
              userStates[chatId].sellPrice
          ).toFixed(5)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
            userStates[chatId].selectedSellToken?.token_address
          }`,
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "10EvmSellPer",
                  },
                  {
                    text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "25EvmSellPer",
                  },
                  {
                    text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "50EvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "70EvmSellPer",
                  },
                  {
                    text: `✅ ${userStates[chatId]?.sellPrice} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                    callback_data: "100EvmSellPer",
                  },
                  {
                    text: `Sell X amount of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    callback_data: "customEvmSellPer",
                  },
                ],
                [
                  {
                    text: `Sell`,
                    callback_data: "finalSellEvm",
                  },
                ],
              ],
            },
          }
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "customEvmSellPer":
      if (userStates[chatId]?.flag) {
        await bot.editMessageReplyMarkup(
          {
            inline_keyboard: [
              [
                {
                  text: `Sell 10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "10EvmSellPer",
                },
                {
                  text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "25EvmSellPer",
                },
                {
                  text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "50EvmSellPer",
                },
              ],
              [
                {
                  text: `Sell 70% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "70EvmSellPer",
                },
                {
                  text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "100EvmSellPer",
                },
                {
                  text: `✅ Sell X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                  callback_data: "customEvmSellPer",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "finalSellEvm",
                },
              ],
            ],
          },
          {
            chat_id: chatId,
            message_id: userStates[chatId].evmSellMessage.message_id,
          }
        );
        userStates[chatId].currentStep = "toTokenSell";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "finalSellEvm":
      if (userStates[chatId]?.flag && userStates[chatId]?.sellPrice) {
        evmSellHandle(userStates[chatId]?.sellPrice, chatId);
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "sellSolanafinal":
      if (userStates[chatId]?.flag && userStates[chatId]?.sellPrice) {
        await solanaSellHandle(chatId);
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
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
    // -------------------------------------------------- buy referash button solana------------------------------------------------------
    case "refreshEvmButton":
      if (userStates[chatId]?.flag) {
        if (userStates[chatId]?.evmBuyMessage) {
          await bot.deleteMessage(
            chatId,
            userStates[chatId]?.evmBuyMessage?.message_id
          );
        }
        const { loaderMessage, interval } = await animateLoader(chatId);
        await axios
          .post(`${API_URL}/dexEVM`, {
            chain: userStates[chatId].flag,
            token: userStates[chatId].toToken,
            nativeToken: userStates[chatId]?.fromToken,
            chatId,
            network: userStates[chatId]?.network,
          })
          .then(async (res) => {
            clearInterval(interval);
            await bot.deleteMessage(chatId, loaderMessage.message_id);
            if (res?.data?.status) {
              userStates[chatId].buyPrice = 0.5;
              userStates[chatId].toBuyAddresName = res?.data?.data?.symbol;
              userStates[chatId].buyTokenNativename =
                res?.data?.data?.nativeTokenDetails;

              userStates[chatId].evmBuyMessage = await bot.sendMessage(
                chatId,
                `${
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.symbol
                    : ""
                } Balance: ${Number(
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.balance_formatted
                    : 0.0
                ).toFixed(5)}(${Number(
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.usd_value
                    : 0
                ).toFixed(4)} USD)
Token : ${res?.data?.data?.symbol}  <code>${res?.data?.data?.address}</code>
${res?.data?.data?.name} price : ${Number(res?.data?.data?.price)?.toFixed(5)}$
24hrPercentChange : ${Number(
                  res?.data?.data?.variation24h
                    ? res?.data?.data?.variation24h
                    : 0
                )?.toFixed(3)}%
totalSupply : ${Number(res?.data?.data?.totalSupply)?.toFixed()}
mcap : ${
                  res?.data?.data?.mcap
                    ? Number(res?.data?.data?.mcap)?.toFixed()
                    : "not available!!"
                }
network : ${userStates[chatId]?.network}
${
  res?.data?.data?.nativeTokenDetails?.balance_formatted <= 0
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${userStates[chatId]?.network}/${
                  userStates[chatId].toToken
                }`,
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
                          callback_data: "refreshEvmButton",
                        },
                      ],
                      [
                        {
                          text: `✅ Buy 0.5 ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "0.5EVM",
                        },
                        {
                          text: `Buy 1 ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "1EVM",
                        },
                        {
                          text: `Buy 3 ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "3EVM",
                        },
                      ],
                      [
                        {
                          text: `Buy 5 ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "5EVM",
                        },
                        {
                          text: `Buy 10 ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "10EVM",
                        },
                        {
                          text: `Buy X ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          } ✏️`,
                          callback_data: "customEVM",
                        },
                      ],
                      [
                        {
                          text: `Buy 10% ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "10EVMPer",
                        },
                        {
                          text: `Buy 25% ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "25EVMPer",
                        },
                        {
                          text: `Buy 50% ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "50EVMPer",
                        },
                      ],
                      [
                        {
                          text: `Buy 70% ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "70EVMPer",
                        },
                        {
                          text: `Buy 10% ${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          }`,
                          callback_data: "100EVMPer",
                        },
                        {
                          text: `Buy X %${
                            res?.data?.data?.nativeTokenDetails
                              ? res?.data?.data?.nativeTokenDetails?.symbol
                              : ""
                          } ✏️`,
                          callback_data: "customEVMPer",
                        },
                      ],
                      [
                        {
                          text: `Buy`,
                          callback_data: "evmFinalBuy",
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
            await bot.sendMessage(
              chatId,
              "🔴somthing has been wrong while fetching token price!!"
            );
          });
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
      break;

    case "refreshButtonBuySolana":
      if (userStates[chatId]?.flag == 19999) {
        if (userStates[chatId]?.solanaBuyMessage) {
          await bot.deleteMessage(
            chatId,
            userStates[chatId]?.solanaBuyMessage?.message_id
          );
        }
        const { loaderMessage, interval } = await animateLoader(chatId);
        await axios;
        await axios
          .post(`${API_URL}/dexSol`, {
            token: userStates[chatId]?.toToken,
            chatId,
          })
          .then(async (res) => {
            if (res?.data?.status) {
              userStates[chatId].toBuyAddresName = res?.data?.data?.name;
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              userStates[chatId].buyPrice = 0.5;
              userStates[chatId].nativeBalance =
                res?.data?.data?.nativeTokenDetails?.solana;
              userStates[chatId].solanaBuyMessage = await bot.sendMessage(
                chatId,
                `Balance : ${Number(
                  res?.data?.data?.nativeTokenDetails?.solana
                )?.toFixed(5)}sol
Token : ${res?.data?.data?.name} <code>${res?.data?.data?.address}</code>
${res?.data?.data?.name} price : ${Number(res?.data?.data?.price)?.toFixed(6)}$
variation24h : ${Number(res?.data?.data?.variation24h)?.toFixed(3)}%
totalSupply : ${Number(res?.data?.data?.totalSupply)?.toFixed()}
mcap : ${
                  res?.data?.data?.mcap
                    ? Number(res?.data?.data?.mcap)?.toFixed()
                    : "not available!!"
                }
https://dexscreener.com/solana/${userStates[chatId]?.toToken}`,
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
                          callback_data: "refreshButtonBuySolana",
                        },
                      ],
                      [
                        {
                          text: "✅ Buy 0.5 SOL",
                          callback_data: "0.5Sol",
                        },
                        {
                          text: "Buy 1 SOL",
                          callback_data: "1Sol",
                        },
                        {
                          text: "Buy 3 SOL",
                          callback_data: "3Sol",
                        },
                      ],
                      [
                        {
                          text: "Buy 5 SOL",
                          callback_data: "5Sol",
                        },
                        {
                          text: "Buy 10 SOL",
                          callback_data: "10Sol",
                        },
                        {
                          text: "Buy X SOL ✏️",
                          callback_data: "customSol",
                        },
                      ],
                      [
                        {
                          text: "Buy 10% SOL",
                          callback_data: "10SolPer",
                        },
                        {
                          text: "Buy 25% SOL",
                          callback_data: "25SolPer",
                        },
                        {
                          text: "Buy 50% SOL",
                          callback_data: "50SolPer",
                        },
                      ],
                      [
                        {
                          text: "Buy 70% SOL",
                          callback_data: "70SolPer",
                        },
                        {
                          text: "Buy 100% SOL",
                          callback_data: "100SolPer",
                        },
                        {
                          text: "Buy X %SOL ✏️",
                          callback_data: "customSolPer",
                        },
                      ],
                      [
                        {
                          text: `Buy`,
                          callback_data: "solanaFinalBuy",
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
                "🔴 Token you entered is not supported!!"
              );
            }
          })
          .catch(async (error) => {
            clearInterval(interval);
            await bot.deleteMessage(chatId, loaderMessage.message_id);
            await bot.sendMessage(
              chatId,
              "🔴 somthing has been wrong while fetching token price!!"
            );
          });
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }
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
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "1buy":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ether";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x1";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "10buy":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xa";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "137buy":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].network = "polygon";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x89";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);
      break;
    case "8453buy":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x2105";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "56buy":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x38";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "43114buy":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].network = "avalanche";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xa86a";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "25buy":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0x19";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);

      break;
    case "250buy":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xfa";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);
      break;
    case "59144buy":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].network = "linea";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "0xe705";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);
      break;
    case "81457buy":
      resetUserState(chatId);
      userStates[chatId].flag = 81457;
      userStates[chatId].network = "blast";
      userStates[chatId].method = "buy";
      userStates[chatId].desCode = "blast";
      userStates[chatId].fromToken =
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleBuy(chatId);
      break;

    // ------------------------------------------------ sell -----------------------------------------------------------
    case "solSellToken":
      resetUserState(chatId);
      userStates[chatId].flag = 19999;
      userStates[chatId].method = "sell";
      await handleToSellSolana(chatId);
      break;
    case "1sell":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ethereum";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x1");

      break;
    case "42161sell":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa4b1");

      break;
    case "10sell":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa");

      break;
    case "137sell":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].network = "polygon";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x89");

      break;
    case "8453sell":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x2105");

      break;
    case "56sell":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x38");

      break;
    case "43114sell":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].method = "sell";
      userStates[chatId].network = "avalanche";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa86a");

      break;
    case "25sell":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa4b1");

      break;
    case "250sell":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xfa");
      break;
    case "59144sell":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].network = "linea";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xe705");
      break;
    case "81457sell":
      resetUserState(chatId);
      userStates[chatId].flag = 81457;
      userStates[chatId].network = "blast";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
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
    case "59144":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].network = "linea";
      userStates[chatId].method = "swap";
      handleSwap(chatId);
      break;
    case "81457":
      resetUserState(chatId);
      userStates[chatId].flag = 81457;
      userStates[chatId].network = "blast";
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
    case "59144b":
      resetUserState(chatId);
      fetchTokenBalances(chatId, "0xe705");
      break;
    case "81457b":
      resetUserState(chatId);
      bot.sendMessage(
        chatId,
        `https://blastscan.io/address/${isUser?.isLogin?.wallet}`
      );
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
    case "59144withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
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
console.log("Bot started!!");
