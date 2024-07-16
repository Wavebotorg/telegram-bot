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
    liq: null,
    market_cap: null,
    sellSolanaTokensDex: null,
    sellToken: null,
    currentPlPrice: null,
    percentageChange: null,
    password: null,
    sellTokensList: userStates[chatId]?.sellTokensList,
    sellSolanaTokensList: userStates[chatId]?.sellSolanaTokensList,
    positionList: userStates[chatId]?.positionList,
    buyTokenData: null,
    selectedSellSolanaToken: null,
    allSellTokens: null,
    confirmPassword: null,
    otp: null,
    transferToken: null,
    swapFromToken: null,
    allSellSolanaToken: null,
    name: null,
    refId: null,
    referral: null,
    nativeBalance: null,
    toMsg: null,
    fromMsg: null,
    amountMsg: null,
    transferCustomMessage: null,
    swapToTokenMessage: null,
    toBuyAddresName: null,
    toWalletAddress: null,
    statusFalse: null,
    solanaBuyMessage: userStates[chatId]?.solanaBuyMessage,
    evmBuyMessageDetail: null,
    evmTransferMessage: userStates[chatId]?.evmTransferMessage,
    evmSellMessage: userStates[chatId]?.evmSellMessage,
    evmBuyMessage: userStates[chatId]?.evmBuyMessage,
    buyPrice: null,
    sellPrice: null,
    transferPrice: null,
    selectedSellToken: null,
    buyTokenNativename: null,
    customAmountSellEvm: null,
    toSwapAddress: null,
    swapPrice: null,
    walletQrCode: userStates[chatId]?.walletQrCode,
  };
};
const resetUserStateRef = (chatId) => {
  userStates[chatId] = {
    flag: null,
    fromToken: null,
    toToken: null,
    passwordAction: null,
    buyTokenData: null,
    amount: null,
    currentStep: null,
    allSellTokens: null,
    method: null,
    network: null,
    liq: null,
    swapFromToken: null,
    percentageChange: null,
    sellToken: null,
    transferCustomMessage: null,
    market_cap: null,
    sellSolanaTokensDex: null,
    currentPlPrice: null,
    sellTokensList: userStates[chatId]?.sellTokensList,
    sellSolanaTokensList: userStates[chatId]?.sellSolanaTokensList,
    positionList: userStates[chatId]?.positionList,
    evmTransferMessage: userStates[chatId]?.evmTransferMessage,
    selectedSellSolanaToken: null,
    desCode: null,
    swapToTokenMessage: null,
    transferToken: null,
    toWalletAddress: null,
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
    evmBuyMessageDetail: null,
    solanaBuyMessage: userStates[chatId]?.solanaBuyMessage,
    evmSellMessage: userStates[chatId]?.evmSellMessage,
    evmBuyMessage: userStates[chatId]?.evmBuyMessage,
    buyPrice: null,
    transferPrice: null,
    toSwapAddress: null,
    swapPrice: null,
    selectedSellToken: null,
    sellPrice: null,
    buyTokenNativename: null,
    customAmountSellEvm: null,
    walletQrCode: userStates[chatId]?.walletQrCode,
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

// frist handle to sell showing token holdings

const handleToSell = async (chatId, chainId, network) => {
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
    await fetchWalletTokenBalances(chatId, chainId, network);
  } catch (error) {
    console.log("🚀 ~ handleToSell ~ error:", error?.message);
  }
};

// frist handle to transfer showing holding

async function transferHoldingsEvm(chatId, chainId, network) {
  try {
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    if (userStates[chatId]?.evmTransferMessage?.message_id) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmTransferMessage?.message_id
      );
      userStates[chatId].evmTransferMessage = null;
    }
    const { loaderMessage, interval } = await animateLoader(chatId);
    try {
      const response = await axios.post(`${API_URL}/fetchbalance`, {
        chatId: chatId,
        chainId: chainId,
        network,
      });
      clearInterval(interval);
      await bot.deleteMessage(chatId, loaderMessage?.message_id);

      const balances = response?.data?.data;
      const tokens = balances?.filter((item) => item?.usd_price != null);
      userStates[chatId].allSellTokens = tokens;

      if (tokens) {
        let message = "✨ Your Tokens:\n\n";
        tokens?.forEach((balance) => {
          message += `🏷 Token Name: <code>${balance?.symbol}</code>\n`;
          message += `💰 Balance: <code>${Number(
            balance?.balance_formatted
          ).toFixed(4)}</code>(${Number(balance?.usd_value).toFixed(5)}$)\n\n`;
        });
        const buttons = tokens.map((item) => ({
          text: item.symbol,
          callback_data: `${item.symbol}TransferEvm`,
        }));

        const keyboard = [];

        // add dynamic buttons in the keyboard
        for (let i = 0; i < buttons.length; i += 4) {
          keyboard.push(buttons.slice(i, i + 4));
        }

        // add static buttons
        if (tokens?.length <= 0) {
          message += "🔴 you do not have any token to Withraw!!";
          keyboard.push([
            { text: "⬅️ Back", callback_data: "withrawButton" },
            { text: "⬅️ Buy", callback_data: "buyButton" },
          ]);
        } else {
          keyboard.push([{ text: "⬅️ Back", callback_data: "withrawButton" }]);
        }

        userStates[chatId].sellTokensList = await bot.sendMessage(
          chatId,
          message,
          {
            reply_markup: {
              inline_keyboard: keyboard,
            },
            parse_mode: "HTML",
          }
        );
      } else {
        await bot.sendMessage(
          chatId,
          "🔴 You do not have any tokens to Withraw!!",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "withrawButton" },
                  { text: "⬅️ Buy", callback_data: "buyButton" },
                ],
              ],
            },
          }
        );
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
  } catch (error) {
    console.log("🚀 ~ transferHoldingsEvm ~ error:", error?.message);
  }
}

// handle to withraw solana

async function transferHoldingsSol(chatId) {
  try {
    if (userStates[chatId]?.evmSellMessage) {
      try {
        await bot.deleteMessage(
          chatId,
          userStates[chatId]?.evmSellMessage?.message_id
        );
        userStates[chatId].evmSellMessage = null;
      } catch (error) {
        console.log("🚀 ~ transferHoldingsSol ~ error:", error?.message);
      }
    }
    if (userStates[chatId]?.sellTokensList) {
      try {
        await bot.deleteMessage(
          chatId,
          userStates[chatId]?.sellTokensList?.message_id
        );
        userStates[chatId].sellTokensList = null;
      } catch (error) {
        console.log("🚀 ~ transferHoldingsSol ~ error:", error?.message);
      }
    }
    if (userStates[chatId]?.evmTransferMessage?.message_id) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmTransferMessage?.message_id
      );
      userStates[chatId].evmTransferMessage = null;
    }
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios
      .post(`${API_URL}/solanaBalance`, {
        chatId: chatId,
      })
      .then(async (res) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage?.message_id);
        if (res?.data?.data?.length > 0) {
          let message = "Your Solana tokens:\n\n";
          userStates[chatId].allSellSolanaToken = res?.data?.data;
          userStates[chatId].allSellSolanaToken.unshift({
            mint: "So11111111111111111111111111111111111111112",
            price: res?.data?.nativePrice,
            name: "Solana",
            amount: res?.data?.native,
            symbol: "Sol",
          });
          // message += `🏷 Token Name: <code> SOL</code>\n`;
          // message += `💰 Balance: <code>${
          //   res?.data?.native ? res?.data?.native : "0.00000"
          // }</code>(${Number(res?.data?.native * res?.data?.nativePrice).toFixed(
          //   3
          // )}$)\n\n`;
          res?.data?.data?.forEach((balance) => {
            message += `🏷 Token Name: <code>${balance?.name}</code>\n`;
            message += `💰 Balance: <code>${balance?.amount}</code>(${Number(
              balance?.amount * balance?.price
            ).toFixed(2)}$)\n\n`;
          });

          const buttons = res?.data?.data?.map((item) => ({
            text: item.symbol,
            callback_data: `${item.symbol}TransferSol`,
          }));

          const keyboard = [];

          // add dynamic buttons in the keyboard
          for (let i = 0; i < buttons.length; i += 4) {
            keyboard.push(buttons.slice(i, i + 4));
          }

          // add solana button
          keyboard.push([{
            text: "Sol",
            callback_data: `SolTransferSol`,
          }]);

          // add static buttons
          keyboard.push([{ text: "⬅️ Back", callback_data: "withrawButton" }]);

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
        } else {
          await bot.sendMessage(
            chatId,
            "🔴 You do not have any token to withraw!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "withrawButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        }
      })
      .catch(async (err) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage?.message_id);
        console.log("🚀 ~ .then ~ err:", err?.message);
        await bot.sendMessage(
          chatId,
          "🔴 Somthing went wrong please try again later!!",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⬅️ Back", callback_data: "withrawButton" }],
              ],
            },
          }
        );
      });
  } catch (error) {
    console.error("Error fetching balance:", error?.message);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
}
//  to figure amount
function humanReadableFormat(number) {
  const units = ["", "K", "M", "B", "T"];
  let unitIndex = 0;

  while (Math.abs(number) >= 1000 && unitIndex < units.length - 1) {
    number /= 1000;
    unitIndex++;
  }

  return `${number.toFixed(2)}$ ${units[unitIndex]}`;
}

// handle to sell solana
const handleToSellSolana = async (chatId) => {
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
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios
      .post(`${API_URL}/solanaBalance`, {
        chatId: chatId,
      })
      .then(async (res) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        let message = "Your Solana tokens:\n\n";
        if (res?.data?.data?.length > 0) {
          userStates[chatId].allSellSolanaToken = res?.data?.data;
          userStates[chatId].nativeBalance = res?.data?.nativePrice;
          // message += `🏷 Token Name: <code> SOL</code>\n`;
          // message += `💰 Balance: <code>${
          //   response?.data?.native ? response?.data?.native : "0.00000"
          // }</code>(${Number(
          //   response?.data?.native * response?.data?.nativePrice
          // ).toFixed(3)}$)\n\n`;

          res?.data?.data?.forEach((balance) => {
            message += `🏷 Token Name: <code>${balance?.name}</code>\n`;
            message += `💰 Balance: <code>${balance?.amount}</code>(${Number(
              balance?.amount * balance?.price
            ).toFixed(2)}$)\n\n`;
          });

          const buttons = res?.data?.data?.map((item) => ({
            text: item.symbol,
            callback_data: `${item.symbol}SellSolana`,
          }));

          const keyboard = [];

          // add dynamic buttons in the keyboard
          for (let i = 0; i < buttons.length; i += 4) {
            keyboard.push(buttons.slice(i, i + 4));
          }

          // add static buttons
          keyboard.push([{ text: "⬅️ Back", callback_data: "sellButton" }]);

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
        } else {
          await bot.sendMessage(
            chatId,
            "🔴 You do not have any token to sell!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "sellButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        }
      })
      .catch(async (err) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        console.log("🚀 ~ handleToSellSolana ~ err:", err?.message);
        await bot.sendMessage(
          chatId,
          "🔴 Somthing went wrong please try again later!!"
        );
      });
  } catch (error) {
    console.error("Error fetching balance:", error?.message);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
};

// frist handle to swap  SOL
async function handleSolanaSwap(chatId) {
  try {
    if (userStates[chatId]?.evmSwapMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmSwapMessage?.message_id
      );
      userStates[chatId].evmSwapMessage = null;
    }
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    const { loaderMessage, interval } = await animateLoader(chatId);
    await axios
      .post(`${API_URL}/solanaBalance`, {
        chatId: chatId,
      })
      .then(async (res) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        let message = "Your Solana tokens:\n\n";
        if (res?.data?.data?.length > 0) {
          userStates[chatId].allSellSolanaToken = res?.data?.data;
          userStates[chatId].nativeBalance = res?.data?.nativePrice;
          // message += `🏷 Token Name: <code> SOL</code>\n`;
          // message += `💰 Balance: <code>${
          //   response?.data?.native ? response?.data?.native : "0.00000"
          // }</code>(${Number(
          //   response?.data?.native * response?.data?.nativePrice
          // ).toFixed(3)}$)\n\n`;

          res?.data?.data?.forEach((balance) => {
            message += `🏷 Token Name: <code>${balance?.name}</code>\n`;
            message += `💰 Balance: <code>${balance?.amount}</code>(${Number(
              balance?.amount * balance?.price
            ).toFixed(3)}$)\n\n`;
          });

          const buttons = res?.data?.data?.map((item) => ({
            text: item.symbol,
            callback_data: `${item.symbol}solanaSwap`,
          }));

          const keyboard = [];

          // add dynamic buttons in the keyboard
          for (let i = 0; i < buttons.length; i += 4) {
            keyboard.push(buttons.slice(i, i + 4));
          }

          // add static buttons
          keyboard.push([
            { text: "⬅️ Back", callback_data: "SwaptokenButton" },
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
        } else {
          await bot.sendMessage(
            chatId,
            "🔴 You do not have any token to swap!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "SwaptokenButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        }
      })
      .catch(async (err) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage.message_id);
        console.log("🚀 ~ handleToSellSolana ~ err:", err?.message);
        await bot.sendMessage(
          chatId,
          "🔴 Somthing went wrong please try again later!!"
        );
      });
  } catch (error) {
    console.error("Error fetching balance:", error?.message);
    await bot.sendMessage(
      chatId,
      "An error occurred while fetching your balance."
    );
  }
}

// frist handle to swap EVM
async function handleEvmSwap(chatId, chainId, network) {
  try {
    if (userStates[chatId]?.sellTokensList) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.sellTokensList?.message_id
      );
      userStates[chatId].sellTokensList = null;
    }
    if (userStates[chatId]?.evmSwapMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmSwapMessage?.message_id
      );
      userStates[chatId].evmSwapMessage = null;
    }
    const { loaderMessage, interval } = await animateLoader(chatId);
    try {
      await axios
        .post(`${API_URL}/fetchbalance`, {
          chatId: chatId,
          chainId: chainId,
          network,
        })
        .then(async (response) => {
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage?.message_id);
          if (response?.data?.status) {
            userStates[chatId].nativeBalance = response.data.data[0];
            console.log("🚀 ~ .then ~", userStates[chatId].nativeBalance);
            const balances = response?.data?.data;
            const tokens = balances
              ?.slice(1, balances?.length)
              ?.filter((item) => item?.usd_price != null);
            userStates[chatId].allSellTokens = tokens;

            if (tokens?.length > 0) {
              let message = "✨ Your Tokens:\n\n";
              tokens?.forEach((balance) => {
                message += `🏷 Token Name: <code>${balance?.symbol}</code>\n`;
                message += `💰 Balance: <code>${Number(
                  balance?.balance_formatted
                ).toFixed(4)}</code>(${Number(balance?.usd_value).toFixed(
                  5
                )}$)\n\n`;
              });
              const buttons = tokens?.map((item) => ({
                text: item.symbol,
                callback_data: `${item.symbol}SwapEvm`,
              }));

              const keyboard = [];

              // add dynamic buttons in the keyboard
              for (let i = 0; i < buttons.length; i += 4) {
                keyboard.push(buttons.slice(i, i + 4));
              }

              // add static buttons
              if (tokens?.length <= 1) {
                message += "🔴 you do not have any token to Withraw!!";
                keyboard.push([
                  { text: "⬅️ Back", callback_data: "withrawButton" },
                  { text: "⬅️ Buy", callback_data: "buyButton" },
                ]);
              } else {
                keyboard.push([
                  { text: "⬅️ Back", callback_data: "withrawButton" },
                ]);
              }

              userStates[chatId].sellTokensList = await bot.sendMessage(
                chatId,
                message,
                {
                  reply_markup: {
                    inline_keyboard: keyboard,
                  },
                  parse_mode: "HTML",
                }
              );
            } else {
              await bot.sendMessage(
                chatId,
                "🔴 You do not have any tokens to Withraw!!",
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        { text: "⬅️ Back", callback_data: "withrawButton" },
                        { text: "⬅️ Buy", callback_data: "buyButton" },
                      ],
                    ],
                  },
                }
              );
            }
          } else {
            console.log(response?.data?.message);
          }
        })
        .catch((error) => {
          console.log("🚀 ~ handleEvmSwap ~ error:", error?.message);
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
  } catch (error) {
    console.log("🚀 ~ transferHoldingsEvm ~ error:", error?.message);
  }
}

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
      { text: "👨‍👧‍👦 Referrals", callback_data: "totalReferrals" },
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
      { text: "Blast", callback_data: "81457b" },
      { text: "Polygon", callback_data: "137b" },
    ],
    [
      { text: "Optimism", callback_data: "10b" },
      { text: "Linea", callback_data: "59144b" },
      { text: "Cronos", callback_data: "25b" },
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
      { text: "Blast", callback_data: "addressEVM" },
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
      { text: "Solona", callback_data: "positionSolana" },
      { text: "Ethereum", callback_data: "1+ether+Position" },
      { text: "Base", callback_data: "8453+base+Position" },
    ],
    [
      { text: "BSC", callback_data: "56+bsc+Position" },
      { text: "Avalanche", callback_data: "43114+avalanche+Position" },
      { text: "Arbitrum", callback_data: "42161+arbitrum+Position" },
    ],
    [
      { text: "Fantom", callback_data: "250+fantom+Position" },
      { text: "Blast", callback_data: "PositionBlast" },
      { text: "Polygon", callback_data: "137+polygon+Position" },
    ],
    [
      { text: "Optimism", callback_data: "10+optimism+Position" },
      { text: "Linea", callback_data: "59144+linea+Position" },
      { text: "Cronos", callback_data: "25+cronos+Position" },
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
      { text: "Blast", callback_data: "81457" },
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
      { text: "Blast", callback_data: "81457buy" },
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
      { text: "Blast", callback_data: "81457sell" },
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
      { text: "Blast", callback_data: "81457withraw" },
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
  try {
    // Delete the previous QR code message if it exists
    if (userStates[chatId]?.walletQrCode) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId].walletQrCode.message_id
      );
      userStates[chatId].walletQrCode = null;
    }

    // Request the new QR code
    const res = await axios({
      url: `${API_URL}/getQrCode`,
      method: "post",
      data: {
        chatId,
        wallet,
      },
    });

    // Send the new QR code
    if (res?.data?.status) {
      userStates[chatId].walletQrCode = await bot.sendPhoto(
        chatId,
        res.data.path,
        {
          caption: `${wallet == 2 ? "Solana wallet" : "EVM Wallet"}:- <code>${
            res.data.walletAddress
          }</code> (Tap to copy)`,
          parse_mode: "HTML",
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        "🔴 Something went wrong, please try again later!!"
      );
    }
  } catch (error) {
    console.log("🚀 ~ getQrCode ~ error:", error.message);
  }
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
            await bot.sendMessage(chatId, `✅ Transaction successful!`);
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
          amount: Number(amount).toFixed(5),
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
  if (userStates[chatId]?.selectedSellToken?.balance_formatted < amount) {
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

// EVM sell positions
async function evmSellHandlePercentage(amount, chatId) {
  if (userStates[chatId]?.selectedSellToken?.qty < amount) {
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
        tokenIn: userStates[chatId]?.selectedSellToken?.tokenAddress,
        tokenOut: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        chainId: userStates[chatId]?.network,
        amount: Number(amount)?.toFixed(5),
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
      "🔴 You do not have sufficient fund + gas to perform this solana transaction!!",
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
          amount: Number(userStates[chatId]?.sellPrice),
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
async function solanaSellHandlePosition(chatId) {
  console.log("solana balance", userStates[chatId]?.selectedSellToken?.amount);
  console.log("amount that you entered", userStates[chatId]?.sellPrice);
  if (
    Number(userStates[chatId]?.selectedSellToken?.amount) <
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
          input: userStates[chatId]?.selectedSellToken?.mint,
          output: "So11111111111111111111111111111111111111112",
          amount: Number(userStates[chatId]?.sellPrice),
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
            // {
            //   text: "Invite",
            //   callback_data: "referralQr",
            // },
            { text: "Help", callback_data: "helpButton" },
            { text: "Reset PW", callback_data: "resetPassword" },
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
    const messageText = `🌊Your DEX marketplace on Wave 🌊\n
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
      message += `🏷 Token Name:  SOL\n`;
      message += `💰 Balance: ${
        response?.data?.native ? response?.data?.native : "0.00000"
      }(${Number(response?.data?.native * response?.data?.nativePrice).toFixed(
        3
      )}$)\n\n`;
      console.log(balances?.data);
      balances?.data?.forEach((balance) => {
        message += `🏷 Token Name: ${balance?.name}\n`;
        message += `💰 Balance: ${Number(balance?.amount).toFixed(6)}(${Number(
          balance?.amount * balance?.price
        ).toFixed(3)}$)\n\n`;
      });
      message += `For More info (https://solscan.io/account/${response?.data?.walletAddress})\n\n`;
      message += "Thank you for using our service! ✌️";
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
    let finalTokens = balances?.data?.filter((item) => item?.usd_price != null);
    finalTokens?.forEach((balance) => {
      message += `🏷 Token Name: ${balance.name}\n`;
      message += `💰 Balance: ${Number(balance.balance_formatted).toFixed(
        4
      )}(${Number(balance?.usd_value).toFixed(2)}$)\n\n`;
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
async function fetchWalletTokenBalances(chatId, chainId, network) {
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    const response = await axios.post(`${API_URL}/fetchbalance`, {
      chatId: chatId,
      chainId: chainId,
      network,
    });
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage?.message_id);

    const balances = response?.data?.data;
    const tokens = balances?.filter((item) => item?.usd_price != null);
    userStates[chatId].allSellTokens = tokens;
    userStates[chatId].nativeBalance = tokens[0];

    if (tokens) {
      let message = "✨ Your Tokens:\n\n";
      tokens?.slice(1, tokens?.length)?.forEach((balance) => {
        message += `🏷 Token Name: <code>${balance?.symbol}</code>\n`;
        message += `💰 Balance: <code>${Number(
          balance?.balance_formatted
        ).toFixed(5)}</code>(${Number(balance?.usd_value).toFixed(2)}$)\n\n`;
      });
      const buttons = tokens.map((item) => ({
        text: item.symbol,
        callback_data: `${item.symbol}Sell`,
      }));

      const keyboard = [];

      // add dynamic buttons in the keyboard
      for (let i = 1; i < buttons.length; i += 4) {
        keyboard.push(buttons.slice(i, i + 4));
      }

      if (tokens?.length <= 1) {
        message += "🔴 you do not have any token to Sell!!";
        keyboard.push([
          { text: "⬅️ Back", callback_data: "sellButton" },
          { text: "⬅️ Buy", callback_data: "buyButton" },
        ]);
      } else {
        keyboard.push([{ text: "⬅️ Back", callback_data: "sellButton" }]);
      }
      // add static buttons

      userStates[chatId].sellTokensList = await bot.sendMessage(
        chatId,
        message,
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "HTML",
        }
      );
    } else {
      await bot.sendMessage(chatId, "🔴 You do not have any tokens!!", {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⬅️ Back", callback_data: "sellButton" },
              { text: "⬅️ Buy", callback_data: "buyButton" },
            ],
          ],
        },
      });
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
    if (userStates[chatId].evmSellMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId].evmSellMessage?.message_id
      );
      userStates[chatId].evmSellMessage = null;
    }
    const tokenDetails = await userStates[chatId]?.allSellTokens?.filter(
      (item) => item.symbol == token
    );
    if (tokenDetails) {
      userStates[chatId].selectedSellToken = tokenDetails[0];
      const response = await axios.post(
        `${API_URL}/getPositionSingleTokenInfoEvm`,
        {
          chatId: chatId,
          token: userStates[chatId].selectedSellToken?.token_address,
          chainId: userStates[chatId]?.flag,
        }
      );
      const change =
        userStates[chatId].selectedSellToken?.usd_price -
        response?.data?.dataBaseTokens?.currentPrice;
      const percentageChange =
        (change / response?.data?.dataBaseTokens?.currentPrice) * 100;
      userStates[chatId].currentPlPrice =
        response?.data?.dataBaseTokens?.currentPrice;
      userStates[chatId].percentageChange = Number(percentageChange).toFixed(2);
      const market_cap =
        userStates[chatId].selectedSellToken?.mcap &&
        (await humanReadableFormat(userStates[chatId].selectedSellToken?.mcap));
      userStates[chatId].market_cap = market_cap;
      userStates[chatId].sellPrice = Number(
        (userStates[chatId].selectedSellToken?.balance_formatted * 10) / 100
      );
      const oldPrice =
        userStates[chatId].selectedSellToken?.balance_formatted *
        userStates[chatId]?.currentPlPrice;
      const newPrice =
        userStates[chatId].selectedSellToken?.balance_formatted *
        userStates[chatId]?.selectedSellToken?.price;
      const difference = Math.abs(Number(oldPrice - newPrice).toFixed(2));
      userStates[chatId].difference = difference;
      userStates[chatId].evmSellMessage = await bot.sendMessage(
        chatId,
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
          userStates[chatId].selectedSellToken?.token_address
        }</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
          userStates[chatId]?.selectedSellToken?.price /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol} / ${Number(
          userStates[chatId]?.selectedSellToken?.price
        )?.toFixed(5)}$
📊 5m : ${Number(
          userStates[chatId]?.selectedSellToken?.variation5m
            ? userStates[chatId]?.selectedSellToken?.variation5m
            : 0
        )?.toFixed(3)}% || 1h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation1h
            ? userStates[chatId]?.selectedSellToken?.variation1h
            : 0
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation6h
            ? userStates[chatId]?.selectedSellToken?.variation6h
            : 0
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation24h
            ? userStates[chatId]?.selectedSellToken?.variation24h
            : 0
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId]?.market_cap
            : "not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
          userStates[chatId].selectedSellToken?.balance_formatted
        )?.toFixed(5)}</code>(${Number(
          userStates[chatId].selectedSellToken?.usd_value
        ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
          ((userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price) *
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(2)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
          userStates[chatId].selectedSellToken?.token_address
        }`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "sellButton" },
                { text: "🔄 Refresh", callback_data: "evmSellRefresh" },
              ],
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
                  text: `Sell 75% ${tokenDetails[0]?.symbol}`,
                  callback_data: "75EvmSellPer",
                },
                {
                  text: `Sell 100% ${tokenDetails[0]?.symbol}`,
                  callback_data: "100EvmSellPer",
                },
                {
                  text: `Sell X %${tokenDetails[0]?.symbol} ✏️`,
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
  }
}

//  function to handle dynamic  SOL percentage

async function handleSolSellPercentageDynamically(chatId, percentage) {
  try {
    if (userStates[chatId]?.flag) {
      if (!(percentage == "sellSolCustom" || percentage == 100)) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellSolanaToken?.amount * percentage) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
      }
      if (percentage == 100) {
        userStates[chatId].sellPrice =
          userStates[chatId]?.selectedSellSolanaToken?.amount;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
      }
      const balanceInUSD = Number(
        userStates[chatId].selectedSellSolanaToken?.amount *
          userStates[chatId]?.sellSolanaTokensDex?.price
      );
      await bot.editMessageText(
        `✨ Information of ${userStates[chatId]?.sellSolanaTokensDex?.name}\n
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.sellSolanaTokensDex?.address}</code>\n
💵 ${userStates[chatId]?.sellSolanaTokensDex?.symbol} price :${Number(
          userStates[chatId]?.sellSolanaTokensDex?.price /
            userStates[chatId]?.sellSolanaTokensDex?.nativePrice
        ).toFixed(5)} SOL / ${Number(
          userStates[chatId]?.sellSolanaTokensDex?.price
        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.sellSolanaTokensDex?.variation5m)?.toFixed(
          3
        )}% || 1h : ${Number(
          userStates[chatId]?.sellSolanaTokensDex?.variation1h
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId]?.sellSolanaTokensDex?.variation6h
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId]?.sellSolanaTokensDex?.variation24h
        )?.toFixed(3)}%\n
🗃  mcap : ${
          userStates[chatId].market_cap
            ? userStates[chatId].market_cap
            : "not available!!"
        }
💰  SOL Balance : ${Number(
          userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana
        )?.toFixed(5)}(${Number(
          userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails?.solana *
            userStates[chatId]?.sellSolanaTokensDex?.nativePrice
        )?.toFixed(2)}$)  SOL
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : ${Number(
          userStates[chatId]?.selectedSellSolanaToken?.amount
        ).toFixed(5)}(${Number(
          userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price
        ).toFixed(4)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.sellSolanaTokensDex?.price
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.sellSolanaTokensDex?.price
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
          userStates[chatId]?.sellSolanaTokensDex?.price *
            userStates[chatId]?.sellPrice
        ).toFixed(5)}$)${
          userStates[chatId]?.sellSolanaTokensDex?.symbol
        } ⇄ ${Number(
          (userStates[chatId]?.sellSolanaTokensDex?.price *
            userStates[chatId]?.sellPrice) /
            userStates[chatId]?.nativeBalance
        ).toFixed(3)}(${(
          Number(
            (userStates[chatId]?.sellSolanaTokensDex?.price *
              userStates[chatId]?.sellPrice) /
              userStates[chatId]?.nativeBalance
          ) * userStates[chatId]?.nativeBalance
        ).toFixed(3)}$) SOL
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
                { text: "⬅️ Back", callback_data: "sellButton" },
                { text: "🔄 Refresh", callback_data: "solanaSellRefresh" },
              ],
              [
                {
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 10%"
                  } ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                  callback_data: "10EvmSellSolanaPer",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 25%"
                  } ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                  callback_data: "25EvmSellSolanaPer",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 50%"
                  } ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                  callback_data: "50EvmSellSolanaPer",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 75%"
                  } ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                  callback_data: "70EvmSellSolanaPer",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 100%"
                  } ${userStates[chatId]?.selectedSellSolanaToken?.symbol}`,
                  callback_data: "100EvmSellSolanaPer",
                },
                {
                  text: `${percentage == "sellSolCustom" ? "✅" : ""} Sell X %${
                    userStates[chatId]?.selectedSellSolanaToken?.symbol
                  } ✏️`,
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
      if (percentage == "sellSolCustom") {
        userStates[chatId].currentStep = "toTokenSellSolana";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      }
    } else {
      resetUserState(chatId);
      sellStartTokenSelection(chatId);
    }
  } catch (error) {
    console.log("🚀 ~ bot.on ~ error:", error?.message);
  }
}

// function to handle dynamic EVM percentage

async function handleEvmSellPercentageDynamically(chatId, percentage) {
  try {
    if (userStates[chatId]?.flag) {
      if (!(percentage == "sellEvmCustom" || percentage == 100)) {
        userStates[chatId].sellPrice =
          (userStates[chatId]?.selectedSellToken?.balance_formatted *
            percentage) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
      }
      if (percentage == 100) {
        userStates[chatId].sellPrice =
          userStates[chatId]?.selectedSellToken?.balance_formatted;
        console.log(
          "--------------------------->",
          userStates[chatId].sellPrice
        );
      }

      await bot.editMessageText(
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
          userStates[chatId].selectedSellToken?.token_address
        }</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
          userStates[chatId]?.selectedSellToken?.price /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol} / ${Number(
          userStates[chatId]?.selectedSellToken?.price
        )?.toFixed(5)}$
📊 5m : ${Number(
          userStates[chatId]?.selectedSellToken?.variation5m
            ? userStates[chatId]?.selectedSellToken?.variation5m
            : 0
        )?.toFixed(3)}% || 1h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation1h
            ? userStates[chatId]?.selectedSellToken?.variation1h
            : 0
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation6h
            ? userStates[chatId]?.selectedSellToken?.variation6h
            : 0
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId]?.selectedSellToken?.variation24h
            ? userStates[chatId]?.selectedSellToken?.variation24h
            : 0
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId]?.market_cap
            : "not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
          userStates[chatId].selectedSellToken?.balance_formatted
        )?.toFixed(5)}</code>(${Number(
          userStates[chatId].selectedSellToken?.usd_value
        ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
          userStates[chatId]?.currentPlPrice <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
          userStates[chatId].percentageChange
        }%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
          ((userStates[chatId].selectedSellToken?.usd_price *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price) *
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(2)}$)
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
                { text: "⬅️ Back", callback_data: "sellButton" },
                { text: "🔄 Refresh", callback_data: "evmSellRefresh" },
              ],
              [
                {
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId]?.sellPrice)?.toFixed(
                          5
                        )}`
                      : "Sell 10%"
                  } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "10EvmSellPer",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId]?.sellPrice)?.toFixed(
                          5
                        )}`
                      : "Sell 25%"
                  } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "25EvmSellPer",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId]?.sellPrice)?.toFixed(
                          5
                        )}`
                      : "Sell 50%"
                  } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "50EvmSellPer",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId]?.sellPrice)?.toFixed(
                          5
                        )}`
                      : "Sell 75%"
                  } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "70EvmSellPer",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId]?.sellPrice)?.toFixed(
                          5
                        )}`
                      : "Sell 100%"
                  } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "100EvmSellPer",
                },
                {
                  text: `${percentage == "sellEvmCustom" ? "✅" : ""} Sell X %${
                    userStates[chatId]?.selectedSellToken?.symbol
                  } ✏️`,
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
      if (percentage == "sellEvmCustom") {
        userStates[chatId].currentStep = "toTokenSell";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      }
    } else {
      resetUserState(chatId);
      sellStartTokenSelection(chatId);
    }
  } catch (error) {
    console.log("🚀 ~ bot.on ~ error:", error?.message);
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
    if (userStates[chatId]?.evmSellMessage) {
      await bot.deleteMessage(
        chatId,
        userStates[chatId]?.evmSellMessage?.message_id
      );
      userStates[chatId].evmSellMessage = null;
    }
    const tokenDetails = await userStates[chatId]?.allSellSolanaToken?.filter(
      (item) => item.symbol == token
    );
    console.log("🚀 ~ handleDynamicSellSolana ~ tokenDetails:", tokenDetails);
    if (tokenDetails) {
      userStates[chatId].selectedSellSolanaToken = tokenDetails[0];
      await axios
        .post(`${API_URL}/dexSol`, {
          token: tokenDetails[0]?.mint,
          chatId,
        })
        .then(async (res) => {
          clearInterval(interval);
          await bot.deleteMessage(chatId, loaderMessage.message_id);
          userStates[chatId].sellSolanaTokensDex = res?.data?.data;
          const market_cap =
            res?.data?.data?.mcap &&
            (await humanReadableFormat(
              userStates[chatId].sellSolanaTokensDex?.mcap
            ));
          userStates[chatId].market_cap = market_cap;
          const liq =
            userStates[chatId].sellSolanaTokensDex?.liq &&
            (await humanReadableFormat(
              userStates[chatId].sellSolanaTokensDex?.liq
            ));
          userStates[chatId].liq = liq;
          const response = await axios.post(
            `${API_URL}/getPositionSingleTokenInfoSol`,
            {
              chatId: chatId,
              token: userStates[chatId].sellSolanaTokensDex?.address,
            }
          );
          userStates[chatId].currentPlPrice =
            response?.data?.dataBaseTokens?.currentPrice;
          const change =
            userStates[chatId]?.sellSolanaTokensDex?.price -
            response?.data?.dataBaseTokens?.currentPrice;
          const percentageChange =
            (change / response?.data?.dataBaseTokens?.currentPrice) * 100;
          userStates[chatId].percentageChange =
            Number(percentageChange).toFixed(2);
          userStates[chatId].sellPrice = Number(
            (tokenDetails[0]?.amount * 10) / 100
          );
          const oldPrice =
            userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.currentPlPrice;
          const newPrice =
            userStates[chatId].selectedSellSolanaToken?.amount *
            userStates[chatId]?.sellSolanaTokensDex?.price;
          const difference = Math.abs(Number(oldPrice - newPrice).toFixed(2));
          userStates[chatId].difference = difference;
          userStates[chatId].evmSellMessage = await bot.sendMessage(
            chatId,
            `✨ Information of ${
              userStates[chatId]?.sellSolanaTokensDex?.name
            }\n
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.sellSolanaTokensDex?.address}</code>\n
💵 ${userStates[chatId]?.sellSolanaTokensDex?.symbol} price :${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price /
                userStates[chatId]?.sellSolanaTokensDex?.nativePrice
            ).toFixed(5)} SOL / ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price
            )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.sellSolanaTokensDex?.variation5m)?.toFixed(
              3
            )}% || 1h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation1h
            )?.toFixed(3)}% || 6h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation6h
            )?.toFixed(3)}% || 24h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation24h
            )?.toFixed(3)}%\n
🗃  mcap : ${
              userStates[chatId].market_cap
                ? userStates[chatId].market_cap
                : "not available!!"
            }
💰  SOL Balance : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana
            )?.toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana * userStates[chatId]?.sellSolanaTokensDex?.nativePrice
            )?.toFixed(2)}$)  SOL\n
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : ${Number(
              userStates[chatId]?.selectedSellSolanaToken?.amount
            ).toFixed(5)}(${Number(
              userStates[chatId].selectedSellSolanaToken?.amount *
                userStates[chatId]?.sellSolanaTokensDex?.price
            ).toFixed(4)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.sellSolanaTokensDex?.price
                ? `+${userStates[chatId].difference}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.sellSolanaTokensDex?.price
                ? `+${Number(
                    userStates[chatId].difference /
                      userStates[chatId]?.nativeBalance
                  ).toFixed(5)}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice
            ).toFixed(5)}$)${
              userStates[chatId]?.sellSolanaTokensDex?.symbol
            } ⇄ ${Number(
              (userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice) /
                userStates[chatId]?.nativeBalance
            ).toFixed(3)}(${(
              Number(
                (userStates[chatId]?.sellSolanaTokensDex?.price *
                  userStates[chatId]?.sellPrice) /
                  userStates[chatId]?.nativeBalance
              ) * userStates[chatId]?.nativeBalance
            ).toFixed(3)}$) SOL
https://dexscreener.com/solana/${
              userStates[chatId]?.sellSolanaTokensDex?.address
            }`,
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "sellButton" },
                    { text: "🔄 Refresh", callback_data: "solanaSellRefresh" },
                  ],
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
                      text: `Sell 75% ${tokenDetails[0]?.symbol}`,
                      callback_data: "75EvmSellSolanaPer",
                    },
                    {
                      text: `Sell 100% ${tokenDetails[0]?.symbol}`,
                      callback_data: "100EvmSellSolanaPer",
                    },
                    {
                      text: `Sell X %${tokenDetails[0]?.symbol} ✏️`,
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
    try {
    } catch (error) {}
  }
}

// function to handle buy solana percentage dynamically

async function handleToBySolanaPercentageDynamically(chatId, percentage) {
  try {
    if (userStates[chatId]?.flag == 19999) {
      if (!(percentage == "buyCustom" || percentage == 100)) {
        userStates[chatId].buyPrice = Number(
          (userStates[chatId]?.nativeBalance * percentage) / 100
        );
      }
      if (percentage == 100) {
        userStates[chatId].buyPrice = Number(userStates[chatId]?.nativeBalance);
      }
      const totalTokenBuy = Number(
        (userStates[chatId].buyPrice *
          userStates[chatId]?.buyTokenData?.nativePrice) /
          userStates[chatId]?.buyTokenData?.price
      )?.toFixed(5);
      console.log("--------------------------->", userStates[chatId].buyPrice);

      await bot.editMessageText(
        `🌊 <b>Information of ${userStates[chatId]?.buyTokenData?.name}</b> 🌊\n
🏷  Name : ${userStates[chatId]?.buyTokenData?.symbol} 
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.buyTokenData?.address}</code>\n
💵 ${userStates[chatId]?.buyTokenData?.symbol} price : ${Number(
          userStates[chatId]?.buyTokenData?.price /
            userStates[chatId]?.buyTokenData?.nativePrice
        ).toFixed(5)} SOL / ${Number(
          userStates[chatId]?.buyTokenData?.price
        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.buyTokenData?.variation5m)?.toFixed(
          2
        )}% || 1h : ${Number(
          userStates[chatId]?.buyTokenData?.variation1h
        )?.toFixed(2)}% || 6h : ${Number(
          userStates[chatId]?.buyTokenData?.variation6h
        )?.toFixed(2)}% || 24h : ${Number(
          userStates[chatId]?.buyTokenData?.variation24h
        )?.toFixed(2)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId]?.market_cap
            : "not available!!"
        }
💰 Balance : ${Number(
          userStates[chatId]?.buyTokenData?.nativeTokenDetails?.solana
        )?.toFixed(5)} SOL / ${Number(
          userStates[chatId]?.buyTokenData?.nativeTokenDetails?.solana *
            userStates[chatId]?.buyTokenData?.nativePrice
        ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice)?.toFixed(5)} SOL (${Number(
          userStates[chatId]?.buyPrice *
            userStates[chatId]?.buyTokenData?.nativePrice
        )?.toFixed(2)}$) ⇄ ${totalTokenBuy} ${
          userStates[chatId]?.buyTokenData?.symbol
        }(${Number(
          totalTokenBuy * userStates[chatId]?.buyTokenData?.price
        ).toFixed(2)}$)
https://dexscreener.com/solana/${userStates[chatId].toToken}`,
        {
          chat_id: chatId,
          message_id: userStates[chatId].solanaBuyMessage.message_id,
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
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 10%  SOL"
                  }  SOL`,
                  callback_data: "10SolPer",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 25%  SOL"
                  }  SOL`,
                  callback_data: "25SolPer",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 50%  SOL"
                  }  SOL`,
                  callback_data: "50SolPer",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 75%  SOL"
                  }  SOL`,
                  callback_data: "70SolPer",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 100%  SOL"
                  }  SOL`,
                  callback_data: "100SolPer",
                },
                {
                  text: `${
                    percentage == "buyCustom" ? "✅" : ""
                  } Buy X % SOL ✏️`,
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
      if (percentage == "buyCustom") {
        userStates[chatId].currentStep = "customAmountBuySolPer";
        userStates[chatId].customAmountBuySol = await bot.sendMessage(
          chatId,
          "please enter a  SOL"
        );
      }
    } else {
      resetUserState(chatId);
      buyStartTokenSelection(chatId);
    }
  } catch (error) {
    console.log("🚀 ~ bot.on ~ error:", error?.message);
  }
}

// funtion to handle buy EVM percentage dynamically

async function handleToByEvmPercentageDynamically(chatId, percentage) {
  try {
    if (userStates[chatId]?.flag) {
      if (!(percentage == "buyEvmCustom" || percentage == 100)) {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted *
            percentage) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
      }
      if (percentage == 100) {
        userStates[chatId].buyPrice =
          userStates[chatId]?.buyTokenNativename?.balance_formatted;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
      }
      if (percentage != "buyEvmCustom") {
        userStates[chatId].buyPrice =
          (userStates[chatId]?.buyTokenNativename?.balance_formatted *
            percentage) /
          100;
        console.log(
          "--------------------------->",
          userStates[chatId].buyPrice
        );
      }
      const totalBuyUsd = Number(
        userStates[chatId]?.buyPrice *
          userStates[chatId]?.buyTokenNativename?.usd_price
      ).toFixed(2);
      await bot.editMessageText(
        `🌊 <b>Information of ${
          userStates[chatId]?.evmBuyMessageDetail?.name
        }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.evmBuyMessageDetail?.symbol}
🔗 Chain : ${userStates[chatId]?.network}  
📭 Address: <code>${userStates[chatId]?.evmBuyMessageDetail?.address}</code>\n
💵 ${userStates[chatId]?.evmBuyMessageDetail?.name} price : ${Number(
          userStates[chatId]?.evmBuyMessageDetail?.price /
            userStates[chatId]?.buyTokenNativename?.usd_price
        ).toFixed(4)}${
          userStates[chatId]?.buyTokenNativename?.symbol
        } / ${Number(userStates[chatId]?.evmBuyMessageDetail?.price)?.toFixed(
          5
        )}$
📊 5m : ${Number(userStates[chatId]?.evmBuyMessageDetail?.variation5m)?.toFixed(
          3
        )}% || 1h : ${Number(
          userStates[chatId]?.evmBuyMessageDetail?.variation1h
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId]?.evmBuyMessageDetail?.variation6h
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId]?.evmBuyMessageDetail?.variation24h
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId]?.market_cap
            : "not available!!"
        }
💰 ${
          userStates[chatId]?.buyTokenNativename
            ? userStates[chatId]?.buyTokenNativename?.symbol
            : ""
        } Balance: ${Number(
          userStates[chatId]?.buyTokenNativename
            ? userStates[chatId]?.buyTokenNativename?.balance_formatted
            : 0.0
        ).toFixed(5)} / ${Number(
          userStates[chatId]?.buyTokenNativename
            ? userStates[chatId]?.buyTokenNativename?.usd_value
            : 0
        ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice).toFixed(5)} ${
          userStates[chatId]?.buyTokenNativename?.symbol
        } (${totalBuyUsd}$) ⇄ ${Number(
          totalBuyUsd / userStates[chatId]?.evmBuyMessageDetail?.price
        ).toFixed(5)} ${
          userStates[chatId]?.evmBuyMessageDetail?.symbol
        } (${Number(
          (totalBuyUsd / userStates[chatId]?.evmBuyMessageDetail?.price) *
            userStates[chatId]?.evmBuyMessageDetail?.price
        ).toFixed(2)}$)
${
  userStates[chatId]?.evmBuyMessageDetail?.nativeTokenDetails
    ?.balance_formatted <= 0
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${
          userStates[chatId]?.network == "ether"
            ? "ethereum"
            : userStates[chatId]?.network
        }/${userStates[chatId]?.toToken}`,

        {
          chat_id: chatId,
          message_id: userStates[chatId].evmBuyMessage.message_id,
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
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 10%"
                  } ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "10EVMPer",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 25%"
                  } ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "25EVMPer",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 50%"
                  } ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "50EVMPer",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 75%"
                  } ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "70EVMPer",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId].buyPrice).toFixed(5)}`
                      : "Buy 100%"
                  } ${
                    userStates[chatId].buyTokenNativename
                      ? userStates[chatId].buyTokenNativename?.symbol
                      : ""
                  }`,
                  callback_data: "100EVMPer",
                },
                {
                  text: `${percentage == "buyEvmCustom" ? "✅" : ""} Buy X %${
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
        }
      );
      if (percentage == "buyEvmCustom") {
        userStates[chatId].currentStep = "customAmountBuyPer";
        userStates[chatId].customAmountEvm = await bot.sendMessage(
          chatId,
          "please enter amount"
        );
      }
    } else {
      resetUserState(chatId);
      buyStartTokenSelection(chatId);
    }
  } catch (error) {
    console.log("🚀 ~ bot.on ~ error:", error?.message);
  }
}

// positions function
async function handlePositions(chatId, chainId, network) {
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  if (userStates[chatId].evmSellMessage) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.evmSellMessage?.message_id
    );
    userStates[chatId].evmSellMessage = null;
  }
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    userStates[chatId].network = network;
    userStates[chatId].flag = chainId;
    const response = await axios.post(`${API_URL}/getPositions`, {
      chatId: chatId,
      chainId: chainId,
    });
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage?.message_id);

    if (response?.data?.status) {
      const balances = response?.data?.data;
      userStates[chatId].nativeBalance = response?.data?.data?.nativeToken;
      userStates[chatId].allPositionTokens = balances?.tokensData;

      let message = "✨ Your Tokens:\n";
      message += `🔗 Chain: ${network}\n\n`;
      if (!balances?.tokensData?.length == 0) {
        balances?.tokensData?.forEach((balance) => {
          const oldPrice = balance?.qty * balance?.price_at_invested;
          const newPrice = balance?.qty * balance?.currentPrice;
          const difference = Math.abs(Number(oldPrice - newPrice).toFixed(2));
          message += `🏷 Token Name: ${balance?.symbol}
💰 Balance: ${Number(balance?.qty).toFixed(4)}(${Number(
            balance?.qty * balance?.currentPrice
          ).toFixed(2)}$)
💵 ${balance?.symbol} Price: ${Number(balance?.currentPrice).toFixed(5)}$ 
📊 Avg Entry Price : ${Number(balance?.price_at_invested).toFixed(5)}$
${balance?.price_at_invested < balance?.currentPrice ? "🟩" : "🟥"} PNL USD : ${
            balance?.price_at_invested < balance?.currentPrice
              ? `+${Number(difference).toFixed(2)}$`
              : `${Number(difference).toFixed(2)}$`
          }(${balance?.percentage_of_growth > 0 ? "+" : ""}${
            balance?.percentage_of_growth
          }%)
${balance?.price_at_invested < balance?.currentPrice ? "🟩" : "🟥"} PNL ${
            userStates[chatId].nativeBalance?.symbol
          } : ${
            balance?.price_at_invested < balance?.currentPrice
              ? `+${Number(
                  difference / userStates[chatId].nativeBalance?.usd_price
                ).toFixed(5)}${userStates[chatId].nativeBalance?.symbol}`
              : `-${Number(difference).toFixed(3)}${
                  userStates[chatId].nativeBalance?.symbol
                }`
          }(${balance?.percentage_of_growth > 0 ? "+" : ""}${
            balance?.percentage_of_growth
          }%)\n\n\n`;
        });
        const buttons = balances?.tokensData?.map((item) => ({
          text: item.symbol,
          callback_data: `${item.symbol}SellP`,
        }));

        const keyboard = [];

        // add dynamic buttons in the keyboard
        for (let i = 0; i < buttons.length; i += 4) {
          keyboard.push(buttons.slice(i, i + 4));
        }

        // add static buttons
        keyboard.push([{ text: "⬅️ Back", callback_data: "positionButton" }]);

        console.log("🚀 ~ handlePositions ~ keyboard:", keyboard);
        userStates[chatId].positionList = await bot.sendMessage(
          chatId,
          message,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: keyboard,
            },
          }
        );
      } else {
        await bot.sendMessage(chatId, "🔴 You do not have any holdings!!", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "positionButton" },
                { text: "⬆️ Buy", callback_data: "buyButton" },
              ],
            ],
          },
        });
      }
    } else {
      await bot.sendMessage(
        chatId,
        "🔴 Somthing went wrong please try again later (If you want to sell then please go sell menu for now)!!"
      );
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
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  if (userStates[chatId].evmSellMessage) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.evmSellMessage?.message_id
    );
    userStates[chatId].evmSellMessage = null;
  }
  const { loaderMessage, interval } = await animateLoader(chatId);
  try {
    await axios
      .post(`${API_URL}/getSolanaPositions`, {
        chatId: chatId,
      })
      .then(async (response) => {
        clearInterval(interval);
        await bot.deleteMessage(chatId, loaderMessage?.message_id);
        console.log("🚀 ~ handleSolanaPosition ~ response:", response);
        if (response?.data?.status && response?.data?.data) {
          const balances = response?.data?.data?.allTokenPrice;
          userStates[chatId].nativeBalance = response?.data?.data?.solanaInfo;
          userStates[chatId].allPositionTokens = balances;

          let message = "✨ Your Tokens:\n";
          message += `🔗 Chain: "Solana"\n\n`;

          if (balances?.length > 0) {
            balances?.forEach((balance) => {
              const oldPrice = balance?.amount * balance?.price_at_invested;
              const newPrice = balance?.amount * balance?.price;
              const difference = Math.abs(
                Number(oldPrice - newPrice).toFixed(2)
              );
              message += `🏷 Token Name: ${balance?.symbol}
💰 Balance: ${Number(balance?.amount).toFixed(4)}(${Number(
                balance?.amount * balance?.price
              ).toFixed(2)}$)
💵 ${balance?.symbol} Price: ${Number(balance?.price).toFixed(5)}$
📊 Avg Entry Price : ${Number(balance?.price_at_invested).toFixed(5)}
${balance?.price_at_invested < balance?.price ? "🟩" : "🟥"} PNL USD : ${
                balance?.price_at_invested < balance?.price
                  ? `+${difference}$`
                  : `-${difference}$`
              }(${balance?.percentage > 0 ? "+" : ""}${balance?.percentage}%)
${balance?.price_at_invested < balance?.price ? "🟩" : "🟥"} PNL  SOL : ${
                balance?.price_at_invested < balance?.price
                  ? `+${Number(
                      difference / userStates[chatId].nativeBalance
                    ).toFixed(5)} SOL`
                  : `-${Number(
                      difference / userStates[chatId].nativeBalance
                    ).toFixed(5)} SOL`
              }(${balance?.percentage > 0 ? "+" : ""}${
                balance?.percentage
              }%)\n\n\n`;
            });
            const buttons = balances?.map((item) => ({
              text: item.symbol,
              callback_data: `${item.symbol}SellPositionSol`,
            }));

            const keyboard = [];

            // add dynamic buttons in the keyboard
            for (let i = 0; i < buttons.length; i += 4) {
              keyboard.push(buttons.slice(i, i + 4));
            }

            // add static buttons
            keyboard.push([{ text: "⬅️ Back", callback_data: "sellButton" }]);

            userStates[chatId].positionList = await bot.sendMessage(
              chatId,
              message,
              {
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: keyboard,
                },
              }
            );
          } else {
            await bot.sendMessage(chatId, "🔴 You do not have any holdings!!", {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "⬅️ Back",
                      callback_data: "positionButton",
                    },
                    {
                      text: "⬆️ Buy",
                      callback_data: "buyButton",
                    },
                  ],
                ],

                resize_keyboard: true,
                one_time_keyboard: true,
              },
            });
          }
        } else {
          console.log(res?.data?.message);
        }
      });
  } catch (error) {
    clearInterval(interval);
    await bot.deleteMessage(chatId, loaderMessage.message_id);
    console.error("Error fetching balance:", error.message);
  }
}

// position sell
async function handlePositionSell(chatId, token) {
  console.log("🚀 ~ handlePositionSell ~ token:", token);
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  if (userStates[chatId].evmSellMessage) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.evmSellMessage?.message_id
    );
    userStates[chatId].evmSellMessage = null;
  }
  try {
    const tokenDetails = await userStates[chatId]?.allPositionTokens?.filter(
      (item) => item.symbol == token
    );
    if (tokenDetails) {
      userStates[chatId].selectedSellToken = tokenDetails[0];
      const market_cap =
        userStates[chatId].selectedSellToken?.mcap &&
        (await humanReadableFormat(userStates[chatId].selectedSellToken?.mcap));
      userStates[chatId].market_cap = market_cap;
      userStates[chatId].sellPrice = Number(
        (userStates[chatId].selectedSellToken?.qty * 10) / 100
      );
      const oldPrice =
        userStates[chatId].selectedSellToken?.qty *
        userStates[chatId].selectedSellToken?.price_at_invested;
      const newPrice =
        userStates[chatId].selectedSellToken?.qty *
        userStates[chatId].selectedSellToken?.currentPrice;
      const difference = Math.abs(Number(oldPrice - newPrice).toFixed(2));
      userStates[chatId].difference = difference;
      userStates[chatId].evmSellMessage = await bot.sendMessage(
        chatId,
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
          userStates[chatId].selectedSellToken?.tokenAddress
        }</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
          userStates[chatId].selectedSellToken?.currentPrice /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)} / ${Number(
          userStates[chatId].selectedSellToken?.currentPrice
        )?.toFixed(5)}$
📊 5m : ${Number(
          userStates[chatId].selectedSellToken?.variation5m
            ? userStates[chatId].selectedSellToken?.variation5m
            : 0
        )?.toFixed(3)}% 1h : ${Number(
          userStates[chatId].selectedSellToken?.variation1h
            ? userStates[chatId].selectedSellToken?.variation1h
            : 0
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId].selectedSellToken?.variation6h
            ? userStates[chatId].selectedSellToken?.variation6h
            : 0
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId].selectedSellToken?.variation24h
            ? userStates[chatId].selectedSellToken?.variation24h
            : 0
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId].market_cap
            : "Not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance :${Number(
          userStates[chatId].selectedSellToken?.value_in_usd /
            userStates[chatId]?.nativeBalance?.usd_value
        ).toFixed(5)}(${Number(
          (userStates[chatId].selectedSellToken?.value_in_usd /
            userStates[chatId]?.nativeBalance?.usd_value) *
            userStates[chatId]?.nativeBalance?.usd_value
        ).toFixed(2)})${userStates[chatId]?.nativeBalance?.symbol} / ${Number(
          userStates[chatId].selectedSellToken?.qty
        )?.toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.value_in_usd
        ).toFixed(3)}$)\n
📊 Avg Entry Price : ${Number(
          userStates[chatId].selectedSellToken?.price_at_invested
        ).toFixed(5)}$
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId]?.selectedSellToken?.price_at_invested <
          userStates[chatId].selectedSellToken?.currentPrice
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage_of_growth > 0
            ? "+"
            : ""
        }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
          userStates[chatId]?.selectedSellToken?.price_at_invested <
          userStates[chatId].selectedSellToken?.currentPrice
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage_of_growth > 0
            ? "+"
            : ""
        }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
          ((userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price) *
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(2)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
          userStates[chatId].selectedSellToken?.tokenAddress
        }`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "positionButton" },
                { text: "🔄 Refresh", callback_data: "sellEvmPositionRefresh" },
              ],
              [
                {
                  text: `✅ ${Number(userStates[chatId].sellPrice).toFixed(
                    5
                  )} ${tokenDetails[0]?.symbol}`,
                  callback_data: "10+EvmSellPercentage",
                },
                {
                  text: `Sell 25% ${tokenDetails[0]?.symbol}`,
                  callback_data: "25+EvmSellPercentage",
                },
                {
                  text: `Sell 50% ${tokenDetails[0]?.symbol}`,
                  callback_data: "50+EvmSellPercentage",
                },
              ],
              [
                {
                  text: `Sell 75% ${tokenDetails[0]?.symbol}`,
                  callback_data: "75+EvmSellPercentage",
                },
                {
                  text: `Sell 100% ${tokenDetails[0]?.symbol}`,
                  callback_data: "100+EvmSellPercentage",
                },
                {
                  text: `Sell X %${tokenDetails[0]?.symbol} ✏️`,
                  callback_data: "customEvmSellPercentageC",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "finalSellEvmPercentageF",
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.log("🚀 ~ handleDynamicSellToken ~ error:", error?.message);
  }
}

// handle all percentage button of position sell dynamically
async function handlePercentageofPositions(chatId, percentage) {
  console.log("🚀 ~ handlePercentageofPositions ~ percentage:", percentage);
  try {
    if (userStates[chatId]?.flag) {
      if (!(percentage == "custom" || percentage == 100)) {
        userStates[chatId].sellPrice = Number(
          (userStates[chatId].selectedSellToken?.qty * percentage) / 100
        );
      }
      if (percentage == 100) {
        userStates[chatId].sellPrice = Number(
          userStates[chatId].selectedSellToken?.qty
        );
      }
      await bot.editMessageText(
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
          userStates[chatId].selectedSellToken?.tokenAddress
        }</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
          userStates[chatId].selectedSellToken?.currentPrice /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)} / ${Number(
          userStates[chatId].selectedSellToken?.currentPrice
        )?.toFixed(5)}$
📊 5m : ${Number(
          userStates[chatId].selectedSellToken?.variation5m
            ? userStates[chatId].selectedSellToken?.variation5m
            : 0
        )?.toFixed(3)}% 1h : ${Number(
          userStates[chatId].selectedSellToken?.variation1h
            ? userStates[chatId].selectedSellToken?.variation1h
            : 0
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId].selectedSellToken?.variation6h
            ? userStates[chatId].selectedSellToken?.variation6h
            : 0
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId].selectedSellToken?.variation24h
            ? userStates[chatId].selectedSellToken?.variation24h
            : 0
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId].market_cap
            : "Not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance :${Number(
          userStates[chatId].selectedSellToken?.value_in_usd /
            userStates[chatId]?.nativeBalance?.usd_value
        ).toFixed(5)}(${Number(
          (userStates[chatId].selectedSellToken?.value_in_usd /
            userStates[chatId]?.nativeBalance?.usd_value) *
            userStates[chatId]?.nativeBalance?.usd_value
        ).toFixed(2)})${userStates[chatId]?.nativeBalance?.symbol} / ${Number(
          userStates[chatId].selectedSellToken?.qty
        )?.toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.value_in_usd
        ).toFixed(3)}$)\n
📊 Avg Entry Price : ${Number(
          userStates[chatId].selectedSellToken?.price_at_invested
        ).toFixed(5)}$
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId]?.selectedSellToken?.price_at_invested <
          userStates[chatId].selectedSellToken?.currentPrice
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage_of_growth > 0
            ? "+"
            : ""
        }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
          userStates[chatId]?.selectedSellToken?.price_at_invested <
          userStates[chatId].selectedSellToken?.currentPrice
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage_of_growth > 0
            ? "+"
            : ""
        }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
          ((userStates[chatId].selectedSellToken?.currentPrice *
            userStates[chatId].sellPrice) /
            userStates[chatId]?.nativeBalance?.usd_price) *
            userStates[chatId]?.nativeBalance?.usd_price
        ).toFixed(2)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
          userStates[chatId].selectedSellToken?.tokenAddress
        }`,
        {
          chat_id: chatId,
          message_id: userStates[chatId].evmSellMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "positionButton" },
                { text: "🔄 Refresh", callback_data: "sellEvmPositionRefresh" },
              ],
              [
                {
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 10%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "10+EvmSellPercentage",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 25%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "25+EvmSellPercentage",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 50%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "50+EvmSellPercentage",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 75%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "75+EvmSellPercentage",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 100%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "100+EvmSellPercentage",
                },
                {
                  text: `${percentage == "custom" ? "✅" : ""} Sell X %${
                    userStates[chatId].selectedSellToken?.symbol
                  } ✏️`,
                  callback_data: "customEvmSellPercentageC",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "finalSellEvmPercentageF",
                },
              ],
            ],
          },
        }
      );
      if (percentage == "custom") {
        userStates[chatId].currentStep = "toTokenSellPercentage";
        userStates[chatId].method = "sell";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      }
    } else {
      resetUserState(chatId);
      sellStartTokenSelection(chatId);
    }
  } catch (error) {
    console.log("🚀 ~ handlePercentageofPositions ~ error:", error?.message);
  }
}

//  handle solana sell position
async function handleSolanaPositionSell(chatId, token) {
  console.log("🚀 ~ handleSolanaPositionSell ~ token:", token);
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  if (userStates[chatId].evmSellMessage) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.evmSellMessage?.message_id
    );
    userStates[chatId].evmSellMessage = null;
  }
  try {
    const tokenDetails = await userStates[chatId]?.allPositionTokens?.filter(
      (item) => item.symbol == token
    );
    if (tokenDetails) {
      userStates[chatId].selectedSellToken = tokenDetails[0];
      const market_cap =
        userStates[chatId].selectedSellToken?.mcap &&
        (await humanReadableFormat(userStates[chatId].selectedSellToken?.mcap));
      userStates[chatId].market_cap = market_cap;
      userStates[chatId].sellPrice = Number(
        (userStates[chatId].selectedSellToken?.amount * 10) / 100
      );
      const oldPrice =
        userStates[chatId].selectedSellToken?.amount *
        userStates[chatId].selectedSellToken?.price_at_invested;
      const newPrice =
        userStates[chatId].selectedSellToken?.amount *
        userStates[chatId]?.selectedSellToken?.price;
      const difference = Math.abs(Number(oldPrice - newPrice).toFixed(2));
      userStates[chatId].difference = difference;
      userStates[chatId].evmSellMessage = await bot.sendMessage(
        chatId,
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: Solana
📭 Address : <code>${userStates[chatId].selectedSellToken?.mint}</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
          userStates[chatId].selectedSellToken?.price /
            userStates[chatId]?.nativeBalance
        ).toFixed(5)} SOL / ${Number(
          userStates[chatId].selectedSellToken?.price
        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId].selectedSellToken?.variation5m)?.toFixed(
          3
        )}% 1h : ${Number(
          userStates[chatId].selectedSellToken?.variation1h
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId].selectedSellToken?.variation6h
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId].selectedSellToken?.variation24h
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId].market_cap
            : "Not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
          userStates[chatId].selectedSellToken?.amount
        )?.toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.amount *
            userStates[chatId]?.selectedSellToken?.price
        ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(
          userStates[chatId].selectedSellToken?.price_at_invested
        )?.toFixed(5)}$
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId].selectedSellToken?.price_at_invested <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
        }${Number(userStates[chatId].selectedSellToken?.percentage)?.toFixed(
          2
        )}%)
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
          userStates[chatId].selectedSellToken?.price_at_invested <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
        }${Number(userStates[chatId].selectedSellToken?.percentage)?.toFixed(
          2
        )}%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
          userStates[chatId]?.selectedSellToken?.price *
            userStates[chatId]?.sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId]?.selectedSellToken?.price *
            userStates[chatId]?.sellPrice) /
            userStates[chatId]?.nativeBalance
        ).toFixed(5)}(${(
          Number(
            (userStates[chatId]?.selectedSellToken?.price *
              userStates[chatId]?.sellPrice) /
              userStates[chatId]?.nativeBalance
          ) * userStates[chatId]?.nativeBalance
        ).toFixed(2)}$) SOL
https://dexscreener.com/solana/${userStates[chatId].selectedSellToken?.mint}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "positionButton" },
                {
                  text: "🔄 Refresh",
                  callback_data: "sellSolanaPositionRefresh",
                },
              ],
              [
                {
                  text: `✅ ${Number(userStates[chatId]?.sellPrice).toFixed(
                    5
                  )} ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "10+EvmSellPercentageSol",
                },
                {
                  text: `Sell 25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "25+EvmSellPercentageSol",
                },
                {
                  text: `Sell 50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "50+EvmSellPercentageSol",
                },
              ],
              [
                {
                  text: `Sell 75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "75+EvmSellPercentageSol",
                },
                {
                  text: `Sell 100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                  callback_data: "100+EvmSellPercentageSol",
                },
                {
                  text: `Sell X %${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                  callback_data: "customSellPercentageCSol",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "sellPositionSolanafinal",
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.log("🚀 ~ handleDynamicSellToken ~ error:", error?.message);
  }
}

//  handle solana all percentage of position sell dynamically
async function handleSolanaPercentage(chatId, percentage) {
  if (userStates[chatId]?.positionList) {
    await bot.deleteMessage(
      chatId,
      userStates[chatId]?.positionList?.message_id
    );
    userStates[chatId].positionList = null;
  }
  try {
    if (userStates[chatId].selectedSellToken) {
      if (!(percentage == "custom" || percentage == 100)) {
        userStates[chatId].sellPrice = Number(
          (userStates[chatId].selectedSellToken?.amount * percentage) / 100
        );
      }
      if (percentage == 100) {
        userStates[chatId].sellPrice = Number(
          userStates[chatId].selectedSellToken?.amount
        );
        console.log("🚀sellPrice:", userStates[chatId].sellPrice);
      }
      await bot.editMessageText(
        `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: Solana
📭 Address : <code>${userStates[chatId].selectedSellToken?.mint}</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
          userStates[chatId].selectedSellToken?.price /
            userStates[chatId]?.nativeBalance
        ).toFixed(5)} SOL / ${Number(
          userStates[chatId].selectedSellToken?.price
        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId].selectedSellToken?.variation5m)?.toFixed(
          3
        )}% 1h : ${Number(
          userStates[chatId].selectedSellToken?.variation1h
        )?.toFixed(3)}% || 6h : ${Number(
          userStates[chatId].selectedSellToken?.variation6h
        )?.toFixed(3)}% || 24h : ${Number(
          userStates[chatId].selectedSellToken?.variation24h
        )?.toFixed(3)}%\n
🗃 mcap : ${
          userStates[chatId]?.market_cap
            ? userStates[chatId].market_cap
            : "Not available!!"
        }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
          userStates[chatId].selectedSellToken?.amount
        )?.toFixed(5)}(${Number(
          userStates[chatId].selectedSellToken?.amount *
            userStates[chatId]?.selectedSellToken?.price
        ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(
          userStates[chatId].selectedSellToken?.price_at_invested
        )?.toFixed(5)}$
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
          userStates[chatId].selectedSellToken?.price_at_invested <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${userStates[chatId].difference}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
        }${Number(userStates[chatId].selectedSellToken?.percentage)?.toFixed(
          2
        )}%)
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
          userStates[chatId].selectedSellToken?.price_at_invested <
          userStates[chatId]?.selectedSellToken?.price
            ? `+${Number(
                userStates[chatId].difference /
                  userStates[chatId]?.nativeBalance
              ).toFixed(5)}$`
            : `-${userStates[chatId].difference}$`
        }(${
          userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
        }${Number(userStates[chatId].selectedSellToken?.percentage)?.toFixed(
          2
        )}%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
          userStates[chatId]?.selectedSellToken?.price *
            userStates[chatId]?.sellPrice
        ).toFixed(2)}$) ⇄ ${Number(
          (userStates[chatId]?.selectedSellToken?.price *
            userStates[chatId]?.sellPrice) /
            userStates[chatId]?.nativeBalance
        ).toFixed(5)}(${(
          Number(
            (userStates[chatId]?.selectedSellToken?.price *
              userStates[chatId]?.sellPrice) /
              userStates[chatId]?.nativeBalance
          ) * userStates[chatId]?.nativeBalance
        ).toFixed(2)}$) SOL
https://dexscreener.com/solana/${userStates[chatId].selectedSellToken?.mint}`,
        {
          chat_id: chatId,
          message_id: userStates[chatId]?.evmSellMessage?.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "⬅️ Back", callback_data: "positionButton" },
                {
                  text: "🔄 Refresh",
                  callback_data: "sellSolanaPositionRefresh",
                },
              ],
              [
                {
                  text: `${
                    percentage == 10
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 10%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "10+EvmSellPercentageSol",
                },
                {
                  text: `${
                    percentage == 25
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 25%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "25+EvmSellPercentageSol",
                },
                {
                  text: `${
                    percentage == 50
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 50%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "50+EvmSellPercentageSol",
                },
              ],
              [
                {
                  text: `${
                    percentage == 75
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 75%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "75+EvmSellPercentageSol",
                },
                {
                  text: `${
                    percentage == 100
                      ? `✅ ${Number(userStates[chatId].sellPrice).toFixed(5)}`
                      : "Sell 100%"
                  } ${userStates[chatId].selectedSellToken?.symbol}`,
                  callback_data: "100+EvmSellPercentageSol",
                },
                {
                  text: `${percentage == "custom" ? "✅" : ""} Sell X %${
                    userStates[chatId].selectedSellToken?.symbol
                  } ✏️`,
                  callback_data: "customSellPercentageCSol",
                },
              ],
              [
                {
                  text: `Sell`,
                  callback_data: "sellPositionSolanafinal",
                },
              ],
            ],
          },
        }
      );
      if (percentage == "custom") {
        userStates[chatId].currentStep = "toTokenSellPercentageSolCustom";
        userStates[chatId].method = "sell";
        userStates[chatId].flag = "solana";
        userStates[chatId].customAmountSellEvm = await bot.sendMessage(
          chatId,
          "Enter Qty that you want to sell:-"
        );
      }
    }
  } catch (error) {
    console.log("🚀 ~ handleSolanaPercentage ~ error:", error?.message);
  }
}

// handle EVM transfer per and wallet
async function handleEvmTransferPercentage(chatId, percentage) {
  try {
    if (
      !(
        percentage == "customEvmTransfer" ||
        percentage == "customTransferWallet" ||
        percentage == "customPerTransfer" ||
        percentage == 100
      )
    ) {
      userStates[chatId].transferPrice = Number(
        (userStates[chatId].selectedSellToken?.balance_formatted * percentage) /
          100
      );
    }
    if (percentage == 100) {
      userStates[chatId].transferPrice = Number(
        userStates[chatId].selectedSellToken?.balance_formatted
      );
    }
    await bot.editMessageText(
      `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
        userStates[chatId].selectedSellToken?.token_address
      }</code>\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
        userStates[chatId].selectedSellToken?.balance_formatted
      )?.toFixed(5)}</code>(${Number(
        userStates[chatId].selectedSellToken?.usd_value
      ).toFixed(2)}$)
📉 You Withdraw : ${Number(userStates[chatId].transferPrice).toFixed(
        5
      )}(${Number(
        userStates[chatId].selectedSellToken?.usd_price *
          userStates[chatId].transferPrice
      ).toFixed(2)}$)\n
https://dexscreener.com/${
        userStates[chatId]?.network == "ether"
          ? "ethereum"
          : userStates[chatId]?.network
      }/${userStates[chatId].selectedSellToken?.token_address}`,
      {
        chat_id: chatId,
        message_id: userStates[chatId]?.evmTransferMessage?.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${
                  percentage == 10
                    ? `✅ ${Number(userStates[chatId].transferPrice).toFixed(
                        4
                      )}`
                    : "10%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "10EvmPerTransfer",
              },
              {
                text: `${
                  percentage == 25
                    ? `✅ ${Number(userStates[chatId].transferPrice).toFixed(
                        4
                      )}`
                    : "25%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "25EvmPerTransfer",
              },
              {
                text: `${
                  percentage == 50
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "50%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "50EvmPerTransfer",
              },
            ],
            [
              {
                text: `${
                  percentage == 75
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "75%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "75EvmPerTransfer",
              },
              {
                text: `${
                  percentage == 100
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "100%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "100EvmPerTransfer",
              },
              {
                text: `${percentage == "customPerTransfer" ? "✅" : ""} X % of${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customPerTransfer",
              },
            ],
            // [
            //   {
            //     text: `${percentage == "customEvmTransfer" ? "✅" : ""} X ${
            //       userStates[chatId]?.selectedSellToken?.symbol
            //     } ✏️`,
            //     callback_data: "customTransferAmount",
            //   },
            // ],
            [
              {
                text: `${percentage == "customTransferWallet" ? "✅" : ""} ${
                  userStates[chatId]?.toWalletAddress
                } ✏️`,
                callback_data: "customTransferWallet",
              },
            ],
            [
              {
                text: `Withraw`,
                callback_data: "finalTransferEvmWallet",
              },
            ],
          ],
        },
      }
    );
    if (percentage == "customPerTransfer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter % you want to withraw"
      );
      userStates[chatId].currentStep = "customPerTransfer";
    }
    if (percentage == "customTransferWallet") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Which address should your tokens to sent to?"
      );
      userStates[chatId].currentStep = "customTransferWallet";
    }
    if (percentage == "customEvmTransfer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter amount you want to withraw"
      );
      userStates[chatId].currentStep = "customEvmTransfer";
    }
  } catch (error) {
    console.log("🚀 ~ handleEvmTransferPercentage ~ error:", error?.message);
  }
}

// handle  SOL transfer per and wallet

async function handleSolTransferPercentage(chatId, percentage) {
  try {
    if (
      !(
        percentage == "customEvmTransfer" ||
        percentage == "customTransferWallet" ||
        percentage == "customPerTransfer" ||
        percentage == 100
      )
    ) {
      userStates[chatId].transferPrice = Number(
        (userStates[chatId]?.selectedSellSolanaToken?.amount * percentage) / 100
      );
    }
    if (percentage == 100) {
      userStates[chatId].transferPrice = Number(
        userStates[chatId]?.selectedSellSolanaToken?.amount
      );
    }
    await bot.editMessageText(
      `✨ Information of ${userStates[chatId]?.selectedSellToken?.symbol}\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.name}
🔗 Chain : "Solana" 
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
🗃 ${userStates[chatId]?.selectedSellToken?.name} balance : ${Number(
        userStates[chatId]?.selectedSellSolanaToken?.amount
      ).toFixed(5)}(${Number(
        userStates[chatId].selectedSellSolanaToken?.amount *
          userStates[chatId]?.selectedSellToken?.price
      ).toFixed(4)}$)
📉 You withdraw : ${Number(userStates[chatId]?.transferPrice).toFixed(
        5
      )}(${Number(
        userStates[chatId]?.selectedSellToken?.price *
          userStates[chatId]?.transferPrice
      ).toFixed(5)}$)\n
https://dexscreener.com/solana/${
        userStates[chatId]?.selectedSellToken?.address
      }`,
      {
        chat_id: chatId,
        message_id: userStates[chatId]?.evmTransferMessage?.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${
                  percentage == 10
                    ? `✅ ${Number(userStates[chatId].transferPrice).toFixed(
                        4
                      )}`
                    : "10%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "10SolPerTransfer",
              },
              {
                text: `${
                  percentage == 25
                    ? `✅ ${Number(userStates[chatId].transferPrice).toFixed(
                        4
                      )}`
                    : "25%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "25SolPerTransfer",
              },
              {
                text: `${
                  percentage == 50
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "50%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "50SolPerTransfer",
              },
            ],
            [
              {
                text: `${
                  percentage == 75
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "75%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "75SolPerTransfer",
              },
              {
                text: `${
                  percentage == 100
                    ? `✅ ${Number(userStates[chatId]?.transferPrice).toFixed(
                        4
                      )}`
                    : "100%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "100SolPerTransfer",
              },
              {
                text: `${percentage == "customPerTransfer" ? "✅" : ""} X % ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customSolPerTransfer",
              },
            ],
            [
              {
                text: `${percentage == "customEvmTransfer" ? "✅" : ""} X ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customSOlTransferAmt",
              },
            ],
            [
              {
                text: `${percentage == "customTransferWallet" ? "✅" : ""} ${
                  userStates[chatId]?.toWalletAddress
                } ✏️`,
                callback_data: "customSolTransferWallet",
              },
            ],
            [
              {
                text: `Withraw`,
                callback_data: "finalTransferSolWallet",
              },
            ],
          ],
        },
      }
    );
    if (percentage == "customPerTransfer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter % you want to withraw"
      );
      userStates[chatId].currentStep = "customPerTransferSol";
    }
    if (percentage == "customTransferWallet") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Which address should your tokens to sent to?"
      );
      userStates[chatId].currentStep = "customTransferWalletSol";
    }
    if (percentage == "customEvmTransfer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter amount you want to withraw"
      );
      userStates[chatId].currentStep = "customTransferSol";
    }
  } catch (error) {
    console.log("🚀 ~ handleSolTransferPercentage ~ error:", error?.message);
  }
}

// handle swap  SOL percentage

async function handleSolSwapPercentage(chatId, percentage) {
  try {
    if (
      !(
        percentage == "customSolToAddress" ||
        percentage == "customSolAmt" ||
        percentage == "customSolPer" ||
        percentage == 100
      )
    ) {
      userStates[chatId].swapPrice = Number(
        (userStates[chatId]?.selectedSellSolanaToken?.amount * percentage) / 100
      );
    }
    if (percentage == 100) {
      userStates[chatId].swapPrice = Number(
        userStates[chatId]?.selectedSellSolanaToken?.amount
      );
    }
    await bot.editMessageText(
      `✨ Information of ${userStates[chatId]?.selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
        userStates[chatId]?.selectedSellToken?.price /
          userStates[chatId].nativeBalance
      ).toFixed(5)} SOL / ${Number(
        userStates[chatId]?.selectedSellToken?.price
      )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.selectedSellToken?.variation5m)?.toFixed(
        3
      )}% || 1h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation1h
      )?.toFixed(3)}% || 6h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation6h
      )?.toFixed(3)}% || 24h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation24h
      )?.toFixed(3)}%\n
🗃  mcap : ${
        userStates[chatId].market_cap
          ? userStates[chatId].market_cap
          : "not available!!"
      }
🗃 ${userStates[chatId]?.selectedSellToken?.symbol} balance : <code>${Number(
        userStates[chatId]?.selectedSellSolanaToken?.amount
      ).toFixed(5)}</code>(<code>${Number(
        userStates[chatId].selectedSellSolanaToken?.amount *
          userStates[chatId]?.selectedSellToken?.price
      ).toFixed(4)}$</code>)\n
🛒 You swap :${Number(
        (userStates[chatId]?.selectedSellToken?.price *
          userStates[chatId]?.swapPrice) /
          userStates[chatId].nativeBalance
      ).toFixed(5)}(${Number(
        ((userStates[chatId]?.selectedSellToken?.price *
          userStates[chatId]?.swapPrice) /
          userStates[chatId].nativeBalance) *
          userStates[chatId].nativeBalance
      ).toFixed(2)}$) SOL ⇄ ${Number(userStates[chatId]?.swapPrice).toFixed(
        5
      )}(${Number(
        userStates[chatId]?.selectedSellToken?.price *
          userStates[chatId]?.swapPrice
      ).toFixed(2)}$)  
https://dexscreener.com/solana/${
        userStates[chatId]?.selectedSellToken?.address
      }`,
      {
        chat_id: chatId,
        message_id: userStates[chatId]?.evmSwapMessage?.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${
                  percentage == 10
                    ? `✅ ${Number(userStates[chatId]?.swapPrice).toFixed(4)}`
                    : "10%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "10SolPerSwap",
              },
              {
                text: `${
                  percentage == 25
                    ? `✅ ${Number(userStates[chatId]?.swapPrice).toFixed(4)}`
                    : "25%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "25SolPerSwap",
              },
              {
                text: `${
                  percentage == 50
                    ? `✅ ${Number(userStates[chatId]?.swapPrice).toFixed(4)}`
                    : "50%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "50SolPerSwap",
              },
            ],
            [
              {
                text: `${
                  percentage == 75
                    ? `✅ ${Number(userStates[chatId]?.swapPrice).toFixed(4)}`
                    : "75%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "75SolPerSwap",
              },
              {
                text: `${
                  percentage == 100
                    ? `✅ ${Number(userStates[chatId]?.swapPrice).toFixed(4)}`
                    : "100%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "100SolPerSwap",
              },
              {
                text: `${percentage == "customSolPer" ? "✅" : ""} X % ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customSolPerSwap",
              },
            ],
            [
              {
                text: `${percentage == "customSolAmt" ? "✅" : ""} X ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customSolSwapAmount",
              },
            ],
            [
              {
                text: `${percentage == "customSolToAddress" ? "✅" : ""} ${
                  userStates[chatId]?.toSwapAddress
                } ✏️`,
                callback_data: "customSolSwapWallet",
              },
            ],
            [
              {
                text: `Swap`,
                callback_data: "finalSwapSolWallet",
              },
            ],
          ],
        },
      }
    );
    if (percentage == "customSolPer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter % you want to withraw"
      );
      userStates[chatId].currentStep = "customPerTransferSwap";
    }

    if (percentage == "customSolAmt") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter amount you want to swap"
      );
      userStates[chatId].currentStep = "customTransferSwap";
    }
    if (percentage == "customSolToAddress") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter token address?"
      );
      userStates[chatId].currentStep = "customWalletSwap";
    }
  } catch (error) {
    console.log("🚀 ~ handleSolSwapPercentage ~ error:", error?.message);
  }
}

async function handleEvmSwapPercentage(chatId, percentage) {
  try {
    if (
      !(
        percentage == "customEvmToAddress" ||
        percentage == "customEvmAmt" ||
        percentage == "customEvmPer" ||
        percentage == 100
      )
    ) {
      userStates[chatId].swapPrice = Number(
        (userStates[chatId].selectedSellToken?.balance_formatted * percentage) /
          100
      );
    }
    if (percentage == 100) {
      userStates[chatId].swapPrice = Number(
        userStates[chatId].selectedSellToken?.balance_formatted
      );
    }
    await bot.editMessageText(
      `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷  Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
🔗 Chain: ${userStates[chatId]?.network}\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
        userStates[chatId].selectedSellToken?.usd_price /
          userStates[chatId].nativeBalance?.usd_price
      ).toFixed(5)}${userStates[chatId].nativeBalance?.symbol} / ${Number(
        userStates[chatId].selectedSellToken?.usd_price
      )?.toFixed(5)}$
📊 5m : ${Number(
        userStates[chatId]?.selectedSellToken?.variation5m
          ? userStates[chatId]?.selectedSellToken?.variation5m
          : 0
      )?.toFixed(3)}% || 1h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation1h
          ? userStates[chatId]?.selectedSellToken?.variation1h
          : 0
      )?.toFixed(3)}% || 6h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation6h
          ? userStates[chatId]?.selectedSellToken?.variation6h
          : 0
      )?.toFixed(3)}% || 24h : ${Number(
        userStates[chatId]?.selectedSellToken?.variation24h
          ? userStates[chatId]?.selectedSellToken?.variation24h
          : 0
      )?.toFixed(3)}%\n
🗃 mcap : ${
        userStates[chatId]?.market_cap
          ? userStates[chatId]?.market_cap
          : "not available!!"
      }\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
        userStates[chatId].selectedSellToken?.balance_formatted
      )?.toFixed(5)}(${Number(
        userStates[chatId].selectedSellToken?.usd_value
      ).toFixed(3)}$)
📉 You swap :${Number(
        (userStates[chatId].selectedSellToken?.usd_price *
          userStates[chatId].swapPrice) /
          userStates[chatId]?.nativeBalance?.usd_price
      ).toFixed(5)}(${Number(
        ((userStates[chatId].selectedSellToken?.usd_price *
          userStates[chatId].swapPrice) /
          userStates[chatId]?.nativeBalance?.usd_price) *
          userStates[chatId]?.nativeBalance?.usd_price
      ).toFixed(2)}$)${userStates[chatId]?.nativeBalance?.symbol} ⇄ ${Number(
        userStates[chatId].swapPrice
      ).toFixed(5)}(${Number(
        userStates[chatId].selectedSellToken?.usd_price *
          userStates[chatId].swapPrice
      ).toFixed(2)}$)${userStates[chatId].selectedSellToken?.symbol}
https://dexscreener.com/${
        userStates[chatId]?.network == "ether"
          ? "ethereum"
          : userStates[chatId]?.network
      }/${userStates[chatId].selectedSellToken?.token_address}`,
      {
        chat_id: chatId,
        message_id: userStates[chatId]?.evmSwapMessage?.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${
                  percentage == 10
                    ? `✅ ${Number(userStates[chatId].swapPrice).toFixed(4)}`
                    : "10%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "10EvmPerSwap",
              },
              {
                text: `${
                  percentage == 25
                    ? `✅ ${Number(userStates[chatId].swapPrice).toFixed(4)}`
                    : "25%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "25EvmPerSwap",
              },
              {
                text: `${
                  percentage == 50
                    ? `✅ ${Number(userStates[chatId].swapPrice).toFixed(4)}`
                    : "50%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "50EvmPerSwap",
              },
            ],
            [
              {
                text: `${
                  percentage == 75
                    ? `✅ ${Number(userStates[chatId].swapPrice).toFixed(4)}`
                    : "75%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "75EvmPerSwap",
              },
              {
                text: `${
                  percentage == 100
                    ? `✅ ${Number(userStates[chatId].swapPrice).toFixed(4)}`
                    : "100%"
                } ${userStates[chatId]?.selectedSellToken?.symbol}`,
                callback_data: "100EvmPerSwap",
              },
              {
                text: `${percentage == "customEvmPer" ? "✅" : ""} X % ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customPerEvmSwap",
              },
            ],
            [
              {
                text: `${percentage == "customEvmAmt" ? "✅" : ""} X ${
                  userStates[chatId]?.selectedSellToken?.symbol
                } ✏️`,
                callback_data: "customSwapEvmAmount",
              },
            ],
            [
              {
                text: `${percentage == "customEvmToAddress" ? "✅" : ""} ${
                  userStates[chatId]?.toSwapAddress
                } ✏️`,
                callback_data: "customEvmSwapToken",
              },
            ],
            [
              {
                text: `Swap`,
                callback_data: "finalSwapEvmWallet",
              },
            ],
          ],
        },
      }
    );
    if (percentage == "customEvmPer") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter % you want to swap"
      );
      userStates[chatId].currentStep = "customPerSwapEvm";
    }

    if (percentage == "customEvmAmt") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter amount you want to swap"
      );
      userStates[chatId].currentStep = "customSwapEvmAmt";
    }
    if (percentage == "customEvmToAddress") {
      userStates[chatId].transferCustomMessage = await bot.sendMessage(
        chatId,
        "Enter token address?"
      );
      userStates[chatId].currentStep = "customWalletSwapEvm";
    }
  } catch (error) {
    console.log("🚀 ~ handleEvmSwapPercentage ~ error:", error?.message);
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
  } else if (msg.text === "/balance") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await bot.sendMessage(chatId, `🌟 Choose a network 🌟`, {
      reply_markup: JSON.stringify(evmWalletBalance),
    });
  } else if (msg.text === "/positions") {
    const isUser = await getstartBot(chatId);
    if (!isUser) {
      return await sendWelcomeMessage(chatId);
    }
    resetUserState(chatId);
    await positionsChainSelection(chatId);
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

        // handle solSwap
        case "infoSolanaSwap":
          state.toSwapAddress = text;
          try {
            if (userStates[chatId]?.sellTokensList) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.sellTokensList?.message_id
              );
              userStates[chatId].sellTokensList = null;
            }
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.swapToTokenMessage?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            const { loaderMessage, interval } = await animateLoader(chatId);
            try {
              const tokenDetails = await userStates[
                chatId
              ]?.allSellSolanaToken?.filter(
                (item) => item.symbol == userStates[chatId]?.swapFromToken
              );
              console.log(
                "🚀 ~ handleDynamicSellSolana ~ tokenDetails:",
                tokenDetails
              );
              if (tokenDetails) {
                userStates[chatId].selectedSellSolanaToken = tokenDetails[0];
                await axios
                  .post(`${API_URL}/dexSol`, {
                    token: tokenDetails[0]?.mint,
                    chatId,
                  })
                  .then(async (res) => {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    userStates[chatId].selectedSellToken = res?.data?.data;
                    const market_cap =
                      res?.data?.data?.mcap &&
                      (await humanReadableFormat(
                        userStates[chatId].selectedSellToken?.mcap
                      ));
                    userStates[chatId].market_cap = market_cap;
                    const liq =
                      userStates[chatId].selectedSellToken?.liq &&
                      (await humanReadableFormat(
                        userStates[chatId].selectedSellToken?.liq
                      ));
                    userStates[chatId].liq = liq;
                    const response = await axios.post(
                      `${API_URL}/getPositionSingleTokenInfoSol`,
                      {
                        chatId: chatId,
                        token: userStates[chatId].selectedSellToken?.address,
                      }
                    );
                    const change =
                      userStates[chatId]?.selectedSellToken?.price -
                      response?.data?.dataBaseTokens?.currentPrice;
                    const percentageChange =
                      (change / response?.data?.dataBaseTokens?.currentPrice) *
                      100;
                    userStates[chatId].percentageChange =
                      Number(percentageChange).toFixed(2);
                    const balanceInUSD = Number(
                      userStates[chatId].selectedSellSolanaToken?.amount *
                        userStates[chatId]?.selectedSellToken?.price
                    );
                    userStates[chatId].swapPrice = Number(
                      (tokenDetails[0]?.amount * 10) / 100
                    );
                    userStates[chatId].evmSwapMessage = await bot.sendMessage(
                      chatId,
                      `✨ Information of ${
                        userStates[chatId]?.selectedSellToken?.name
                      }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
                        userStates[chatId]?.selectedSellToken?.price /
                          userStates[chatId].nativeBalance
                      ).toFixed(5)} SOL / ${Number(
                        userStates[chatId]?.selectedSellToken?.price
                      )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.selectedSellToken?.variation5m)?.toFixed(
                        3
                      )}% || 1h : ${Number(
                        userStates[chatId]?.selectedSellToken?.variation1h
                      )?.toFixed(3)}% || 6h : ${Number(
                        userStates[chatId]?.selectedSellToken?.variation6h
                      )?.toFixed(3)}% || 24h : ${Number(
                        userStates[chatId]?.selectedSellToken?.variation24h
                      )?.toFixed(3)}%\n
🗃  mcap : ${
                        userStates[chatId].market_cap
                          ? userStates[chatId].market_cap
                          : "not available!!"
                      }
🗃 ${userStates[chatId]?.selectedSellToken?.symbol} balance : ${Number(
                        userStates[chatId]?.selectedSellSolanaToken?.amount
                      ).toFixed(5)}(${Number(balanceInUSD).toFixed(4)})\n
🛒 You swap :${Number(
                        (userStates[chatId]?.selectedSellToken?.price *
                          userStates[chatId]?.swapPrice) /
                          userStates[chatId].nativeBalance
                      ).toFixed(5)}(${Number(
                        ((userStates[chatId]?.selectedSellToken?.price *
                          userStates[chatId]?.swapPrice) /
                          userStates[chatId].nativeBalance) *
                          userStates[chatId].nativeBalance
                      ).toFixed(2)}$) SOL ⇄ ${Number(
                        userStates[chatId]?.swapPrice
                      ).toFixed(5)}(${Number(
                        userStates[chatId]?.selectedSellToken?.price *
                          userStates[chatId]?.swapPrice
                      ).toFixed(2)}$)  
https://dexscreener.com/solana/${
                        userStates[chatId]?.selectedSellToken?.address
                      }`,
                      {
                        parse_mode: "HTML",
                        reply_markup: {
                          inline_keyboard: [
                            [
                              {
                                text: `✅ ${Number(
                                  userStates[chatId]?.swapPrice
                                ).toFixed(4)} ${
                                  userStates[chatId]?.selectedSellToken?.symbol
                                }`,
                                callback_data: "10SolPerSwap",
                              },
                              {
                                text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                callback_data: "25SolPerSwap",
                              },
                              {
                                text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                callback_data: "50SolPerSwap",
                              },
                            ],
                            [
                              {
                                text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                callback_data: "75SolPerSwap",
                              },
                              {
                                text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                callback_data: "100SolPerSwap",
                              },
                              {
                                text: ` X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                                callback_data: "customSolPerSwap",
                              },
                            ],
                            [
                              {
                                text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                                callback_data: "customSolSwapAmount",
                              },
                            ],
                            [
                              {
                                text: `${userStates[chatId]?.toSwapAddress} ✏️`,
                                callback_data: "customSolSwapWallet",
                              },
                            ],
                            [
                              {
                                text: `Swap`,
                                callback_data: "finalSwapSolWallet",
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
              console.log(
                "🚀 ~ handleDynamicSellToken ~ error:",
                error?.message
              );
              await bot.sendMessage(
                chatId,
                "🔴 Something went wrong, please try again after some time!!"
              );
            }
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error?.message);
          }
          break;
          break;
        case "customPerTransferSwap":
          try {
            userStates[chatId].swapPrice = Number(
              (userStates[chatId]?.selectedSellSolanaToken?.amount * text) / 100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.name
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
                userStates[chatId]?.selectedSellToken?.price /
                  userStates[chatId].nativeBalance
              ).toFixed(5)} SOL / ${Number(
                userStates[chatId]?.selectedSellToken?.price
              )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.selectedSellToken?.variation5m)?.toFixed(
                3
              )}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
              )?.toFixed(3)}%\n
🗃  mcap : ${
                userStates[chatId].market_cap
                  ? userStates[chatId].market_cap
                  : "not available!!"
              }
🗃 ${userStates[chatId]?.selectedSellToken?.symbol} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)\n
🛒 You swap :${Number(
                (userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance
              ).toFixed(5)}(${Number(
                ((userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance) *
                  userStates[chatId].nativeBalance
              ).toFixed(2)}$) SOL ⇄ ${Number(
                userStates[chatId]?.swapPrice
              ).toFixed(5)}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice
              ).toFixed(2)}$)  
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10SolPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerSwap",
                      },
                      {
                        text: `✅ ${Number(
                          userStates[chatId].swapPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customSolPerSwap",
                      },
                    ],
                    [
                      {
                        text: ` X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolSwapAmount",
                      },
                    ],
                    [
                      {
                        text: ` ${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customSolSwapWallet",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolSwapPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customTransferSwap":
          try {
            userStates[chatId].swapPrice = text;
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.name
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
                userStates[chatId]?.selectedSellToken?.price /
                  userStates[chatId].nativeBalance
              ).toFixed(5)} SOL / ${Number(
                userStates[chatId]?.selectedSellToken?.price
              )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.selectedSellToken?.variation5m)?.toFixed(
                3
              )}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
              )?.toFixed(3)}%\n
🗃  mcap : ${
                userStates[chatId].market_cap
                  ? userStates[chatId].market_cap
                  : "not available!!"
              }
🗃 ${userStates[chatId]?.selectedSellToken?.symbol} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)\n
🛒 You swap :${Number(
                (userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance
              ).toFixed(5)}(${Number(
                ((userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance) *
                  userStates[chatId].nativeBalance
              ).toFixed(2)}$) SOL ⇄ ${Number(
                userStates[chatId]?.swapPrice
              ).toFixed(5)}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice
              ).toFixed(2)}$)  
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10SolPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerSwap",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolPerSwap",
                      },
                    ],
                    [
                      {
                        text: `✅ ${Number(userStates[chatId].swapPrice)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customSolSwapAmount",
                      },
                    ],
                    [
                      {
                        text: ` ${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customSolSwapWallet",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolSwapPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customWalletSwap":
          try {
            userStates[chatId].toSwapAddress = text;
            userStates[chatId].swapPrice = Number(
              (userStates[chatId]?.selectedSellSolanaToken?.amount * 10) / 100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.name
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
                userStates[chatId]?.selectedSellToken?.price /
                  userStates[chatId].nativeBalance
              ).toFixed(5)} SOL / ${Number(
                userStates[chatId]?.selectedSellToken?.price
              )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.selectedSellToken?.variation5m)?.toFixed(
                3
              )}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
              )?.toFixed(3)}%\n
🗃  mcap : ${
                userStates[chatId].market_cap
                  ? userStates[chatId].market_cap
                  : "not available!!"
              }
🗃 ${userStates[chatId]?.selectedSellToken?.symbol} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)\n
🛒 You swap :${Number(
                (userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance
              ).toFixed(5)}(${Number(
                ((userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice) /
                  userStates[chatId].nativeBalance) *
                  userStates[chatId].nativeBalance
              ).toFixed(2)}$) SOL ⇄ ${Number(
                userStates[chatId]?.swapPrice
              ).toFixed(5)}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.swapPrice
              ).toFixed(2)}$)  
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `✅ ${Number(
                          userStates[chatId].swapPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        }`,
                        callback_data: "10SolPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerSwap",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolPerSwap",
                      },
                    ],
                    [
                      {
                        text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolSwapAmount",
                      },
                    ],
                    [
                      {
                        text: ` ${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customSolSwapWallet",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolSwapPercentage ~ error:",
              error?.message
            );
          }
          break;

        //  handle Evm swap

        case "infoEvmSwap":
          userStates[chatId].toSwapAddress = text;
          try {
            if (userStates[chatId]?.sellTokensList) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.sellTokensList?.message_id
              );
              userStates[chatId].sellTokensList = null;
            }
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.swapToTokenMessage?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            const tokenDetails = await userStates[
              chatId
            ]?.allSellTokens?.filter(
              (item) => item.symbol == state?.swapFromToken
            );
            if (tokenDetails) {
              userStates[chatId].selectedSellToken = tokenDetails[0];
              const response = await axios.post(
                `${API_URL}/getPositionSingleTokenInfoEvm`,
                {
                  chatId: chatId,
                  token: userStates[chatId].selectedSellToken?.token_address,
                  chainId: userStates[chatId]?.flag,
                }
              );
              const change =
                userStates[chatId].selectedSellToken?.usd_price -
                response?.data?.dataBaseTokens?.currentPrice;
              const percentageChange =
                (change / response?.data?.dataBaseTokens?.currentPrice) * 100;
              userStates[chatId].percentageChange =
                Number(percentageChange).toFixed(2);
              const market_cap =
                userStates[chatId].selectedSellToken?.mcap &&
                (await humanReadableFormat(
                  userStates[chatId].selectedSellToken?.mcap
                ));
              userStates[chatId].market_cap = market_cap;
              userStates[chatId].swapPrice = Number(
                (userStates[chatId].selectedSellToken?.balance_formatted * 10) /
                  100
              );
              userStates[chatId].evmSwapMessage = await bot.sendMessage(
                chatId,
                `✨ Information of ${
                  userStates[chatId].selectedSellToken?.name
                }\n
🏷  Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
🔗 Chain: ${userStates[chatId]?.network}\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
                  userStates[chatId].selectedSellToken?.usd_price /
                    userStates[chatId].nativeBalance?.usd_price
                ).toFixed(5)}${
                  userStates[chatId].nativeBalance?.symbol
                } / ${Number(
                  userStates[chatId].selectedSellToken?.usd_price
                )?.toFixed(5)}$
📊 5m : ${Number(
                  userStates[chatId]?.selectedSellToken?.variation5m
                    ? userStates[chatId]?.selectedSellToken?.variation5m
                    : 0
                )?.toFixed(3)}% || 1h : ${Number(
                  userStates[chatId]?.selectedSellToken?.variation1h
                    ? userStates[chatId]?.selectedSellToken?.variation1h
                    : 0
                )?.toFixed(3)}% || 6h : ${Number(
                  userStates[chatId]?.selectedSellToken?.variation6h
                    ? userStates[chatId]?.selectedSellToken?.variation6h
                    : 0
                )?.toFixed(3)}% || 24h : ${Number(
                  userStates[chatId]?.selectedSellToken?.variation24h
                    ? userStates[chatId]?.selectedSellToken?.variation24h
                    : 0
                )?.toFixed(3)}%\n
🗃 mcap : ${
                  userStates[chatId]?.market_cap
                    ? userStates[chatId]?.market_cap
                    : "not available!!"
                }\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
                  userStates[chatId].selectedSellToken?.balance_formatted
                )?.toFixed(5)}(${Number(
                  userStates[chatId].selectedSellToken?.usd_value
                ).toFixed(3)}$)
📉 You swap :${Number(
                  (userStates[chatId].selectedSellToken?.usd_price *
                    userStates[chatId].swapPrice) /
                    userStates[chatId]?.nativeBalance?.usd_price
                ).toFixed(5)}(${Number(
                  ((userStates[chatId].selectedSellToken?.usd_price *
                    userStates[chatId].swapPrice) /
                    userStates[chatId]?.nativeBalance?.usd_price) *
                    userStates[chatId]?.nativeBalance?.usd_price
                ).toFixed(2)}$)${
                  userStates[chatId]?.nativeBalance?.symbol
                } ⇄ ${Number(userStates[chatId].swapPrice).toFixed(5)}(${Number(
                  userStates[chatId].selectedSellToken?.usd_price *
                    userStates[chatId].swapPrice
                ).toFixed(2)}$)${userStates[chatId].selectedSellToken?.symbol}
https://dexscreener.com/${
                  userStates[chatId]?.network == "ether"
                    ? "ethereum"
                    : userStates[chatId]?.network
                }/${userStates[chatId].selectedSellToken?.token_address}`,
                {
                  parse_mode: "HTML",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: `✅ ${Number(
                            userStates[chatId].swapPrice
                          ).toFixed(4)} ${
                            userStates[chatId]?.selectedSellToken?.symbol
                          }`,
                          callback_data: "10EvmPerSwap",
                        },
                        {
                          text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "25EvmPerSwap",
                        },
                        {
                          text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "50EvmPerSwap",
                        },
                      ],
                      [
                        {
                          text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "75EvmPerSwap",
                        },
                        {
                          text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "100EvmPerSwap",
                        },
                        {
                          text: `X % of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                          callback_data: "customPerEvmSwap",
                        },
                      ],
                      [
                        {
                          text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                          callback_data: "customSwapEvmAmount",
                        },
                      ],
                      [
                        {
                          text: `${userStates[chatId]?.toSwapAddress} ✏️`,
                          callback_data: "customEvmToken",
                        },
                      ],
                      [
                        {
                          text: `Swap`,
                          callback_data: "finalSwapEvmWallet",
                        },
                      ],
                    ],
                  },
                }
              );
            }
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error?.message);
          }
          break;
        case "customPerSwapEvm":
          try {
            userStates[chatId].swapPrice = Number(
              (userStates[chatId].selectedSellToken?.balance_formatted * text) /
                100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷  Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
🔗 Chain: ${userStates[chatId]?.network}\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
                userStates[chatId].selectedSellToken?.usd_price /
                  userStates[chatId].nativeBalance?.usd_price
              ).toFixed(5)}${
                userStates[chatId].nativeBalance?.symbol
              } / ${Number(
                userStates[chatId].selectedSellToken?.usd_price
              )?.toFixed(5)}$
📊 5m : ${Number(
                userStates[chatId]?.selectedSellToken?.variation5m
                  ? userStates[chatId]?.selectedSellToken?.variation5m
                  : 0
              )?.toFixed(3)}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
                  ? userStates[chatId]?.selectedSellToken?.variation1h
                  : 0
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
                  ? userStates[chatId]?.selectedSellToken?.variation6h
                  : 0
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
                  ? userStates[chatId]?.selectedSellToken?.variation24h
                  : 0
              )?.toFixed(3)}%\n
🗃 mcap : ${
                userStates[chatId]?.market_cap
                  ? userStates[chatId]?.market_cap
                  : "not available!!"
              }\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(3)}$)
📉 You swap :${Number(
                (userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}(${Number(
                ((userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price) *
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(2)}$)${
                userStates[chatId]?.nativeBalance?.symbol
              } ⇄ ${Number(userStates[chatId].swapPrice).toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice
              ).toFixed(2)}$)${userStates[chatId].selectedSellToken?.symbol}
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10EvmPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75%${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerSwap",
                      },
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.swapPrice
                        )?.toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customPerEvmSwap",
                      },
                    ],
                    [
                      {
                        text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSwapEvmAmount",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customEvmSwapToken",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmSwapPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customSwapEvmAmt":
          try {
            userStates[chatId].swapPrice = Number(text);
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷  Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
🔗 Chain: ${userStates[chatId]?.network}\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
                userStates[chatId].selectedSellToken?.usd_price /
                  userStates[chatId].nativeBalance?.usd_price
              ).toFixed(5)}${
                userStates[chatId].nativeBalance?.symbol
              } / ${Number(
                userStates[chatId].selectedSellToken?.usd_price
              )?.toFixed(5)}$
📊 5m : ${Number(
                userStates[chatId]?.selectedSellToken?.variation5m
                  ? userStates[chatId]?.selectedSellToken?.variation5m
                  : 0
              )?.toFixed(3)}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
                  ? userStates[chatId]?.selectedSellToken?.variation1h
                  : 0
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
                  ? userStates[chatId]?.selectedSellToken?.variation6h
                  : 0
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
                  ? userStates[chatId]?.selectedSellToken?.variation24h
                  : 0
              )?.toFixed(3)}%\n
🗃 mcap : ${
                userStates[chatId]?.market_cap
                  ? userStates[chatId]?.market_cap
                  : "not available!!"
              }\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(3)}$)
📉 You swap :${Number(
                (userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}(${Number(
                ((userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price) *
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(2)}$)${
                userStates[chatId]?.nativeBalance?.symbol
              } ⇄ ${Number(userStates[chatId].swapPrice).toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice
              ).toFixed(2)}$)${userStates[chatId].selectedSellToken?.symbol}
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10EvmPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75%${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerSwap",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customPerEvmSwap",
                      },
                    ],
                    [
                      {
                        text: `✅ ${Number(userStates[chatId]?.swapPrice)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customSwapEvmAmount",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customEvmSwapToken",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmSwapPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customWalletSwapEvm":
          try {
            userStates[chatId].toSwapAddress = text;

            userStates[chatId].swapPrice = Number(
              (userStates[chatId].selectedSellToken?.balance_formatted * 10) /
                100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷  Name : ${userStates[chatId].selectedSellToken?.symbol}
📭 Address : <code>${userStates[chatId].selectedSellToken?.token_address}</code>
🔗 Chain: ${userStates[chatId]?.network}\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
                userStates[chatId].selectedSellToken?.usd_price /
                  userStates[chatId].nativeBalance?.usd_price
              ).toFixed(5)}${
                userStates[chatId].nativeBalance?.symbol
              } / ${Number(
                userStates[chatId].selectedSellToken?.usd_price
              )?.toFixed(5)}$
📊 5m : ${Number(
                userStates[chatId]?.selectedSellToken?.variation5m
                  ? userStates[chatId]?.selectedSellToken?.variation5m
                  : 0
              )?.toFixed(3)}% || 1h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation1h
                  ? userStates[chatId]?.selectedSellToken?.variation1h
                  : 0
              )?.toFixed(3)}% || 6h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation6h
                  ? userStates[chatId]?.selectedSellToken?.variation6h
                  : 0
              )?.toFixed(3)}% || 24h : ${Number(
                userStates[chatId]?.selectedSellToken?.variation24h
                  ? userStates[chatId]?.selectedSellToken?.variation24h
                  : 0
              )?.toFixed(3)}%\n
🗃 mcap : ${
                userStates[chatId]?.market_cap
                  ? userStates[chatId]?.market_cap
                  : "not available!!"
              }\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(3)}$)
📉 You swap :${Number(
                (userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(5)}(${Number(
                ((userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice) /
                  userStates[chatId]?.nativeBalance?.usd_price) *
                  userStates[chatId]?.nativeBalance?.usd_price
              ).toFixed(2)}$)${
                userStates[chatId]?.nativeBalance?.symbol
              } ⇄ ${Number(userStates[chatId].swapPrice).toFixed(5)}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].swapPrice
              ).toFixed(2)}$)${userStates[chatId].selectedSellToken?.symbol}
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmSwapMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.swapPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        }`,
                        callback_data: "10EvmPerSwap",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerSwap",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerSwap",
                      },
                    ],
                    [
                      {
                        text: `75%${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerSwap",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerSwap",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customPerEvmSwap",
                      },
                    ],
                    [
                      {
                        text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSwapEvmAmount",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toSwapAddress} ✏️`,
                        callback_data: "customEvmSwapToken",
                      },
                    ],
                    [
                      {
                        text: `Swap`,
                        callback_data: "finalSwapEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmSwapPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "amountSwap":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/balance" ||
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
              await axios
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
            text == "/balance" ||
            text == "/swap"
          ) {
            resetUserState(chatId);
          } else {
            const { loaderMessage, interval } = await animateLoader(chatId);
            try {
              if (state?.flag == 19999) {
                if (userStates[chatId]?.solanaBuyMessage) {
                  await bot.deleteMessage(
                    chatId,
                    userStates[chatId]?.solanaBuyMessage?.message_id
                  );
                  userStates[chatId].solanaBuyMessage = null;
                }
                if (userStates[chatId]?.evmBuyMessage) {
                  await bot.deleteMessage(
                    chatId,
                    userStates[chatId]?.evmBuyMessage?.message_id
                  );
                  userStates[chatId].evmBuyMessage = null;
                }
                await axios
                  .post(`${API_URL}/dexSol`, {
                    token: state?.toToken,
                    chatId,
                  })
                  .then(async (res) => {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    if (res?.data?.status) {
                      state.buyTokenData = res?.data?.data;
                      state.toBuyAddresName = res?.data?.data?.name;
                      const market_cap =
                        res?.data?.data?.mcap &&
                        (await humanReadableFormat(res?.data?.data?.mcap));
                      userStates[chatId].market_cap = market_cap;
                      const liq =
                        res?.data?.data?.liq &&
                        (await humanReadableFormat(res?.data?.data?.liq));
                      userStates[chatId].liq = liq;
                      state.nativeBalance =
                        res?.data?.data?.nativeTokenDetails?.solana;
                      userStates[chatId].buyPrice = Number(
                        (userStates[chatId]?.nativeBalance * 10) / 100
                      );
                      const totalTokenBuy = Number(
                        (userStates[chatId].buyPrice *
                          userStates[chatId]?.buyTokenData?.nativePrice) /
                          userStates[chatId]?.buyTokenData?.price
                      )?.toFixed(5);
                      state.solanaBuyMessage = await bot.sendMessage(
                        chatId,
                        `🌊 <b>Information of ${
                          userStates[chatId]?.buyTokenData?.name
                        }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.buyTokenData?.symbol} 
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.buyTokenData?.address}</code>\n
💵 ${userStates[chatId]?.buyTokenData?.symbol} price : ${Number(
                          userStates[chatId]?.buyTokenData?.price /
                            userStates[chatId]?.buyTokenData?.nativePrice
                        ).toFixed(5)} SOL / ${Number(
                          userStates[chatId]?.buyTokenData?.price
                        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.buyTokenData?.variation5m)?.toFixed(
                          2
                        )}% || 1h : ${Number(
                          userStates[chatId]?.buyTokenData?.variation1h
                        )?.toFixed(2)}% || 6h : ${Number(
                          userStates[chatId]?.buyTokenData?.variation6h
                        )?.toFixed(2)}% || 24h : ${Number(
                          userStates[chatId]?.buyTokenData?.variation24h
                        )?.toFixed(2)}%\n
🗃 mcap : ${
                          userStates[chatId]?.market_cap
                            ? userStates[chatId]?.market_cap
                            : "not available!!"
                        }
💰 Balance : ${Number(
                          userStates[chatId]?.buyTokenData?.nativeTokenDetails
                            ?.solana
                        )?.toFixed(5)} SOL / ${Number(
                          userStates[chatId]?.buyTokenData?.nativeTokenDetails
                            ?.solana *
                            userStates[chatId]?.buyTokenData?.nativePrice
                        ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice)?.toFixed(5)} SOL (${Number(
                          userStates[chatId]?.buyPrice *
                            userStates[chatId]?.buyTokenData?.nativePrice
                        )?.toFixed(2)}$) ⇄ ${totalTokenBuy} ${
                          userStates[chatId]?.buyTokenData?.symbol
                        }(${Number(
                          totalTokenBuy *
                            userStates[chatId]?.buyTokenData?.price
                        ).toFixed(2)}$)
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
                                  text: `✅ ${Number(
                                    userStates[chatId].buyPrice
                                  )?.toFixed(5)}  SOL`,
                                  callback_data: "10SolPer",
                                },
                                {
                                  text: "Buy 25%  SOL",
                                  callback_data: "25SolPer",
                                },
                                {
                                  text: "Buy 50%  SOL",
                                  callback_data: "50SolPer",
                                },
                              ],
                              [
                                {
                                  text: "Buy 75%  SOL",
                                  callback_data: "70SolPer",
                                },
                                {
                                  text: "Buy 100%  SOL",
                                  callback_data: "100SolPer",
                                },
                                {
                                  text: "Buy X% ✏️",
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
                        "🔴 Token you entered is not supported!!",
                        {
                          reply_markup: {
                            inline_keyboard: [
                              [
                                {
                                  text: "⬅️ Back",
                                  callback_data: "buyButton",
                                },
                              ],
                            ],
                          },
                        }
                      );
                    }
                  })
                  .catch(async (error) => {
                    console.log("🚀 ~ bot.on ~ error:", error?.message);
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    await bot.sendMessage(
                      chatId,
                      "🔴 somthing has been wrong while fetching token price!!"
                    );
                  });
              } else {
                if (userStates[chatId]?.solanaBuyMessage) {
                  await bot.deleteMessage(
                    chatId,
                    userStates[chatId]?.solanaBuyMessage?.message_id
                  );
                  userStates[chatId].solanaBuyMessage = null;
                }
                if (userStates[chatId]?.evmBuyMessage) {
                  await bot.deleteMessage(
                    chatId,
                    userStates[chatId]?.evmBuyMessage?.message_id
                  );
                  userStates[chatId].evmBuyMessage = null;
                }
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
                      state.evmBuyMessageDetail = res?.data?.data;
                      state.toBuyAddresName = res?.data?.data?.symbol;
                      const market_cap =
                        res?.data?.data?.mcap &&
                        (await humanReadableFormat(res?.data?.data?.mcap));
                      userStates[chatId].market_cap = market_cap;
                      const liq =
                        res?.data?.data?.liq &&
                        (await humanReadableFormat(res?.data?.data?.liq));
                      userStates[chatId].liq = liq;
                      state.buyTokenNativename =
                        res?.data?.data?.nativeTokenDetails;
                      userStates[chatId].buyPrice =
                        (userStates[chatId]?.buyTokenNativename
                          ?.balance_formatted *
                          10) /
                        100;
                      const totalBuyUsd = Number(
                        userStates[chatId]?.buyPrice *
                          userStates[chatId]?.buyTokenNativename?.usd_price
                      ).toFixed(2);
                      userStates[chatId].evmBuyMessage = await bot.sendMessage(
                        chatId,
                        `🌊 <b>Information of ${
                          userStates[chatId]?.evmBuyMessageDetail?.name
                        }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.evmBuyMessageDetail?.symbol}
🔗 Chain : ${state?.network}  
📭 Address: <code>${userStates[chatId]?.evmBuyMessageDetail?.address}</code>\n
💵 ${userStates[chatId]?.evmBuyMessageDetail?.name} price : ${Number(
                          userStates[chatId]?.evmBuyMessageDetail?.price /
                            userStates[chatId]?.buyTokenNativename?.usd_price
                        ).toFixed(4)}${
                          userStates[chatId]?.buyTokenNativename?.symbol
                        } / ${Number(
                          userStates[chatId]?.evmBuyMessageDetail?.price
                        )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.evmBuyMessageDetail?.variation5m)?.toFixed(
                          3
                        )}% || 1h : ${Number(
                          userStates[chatId]?.evmBuyMessageDetail?.variation1h
                        )?.toFixed(3)}% || 6h : ${Number(
                          userStates[chatId]?.evmBuyMessageDetail?.variation6h
                        )?.toFixed(3)}% || 24h : ${Number(
                          userStates[chatId]?.evmBuyMessageDetail?.variation24h
                        )?.toFixed(3)}%\n
🗃 mcap : ${
                          userStates[chatId]?.market_cap
                            ? userStates[chatId]?.market_cap
                            : "not available!!"
                        }
💰 ${
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.symbol
                            : ""
                        } Balance: ${Number(
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.balance_formatted
                            : 0.0
                        ).toFixed(5)} / ${Number(
                          state?.buyTokenNativename
                            ? state?.buyTokenNativename?.usd_value
                            : 0
                        ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice).toFixed(5)} ${
                          userStates[chatId]?.buyTokenNativename?.symbol
                        } (${totalBuyUsd}$) ⇄ ${Number(
                          totalBuyUsd /
                            userStates[chatId]?.evmBuyMessageDetail?.price
                        ).toFixed(5)} ${
                          userStates[chatId]?.evmBuyMessageDetail?.symbol
                        } (${Number(
                          (totalBuyUsd /
                            userStates[chatId]?.evmBuyMessageDetail?.price) *
                            userStates[chatId]?.evmBuyMessageDetail?.price
                        ).toFixed(2)}$)
${
  userStates[chatId]?.evmBuyMessageDetail?.nativeTokenDetails
    ?.balance_formatted <= 0
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${
                          userStates[chatId]?.network == "ether"
                            ? "ethereum"
                            : userStates[chatId]?.network
                        }/${userStates[chatId]?.toToken}`,
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
                                  text: `✅ ${Number(
                                    userStates[chatId].buyPrice
                                  )?.toFixed(5)} ${
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
                                  text: `Buy 100% ${
                                    res?.data?.data?.nativeTokenDetails
                                      ? res?.data?.data?.nativeTokenDetails
                                          ?.symbol
                                      : ""
                                  }`,
                                  callback_data: "100EVMPer",
                                },
                                {
                                  text: `Buy X %${
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
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
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
              userStates[chatId].buyPrice =
                (userStates[chatId]?.buyTokenNativename?.balance_formatted *
                  text) /
                100;
              console.log(
                "--------------------------->",
                userStates[chatId].buyPrice
              );
              const totalBuyUsd = Number(
                userStates[chatId]?.buyPrice *
                  userStates[chatId]?.buyTokenNativename?.usd_price
              ).toFixed(2);
              await bot.deleteMessage(
                chatId,
                state?.customAmountEvm?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageText(
                `🌊 <b>Information of ${
                  userStates[chatId]?.evmBuyMessageDetail?.name
                }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.evmBuyMessageDetail?.symbol}
🔗 Chain : ${userStates[chatId]?.network}  
📭 Address: <code>${userStates[chatId]?.evmBuyMessageDetail?.address}</code>\n
💵 ${userStates[chatId]?.evmBuyMessageDetail?.name} price : ${Number(
                  userStates[chatId]?.evmBuyMessageDetail?.price /
                    userStates[chatId]?.buyTokenNativename?.usd_price
                ).toFixed(4)}${
                  userStates[chatId]?.buyTokenNativename?.symbol
                } / ${Number(
                  userStates[chatId]?.evmBuyMessageDetail?.price
                )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.evmBuyMessageDetail?.variation5m)?.toFixed(
                  3
                )}% || 1h : ${Number(
                  userStates[chatId]?.evmBuyMessageDetail?.variation1h
                )?.toFixed(3)}% || 6h : ${Number(
                  userStates[chatId]?.evmBuyMessageDetail?.variation6h
                )?.toFixed(3)}% || 24h : ${Number(
                  userStates[chatId]?.evmBuyMessageDetail?.variation24h
                )?.toFixed(3)}%\n
🗃 mcap : ${
                  userStates[chatId]?.market_cap
                    ? userStates[chatId]?.market_cap
                    : "not available!!"
                }
💰 ${
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.symbol
                    : ""
                } Balance: ${Number(
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.balance_formatted
                    : 0.0
                ).toFixed(5)} / ${Number(
                  userStates[chatId]?.buyTokenNativename
                    ? userStates[chatId]?.buyTokenNativename?.usd_value
                    : 0
                ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice).toFixed(5)} ${
                  userStates[chatId]?.buyTokenNativename?.symbol
                } (${totalBuyUsd}$) ⇄ ${Number(
                  totalBuyUsd / userStates[chatId]?.evmBuyMessageDetail?.price
                ).toFixed(5)} ${
                  userStates[chatId]?.evmBuyMessageDetail?.symbol
                } (${Number(
                  (totalBuyUsd /
                    userStates[chatId]?.evmBuyMessageDetail?.price) *
                    userStates[chatId]?.evmBuyMessageDetail?.price
                ).toFixed(2)}$)
${
  userStates[chatId]?.evmBuyMessageDetail?.nativeTokenDetails
    ?.balance_formatted <= 0
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${
                  userStates[chatId]?.network == "ether"
                    ? "ethereum"
                    : userStates[chatId]?.network
                }/${userStates[chatId]?.toToken}`,
                {
                  chat_id: chatId,
                  message_id: userStates[chatId]?.evmBuyMessage?.message_id,
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
                          text: `✅ ${Number(
                            userStates[chatId].buyPrice
                          ).toFixed(5)} ${
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
                        text: "Buy 10%  SOL",
                        callback_data: "10SolPer",
                      },
                      {
                        text: "Buy 25%  SOL",
                        callback_data: "25SolPer",
                      },
                      {
                        text: "Buy 50%  SOL",
                        callback_data: "50SolPer",
                      },
                    ],
                    [
                      {
                        text: "Buy 70%  SOL",
                        callback_data: "70SolPer",
                      },
                      {
                        text: "Buy 100%  SOL",
                        callback_data: "100SolPer",
                      },
                      {
                        text: "Buy X  SOL ✏️",
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
                  message_id: userStates[chatId]?.solanaBuyMessage?.message_id,
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
              userStates[chatId].buyPrice = Number(
                (userStates[chatId]?.nativeBalance * text) / 100
              );
              console.log(
                "--------------------------->",
                userStates[chatId].buyPrice
              );
              const totalTokenBuy = Number(
                (userStates[chatId].buyPrice *
                  userStates[chatId]?.buyTokenData?.nativePrice) /
                  userStates[chatId]?.buyTokenData?.price
              )?.toFixed(5);
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.customAmountBuySol?.message_id
              );
              await bot.deleteMessage(chatId, msg.message_id);
              await bot.editMessageText(
                `🌊 <b>Information of ${
                  userStates[chatId]?.buyTokenData?.name
                }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.buyTokenData?.symbol} 
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.buyTokenData?.address}</code>\n
💵 ${userStates[chatId]?.buyTokenData?.symbol} price : ${Number(
                  userStates[chatId]?.buyTokenData?.price /
                    userStates[chatId]?.buyTokenData?.nativePrice
                ).toFixed(5)} SOL / ${Number(
                  userStates[chatId]?.buyTokenData?.price
                )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.buyTokenData?.variation5m)?.toFixed(
                  2
                )}% || 1h : ${Number(
                  userStates[chatId]?.buyTokenData?.variation1h
                )?.toFixed(2)}% || 6h : ${Number(
                  userStates[chatId]?.buyTokenData?.variation6h
                )?.toFixed(2)}% || 24h : ${Number(
                  userStates[chatId]?.buyTokenData?.variation24h
                )?.toFixed(2)}%\n
🗃 mcap : ${
                  userStates[chatId]?.market_cap
                    ? userStates[chatId]?.market_cap
                    : "not available!!"
                }
💰 Balance : ${Number(
                  userStates[chatId]?.buyTokenData?.nativeTokenDetails?.solana
                )?.toFixed(5)} SOL / ${Number(
                  userStates[chatId]?.buyTokenData?.nativeTokenDetails?.solana *
                    userStates[chatId]?.buyTokenData?.nativePrice
                ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice)?.toFixed(5)} SOL (${Number(
                  userStates[chatId]?.buyPrice *
                    userStates[chatId]?.buyTokenData?.nativePrice
                )?.toFixed(2)}$) ⇄ ${totalTokenBuy} ${
                  userStates[chatId]?.buyTokenData?.symbol
                }(${Number(
                  totalTokenBuy * userStates[chatId]?.buyTokenData?.price
                ).toFixed(2)}$)
https://dexscreener.com/solana/${userStates[chatId].toToken}`,
                {
                  chat_id: chatId,
                  message_id: userStates[chatId].solanaBuyMessage.message_id,
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
                          text: "Buy 10%  SOL",
                          callback_data: "10SolPer",
                        },
                        {
                          text: "Buy 25%  SOL",
                          callback_data: "25SolPer",
                        },
                        {
                          text: "Buy 50%  SOL",
                          callback_data: "50SolPer",
                        },
                      ],
                      [
                        {
                          text: "Buy 75%  SOL",
                          callback_data: "70SolPer",
                        },
                        {
                          text: "Buy 100%  SOL",
                          callback_data: "100SolPer",
                        },
                        {
                          text: `✅ Buy ${Number(
                            userStates[chatId].buyPrice
                          ).toFixed(5)} SOL`,
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
          userStates[chatId].sellPrice =
            (userStates[chatId]?.selectedSellToken?.balance_formatted * text) /
            100;
          await bot.deleteMessage(
            chatId,
            state?.customAmountSellEvm?.message_id
          );
          await bot.deleteMessage(chatId, msg.message_id);
          await bot.editMessageText(
            `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
              userStates[chatId].selectedSellToken?.token_address
            }</code>\n
💵 ${userStates[chatId]?.selectedSellToken?.symbol} price : ${Number(
              userStates[chatId]?.selectedSellToken?.price /
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(5)}${
              userStates[chatId]?.nativeBalance?.symbol
            } / ${Number(userStates[chatId]?.selectedSellToken?.price)?.toFixed(
              5
            )}$
📊 5m : ${Number(
              userStates[chatId]?.selectedSellToken?.variation5m
                ? userStates[chatId]?.selectedSellToken?.variation5m
                : 0
            )?.toFixed(3)}% || 1h : ${Number(
              userStates[chatId]?.selectedSellToken?.variation1h
                ? userStates[chatId]?.selectedSellToken?.variation1h
                : 0
            )?.toFixed(3)}% || 6h : ${Number(
              userStates[chatId]?.selectedSellToken?.variation6h
                ? userStates[chatId]?.selectedSellToken?.variation6h
                : 0
            )?.toFixed(3)}% || 24h : ${Number(
              userStates[chatId]?.selectedSellToken?.variation24h
                ? userStates[chatId]?.selectedSellToken?.variation24h
                : 0
            )?.toFixed(3)}%\n
🗃 mcap : ${
              userStates[chatId]?.market_cap
                ? userStates[chatId]?.market_cap
                : "not available!!"
            }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
              userStates[chatId].selectedSellToken?.balance_formatted
            )?.toFixed(5)}</code>(${Number(
              userStates[chatId].selectedSellToken?.usd_value
            ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.selectedSellToken?.price
                ? `+${userStates[chatId].difference}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.selectedSellToken?.price
                ? `+${Number(
                    userStates[chatId].difference /
                      userStates[chatId]?.nativeBalance?.usd_price
                  ).toFixed(5)}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
              userStates[chatId].selectedSellToken?.usd_price *
                userStates[chatId].sellPrice
            ).toFixed(2)}$) ⇄ ${Number(
              (userStates[chatId].selectedSellToken?.usd_price *
                userStates[chatId].sellPrice) /
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
              ((userStates[chatId].selectedSellToken?.usd_price *
                userStates[chatId].sellPrice) /
                userStates[chatId]?.nativeBalance?.usd_price) *
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(2)}$)
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
                    { text: "⬅️ Back", callback_data: "sellButton" },
                    { text: "🔄 Refresh", callback_data: "evmSellRefresh" },
                  ],
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
        case "toTokenSellPercentage":
          userStates[chatId].sellPrice = Number(
            (userStates[chatId].selectedSellToken?.qty * text) / 100
          );
          await bot.deleteMessage(
            chatId,
            state?.customAmountSellEvm?.message_id
          );
          await bot.deleteMessage(chatId, msg.message_id);
          await bot.editMessageText(
            `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
              userStates[chatId].selectedSellToken?.tokenAddress
            }</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
              userStates[chatId].selectedSellToken?.currentPrice /
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(5)} / ${Number(
              userStates[chatId].selectedSellToken?.currentPrice
            )?.toFixed(5)}$
📊 5m : ${Number(
              userStates[chatId].selectedSellToken?.variation5m
                ? userStates[chatId].selectedSellToken?.variation5m
                : 0
            )?.toFixed(3)}% 1h : ${Number(
              userStates[chatId].selectedSellToken?.variation1h
                ? userStates[chatId].selectedSellToken?.variation1h
                : 0
            )?.toFixed(3)}% || 6h : ${Number(
              userStates[chatId].selectedSellToken?.variation6h
                ? userStates[chatId].selectedSellToken?.variation6h
                : 0
            )?.toFixed(3)}% || 24h : ${Number(
              userStates[chatId].selectedSellToken?.variation24h
                ? userStates[chatId].selectedSellToken?.variation24h
                : 0
            )?.toFixed(3)}%\n
🗃 mcap : ${
              userStates[chatId]?.market_cap
                ? userStates[chatId].market_cap
                : "Not available!!"
            }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance :${Number(
              userStates[chatId].selectedSellToken?.value_in_usd /
                userStates[chatId]?.nativeBalance?.usd_value
            ).toFixed(5)}(${Number(
              (userStates[chatId].selectedSellToken?.value_in_usd /
                userStates[chatId]?.nativeBalance?.usd_value) *
                userStates[chatId]?.nativeBalance?.usd_value
            ).toFixed(2)})${
              userStates[chatId]?.nativeBalance?.symbol
            } / ${Number(userStates[chatId].selectedSellToken?.qty)?.toFixed(
              5
            )}(${Number(
              userStates[chatId].selectedSellToken?.value_in_usd
            ).toFixed(3)}$)\n
📊 Avg Entry Price : ${Number(
              userStates[chatId].selectedSellToken?.price_at_invested
            ).toFixed(5)}$
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL USD : ${
              userStates[chatId]?.selectedSellToken?.price_at_invested <
              userStates[chatId].selectedSellToken?.currentPrice
                ? `+${userStates[chatId].difference}$`
                : `-${userStates[chatId].difference}$`
            }(${
              userStates[chatId].selectedSellToken?.percentage_of_growth > 0
                ? "+"
                : ""
            }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)
${
  userStates[chatId]?.selectedSellToken?.price_at_invested <
  userStates[chatId].selectedSellToken?.currentPrice
    ? "🟩"
    : "🟥"
} PNL ${userStates[chatId]?.nativeBalance?.symbol} : ${
              userStates[chatId]?.selectedSellToken?.price_at_invested <
              userStates[chatId].selectedSellToken?.currentPrice
                ? `+${Number(
                    userStates[chatId].difference /
                      userStates[chatId]?.nativeBalance?.usd_price
                  ).toFixed(5)}$`
                : `-${userStates[chatId].difference}$`
            }(${
              userStates[chatId].selectedSellToken?.percentage_of_growth > 0
                ? "+"
                : ""
            }${userStates[chatId].selectedSellToken?.percentage_of_growth}%)\n
📉 You sell : ${Number(userStates[chatId].sellPrice).toFixed(5)}(${Number(
              userStates[chatId].selectedSellToken?.currentPrice *
                userStates[chatId].sellPrice
            ).toFixed(2)}$) ⇄ ${Number(
              (userStates[chatId].selectedSellToken?.currentPrice *
                userStates[chatId].sellPrice) /
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(5)}${userStates[chatId]?.nativeBalance?.symbol}(${Number(
              ((userStates[chatId].selectedSellToken?.currentPrice *
                userStates[chatId].sellPrice) /
                userStates[chatId]?.nativeBalance?.usd_price) *
                userStates[chatId]?.nativeBalance?.usd_price
            ).toFixed(2)}$)
https://dexscreener.com/${userStates[chatId]?.network}/${
              userStates[chatId].selectedSellToken?.tokenAddress
            }`,
            {
              chat_id: chatId,
              message_id: userStates[chatId].evmSellMessage.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "positionButton" },
                    {
                      text: "🔄 Refresh",
                      callback_data: "sellEvmPositionRefresh",
                    },
                  ],
                  [
                    {
                      text: `Sell 10% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "10+EvmSellPercentage",
                    },
                    {
                      text: `Sell 25% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "25+EvmSellPercentage",
                    },
                    {
                      text: `Sell 50% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "50+EvmSellPercentage",
                    },
                  ],
                  [
                    {
                      text: `Sell 75% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "75+EvmSellPercentage",
                    },
                    {
                      text: `Sell 100% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "100+EvmSellPercentage",
                    },
                    {
                      text: `✅ ${Number(state?.sellPrice).toFixed(4)} ${
                        userStates[chatId].selectedSellToken?.symbol
                      } ✏️`,
                      callback_data: "customEvmSellPercentageC",
                    },
                  ],
                  [
                    {
                      text: `Sell`,
                      callback_data: "finalSellEvmPercentageF",
                    },
                  ],
                ],
              },
            }
          );
          break;
        case "toTokenSellPercentageSolCustom":
          userStates[chatId].sellPrice = Number(
            (userStates[chatId].selectedSellToken?.amount * text) / 100
          );
          await bot.deleteMessage(
            chatId,
            state?.customAmountSellEvm?.message_id
          );
          await bot.deleteMessage(chatId, msg.message_id);
          await bot.editMessageText(
            `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: Solana
📭 Address : <code>${userStates[chatId].selectedSellToken?.mint}</code>\n
💵 ${userStates[chatId].selectedSellToken?.symbol} price : ${Number(
              userStates[chatId].selectedSellToken?.price /
                userStates[chatId]?.nativeBalance
            ).toFixed(5)} SOL / ${Number(
              userStates[chatId].selectedSellToken?.price
            )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId].selectedSellToken?.variation5m)?.toFixed(
              3
            )}% 1h : ${Number(
              userStates[chatId].selectedSellToken?.variation1h
            )?.toFixed(3)}% || 6h : ${Number(
              userStates[chatId].selectedSellToken?.variation6h
            )?.toFixed(3)}% || 24h : ${Number(
              userStates[chatId].selectedSellToken?.variation24h
            )?.toFixed(3)}%\n
🗃 mcap : ${
              userStates[chatId]?.market_cap
                ? userStates[chatId].market_cap
                : "Not available!!"
            }
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : ${Number(
              userStates[chatId].selectedSellToken?.amount
            )?.toFixed(5)}(${Number(
              userStates[chatId].selectedSellToken?.amount *
                userStates[chatId]?.selectedSellToken?.price
            ).toFixed(2)}$)\n
📊 Avg Entry Price : ${Number(
              userStates[chatId].selectedSellToken?.price_at_invested
            )?.toFixed(5)}$
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
              userStates[chatId].selectedSellToken?.price_at_invested <
              userStates[chatId]?.selectedSellToken?.price
                ? `+${userStates[chatId].difference}$`
                : `-${userStates[chatId].difference}$`
            }(${
              userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
            }${Number(
              userStates[chatId].selectedSellToken?.percentage
            )?.toFixed(2)}%)
${
  userStates[chatId].selectedSellToken?.price_at_invested <
  userStates[chatId]?.selectedSellToken?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
              userStates[chatId].selectedSellToken?.price_at_invested <
              userStates[chatId]?.selectedSellToken?.price
                ? `+${Number(
                    userStates[chatId].difference /
                      userStates[chatId]?.nativeBalance
                  ).toFixed(5)}$`
                : `-${userStates[chatId].difference}$`
            }(${
              userStates[chatId].selectedSellToken?.percentage > 0 ? "+" : ""
            }${Number(userStates[chatId].selectedSellToken?.percentage).toFixed(
              2
            )}%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId]?.selectedSellToken?.price *
                userStates[chatId]?.sellPrice
            ).toFixed(2)}$) ⇄ ${Number(
              (userStates[chatId]?.selectedSellToken?.price *
                userStates[chatId]?.sellPrice) /
                userStates[chatId]?.nativeBalance
            ).toFixed(5)}(${(
              Number(
                (userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.sellPrice) /
                  userStates[chatId]?.nativeBalance
              ) * userStates[chatId]?.nativeBalance
            ).toFixed(2)}$) SOL
https://dexscreener.com/solana/${userStates[chatId].selectedSellToken?.mint}`,
            {
              chat_id: chatId,
              message_id: userStates[chatId]?.evmSellMessage?.message_id,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "positionButton" },
                    {
                      text: "🔄 Refresh",
                      callback_data: "sellSolanaPositionRefresh",
                    },
                  ],
                  [
                    {
                      text: `Sell 10% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "10+EvmSellPercentageSol",
                    },
                    {
                      text: `Sell 25% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "25+EvmSellPercentageSol",
                    },
                    {
                      text: `Sell 50% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "50+EvmSellPercentageSol",
                    },
                  ],
                  [
                    {
                      text: `Sell 75% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "75+EvmSellPercentageSol",
                    },
                    {
                      text: `Sell 100% ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "100+EvmSellPercentageSol",
                    },
                    {
                      text: `✅ ${Number(userStates[chatId]?.sellPrice).toFixed(
                        4
                      )} ${userStates[chatId].selectedSellToken?.symbol}`,
                      callback_data: "customSellPercentageCSol",
                    },
                  ],
                  [
                    {
                      text: `Sell`,
                      callback_data: "sellPositionSolanafinal",
                    },
                  ],
                ],
              },
            }
          );
          break;
        case "toTokenSellSolana":
          userStates[chatId].sellPrice = Number(
            (userStates[chatId]?.selectedSellSolanaToken?.amount * text) / 100
          );
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
            `✨ Information of ${
              userStates[chatId]?.sellSolanaTokensDex?.name
            }\n
🏷 Name : ${userStates[chatId]?.sellSolanaTokensDex?.symbol}
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.sellSolanaTokensDex?.address}</code>\n
💵 ${userStates[chatId]?.sellSolanaTokensDex?.name} price :${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price /
                userStates[chatId]?.sellSolanaTokensDex?.nativePrice
            ).toFixed(5)} SOL / ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price
            )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.sellSolanaTokensDex?.variation5m)?.toFixed(
              3
            )}% || 1h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation1h
            )?.toFixed(3)}% || 6h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation6h
            )?.toFixed(3)}% || 24h : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.variation24h
            )?.toFixed(3)}%\n
🗃  mcap : ${
              userStates[chatId].market_cap
                ? userStates[chatId].market_cap
                : "not available!!"
            }
💰  SOL Balance : ${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana
            )?.toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.nativeTokenDetails
                ?.solana * userStates[chatId]?.sellSolanaTokensDex?.nativePrice
            )?.toFixed(2)}$)  SOL
🗃 ${userStates[chatId]?.sellSolanaTokensDex?.name} balance : ${Number(
              userStates[chatId]?.selectedSellSolanaToken?.amount
            ).toFixed(5)}(${Number(
              userStates[chatId].selectedSellSolanaToken?.amount *
                userStates[chatId]?.sellSolanaTokensDex?.price
            ).toFixed(4)}$)\n
📊 Avg Entry Price : ${Number(userStates[chatId]?.currentPlPrice).toFixed(5)}
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL USD : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.sellSolanaTokensDex?.price
                ? `+${userStates[chatId].difference}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)
${
  userStates[chatId]?.currentPlPrice <
  userStates[chatId]?.sellSolanaTokensDex?.price
    ? "🟩"
    : "🟥"
} PNL  SOL : ${
              userStates[chatId]?.currentPlPrice <
              userStates[chatId]?.sellSolanaTokensDex?.price
                ? `+${Number(
                    userStates[chatId].difference /
                      userStates[chatId]?.nativeBalance
                  ).toFixed(5)}$`
                : `-${userStates[chatId].difference}$`
            }(${userStates[chatId].percentageChange > 0 ? "+" : ""}${
              userStates[chatId].percentageChange
            }%)\n
📉 You sell : ${Number(userStates[chatId]?.sellPrice).toFixed(5)}(${Number(
              userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice
            ).toFixed(5)}$)${
              userStates[chatId]?.sellSolanaTokensDex?.symbol
            } ⇄ ${Number(
              (userStates[chatId]?.sellSolanaTokensDex?.price *
                userStates[chatId]?.sellPrice) /
                userStates[chatId]?.nativeBalance
            ).toFixed(3)}(${(
              Number(
                (userStates[chatId]?.sellSolanaTokensDex?.price *
                  userStates[chatId]?.sellPrice) /
                  userStates[chatId]?.nativeBalance
              ) * userStates[chatId]?.nativeBalance
            ).toFixed(3)}$) SOL
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
                    { text: "⬅️ Back", callback_data: "sellButton" },
                    { text: "🔄 Refresh", callback_data: "solanaSellRefresh" },
                  ],
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
            text == "/balance" ||
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
          state.currentStep = "toWalletCustom";
          await bot.sendMessage(chatId, "Type To Wallet Address:");
          break;
        case "toWalletCustom":
          state.toToken = text;
          state.currentStep = "amountTransfer";
          await bot.sendMessage(chatId, "Enter amount");
          break;
        // EVM transfer
        case "toWalletTransfer":
          state.toWalletAddress = text;
          try {
            if (userStates[chatId]?.sellTokensList) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.sellTokensList?.message_id
              );
              userStates[chatId].sellTokensList = null;
            }
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.customAmountTransfer?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            const tokenDetails = await userStates[
              chatId
            ]?.allSellTokens?.filter(
              (item) => item.symbol == state?.transferToken
            );
            if (tokenDetails) {
              userStates[chatId].selectedSellToken = tokenDetails[0];
              const response = await axios.post(
                `${API_URL}/getPositionSingleTokenInfoEvm`,
                {
                  chatId: chatId,
                  token: userStates[chatId].selectedSellToken?.token_address,
                  chainId: userStates[chatId]?.flag,
                }
              );
              const change =
                userStates[chatId].selectedSellToken?.usd_price -
                response?.data?.dataBaseTokens?.currentPrice;
              const percentageChange =
                (change / response?.data?.dataBaseTokens?.currentPrice) * 100;
              userStates[chatId].percentageChange =
                Number(percentageChange).toFixed(2);
              const market_cap =
                userStates[chatId].selectedSellToken?.mcap &&
                (await humanReadableFormat(
                  userStates[chatId].selectedSellToken?.mcap
                ));
              userStates[chatId].market_cap = market_cap;
              userStates[chatId].transferPrice = Number(
                (userStates[chatId].selectedSellToken?.balance_formatted * 10) /
                  100
              );
              userStates[chatId].evmTransferMessage = await bot.sendMessage(
                chatId,
                `✨ Information of ${
                  userStates[chatId].selectedSellToken?.name
                }\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
                  userStates[chatId].selectedSellToken?.token_address
                }</code>\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
                  userStates[chatId].selectedSellToken?.balance_formatted
                )?.toFixed(5)}</code>(${Number(
                  userStates[chatId].selectedSellToken?.usd_value
                ).toFixed(2)}$)
📉 You Withdraw : ${Number(userStates[chatId].transferPrice).toFixed(
                  5
                )}(${Number(
                  userStates[chatId].selectedSellToken?.usd_price *
                    userStates[chatId].transferPrice
                ).toFixed(2)}$)\n
https://dexscreener.com/${
                  userStates[chatId]?.network == "ether"
                    ? "ethereum"
                    : userStates[chatId]?.network
                }/${userStates[chatId].selectedSellToken?.token_address}`,
                {
                  parse_mode: "HTML",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: `✅ ${Number(
                            userStates[chatId].transferPrice
                          ).toFixed(4)} ${
                            userStates[chatId]?.selectedSellToken?.symbol
                          }`,
                          callback_data: "10EvmPerTransfer",
                        },
                        {
                          text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "25EvmPerTransfer",
                        },
                        {
                          text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "50EvmPerTransfer",
                        },
                      ],
                      [
                        {
                          text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "75EvmPerTransfer",
                        },
                        {
                          text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                          callback_data: "100EvmPerTransfer",
                        },
                        {
                          text: `X % of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                          callback_data: "customPerTransfer",
                        },
                      ],
                      // [
                      //   {
                      //     text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                      //     callback_data: "customTransferAmount",
                      //   },
                      // ],
                      [
                        {
                          text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                          callback_data: "customTransferWallet",
                        },
                      ],
                      [
                        {
                          text: `Withraw`,
                          callback_data: "finalTransferEvmWallet",
                        },
                      ],
                    ],
                  },
                }
              );
            }
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error?.message);
          }
          break;
        case "customPerTransfer":
          try {
            userStates[chatId].transferPrice = Number(
              (userStates[chatId].selectedSellToken?.balance_formatted * text) /
                100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
                userStates[chatId].selectedSellToken?.token_address
              }</code>\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}</code>(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(2)}$)
📉 You Withdraw : ${Number(userStates[chatId].transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].transferPrice
              ).toFixed(2)}$)\n
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10EvmPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerTransfer",
                      },
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.transferPrice
                        ).toFixed(4)} % of${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customPerTransfer",
                      },
                    ],
                    // [
                    //   {
                    //     text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    //     callback_data: "customTransferAmount",
                    //   },
                    // ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmTransferPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customEvmTransfer":
          try {
            userStates[chatId].transferPrice = text;
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
                userStates[chatId].selectedSellToken?.token_address
              }</code>\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}</code>(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(2)}$)
📉 You Withdraw : ${Number(userStates[chatId].transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].transferPrice
              ).toFixed(2)}$)\n
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10EvmPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerTransfer",
                      },
                      {
                        text: ` X % of${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customPerTransfer",
                      },
                    ],
                    // [
                    //   {
                    //     text: `✅ ${userStates[chatId].transferPrice} ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    //     callback_data: "customTransferAmount",
                    //   },
                    // ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmTransferPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customTransferWallet":
          try {
            userStates[chatId].toWalletAddress = text;
            userStates[chatId].transferPrice = Number(
              (userStates[chatId].selectedSellToken?.balance_formatted * 10) /
                100
            );
            if (userStates[chatId]?.transferCustomMessage) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.transferCustomMessage?.message_id
              );
              userStates[chatId].transferCustomMessage = null;
            }
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${userStates[chatId].selectedSellToken?.name}\n
🏷 Name : ${userStates[chatId].selectedSellToken?.symbol}
🔗 Chain: ${userStates[chatId]?.network}
📭 Address : <code>${
                userStates[chatId].selectedSellToken?.token_address
              }</code>\n
💰 ${userStates[chatId].selectedSellToken?.symbol} Balance : <code>${Number(
                userStates[chatId].selectedSellToken?.balance_formatted
              )?.toFixed(5)}</code>(${Number(
                userStates[chatId].selectedSellToken?.usd_value
              ).toFixed(2)}$)
📉 You Withdraw : ${Number(userStates[chatId].transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId].selectedSellToken?.usd_price *
                  userStates[chatId].transferPrice
              ).toFixed(2)}$)\n
https://dexscreener.com/${
                userStates[chatId]?.network == "ether"
                  ? "ethereum"
                  : userStates[chatId]?.network
              }/${userStates[chatId].selectedSellToken?.token_address}`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.transferPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        }`,
                        callback_data: "10EvmPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25EvmPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50EvmPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75EvmPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100EvmPerTransfer",
                      },
                      {
                        text: ` X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customPerTransfer",
                      },
                    ],
                    // [
                    //   {
                    //     text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                    //     callback_data: "customTransferAmount",
                    //   },
                    // ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferEvmWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleEvmTransferPercentage ~ error:",
              error?.message
            );
          }
          break;

        // solana transfer
        case "toWalletSolTransfer":
          state.toWalletAddress = text;
          try {
            if (userStates[chatId]?.sellTokensList) {
              await bot.deleteMessage(
                chatId,
                userStates[chatId]?.sellTokensList?.message_id
              );
              userStates[chatId].sellTokensList = null;
            }
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.customAmountTransfer?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            const { loaderMessage, interval } = await animateLoader(chatId);
            try {
              if (userStates[chatId]?.sellTokensList) {
                await bot.deleteMessage(
                  chatId,
                  userStates[chatId]?.sellTokensList?.message_id
                );
                userStates[chatId].sellTokensList = null;
              }
              const tokenDetails = await userStates[
                chatId
              ]?.allSellSolanaToken?.filter(
                (item) => item.symbol == userStates[chatId].transferToken
              );
              console.log(
                "🚀 ~ handleDynamicSellSolana ~ tokenDetails:",
                tokenDetails
              );
              if (tokenDetails) {
                userStates[chatId].selectedSellSolanaToken = tokenDetails[0];
                await axios
                  .post(`${API_URL}/dexSol`, {
                    token: tokenDetails[0]?.mint,
                    chatId,
                  })
                  .then(async (res) => {
                    clearInterval(interval);
                    await bot.deleteMessage(chatId, loaderMessage.message_id);
                    userStates[chatId].selectedSellToken = res?.data?.data;
                    const market_cap =
                      res?.data?.data?.mcap &&
                      (await humanReadableFormat(
                        userStates[chatId].selectedSellToken?.mcap
                      ));
                    userStates[chatId].market_cap = market_cap;
                    const liq =
                      userStates[chatId].selectedSellToken?.liq &&
                      (await humanReadableFormat(
                        userStates[chatId].selectedSellToken?.liq
                      ));
                    userStates[chatId].liq = liq;
                    const response = await axios.post(
                      `${API_URL}/getPositionSingleTokenInfoSol`,
                      {
                        chatId: chatId,
                        token: userStates[chatId].selectedSellToken?.address,
                      }
                    );
                    const change =
                      userStates[chatId]?.selectedSellToken?.price -
                      response?.data?.dataBaseTokens?.currentPrice;
                    const percentageChange =
                      (change / response?.data?.dataBaseTokens?.currentPrice) *
                      100;
                    userStates[chatId].percentageChange =
                      Number(percentageChange).toFixed(2);
                    const balanceInUSD = Number(
                      userStates[chatId].selectedSellSolanaToken?.amount *
                        userStates[chatId]?.selectedSellToken?.price
                    );
                    userStates[chatId].transferPrice = Number(
                      (tokenDetails[0]?.amount * 10) / 100
                    );
                    userStates[chatId].evmTransferMessage =
                      await bot.sendMessage(
                        chatId,
                        `✨ Information of ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.name}
🔗 Chain : "Solana" 
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
🗃 ${userStates[chatId]?.selectedSellToken?.name} balance : ${Number(
                          userStates[chatId]?.selectedSellSolanaToken?.amount
                        ).toFixed(5)}(${Number(balanceInUSD).toFixed(4)}$)
📉 You withdraw : ${Number(userStates[chatId]?.transferPrice).toFixed(
                          5
                        )}(${Number(
                          userStates[chatId]?.selectedSellToken?.price *
                            userStates[chatId]?.transferPrice
                        ).toFixed(5)}$)\n
https://dexscreener.com/solana/${
                          userStates[chatId]?.selectedSellToken?.address
                        }`,
                        {
                          parse_mode: "HTML",
                          reply_markup: {
                            inline_keyboard: [
                              [
                                {
                                  text: `✅ ${Number(
                                    userStates[chatId]?.transferPrice
                                  ).toFixed(4)} ${
                                    userStates[chatId]?.selectedSellToken
                                      ?.symbol
                                  }`,
                                  callback_data: "10SolPerTransfer",
                                },
                                {
                                  text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                  callback_data: "25SolPerTransfer",
                                },
                                {
                                  text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                  callback_data: "50SolPerTransfer",
                                },
                              ],
                              [
                                {
                                  text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                  callback_data: "75SolPerTransfer",
                                },
                                {
                                  text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                                  callback_data: "100SolPerTransfer",
                                },
                                {
                                  text: ` X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                                  callback_data: "customSolPerTransfer",
                                },
                              ],
                              [
                                {
                                  text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                                  callback_data: "customSOlTransferAmt",
                                },
                              ],
                              [
                                {
                                  text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                                  callback_data: "customSolTransferWallet",
                                },
                              ],
                              [
                                {
                                  text: `Withraw`,
                                  callback_data: "finalTransferSolWallet",
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
              console.log(
                "🚀 ~ handleDynamicSellToken ~ error:",
                error?.message
              );
              await bot.sendMessage(
                chatId,
                "🔴 Something went wrong, please try again after some time!!"
              );
            }
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error?.message);
          }
          break;
        case "customPerTransferSol":
          try {
            userStates[chatId].transferPrice = Number(
              (userStates[chatId]?.selectedSellSolanaToken?.amount * text) / 100
            );
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.transferCustomMessage?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);

            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.symbol
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.name}
🔗 Chain : "Solana" 
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
🗃 ${userStates[chatId]?.selectedSellToken?.name} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)
📉 You withdraw : ${Number(userStates[chatId]?.transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.transferPrice
              ).toFixed(5)}$)\n
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10SolPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerTransfer",
                      },
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.transferPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customSolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSOlTransferAmt",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customSolTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolTransferPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customTransferSol":
          try {
            userStates[chatId].transferPrice = text;
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.transferCustomMessage?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.symbol
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.name}
🔗 Chain : "Solana" 
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
🗃 ${userStates[chatId]?.selectedSellToken?.name} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)
📉 You withdraw : ${Number(userStates[chatId]?.transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.transferPrice
              ).toFixed(5)}$)\n
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `10% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "10SolPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerTransfer",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.transferPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        } ✏️`,
                        callback_data: "customSOlTransferAmt",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customSolTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolTransferPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "customTransferWalletSol":
          try {
            userStates[chatId].toWalletAddress = text;
            userStates[chatId].transferPrice = Number(
              (userStates[chatId]?.selectedSellSolanaToken?.amount * 10) / 100
            );
            await bot.deleteMessage(
              chatId,
              userStates[chatId]?.transferCustomMessage?.message_id
            );
            await bot.deleteMessage(chatId, msg.message_id);
            await bot.editMessageText(
              `✨ Information of ${
                userStates[chatId]?.selectedSellToken?.symbol
              }\n
🏷 Name : ${userStates[chatId]?.selectedSellToken?.name}
🔗 Chain : "Solana" 
📭 Address : <code>${userStates[chatId]?.selectedSellToken?.address}</code>\n
🗃 ${userStates[chatId]?.selectedSellToken?.name} balance : ${Number(
                userStates[chatId]?.selectedSellSolanaToken?.amount
              ).toFixed(5)}(${Number(
                userStates[chatId].selectedSellSolanaToken?.amount *
                  userStates[chatId]?.selectedSellToken?.price
              ).toFixed(4)}$)
📉 You withdraw : ${Number(userStates[chatId]?.transferPrice).toFixed(
                5
              )}(${Number(
                userStates[chatId]?.selectedSellToken?.price *
                  userStates[chatId]?.transferPrice
              ).toFixed(5)}$)\n
https://dexscreener.com/solana/${
                userStates[chatId]?.selectedSellToken?.address
              }`,
              {
                chat_id: chatId,
                message_id: userStates[chatId]?.evmTransferMessage?.message_id,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: `✅ ${Number(
                          userStates[chatId]?.transferPrice
                        ).toFixed(4)} ${
                          userStates[chatId]?.selectedSellToken?.symbol
                        }`,
                        callback_data: "10SolPerTransfer",
                      },
                      {
                        text: `25% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "25SolPerTransfer",
                      },
                      {
                        text: `50% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "50SolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `75% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "75SolPerTransfer",
                      },
                      {
                        text: `100% ${userStates[chatId]?.selectedSellToken?.symbol}`,
                        callback_data: "100SolPerTransfer",
                      },
                      {
                        text: `X % ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSolPerTransfer",
                      },
                    ],
                    [
                      {
                        text: `X ${userStates[chatId]?.selectedSellToken?.symbol} ✏️`,
                        callback_data: "customSOlTransferAmt",
                      },
                    ],
                    [
                      {
                        text: `${userStates[chatId]?.toWalletAddress} ✏️`,
                        callback_data: "customSolTransferWallet",
                      },
                    ],
                    [
                      {
                        text: `Withraw`,
                        callback_data: "finalTransferSolWallet",
                      },
                    ],
                  ],
                },
              }
            );
          } catch (error) {
            console.log(
              "🚀 ~ handleSolTransferPercentage ~ error:",
              error?.message
            );
          }
          break;
        case "amountTransfer":
          if (
            text == "/start" ||
            text == "/buy" ||
            text == "/sell" ||
            text == "/withdraw" ||
            text == "/invite" ||
            text == "Start" ||
            text == "/balance" ||
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
            text == "/balance" ||
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
            text == "/balance" ||
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
            text == "/balance" ||
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
            text == "/invite" ||
            text == "Start" ||
            text == "/balance" ||
            text == "/swap"
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

  // handle sell dynamic buttons
  if (data?.slice(-4) == "Sell") {
    userStates[chatId].sellToken = data?.slice(0, -4);
    return await handleDynamicSellToken(chatId, data?.slice(0, -4));
  }
  // handle solana sell
  if (data?.slice(-10) == "SellSolana") {
    userStates[chatId].sellToken = data?.slice(0, -10);
    return await handleDynamicSellSolana(chatId, data?.slice(0, -10));
  }

  // handle EVM position
  if (data?.slice(-8) == "Position") {
    resetUserState(chatId);
    const positionData = data?.split("+");
    await handlePositions(chatId, Number(positionData[0]), positionData[1]);
  }

  // handle solana position sell
  if (data?.slice(-15) == "SellPositionSol") {
    userStates[chatId].sellToken = data?.slice(0, -15);
    userStates[chatId].flag = 19999;
    await handleSolanaPositionSell(chatId, data?.slice(0, -15));
  }

  //  handle solana position percentage sell
  if (data?.slice(-17) == "SellPercentageSol") {
    let percentage = data?.split("+");
    await handleSolanaPercentage(chatId, percentage[0]);
  }
  //  handle custom position sell
  if (data?.slice(-18) == "SellPercentageCSol") {
    await handleSolanaPercentage(chatId, "custom");
  }
  // handle EVM position sell
  if (data?.slice(-5) == "SellP") {
    userStates[chatId].sellToken = data?.slice(0, -5);
    await handlePositionSell(chatId, data?.slice(0, -5));
  }

  // handle EVM position percentage
  if (data?.slice(-14) == "SellPercentage") {
    let percentage = data?.split("+");
    await handlePercentageofPositions(chatId, percentage[0]);
  }

  // handle custom position sell
  if (data?.slice(-15) == "SellPercentageC") {
    await handlePercentageofPositions(chatId, "custom");
  }

  // All about transfer

  //  handle EVM transfer

  if (data?.slice(-11) == "TransferEvm") {
    userStates[chatId].transferToken = data?.slice(0, -11);
    userStates[chatId].customAmountTransfer = await bot.sendMessage(
      chatId,
      "Which address should your tokens to sent to?"
    );
    userStates[chatId].currentStep = "toWalletTransfer";
  }

  // handle to solana transfer
  if (data?.slice(-11) == "TransferSol") {
    userStates[chatId].transferToken = data?.slice(0, -11);
    userStates[chatId].customAmountTransfer = await bot.sendMessage(
      chatId,
      "Which address should your tokens to sent to?"
    );
    userStates[chatId].currentStep = "toWalletSolTransfer";
  }

  // All about swap

  // handle for swap  SOL
  if (data?.slice(-10) == "solanaSwap") {
    userStates[chatId].swapFromToken = data?.slice(0, -10);
    userStates[chatId].swapToTokenMessage = await bot.sendMessage(
      chatId,
      "Enter the token address  you want to buy"
    );
    userStates[chatId].currentStep = "infoSolanaSwap";
  }

  //  handle for swap EVM
  if (data?.slice(-7) == "SwapEvm") {
    userStates[chatId].swapFromToken = data?.slice(0, -7);
    userStates[chatId].swapToTokenMessage = await bot.sendMessage(
      chatId,
      "Enter the token address  you want to buy"
    );
    userStates[chatId].currentStep = "infoEvmSwap";
  }

  //  all buttons handlers
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
    case "positionSolana":
      resetUserState(chatId);
      await handleSolanaPosition(chatId);
      break;
    case "settingButton":
      resetUserState(chatId);
      await setting(chatId);
      break;
    case "helpButton":
      resetUserState(chatId);
      await bot.sendMessage(
        chatId,
        `<u><b>How do I use Wave?</b></u>
Check out our https://wavebot.gitbook.io/wave-manual where we provide detailed explanations.
      
<u><b>Which tokens can I trade?</b></u>
We currently cover 12 chains. 
      
<u><b>Where can I find my referral code?</b></u>
Go to the menu and click on 💰Referrals.
      
<u><b>My transaction timed out. What happened?</b></u>
Transaction timeouts may occur due to heavy network load or instability. This is a common issue with the current network conditions.
   
<u><b>Additional questions or need support?</b></u>
Join our https://t.me/WaveUsers and one of our admins will assist you.
    `,
        { parse_mode: "HTML" }
      );
      break;
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
🔗<code>https://t.me/onchain_wavebot?start=${isUser?.isLogin?.referralId}</code>\n(Tap to Copy)
Net Referral Rate: 25%
Active Referrals: 0\n
Total Unclaimed: <code>$0</code>
*ETH: <code>0.000 ($0)</code>
* SOL: <code>0.000 ($0)</code>
*BASE: <code>0.000 ($0)</code>
*BNB: <code>0.000 ($0)</code>
*AVAX: <code>0.000 ($0)</code>
*ARB: <code>0.000 ($0)</code>
*FTM: <code>0.000 ($0)</code>
*MATIC: <code>0.000 ($0)</code>
*BLAST: <code>0.000 ($0)</code>\n

Lifetime Rewards: <code>$0</code>
*ETH: <code>0.000 ($0)</code>
* SOL: <code>0.000 ($0)</code>
*BASE: <code>0.000 ($0)</code>
*BNB: <code>0.000 ($0)</code>
*AVAX: <code>0.000 ($0)</code>
*ARB: <code>0.000 ($0)</code>
*FTM: <code>0.000 ($0)</code>
*MATIC: <code>0.000 ($0)</code>
*BLAST: <code>0.000 ($0)</code>\n
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
    case "10SolPer":
      await handleToBySolanaPercentageDynamically(chatId, 10);
      break;
    case "25SolPer":
      await handleToBySolanaPercentageDynamically(chatId, 25);
      break;
    case "50SolPer":
      await handleToBySolanaPercentageDynamically(chatId, 50);
      break;
    case "70SolPer":
      await handleToBySolanaPercentageDynamically(chatId, 75);
      break;
    case "100SolPer":
      await handleToBySolanaPercentageDynamically(chatId, 100);
      break;
    case "customSolPer":
      await handleToBySolanaPercentageDynamically(chatId, "buyCustom");
      break;
    case "solanaFinalBuy":
      if (userStates[chatId]?.flag) {
        await solanaSwapHandle(
          chatId,
          "So11111111111111111111111111111111111111112",
          userStates[chatId]?.toToken,
          Number(userStates[chatId]?.buyPrice),
          "buy",
          9
        );
      } else {
        resetUserState(chatId);
        buyStartTokenSelection(chatId);
      }

      break;

    case "10EVMPer":
      await handleToByEvmPercentageDynamically(chatId, 10);
      break;
    case "25EVMPer":
      await handleToByEvmPercentageDynamically(chatId, 25);
      break;
    case "50EVMPer":
      await handleToByEvmPercentageDynamically(chatId, 50);
      break;
    case "70EVMPer":
      await handleToByEvmPercentageDynamically(chatId, 75);
      break;
    case "100EVMPer":
      await handleToByEvmPercentageDynamically(chatId, 100);
      break;
    case "customEVMPer":
      await handleToByEvmPercentageDynamically(chatId, "buyEvmCustom");
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
      await handleSolSellPercentageDynamically(chatId, 10);
      break;
    case "25EvmSellSolanaPer":
      await handleSolSellPercentageDynamically(chatId, 25);
      break;
    case "50EvmSellSolanaPer":
      await handleSolSellPercentageDynamically(chatId, 50);
      break;
    case "70EvmSellSolanaPer":
      await handleSolSellPercentageDynamically(chatId, 75);
      break;
    case "100EvmSellSolanaPer":
      await handleSolSellPercentageDynamically(chatId, 100);
      break;
    case "customEvmSellSolanaPer":
      await handleSolSellPercentageDynamically(chatId, "sellSolCustom");
      break;
    case "10EvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, 10);
      break;
    case "25EvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, 25);
      break;
    case "50EvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, 50);
      break;
    case "70EvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, 75);
      break;
    case "100EvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, 100);
      break;
    case "customEvmSellPer":
      await handleEvmSellPercentageDynamically(chatId, "sellEvmCustom");
      break;
    case "finalSellEvm":
      if (userStates[chatId]?.flag && userStates[chatId]?.sellPrice) {
        let partAmount = userStates[chatId]?.sellPrice?.toString()?.split(".");
        if (partAmount[1]?.length > 5) {
          let finalAmount = partAmount[0] + "." + partAmount[1]?.slice(0, 5);
          evmSellHandle(finalAmount, chatId);
        } else {
          evmSellHandle(userStates[chatId]?.sellPrice, chatId);
        }
      } else {
        resetUserState(chatId);
        sellStartTokenSelection(chatId);
      }
      break;
    case "finalSellEvmPercentageF":
      if (userStates[chatId]?.flag && userStates[chatId]?.sellPrice) {
        evmSellHandlePercentage(userStates[chatId]?.sellPrice, chatId);
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
    case "sellPositionSolanafinal":
      if (userStates[chatId]?.sellPrice) {
        await solanaSellHandlePosition(chatId);
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
    // -------------------------------------------------- buy referash button solana ------------------------------------------------------
    case "refreshEvmButton":
      try {
        if (userStates[chatId]?.flag) {
          await axios
            .post(`${API_URL}/dexEVM`, {
              chain: userStates[chatId].flag,
              token: userStates[chatId].toToken,
              nativeToken: userStates[chatId]?.fromToken,
              chatId,
              network: userStates[chatId]?.network,
            })
            .then(async (res) => {
              if (res?.data?.status) {
                console.log(
                  "🚀 ~ .then ~ res?.data?.status:",
                  res?.data?.status
                );
                userStates[chatId].evmBuyMessageDetail = res?.data?.data;
                userStates[chatId].toBuyAddresName = res?.data?.data?.symbol;
                const market_cap =
                  res?.data?.data?.mcap &&
                  (await humanReadableFormat(res?.data?.data?.mcap));
                userStates[chatId].market_cap = market_cap;
                const liq =
                  res?.data?.data?.liq &&
                  (await humanReadableFormat(res?.data?.data?.liq));
                userStates[chatId].liq = liq;
                userStates[chatId].buyTokenNativename =
                  res?.data?.data?.nativeTokenDetails;
                userStates[chatId].buyPrice =
                  (userStates[chatId]?.buyTokenNativename?.balance_formatted *
                    10) /
                  100;
                const totalBuyUsd = Number(
                  userStates[chatId]?.buyPrice *
                    userStates[chatId]?.buyTokenNativename?.usd_price
                ).toFixed(2);
                await bot.editMessageText(
                  `🌊 <b>Information of ${
                    userStates[chatId]?.evmBuyMessageDetail?.name
                  }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.evmBuyMessageDetail?.symbol}
🔗 Chain : ${userStates[chatId]?.network}  
📭 Address: <code>${userStates[chatId]?.evmBuyMessageDetail?.address}</code>\n
💵 ${userStates[chatId]?.evmBuyMessageDetail?.name} price : ${Number(
                    userStates[chatId]?.evmBuyMessageDetail?.price /
                      userStates[chatId]?.buyTokenNativename?.usd_price
                  ).toFixed(4)}${
                    userStates[chatId]?.buyTokenNativename?.symbol
                  } / ${Number(
                    userStates[chatId]?.evmBuyMessageDetail?.price
                  )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.evmBuyMessageDetail?.variation5m)?.toFixed(
                    3
                  )}% || 1h : ${Number(
                    userStates[chatId]?.evmBuyMessageDetail?.variation1h
                  )?.toFixed(3)}% || 6h : ${Number(
                    userStates[chatId]?.evmBuyMessageDetail?.variation6h
                  )?.toFixed(3)}% || 24h : ${Number(
                    userStates[chatId]?.evmBuyMessageDetail?.variation24h
                  )?.toFixed(3)}%\n
🗃 mcap : ${
                    userStates[chatId]?.market_cap
                      ? userStates[chatId]?.market_cap
                      : "not available!!"
                  }
💰 ${
                    userStates[chatId]?.buyTokenNativename
                      ? userStates[chatId]?.buyTokenNativename?.symbol
                      : ""
                  } Balance: ${Number(
                    userStates[chatId]?.buyTokenNativename
                      ? userStates[chatId]?.buyTokenNativename
                          ?.balance_formatted
                      : 0.0
                  ).toFixed(5)} / ${Number(
                    userStates[chatId]?.buyTokenNativename
                      ? userStates[chatId]?.buyTokenNativename?.usd_value
                      : 0
                  ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice).toFixed(5)} ${
                    userStates[chatId]?.buyTokenNativename?.symbol
                  } (${totalBuyUsd}$) ⇄ ${Number(
                    totalBuyUsd / userStates[chatId]?.evmBuyMessageDetail?.price
                  ).toFixed(5)} ${
                    userStates[chatId]?.evmBuyMessageDetail?.symbol
                  } (${Number(
                    (totalBuyUsd /
                      userStates[chatId]?.evmBuyMessageDetail?.price) *
                      userStates[chatId]?.evmBuyMessageDetail?.price
                  ).toFixed(2)}$)
${
  userStates[chatId]?.evmBuyMessageDetail?.nativeTokenDetails
    ?.balance_formatted <= 0
    ? `🔴 Insufficient balance for buy amount + gas ⇅`
    : ""
}
https://dexscreener.com/${
                    userStates[chatId]?.network == "ether"
                      ? "ethereum"
                      : userStates[chatId]?.network
                  }/${userStates[chatId]?.toToken}`,
                  {
                    chat_id: chatId,
                    message_id: userStates[chatId].evmBuyMessage.message_id,
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
                            text: `✅ ${Number(
                              userStates[chatId].buyPrice
                            )?.toFixed(5)} 10% ${
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
                            text: `Buy 75% ${
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
                            text: `Buy X ${
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
                resetUserState(chatId);
                await bot.sendMessage(
                  chatId,
                  "🔴Token you entered is not supported(May there is a network issue)!!"
                );
              }
            })
            .catch(async (error) => {
              console.log("🚀 ~ bot.on ~ error:", error?.message);
            });
        } else {
          resetUserState(chatId);
          buyStartTokenSelection(chatId);
        }
      } catch (error) {
        console.log("🚀 ~ bot.on ~ error:", error?.message_id);
      }
      break;

    case "refreshButtonBuySolana":
      try {
        if (userStates[chatId]?.flag == 19999) {
          await axios
            .post(`${API_URL}/dexSol`, {
              token: userStates[chatId]?.toToken,
              chatId,
            })
            .then(async (res) => {
              if (res?.data?.status) {
                userStates[chatId].buyTokenData = res?.data?.data;
                userStates[chatId].toBuyAddresName = res?.data?.data?.name;
                const market_cap =
                  res?.data?.data?.mcap &&
                  (await humanReadableFormat(res?.data?.data?.mcap));
                userStates[chatId].market_cap = market_cap;
                const liq =
                  res?.data?.data?.liq &&
                  (await humanReadableFormat(res?.data?.data?.liq));
                userStates[chatId].liq = liq;

                userStates[chatId].nativeBalance =
                  res?.data?.data?.nativeTokenDetails?.solana;
                userStates[chatId].buyPrice = Number(
                  (userStates[chatId]?.nativeBalance * 10) / 100
                );
                const totalTokenBuy = Number(
                  (userStates[chatId].buyPrice *
                    userStates[chatId]?.buyTokenData?.nativePrice) /
                    userStates[chatId]?.buyTokenData?.price
                )?.toFixed(2);
                await bot.editMessageText(
                  `🌊 <b>Information of ${
                    userStates[chatId]?.buyTokenData?.name
                  }</b> 🌊\n
🏷  Name : ${userStates[chatId]?.buyTokenData?.symbol} 
🔗 Chain : "Solana"
📭 Address : <code>${userStates[chatId]?.buyTokenData?.address}</code>\n
💵 ${userStates[chatId]?.buyTokenData?.symbol} price : ${Number(
                    userStates[chatId]?.buyTokenData?.price /
                      userStates[chatId]?.buyTokenData?.nativePrice
                  ).toFixed(5)} SOL / ${Number(
                    userStates[chatId]?.buyTokenData?.price
                  )?.toFixed(5)}$
📊 5m : ${Number(userStates[chatId]?.buyTokenData?.variation5m)?.toFixed(
                    2
                  )}% || 1h : ${Number(
                    userStates[chatId]?.buyTokenData?.variation1h
                  )?.toFixed(2)}% || 6h : ${Number(
                    userStates[chatId]?.buyTokenData?.variation6h
                  )?.toFixed(2)}% || 24h : ${Number(
                    userStates[chatId]?.buyTokenData?.variation24h
                  )?.toFixed(2)}%\n
🗃 mcap : ${
                    userStates[chatId]?.market_cap
                      ? userStates[chatId]?.market_cap
                      : "not available!!"
                  }
💰 Balance : ${Number(
                    userStates[chatId]?.buyTokenData?.nativeTokenDetails?.solana
                  )?.toFixed(5)} SOL / ${Number(
                    userStates[chatId]?.buyTokenData?.nativeTokenDetails
                      ?.solana * userStates[chatId]?.buyTokenData?.nativePrice
                  ).toFixed(2)}$\n
🛒 You buy : ${Number(userStates[chatId]?.buyPrice)?.toFixed(5)} SOL (${Number(
                    userStates[chatId]?.buyPrice *
                      userStates[chatId]?.buyTokenData?.nativePrice
                  )?.toFixed(2)}$) ⇄ ${totalTokenBuy} ${
                    userStates[chatId]?.buyTokenData?.symbol
                  }(${Number(
                    totalTokenBuy * userStates[chatId]?.buyTokenData?.price
                  ).toFixed(2)}$)
https://dexscreener.com/solana/${userStates[chatId].toToken}`,
                  {
                    chat_id: chatId,
                    message_id: userStates[chatId].solanaBuyMessage.message_id,
                    parse_mode: "HTML",
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
                            text: `✅ ${Number(
                              userStates[chatId].buyPrice
                            )?.toFixed(5)}  SOL`,
                            callback_data: "10SolPer",
                          },
                          {
                            text: "Buy 25%  SOL",
                            callback_data: "25SolPer",
                          },
                          {
                            text: "Buy 50%  SOL",
                            callback_data: "50SolPer",
                          },
                        ],
                        [
                          {
                            text: "Buy 75%  SOL",
                            callback_data: "70SolPer",
                          },
                          {
                            text: "Buy 100%  SOL",
                            callback_data: "100SolPer",
                          },
                          {
                            text: "Buy X %  SOL ✏️",
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
                resetUserState(chatId);
                await bot.sendMessage(
                  chatId,
                  "🔴 Token you entered is not supported!!"
                );
              }
            })
            .catch(async (error) => {
              console.log("🚀 ~ bot.on ~ error:", error?.message);
            });
        } else {
          resetUserState(chatId);
          buyStartTokenSelection(chatId);
        }
      } catch (error) {
        console.log("🚀 ~ bot.on ~ error:", error?.message);
      }
      break;
    case "evmSellRefresh":
      if (userStates[chatId]?.flag) {
        await handleDynamicSellToken(chatId, userStates[chatId]?.sellToken);
      } else {
        resetUserState(chatId);
        await sellStartTokenSelection(chatId);
      }
      break;
    case "solanaSellRefresh":
      if (userStates[chatId]?.flag) {
        await handleDynamicSellSolana(chatId, userStates[chatId]?.sellToken);
      } else {
        resetUserState(chatId);
        await sellStartTokenSelection(chatId);
      }
      break;
    case "sellSolanaPositionRefresh":
      if (userStates[chatId]?.flag) {
        await handleSolanaPositionSell(chatId, userStates[chatId].sellToken);
      } else {
        resetUserState(chatId);
        await positionsChainSelection(chatId);
      }
      break;
    case "sellEvmPositionRefresh":
      if (userStates[chatId]?.flag) {
        await handlePositionSell(chatId, userStates[chatId]?.sellToken);
      } else {
        resetUserState(chatId);
        await positionsChainSelection(chatId);
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
      handleToSell(chatId, "0x1", "ether");

      break;
    case "42161sell":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa4b1", "arbitrum");

      break;
    case "10sell":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa", "optimism");

      break;
    case "137sell":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].network = "polygon";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x89", "polygon");

      break;
    case "8453sell":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x2105", "base");

      break;
    case "56sell":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x38", "bsc");

      break;
    case "43114sell":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].method = "sell";
      userStates[chatId].network = "avalanche";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xa86a", "avalanche");

      break;
    case "25sell":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0x19", "cronos");

      break;
    case "250sell":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xfa", "fantom");
      break;
    case "59144sell":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].network = "linea";
      userStates[chatId].method = "sell";
      userStates[chatId].toToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      handleToSell(chatId, "0xe705", "linea");
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
      await handleSolanaSwap(chatId);

    // handle swap  SOL percentage
    case "10SolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, 10);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "25SolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, 25);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "50SolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, 50);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "75SolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, 75);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "100SolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, 100);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customSolPerSwap":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, "customSolPer");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customSolSwapAmount":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, "customSolAmt");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customSolSwapWallet":
      if (userStates[chatId]?.flag) {
        await handleSolSwapPercentage(chatId, "customSolToAddress");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "finalSwapSolWallet":
      if (userStates[chatId]?.flag) {
        if (
          userStates[chatId]?.selectedSellSolanaToken?.amount <
          userStates[chatId]?.swapPrice
        ) {
          resetUserState(chatId);
          await bot.sendMessage(
            chatId,
            "🔴 You do not have sufficient Balance!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "SwaptokenButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        } else {
          console.log(
            "-------------------------- solana swap-------------------------"
          );
          const { loaderMessage, interval } = await animateLoader(chatId);
          await axios
            .post(`${API_URL}/solanaSwap`, {
              input: userStates[chatId]?.selectedSellToken?.address,
              output: userStates[chatId]?.toSwapAddress,
              amount: Number(userStates[chatId]?.swapPrice),
              chatId,
              method: "swap",
            })
            .then(async (res) => {
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              if (res?.data?.status) {
                resetUserState(chatId);
                await bot.sendMessage(chatId, "✅ Transaction successfull!!");
                return await bot.sendMessage(
                  chatId,
                  `https://solscan.io/tx/${res?.data?.transactionCreated?.txid}`
                );
              } else {
                resetUserState(chatId);
                await bot.sendMessage(chatId, ` 🔴 ${res?.data?.message}!!!`);
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
        }
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;

    // handle evm swap
    case "10EvmPerSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, 10);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "25EvmPerSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, 25);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "50EvmPerSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, 50);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "75EvmPerSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, 75);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "100EvmPerSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, 100);
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customPerEvmSwap":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, "customEvmPer");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customSwapEvmAmount":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, "customEvmAmt");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "customEvmSwapToken":
      if (userStates[chatId]?.flag) {
        await handleEvmSwapPercentage(chatId, "customEvmToAddress");
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "finalSwapEvmWallet":
      if (userStates[chatId]?.flag) {
        if (
          userStates[chatId].selectedSellToken?.balance_formatted <
          userStates[chatId]?.swapPrice
        ) {
          resetUserState(chatId);
          await bot.sendMessage(
            chatId,
            "🔴 You do not have sufficient Balance!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "SwaptokenButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        } else {
          console.log(
            "-------------------------- EVM swap-------------------------"
          );
          try {
            const { loaderMessage, interval } = await animateLoader(chatId);
            let finalAmount;
            let partAmount = userStates[chatId]?.swapPrice
              ?.toString()
              ?.split(".");
            if (partAmount[1]?.length > 5) {
              finalAmount = partAmount[0] + "." + partAmount[1]?.slice(0, 5);
            } else {
              finalAmount = userStates[chatId]?.swapPrice;
            }
            await axios
              .post(`${API_URL}/EVMswap`, {
                tokenIn: userStates[chatId]?.toSwapAddress,
                tokenOut: userStates[chatId]?.selectedSellToken?.token_address,
                chainId: userStates[chatId]?.network,
                amount: Number(finalAmount),
                chain: userStates[chatId]?.flag,
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
          } catch (error) {
            console.log("🚀 ~ bot.on ~ error:", error?.message);
          }
        }
      } else {
        resetUserState(chatId);
        await startSwapProcess(chatId);
      }
      break;
    case "1":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].network = "ethereum";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 1, "ethereum");

      break;
    case "42161":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].network = "arbitrum";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 42161, "arbitrum");

      break;
    case "10":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].network = "optimism";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 10, "optimism");

      break;
    case "137":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].method = "swap";
      userStates[chatId].network = "polygon";
      await handleEvmSwap(chatId, 137, "polygon");

      break;
    case "8453":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].network = "base";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 8453, "base");

      break;
    case "56":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].network = "bsc";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 56, "bsc");

      break;
    case "43114":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].network = "avalanche";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 43114, "avalanche");

      break;
    case "25":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].network = "cronos";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 25, "cronos");

      break;
    case "250":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].network = "fantom";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 250, "fantom");

      break;
    case "59144":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].network = "linea";
      userStates[chatId].method = "swap";
      await handleEvmSwap(chatId, 59144, "linea");
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
      await transferHoldingsSol(chatId);

      break;
    case "1withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 1;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "ether";
      await transferHoldingsEvm(chatId, 1, "ethereum");

      break;
    case "42161withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 42161;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Arbitrum";
      await transferHoldingsEvm(chatId, 42161, "arbitrum");

      break;
    case "10withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 10;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "optimism";
      await transferHoldingsEvm(chatId, 10, "optimism");

      break;
    case "137withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 137;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Polygon";
      await transferHoldingsEvm(chatId, 137, "polygon");

      break;
    case "8453withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 8453;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Base";
      await transferHoldingsEvm(chatId, 8453, "base");

      break;
    case "56withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 56;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Bsc";
      await transferHoldingsEvm(chatId, 56, "bsc");

      break;
    case "43114withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 43114;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Avalanche";
      await transferHoldingsEvm(chatId, 43114, "avalanche");

      break;
    case "25withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 25;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Cronos";
      await transferHoldingsEvm(chatId, 25, "cronos");

      break;
    case "250withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 250;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Fantom";
      await transferHoldingsEvm(chatId, 250, "fantom");
      break;
    case "59144withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 59144;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Linea";
      await transferHoldingsEvm(chatId, 59144, "linea");
      break;
    case "81457withraw":
      resetUserState(chatId);
      userStates[chatId].flag = 81457;
      userStates[chatId].method = "transfer";
      userStates[chatId].network = "Blast";
      await handleTransfer(chatId);
      break;

    // handle percentage
    case "10EvmPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, 10);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "25EvmPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, 25);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "50EvmPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, 50);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "75EvmPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, 75);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;

    case "100EvmPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, 100);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, "customPerTransfer");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customTransferAmount":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, "customEvmTransfer");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customTransferWallet":
      if (userStates[chatId]?.flag) {
        await handleEvmTransferPercentage(chatId, "customTransferWallet");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "finalTransferEvmWallet":
      if (
        userStates[chatId].selectedSellToken?.balance_formatted <
        userStates[chatId]?.transferPrice
      ) {
        resetUserState(chatId);
        await bot.sendMessage(
          chatId,
          "🔴 You do not have sufficient Balance!!",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "withrawButton" },
                  { text: "⬅️ Buy", callback_data: "buyButton" },
                ],
              ],
            },
          }
        );
      } else {
        const { loaderMessage, interval } = await animateLoader(chatId);
        try {
          await axios({
            url: `${API_URL}/transferEvmToken`,
            method: "post",
            data: {
              chatId,
              token: userStates[chatId]?.selectedSellToken?.token_address,
              toWallet: userStates[chatId]?.toWalletAddress,
              chain: userStates[chatId]?.flag,
              amount:
                Number(userStates[chatId]?.transferPrice).toFixed(5) - 0.00001,
            },
          })
            .then(async (res) => {
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              resetUserState(chatId);
              if (res?.data?.status) {
                await bot.sendMessage(chatId, `✅ ${res?.data?.message}`);
                await bot.sendMessage(chatId, res?.data?.txUrl);
              } else {
                await bot.sendMessage(
                  chatId,
                  "🔴 somthing has been wrong make sure you have a enough balance!!"
                );
              }
            })
            .catch(async (error) => {
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage.message_id);
              resetUserState(chatId);
              await bot.sendMessage(
                chatId,
                "somthing has been wrong please try again latter!!"
              );
            });
        } catch (error) {
          resetUserState(chatId);
          console.log("🚀 ~ bot.on ~ error:", error?.message);
        }
      }
      break;
    // handle  SOL percentage
    case "10SolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, 10);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "25SolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, 25);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "50SolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, 50);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "75SolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, 75);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "100SolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, 100);
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customSolPerTransfer":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, "customPerTransfer");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customSOlTransferAmt":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, "customEvmTransfer");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "customSolTransferWallet":
      if (userStates[chatId]?.flag) {
        await handleSolTransferPercentage(chatId, "customTransferWallet");
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    case "finalTransferSolWallet":
      if (userStates[chatId]?.flag) {
        if (
          userStates[chatId]?.selectedSellSolanaToken?.amount <
          userStates[chatId].transferPrice
        ) {
          resetUserState(chatId);
          await bot.sendMessage(
            chatId,
            "🔴 You do not have sufficient Balance!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "⬅️ Back", callback_data: "withrawButton" },
                    { text: "⬅️ Buy", callback_data: "buyButton" },
                  ],
                ],
              },
            }
          );
        } else {
          const { loaderMessage, interval } = await animateLoader(chatId);
          await axios({
            url: `${API_URL}/transferSolanaToken`,
            method: "post",
            data: {
              chatId,
              toWallet: userStates[chatId]?.toWalletAddress,
              token: userStates[chatId]?.selectedSellToken?.address,
              amount: Number(userStates[chatId]?.transferPrice),
            },
          })
            .then(async (res) => {
              resetUserState(chatId);
              clearInterval(interval);
              await bot.deleteMessage(chatId, loaderMessage?.message_id);
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
        }
      } else {
        resetUserState(chatId);
        withrawStartTokenSelection(chatId);
      }
      break;
    default:
      console.log(`Unknown button clicked meet: ${data}`);
  }
});

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
console.log("Bot started!!");
