// const TelegramBot = require('node-telegram-bot-api');
// require('dotenv').config();
// const axios = require('axios');
// const express = require('express')
// const app = express();


// const TOKEN = process.env.TOKEN; // Telegram Token
// const WEBSITE_URL = 'https://marketing-dashboard-beta.vercel.app/';
// const API_URL = process.env.BACKEND_URL; // Backend URL

// const bot = new TelegramBot(TOKEN, { polling: true });

// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const userId = msg.from.id;
//     console.log("🚀 ~ bot.on ~ userId:", userId)

//     if (msg.text === '/start') {
//         bot.sendMessage(chatId, 'Welcome to the bot! Type something in the textbox:', {
//             reply_markup: {
//                 keyboard: [
//                     [{ text: 'SignUp', request_contact: false, request_location: false }],
//                     [{ text: 'SwapToken', request_contact: false, request_location: false }],
//                 ],
//                 resize_keyboard: true,
//                 one_time_keyboard: true,
//             },
//         });
//     } else if (msg.text === 'SignUp') {
//         bot.sendMessage(chatId, 'Please provide your name:');
//         bot.once('message', async (nameMsg) => {
//             const name = nameMsg.text;
//             bot.sendMessage(chatId, 'Please provide your email:');
//             bot.once('message', async (emailMsg) => {
//                 const email = emailMsg.text;
//                 bot.sendMessage(chatId, 'Please provide your password:');
//                 bot.once('message', async (passwordMsg) => {
//                     const password = passwordMsg.text;
//                     bot.sendMessage(chatId, 'Please confirm your password:');
//                     bot.once('message', async (confirmPasswordMsg) => {
//                         const confirmPassword = confirmPasswordMsg.text;
//                         try {
//                             const response = await axios.post(`${API_URL}/signup`, {
//                                 name,
//                                 email,
//                                 password,
//                                 confirmPassword,
//                                 chatId
//                             });
//                             const { message, data } = response.data;
//                             if (data && data.email) {
//                                 await bot.sendMessage(chatId, `User registered successfully. Email: ${data.email}`);
//                                 bot.sendMessage(chatId, 'Please provide your email:');
//                                 bot.once('message', async (emailMsg) => {
//                                     const email = emailMsg.text;
//                                     bot.sendMessage(chatId, 'Please Check Your Email & Enter your OTP:');
//                                     bot.once('message', async (otpMsg) => {
//                                         const otp = otpMsg.text;
//                                         try {
//                                             const response = await axios.post(`${API_URL}/verify`, {
//                                                 email,
//                                                 otp,
//                                             });
//                                             if (response.data.status === true) {
//                                                 const { message, data } = response.data;
//                                                 await bot.sendMessage(chatId, `User verified successfully`);
//                                             } else if (response.data.status === false) {
//                                                 bot.sendMessage(chatId, `Invalid OTP. Please enter a valid OTP.`);
//                                             }
//                                         } catch (error) {
//                                             console.error('Error:', error.message);
//                                             bot.sendMessage(chatId, `An error occurred while verifying the user: ${error.message}`);
//                                         }
//                                     });
//                                 });
//                             } else {
//                                 bot.sendMessage(chatId, `Failed to register user. Please try again.`);
//                             }
//                         } catch (error) {
//                             console.error('Error:', error.message);
//                             bot.sendMessage(chatId, `An error occurred while registering the user: ${error.message}`);
//                         }
//                     });
//                 });
//             });
//         });
//     } else if (msg.text === 'Login') {
//         bot.sendMessage(chatId, 'Please provide your email:');
//         bot.once('message', async (emailMsg) => {
//             const email = emailMsg.text;
//             bot.sendMessage(chatId, 'Please provide your password:');
//             bot.once('message', async (passwordMsg) => {
//                 const password = passwordMsg.text;
//                 try {
//                     const response = await axios.post(`${API_URL}/login`, {
//                         email,
//                         password,
//                         chatId,
//                     });
//                     if (response.data.status === true) {
//                         bot.sendMessage(chatId, `Login successful!`, {
//                             reply_markup: JSON.stringify({
//                                 inline_keyboard: [
//                                     [{
//                                         text: 'Go to website',
//                                         url: WEBSITE_URL
//                                     }]
//                                 ]
//                             })
//                         });
//                     } else {
//                         bot.sendMessage(chatId, 'Invalid email or password. Please try again.');
//                     }
//                 } catch (error) {
//                     console.error('Error:', error.message);
//                     bot.sendMessage(chatId, `An error occurred while logging in: ${error.message}`);
//                 }
//             });
//         });
//     } else if (msg.text === 'SwapToken') {
//         bot.sendMessage(chatId, 'Please enter the chainId:');
//         bot.once('message', async (msg) => {
//             const chainId = Number(msg.text);
//             if (isNaN(chainId)) {
//                 return bot.sendMessage(chatId, 'Invalid chainId. Please enter a valid number.');
//             }
//             bot.sendMessage(chatId, 'Please enter token0:');
//             bot.once('message', async (msg) => {
//                 const token0 = msg.text;
//                 bot.sendMessage(chatId, 'Please enter token1:');
//                 bot.once('message', async (msg) => {
//                     const token1 = msg.text;
//                     bot.sendMessage(chatId, 'Please enter the amountIn:');
//                     bot.once('message', async (msg) => {
//                         const amountIn = Number(msg.text);
//                         if (isNaN(amountIn)) {
//                             return bot.sendMessage(chatId, 'Invalid amountIn. Please enter a valid number.');
//                         }
//                         try {
//                             const result = await mainswap({ token0, token1, amountIn, chainId, chatId });
//                             bot.sendMessage(chatId, result.msg); // Send response to the user
//                         } catch (error) {
//                             console.error("Error in mainswap:", error);
//                             bot.sendMessage(chatId, 'Something went wrong. Please try again later.');
//                         }
//                     });
//                 });
//             });
//         });
//     } else {
//         bot.sendMessage(chatId, `You typed: ${msg.text}`);
//     }
// });

// app.all("*", (req, res) => {
//     res.send("URL not found")
// })

// console.log('Bot started!');
// console.log('Server running');



const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.TOKEN; // Telegram Token
const API_URL = process.env.BACKEND_URL; // Backend URL

const bot = new TelegramBot(TOKEN, { polling: true });

// Event listener for handling messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        sendWelcomeMessage(chatId);
    } else if (msg.text === 'SignUp') {
        startSignUp(chatId);
    } else if (msg.text === 'Login') {
        startLogin(chatId);
    } else if (msg.text === 'SwapToken') {
        startSwapToken(chatId);
    } else {
        bot.sendMessage(chatId, `You typed: ${msg.text}`);
    }
});

// Function to send the welcome message
function sendWelcomeMessage(chatId) {
    bot.sendMessage(chatId, '👋 Welcome to the bot! Type something in the textbox:', {
        reply_markup: {
            keyboard: [
                [{ text: 'SignUp', request_contact: false, request_location: false }],
                [{ text: 'SwapToken', request_contact: false, request_location: false }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,                        
        },
    });
}

// Function to start the sign-up process
function startSignUp(chatId) {
    bot.sendMessage(chatId, '👋 Welcome! Please provide your name:');
    bot.once('message', async (nameMsg) => {
        const name = nameMsg.text;
        console.log("🚀 ~ bot.once ~ name:", name)
        bot.sendMessage(chatId, `Great, thanks ${name}! Next, please provide your email address:`);
        bot.once('message', async (emailMsg) => {
            const email = emailMsg.text;
            console.log("🚀 ~ bot.once ~ email:", email)
            bot.sendMessage(chatId, 'Awesome! Now, please create a password:');
            bot.once('message', async (passwordMsg) => {
                const password = passwordMsg.text;
                bot.sendMessage(chatId, 'Got it! Please confirm your password:');
                bot.once('message', async (confirmPasswordMsg) => {
                    const confirmPassword = confirmPasswordMsg.text;
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
                            bot.once('message', async (otpMsg) => {
                                const otp = otpMsg.text;
                                try {
                                    const response = await axios.post(`${API_URL}/verify`, {
                                        email,
                                        otp,
                                    });
                                    if (response.data.status === true) {
                                        await bot.sendMessage(chatId, `✅ User verified successfully`);
                                    } else if (response.data.status === false) {
                                        bot.sendMessage(chatId, `❌ Invalid OTP. Please enter a valid OTP.`);
                                    }
                                } catch (error) {
                                    console.error('Error:', error.message);
                                    bot.sendMessage(chatId, `❌ An error occurred while verifying the user: ${error.message}`);
                                }
                            });
                        } else {
                            bot.sendMessage(chatId, `❌ Failed to register user. Please try again.`);
                        }
                    } catch (error) {
                        console.error('Error:', error.message);
                        bot.sendMessage(chatId, `❌ An error occurred while registering the user: ${error.message}`);
                    }
                });
            });
        });
    });
}

// Function to start the login process
function startLogin(chatId) {
    bot.sendMessage(chatId, '🔐 Please enter your email to log in:');
    bot.once('message', async (emailMsg) => {
        const email = emailMsg.text;
        bot.sendMessage(chatId, '🔑 Now, please enter your password:');
        bot.once('message', async (passwordMsg) => {
            const password = passwordMsg.text;
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
                }
            } catch (error) {
                console.error('Error:', error.message);
                bot.sendMessage(chatId, `❌ An error occurred while logging in: ${error.message}`);
            }
        });
    });

}

// Function to start the token swapping process
function startSwapToken(chatId) {
    bot.sendMessage(chatId, '🔄 Please enter the chain ID:');
    bot.once('message', async (msg) => {
        const chainId = Number(msg.text);
        if (isNaN(chainId)) {
            return bot.sendMessage(chatId, '❌ Invalid chain ID. Please enter a valid number.');
        }
        bot.sendMessage(chatId, '💱 Please enter the first token:');
        bot.once('message', async (msg) => {
            const token0 = msg.text;
            bot.sendMessage(chatId, '💱 Please enter the second token:');
            bot.once('message', async (msg) => {
                const token1 = msg.text;
                bot.sendMessage(chatId, '💰 Please enter the amount to swap:');
                bot.once('message', async (msg) => {
                    const amountIn = Number(msg.text);
                    if (isNaN(amountIn)) {
                        return bot.sendMessage(chatId, '❌ Invalid amount. Please enter a valid number.');
                    }
                    try {
                        const result = await mainswap({ token0, token1, amountIn, chainId, chatId });
                        bot.sendMessage(chatId, result.msg); // Send response to the user
                    } catch (error) {
                        console.error("Error in mainswap:", error);
                        bot.sendMessage(chatId, '❌ Something went wrong. Please try again later.');
                    }
                });
            });
        });
    });
}

console.log('Bot started!');
