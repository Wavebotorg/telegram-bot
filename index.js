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
  };
};

// Function to handle swapping for Solana
const handleSwap = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenSwap";
  await bot.sendMessage(chatId, "Type From Token:");
};
const handleBuy = async (chatId) => {
  userStates[chatId].currentStep = "fromTokenBuy";
  await bot.sendMessage(chatId, "Type Token You Want To Buy:");
};
const handleSell = async (chatId) => {
  userStates[chatId].currentStep = "toTokenSell";
  await bot.sendMessage(chatId, "Type Token You Want To Sell:");
};
const handleTransfer = async (chatId) => {
  userStates[chatId].currentStep = "tokenTransfer";
  await bot.sendMessage(chatId, "Type Token You Want To Transfer:");
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
    if (!receipt?.data?.status) {
      console.log("🚀 ~ transferEvmToken ~ receipt:", receipt);
      return null;
    }
    return receipt?.data;
  } catch (error) {
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
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Handle '/start' command
  if (msg.text === "/start") {
    resetUserState(chatId);
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
    resetUserState(chatId);
    flag = null;
    await start(chatId);
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
          state.amount = Number(text);
          const { loaderMessage, interval } = await animateLoader(chatId);

          if (state.flag == 19999) {
            response = await axios
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
                  return await bot.sendMessage(
                    chatId,
                    "solana swap successfull"
                  );
                } else {
                  resetUserState(chatId);
                  return await bot.sendMessage(
                    chatId,
                    "somthing has been wrong in solana swap!!!"
                  );
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
                method: "Swap",
              })
              .then(async (res) => {
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                resetUserState(chatId);
                if (res?.data?.status) {
                  await bot.sendMessage(chatId, res?.data?.message);
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
          state.currentStep = "amountBuy";
          await bot.sendMessage(chatId, "Enter amount:");
          break;

        case "amountBuy":
          state.amount = Number(text);

          if (state.flag == 19999) {
            const { loaderMessage, interval } = await animateLoader(chatId);
            const tokenRes = await axios
              .post(`${API_URL}/getSolanaTokenPrice`, {
                token: "So11111111111111111111111111111111111111112",
                token2: state?.toToken,
              })
              .then(async (res) => {
                const tokensPrice = res?.data?.finalRes;
                const buyAmt = state.amount * tokensPrice?.to;
                const finalAmt = buyAmt / tokensPrice?.sol;
                await axios
                  .post(`${API_URL}/solanaSwap`, {
                    input: "So11111111111111111111111111111111111111112",
                    output: state?.toToken,
                    amount: finalAmt,
                    chatId,
                    desBot: 9,
                    method: "Buy",
                  })
                  .then(async (response) => {
                    clearInterval(interval);
                    resetUserState(chatId);
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
                          "❌ buy failed. Please try again."
                      );
                    }
                  });
              })
              .catch(async (err) => {
                resetUserState(chatId);
                clearInterval(interval);
                await bot.deleteMessage(chatId, loaderMessage.message_id);
                await bot.sendMessage(
                  chatId,
                  `due to some reason you transaction failed!!`
                );
              });
          } else {
            const { loaderMessage, interval } = await animateLoader(chatId);
            await axios
              .post(`${API_URL}/getEvmTokenPrice`, {
                token: state?.fromToken,
                token2: state?.toToken,
                chain: state?.desCode,
              })
              .then(async (res) => {
                const tokensPrice = res?.data?.finalRes;
                const buyAmt = state?.amount * tokensPrice?.token2;
                const finalAmt = buyAmt / tokensPrice?.token1;
                await axios({
                  url: `${API_URL}/EVMswap`,
                  method: "post",
                  data: {
                    tokenIn: state?.fromToken,
                    tokenOut: state?.toToken,
                    chainId: state?.network,
                    amount: finalAmt,
                    chain: 42161,
                    chatId: chatId,
                    method: "Buy",
                  },
                })
                  .then(async (response) => {
                    resetUserState(chatId);
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    if (response?.data?.status) {
                      await bot.sendMessage(chatId, response?.data?.message);
                      return await bot.sendMessage(
                        chatId,
                        response?.data?.txUrl
                      );
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
              });
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
                  await bot.sendMessage(chatId, "Transaction Successfull!!");
                  return await bot.sendMessage(
                    chatId,
                    `https://solscan.io/account/${res?.data?.transactionCreated?.txid}`
                  );
                } else {
                  resetUserState(chatId);
                  return await bot.sendMessage(
                    chatId,
                    "somthing has been wrong please try again letter!!!"
                  );
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
                  await bot.sendMessage(chatId, res?.data?.message);
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
                  await bot.sendMessage(chatId, res?.data?.message);
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
                  await bot.sendMessage(chatId, res?.data?.message);
                  await bot.sendMessage(chatId, res?.data?.txUrl);
                } else {
                  await bot.sendMessage(
                    chatId,
                    "somthing has been wrong make sure you have a enough balance!!"
                  );
                }
              })
              .catch(async (error) => {
                console.log("🚀 ~ bot.on ~ error:", error?.message);
                await bot.sendMessage(
                  chatId,
                  "somthing has been wrong please try again latter!!"
                );
              });
            // await transferEvmToken(
            //   chatId,
            //   state?.fromToken,
            //   state?.toToken,
            //   state?.flag,
            //   state?.amount
            // )
            //   .then(async (res) => {
            //     clearInterval(interval);
            //     await bot.deleteMessage(chatId, loaderMessage.message_id);
            //     await bot.sendMessage(chatId, res?.message);
            //     await bot.sendMessage(chatId, res?.txUrl);
            //   })
            //   .catch(async (err) => {
            //     console.log("🚀 ~ bot.once ~ err:", err);
            //     clearInterval(interval);
            //     await bot.deleteMessage(chatId, loaderMessage.message_id);
            //     await bot.sendMessage(
            //       chatId,
            //       "somthing has been wrong make sure you have a enough balance!!"
            //     );
            //   });
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
              }
            })
            .catch(async (error) => {
              resetUserState(chatId);
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              console.error("Error:", error.message);
              await bot.sendMessage(
                chatId,
                `❌ An error occurred while logging in: ${error.message}`
              );
            });

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
          await axios
            .post(`${API_URL}/signup`, {
              name: state?.name,
              email: state?.email,
              password: state?.password,
              confirmPassword: state?.confirmPassword,
              chatId,
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
                  "failed to register please try again!!",
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
          break;
        case "userOtpSignUp":
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
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const isUser = await getstartBot(chatId);
  if (!isUser) {
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
      startSwapProcess(chatId);

      break;
    case "SolonabalanceButton":
      resetUserState(chatId);
      fetchSolanaBalance(chatId);

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
