const userModel = require("../../app/Models/userModel");
async function telegram() {
  const controller = require("../../app/Controllers/userController")
  const helpers = require("../../helpers")
  const UserModel = require('../../app/Models/userModel')
  const TelegramBot = require('node-telegram-bot-api');
  require('dotenv').config();
  const axios = require('axios');

  const TOKEN = process.env.TELEGRAM_TOKEN;
  //const API_URL = 'http://localhost:3332'; // Replace with your actual API endpoint
  const WEBSITE_URL = 'https://marketing-dashboard-beta.vercel.app/';
  const API_URL = 'https://core-ivory.vercel.app/'; // Replace with your actual API endpoint

  const bot = new TelegramBot(TOKEN, { polling: true });

  const buyKeyboard = {
    inline_keyboard: [
      [
        { text: 'Swap Token', callback_data: 'SwaptokenButton' },
      ],
      [
        { text: '🗘Refresh', callback_data: 'refreshButton' },
        { text: '💼Balance', callback_data: 'balanceButton' },
      ],
    ],
  };

  const blockchainKeyboard = {
    inline_keyboard: [
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
      bot.onText(/SignUp/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Please provide your name:');
        bot.once('message', async (nameMsg) => {
          const name = nameMsg.text;

          bot.sendMessage(chatId, 'Please provide your email:');
          bot.once('message', async (emailMsg) => {
            const email = emailMsg.text;

            bot.sendMessage(chatId, 'Please provide your password:');
            bot.once('message', async (passwordMsg) => {
              const password = passwordMsg.text;

              bot.sendMessage(chatId, 'Please confirm your password:');
              bot.once('message', async (confirmPasswordMsg) => {
                const confirmPassword = confirmPasswordMsg.text;

                if (password !== confirmPassword) {
                  bot.sendMessage(chatId, 'Passwords does not match. Please try again.');
                  return;
                }

                try {
                  const userExists = await UserModel.findOne({ email });
                  if (userExists) {
                    bot.sendMessage(chatId, 'User with this email already exists.');
                    return;
                  }

                  // Register a new user
                  const response = await axios.post(`${API_URL}/signup`, {
                    name,
                    email,
                    password,
                    confirmPassword,
                    chatId
                  });
                  console.log("🚀 ~ bot.once ~ response:", response)
                  const { message, data } = response.data;
                  await bot.sendMessage(chatId, `User registered successfully. Email: ${data.email}`);

                  // Ask the user to provide their email for verification
                  bot.sendMessage(chatId, 'Please provide your email:');
                  bot.once('message', async (emailMsg) => {
                    const email = emailMsg.text;

                    // Ask the user for OTP
                    bot.sendMessage(chatId, 'Please Check Your Email & Enter your OTP:');
                    bot.once('message', async (otpMsg) => {
                      const otp = otpMsg.text;

                      try {
                        // Verify the user with OTP
                        const response = await axios.post(`${API_URL}/verify`, {
                          email,
                          otp,
                        });

                        if (response.data.status === true) {
                          const { message, data } = response.data;
                          await bot.sendMessage(chatId, `User verified successfully`);
                          // Retrieve the wallet address from the database
                          const user = await UserModel.findOne({ email: email });
                          console.log("🚀 ~ bot.once ~ user:", user)
                          const wallet = user ? user.wallet : null;

                          if (wallet) {
                            await bot.sendMessage(chatId, `This is Your WalletAddress : ${wallet}`);
                          } else {
                            await bot.sendMessage(chatId, `User wallet address not available.`);
                          }
                        } else if (response.data.status === false) {
                          bot.sendMessage(chatId, `Invalid OTP. Please enter a valid OTP.`);
                        }
                      } catch (error) {
                        console.error('Error:', error.message);
                        bot.sendMessage(chatId, `An error occurred while verifying the user: ${error.message}`);
                      }
                    });
                  });
                } catch (error) {
                  console.error('Error:', error.message);
                  bot.sendMessage(chatId, `An error occurred while registering the user: ${error.message}`);
                }
              });
            });
          });
        });
      });

    } else if (msg.text === 'Login') {
      bot.sendMessage(chatId, 'Please provide your email:');
      bot.once('message', async (emailMsg) => {
        const email = emailMsg.text;
        bot.sendMessage(chatId, 'Please provide your password:');
        bot.once('message', async (passwordMsg) => {
          const password = passwordMsg.text;
          try {
            // Login the user
            const response = await axios.post(`${API_URL}/login`, {
              email,
              password,
              chatId,
            });
            if (response.data.status === true) {
              // Send a message with an inline keyboard button to redirect to the website
              bot.sendMessage(chatId, `Login successful!`, {
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [{
                      text: 'Go to website',
                      url: WEBSITE_URL
                    }]
                  ]
                })
              });
            } else {
              bot.sendMessage(chatId, 'Invalid email or password. Please try again.');
            }
          } catch (error) {
            console.error('Error:', error.message);
            bot.sendMessage(chatId, `An error occurred while logging in: ${error.message}`);
          }
        });
      });
    }
    else if (msg.text === 'Start') {
      async function start() {
        const user = await UserModel.findOne({ chatId: chatId });
        console.log("🚀 ~ start ~ user:", user)
        const messageText = `*Welcome to WaveBot*
🌊 WaveBot(https://wavebot.app/)
📊 Dashbord(https://dashobaord.wavebot.app/)
🌊 WebSite(https://marketing-dashboard-beta.vercel.app/)
‧‧────────────────‧‧
*Your Email Address:* ${user.email}
*Your Wallet Address:* ${user.wallet}`;

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
    let WebSiteLink = 'https://marketing-dashboard-beta.vercel.app/';

    switch (data) {
      case 'menuButton': {
        const user = await UserModel.findOne({ chatId: chatId });
        console.log("🚀 ~ start ~ user:", user)
        bot.sendMessage(chatId,
          `*Welcome to WaveBot*
🌊 WaveBot(https://wavebot.app/)
📊 Dashbord(https://dashobaord.wavebot.app/)
🌊 WebSite(https://marketing-dashboard-beta.vercel.app/)
‧‧────────────────‧‧
*Your Email Address:* ${user.email}
*Your Wallet Address:* ${user.wallet}`
          , { reply_markup: JSON.stringify(buyKeyboard) });
        break;
      }
      case 'closeButton':
        bot.editMessageText('Menu closed.', { chat_id: chatId, message_id: messageId });
        break;
      case 'SwaptokenButton':
        //   let fromtoken
        //   let totoken
        //   let amountIn
        //   let chainId
        //   bot.sendMessage(chatId, 'ChainId:');
        //   bot.once('message', async (chainId) => {
        //     chainId = chainId.text;
        //     console.log("🚀 ~ bot.once ~ chainId:", chainId)
        //   bot.sendMessage(chatId, 'from Token:');
        //   bot.once('message', async (fromToken) => {
        //     fromtoken = fromToken.text;
        //     bot.sendMessage(chatId, 'To Token:');
        //     bot.once('message', async (totoken) => {
        //       totoken = totoken.text;
        //       bot.sendMessage(chatId, 'amount in:');
        //       bot.once('message', async (amountIn) => {
        //         // console.log("🚀 ~ bot.once ~ amountIn:", amountIn)
        //         amountIn = amountIn.text;
        //         const walletInfo = helpers.getWalletInfo(chatId);
        //         console.log("🚀 ~ bot.once ~ walletInfo:", walletInfo)
        //         const swaptoken = await controller.mainswap(fromtoken, totoken, amountIn ,chainId, chatId)
        //         console.log("🚀 ~ bot.once ~ swaptoken:", swaptoken)
        //         bot.sendMessage(chatId,`transection hash : ${swaptoken}`);
        //         // bot.sendMessage(chatId,`transection successfully`);
        //       })
        //     })
        //   })
        // })
        let fromtoken
        let totoken
        let amountIn
        let chainId
        bot.sendMessage(chatId, 'Choose a blockchain', { reply_markup: JSON.stringify(blockchainKeyboard) });
        bot.on('callback_query', async (callbackQuery) => {
          const data = callbackQuery.data;
          console.log("🚀 ~ bot.on ~ data:::::::::::>>>>>>>>>>>>>>>", data)
          chainId = data;
          console.log("🚀 ~ bot.once ~ chainId:", chainId)
          bot.sendMessage(chatId, 'Type To From Token:');
          bot.once('message', async (fromToken) => {
            fromtoken = fromToken.text;
            bot.sendMessage(chatId, 'Type To To Token:');
            bot.once('message', async (totoken) => {
              totoken = totoken.text;
              bot.sendMessage(chatId, 'amount in:');
              bot.once('message', async (amountIn) => {
                // console.log("🚀 ~ bot.once ~ amountIn:", amountIn)
                amountIn = amountIn.text;
                const walletInfo = helpers.getWalletInfo(chatId);
                const swaptoken = await controller.mainswap(fromtoken, totoken, amountIn, chainId, chatId)
                console.log("🚀 ~ bot.once ~ swaptoken:", swaptoken)
                bot.sendMessage(chatId, `transection hash : ${swaptoken}`);
                // bot.sendMessage(chatId,`transection successfully`);
              })
            })
          })
        })
        break;
      case 'balanceButton':
        // //bot.sendMessage(chatId, 'Please provide your Wallet Address:');
        // bot.once('message', async (walletmessage) => {

        //   console.log("🚀 ~ bot.once ~ emailMsg:", walletmessage)
        //   const wallet = walletmessage.text;
        //   console.log("🚀 ~ bot.once ~ wallet:", wallet)
        const user = await UserModel.findOne({ chatId: chatId });
        const balancedata = await controller.fetchBalance(user.wallet)
        let message = "Balance:\n";
        balancedata.forEach((item, index) => {
          message += `${index + 1}. Name: ${item.name}, Amount: ${item.balance}\n`; // Modify this based on your object structure
        });
        bot.sendMessage(chatId, message);
        // })
        break;
      default:
        console.log(`Unknown button clicked: ${data}`);
    }
  });
  console.log('Bot started!');
  console.log('Server running');
}


