const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');
const express = require('express')
const app = express();

const PORT = process.env.PORT || 3333;
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
function startSwapToken(chatId, bot) {
    bot.sendMessage(chatId, '🔄 Please enter the chain ID:');
    bot.once('message', async (chainIdMsg) => {
        const chainId = Number(chainIdMsg.text);
        if (isNaN(chainId)) {
            return bot.sendMessage(chatId, '❌ Invalid chain ID. Please enter a valid number.');
        }
        bot.sendMessage(chatId, '💱 Please enter the first token:');
        bot.once('message', async (token0Msg) => {
            const token0 = token0Msg.text;
            bot.sendMessage(chatId, '💱 Please enter the second token:');
            bot.once('message', async (token1Msg) => {
                const token1 = token1Msg.text;
                bot.sendMessage(chatId, '💰 Please enter the amount to swap:');
                bot.once('message', async (amountInMsg) => {
                    const amountIn = Number(amountInMsg.text);
                    if (isNaN(amountIn)) {
                        return bot.sendMessage(chatId, '❌ Invalid amount. Please enter a valid number.');
                    }
                    try {
                        const response = await axios.post(`${API_URL}/mainswap`,{
                            token0: token0,
                            token1: token1,
                            amountIn: amountIn,
                            chainId: chainId,
                            chatId: chatId
                        });
                        if (response.data.status === true) {
                            bot.sendMessage(chatId, `Swap successful!`);
                        } else {
                            bot.sendMessage(chatId, '❌ Swap failed. Please try again.');
                        }
                    } catch (error) {
                        console.error("Error in mainswap:", error);
                        bot.sendMessage(chatId, '❌ Something went wrong. Please try again later.');
                    }
                });
            });
        });
    });
}

app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
console.log('Bot started!');
