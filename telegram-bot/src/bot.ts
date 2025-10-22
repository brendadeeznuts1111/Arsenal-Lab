#!/usr/bin/env bun

/**
 * White-label Sports Betting Telegram Bot
 * For operators who rent sports-books but own their customer experience
 */

import { conversations, createConversation } from "@grammyjs/conversations";
import { Bot, Context, session, SessionFlavor } from "grammy";

// Types
interface BotSession {
  currentBet?: {
    stake?: number;
    market?: string;
    selection?: string;
    odds?: number;
  };
  language: string;
  timezone: string;
}

type BotContext = Context & SessionFlavor<BotSession>;

// Configuration
const BOT_TOKEN = process.env.TG_BOT_TOKEN || "your-bot-token-here";
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || "http://localhost:3001";
const RENTER_API_URL = process.env.RENTER_API_URL || "https://fantasy402.com/api";
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/white_label";

// Initialize bot
const bot = new Bot<BotContext>(BOT_TOKEN);

// Add session middleware
bot.use(session({
  initial: (): BotSession => ({
    language: 'en',
    timezone: 'UTC'
  })
}));

// Add conversations plugin
bot.use(conversations());

// Database connection (simplified - in production use a proper ORM)
const db = {
  async getCustomer(tgUserId: number) {
    // Mock implementation - replace with actual DB query
    return {
      id: `cust-${tgUserId}`,
      tg_user_id: tgUserId,
      status: 'active',
      kyc_status: 'approved',
      currency: 'USD'
    };
  },

  async createCustomer(tgUser: any) {
    // Mock implementation - replace with actual DB insert
    return {
      id: `cust-${tgUser.id}`,
      tg_user_id: tgUser.id,
      tg_username: tgUser.username,
      status: 'active'
    };
  },

  async createBet(customerId: string, betData: any) {
    // Mock implementation - replace with actual DB insert
    return {
      id: Math.random().toString(36).substr(2, 9),
      customer_id: customerId,
      ...betData,
      status: 'pending'
    };
  }
};

// Identity service integration
async function createIdentity(prefix: string, run: string | number): Promise<any> {
  const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/id?prefix=${prefix}&run=${run}`);
  if (!response.ok) {
    throw new Error(`Identity service error: ${response.status}`);
  }
  return response.json();
}

// Renter API integration (iframe approach)
async function placeBetWithRenter(identity: string, betData: any): Promise<any> {
  // This would use iframe postMessage or headless browser
  // For now, return mock response
  return {
    ticket_ref: `TICKET-${Date.now()}`,
    status: 'accepted',
    estimated_payout: betData.stake * betData.odds
  };
}

// Conversation: Bet placement
const betConversation = createConversation(async (conversation, ctx) => {
  await ctx.reply("🎯 Let's place a bet! What's the stake amount?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "10", callback_data: "stake_10" }],
        [{ text: "25", callback_data: "stake_25" }],
        [{ text: "50", callback_data: "stake_50" }],
        [{ text: "100", callback_data: "stake_100" }],
        [{ text: "Custom amount", callback_data: "stake_custom" }]
      ]
    }
  });

  const stakeResponse = await conversation.waitForCallbackQuery(/stake_(.+)/);
  let stake: number;

  if (stakeResponse.match[1] === 'custom') {
    await ctx.reply("Enter stake amount:");
    const amountMsg = await conversation.waitFor("message:text");
    stake = parseFloat(amountMsg.message.text);
  } else {
    stake = parseFloat(stakeResponse.match[1]);
  }

  if (isNaN(stake) || stake <= 0) {
    await ctx.reply("❌ Invalid stake amount. Please try again.");
    return;
  }

  // Update session
  ctx.session.currentBet = { stake };

  await ctx.reply("🏆 What market are you betting on?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Moneyline", callback_data: "market_moneyline" }],
        [{ text: "Spread", callback_data: "market_spread" }],
        [{ text: "Over/Under", callback_data: "market_ou" }],
        [{ text: "Parlay", callback_data: "market_parlay" }]
      ]
    }
  });

  const marketResponse = await conversation.waitForCallbackQuery(/market_(.+)/);
  const market = marketResponse.match[1];

  await ctx.reply(`🎯 Enter your selection for ${market}:`);
  const selectionMsg = await conversation.waitFor("message:text");
  const selection = selectionMsg.message.text;

  await ctx.reply("📊 What's the odds? (e.g., 2.10 for decimal, +110 for American)");
  const oddsMsg = await conversation.waitFor("message:text");
  const odds = parseFloat(oddsMsg.message.text.replace(/[+\-]/, ''));

  // Get or create customer
  const customer = await db.getCustomer(ctx.from!.id) ||
                   await db.createCustomer(ctx.from!);

  // Create disposable identity
  const identity = await createIdentity('tg', ctx.from!.id);

  // Place bet through renter
  const betData = {
    stake,
    market,
    selection,
    odds,
    currency: customer.currency,
    identity: identity.id
  };

  try {
    const ticket = await placeBetWithRenter(identity.id, betData);

    // Save to our database
    const bet = await db.createBet(customer.id, {
      ...betData,
      renter_ref: ticket.ticket_ref,
      placed_via: 'telegram'
    });

    await ctx.reply(
      `🎉 **Bet Placed Successfully!**\n\n` +
      `🎫 **Ticket:** \`${ticket.ticket_ref}\`\n` +
      `💰 **Stake:** ${stake} ${customer.currency}\n` +
      `🎯 **Selection:** ${selection}\n` +
      `📊 **Odds:** ${odds}\n` +
      `💎 **Potential Payout:** ${ticket.estimated_payout.toFixed(2)} ${customer.currency}\n\n` +
      `🔐 **Identity Used:** \`${identity.id}\`\n` +
      `(Expires: ${new Date(identity.expires).toLocaleString()})`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error('Bet placement error:', error);
    await ctx.reply("❌ Sorry, there was an error placing your bet. Please try again.");
  }
});

// Commands
bot.command("start", async (ctx) => {
  const user = ctx.from!;
  const customer = await db.getCustomer(user.id) ||
                   await db.createCustomer(user);

  let welcomeMessage = `🎰 **Welcome to YourBrand Sports Betting!**\n\n`;

  if (customer.kyc_status !== 'approved') {
    welcomeMessage += `⚠️ **KYC Required:** Please complete identity verification first.\n`;
    welcomeMessage += `/kyc - Start KYC process\n\n`;
  }

  welcomeMessage += `🎯 **Available Commands:**\n`;
  welcomeMessage += `/bet - Place a new bet\n`;
  welcomeMessage += `/balance - Check your balance\n`;
  welcomeMessage += `/tickets - View active tickets\n`;
  welcomeMessage += `/profile - Your profile & settings\n`;
  welcomeMessage += `/help - Show this help\n\n`;

  if (customer.kyc_status === 'approved') {
    welcomeMessage += `✅ **Ready to bet!** Use /bet to get started.`;
  }

  await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
});

bot.command("bet", async (ctx) => {
  const customer = await db.getCustomer(ctx.from!.id);
  if (!customer) {
    await ctx.reply("❌ Please use /start first to register.");
    return;
  }

  if (customer.kyc_status !== 'approved') {
    await ctx.reply("⚠️ KYC verification required before betting. Use /kyc to start.");
    return;
  }

  if (customer.status !== 'active') {
    await ctx.reply("❌ Your account is not active. Please contact support.");
    return;
  }

  await ctx.conversation.enter(betConversation.name);
});

bot.command("balance", async (ctx) => {
  const customer = await db.getCustomer(ctx.from!.id);
  if (!customer) {
    await ctx.reply("❌ Please use /start first to register.");
    return;
  }

  // Mock balance - replace with actual balance calculation
  const balance = 1000.00;
  const currency = customer.currency;

  await ctx.reply(
    `💰 **Your Balance**\n\n` +
    `💵 **Available:** ${balance.toFixed(2)} ${currency}\n` +
    `🎯 **Pending Bets:** 0.00 ${currency}\n` +
    `🏆 **Lifetime Winnings:** 250.00 ${currency}`,
    { parse_mode: "Markdown" }
  );
});

bot.command("tickets", async (ctx) => {
  const customer = await db.getCustomer(ctx.from!.id);
  if (!customer) {
    await ctx.reply("❌ Please use /start first to register.");
    return;
  }

  // Mock active tickets - replace with actual DB query
  const tickets = [
    { ref: "TICKET-123456", selection: "Lakers -4.5", stake: 50, odds: 1.95, status: "pending" },
    { ref: "TICKET-123457", selection: "Over 220.5", stake: 25, odds: 1.85, status: "pending" }
  ];

  if (tickets.length === 0) {
    await ctx.reply("📭 No active tickets found.");
    return;
  }

  let message = `🎫 **Your Active Tickets**\n\n`;
  tickets.forEach(ticket => {
    message += `🎯 **${ticket.ref}**\n`;
    message += `   ${ticket.selection}\n`;
    message += `   Stake: ${ticket.stake} ${customer.currency} @ ${ticket.odds}\n`;
    message += `   Status: ${ticket.status}\n\n`;
  });

  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("profile", async (ctx) => {
  const customer = await db.getCustomer(ctx.from!.id);
  if (!customer) {
    await ctx.reply("❌ Please use /start first to register.");
    return;
  }

  const kycStatus = customer.kyc_status === 'approved' ? '✅ Verified' :
                   customer.kyc_status === 'pending' ? '⏳ Pending' :
                   customer.kyc_status === 'rejected' ? '❌ Rejected' : '⚠️ Not Started';

  await ctx.reply(
    `👤 **Your Profile**\n\n` +
    `🆔 **User ID:** ${customer.id}\n` +
    `💳 **KYC Status:** ${kycStatus}\n` +
    `💰 **Currency:** ${customer.currency}\n` +
    `📅 **Member Since:** ${new Date(customer.created_at || Date.now()).toLocaleDateString()}\n` +
    `🎮 **Total Bets:** 15\n` +
    `🏆 **Win Rate:** 60%\n\n` +
    `🔧 **Settings**\n` +
    `/kyc - Manage KYC\n` +
    `/language - Change language\n` +
    `/timezone - Set timezone`,
    { parse_mode: "Markdown" }
  );
});

bot.command("kyc", async (ctx) => {
  const customer = await db.getCustomer(ctx.from!.id);
  if (!customer) {
    await ctx.reply("❌ Please use /start first to register.");
    return;
  }

  const status = customer.kyc_status;
  let message = `🔐 **KYC Verification**\n\n`;

  switch (status) {
    case 'none':
      message += `⚠️ **Not Started**\n\n`;
      message += `To place bets, you need to verify your identity.\n\n`;
      message += `🔗 **Start Verification:** [Click Here](${process.env.KYC_WIDGET_URL}?user=${customer.id})\n\n`;
      message += `After completing verification, use /profile to check status.`;
      break;

    case 'pending':
      message += `⏳ **Verification In Progress**\n\n`;
      message += `Your documents are being reviewed. This usually takes 5-15 minutes.\n\n`;
      message += `Use /profile to check for updates.`;
      break;

    case 'approved':
      message += `✅ **Verified**\n\n`;
      message += `Your identity has been verified. You can now place bets!\n\n`;
      message += `Use /bet to get started.`;
      break;

    case 'rejected':
      message += `❌ **Verification Failed**\n\n`;
      message += `Your documents were not accepted. Please try again.\n\n`;
      message += `🔄 **Retry:** [Click Here](${process.env.KYC_WIDGET_URL}?user=${customer.id})`;
      break;
  }

  await ctx.reply(message, { parse_mode: "Markdown", disable_web_page_preview: true });
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    `🎰 **YourBrand Sports Betting Bot**\n\n` +
    `🎯 **Betting Commands:**\n` +
    `/bet - Place a new bet (interactive)\n` +
    `/balance - Check your account balance\n` +
    `/tickets - View your active bets\n\n` +
    `👤 **Account Commands:**\n` +
    `/profile - View your profile & stats\n` +
    `/kyc - KYC verification status\n\n` +
    `ℹ️ **Other Commands:**\n` +
    `/start - Welcome message & registration\n` +
    `/help - Show this help\n\n` +
    `💡 **Tips:**\n` +
    `• Complete KYC to unlock betting\n` +
    `• Use interactive bet placement for best experience\n` +
    `• Check /tickets for bet status\n\n` +
    `📞 **Support:** @YourBrandSupport`,
    { parse_mode: "Markdown" }
  );
});

// Handle callback queries for bet conversation
bot.on("callback_query", async (ctx) => {
  // Handle bet conversation callbacks
  await ctx.answerCallbackQuery();
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("🛑 Shutting down bot...");
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("🛑 Shutting down bot...");
  bot.stop();
  process.exit(0);
});

// Start bot
console.log("🎰 Starting White-label Sports Betting Bot...");
console.log("🤖 Connected to Telegram API");
console.log("🔐 Identity service:", IDENTITY_SERVICE_URL);
console.log("🏦 Renter API:", RENTER_API_URL);

bot.start();
