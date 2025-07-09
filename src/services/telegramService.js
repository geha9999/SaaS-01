// src/services/telegramService.js
// Telegram Bot Integration Service for CLINIC-Q

const TELEGRAM_CONFIG = {
  botToken: '7780822586:AAHDh_JLca_qYpapG2-a9KwSaHce2sHdy9E',
  adminChatId: '2185881', // Admin
  apiUrl: 'https://api.telegram.org/bot'
};

class TelegramService {
  constructor() {
    this.botToken = TELEGRAM_CONFIG.botToken;
    this.adminChatId = TELEGRAM_CONFIG.adminChatId;
    this.apiUrl = `${TELEGRAM_CONFIG.apiUrl}${this.botToken}`;
  }

  // Send message to admin
  async sendAdminMessage(message) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        console.log('✅ Telegram message sent successfully');
        return data;
      } else {
        console.error('❌ Telegram error:', data.description);
        return null;
      }
    } catch (error) {
      console.error('❌ Telegram service error:', error);
      return null;
    }
  }

  // Send transaction notification
  async sendTransactionNotification(transaction) {
    const message = `
🏥 <b>CLINICQ Transaction Processed</b>

👤 <b>Patient:</b> ${transaction.patientName}
🏥 <b>Clinic:</b> ${transaction.clinicInfo.name}
💰 <b>Amount:</b> IDR ${transaction.totalAmount.toLocaleString()}
💸 <b>Your Fee:</b> IDR ${transaction.systemFee.toLocaleString()}
📅 <b>Date:</b> ${new Date(transaction.timestamp).toLocaleDateString('id-ID')}
👨‍⚕️ <b>Doctor:</b> ${transaction.doctor}
💳 <b>Cashier:</b> ${transaction.cashier}

📊 <b>Items:</b>
${transaction.originalServices.map(s => `• ${s.name}`).join('\n')}
${transaction.originalMedications.map(m => `• ${m.name} (x${m.quantity})`).join('\n')}
${transaction.additionalItems.map(a => `• ${a.name} (x${a.quantity})`).join('\n')}
    `;

    return await this.sendAdminMessage(message);
  }

  // Send daily revenue summary
  async sendDailyRevenueSummary(stats) {
    const message = `
📈 <b>CLINICQ Daily Revenue Summary</b>

📅 <b>Date:</b> ${new Date().toLocaleDateString('id-ID')}
💰 <b>Total Transactions:</b> ${stats.transactionCount}
💸 <b>Total Revenue:</b> IDR ${stats.totalRevenue.toLocaleString()}
🏥 <b>Active Clinics:</b> ${stats.activeClinics}
📊 <b>Average per Transaction:</b> IDR ${Math.round(stats.totalRevenue / stats.transactionCount).toLocaleString()}

🎯 <b>Performance:</b>
• Revenue Target: ${stats.revenueTarget ? 'Met ✅' : 'Not Met ❌'}
• Growth: ${stats.growth > 0 ? '+' : ''}${stats.growth}%
    `;

    return await this.sendAdminMessage(message);
  }

  // Send subscription expiry warning
  async sendSubscriptionWarning(clinic, daysLeft) {
    const urgencyLevel = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    const message = `
${urgencyLevel} <b>CLINICQ Subscription Alert</b>

🏥 <b>Clinic:</b> ${clinic.name}
📧 <b>Owner:</b> ${clinic.ownerId}
⏰ <b>Expires in:</b> ${daysLeft} day${daysLeft > 1 ? 's' : ''}
💰 <b>Amount Due:</b> $15 USDT

${daysLeft <= 1 ? 
  '🚨 <b>URGENT:</b> Subscription expires today!' : 
  daysLeft <= 3 ? 
    '⚠️ <b>WARNING:</b> Subscription expires soon!' : 
    '📅 <b>REMINDER:</b> Subscription renewal needed'
}
    `;

    return await this.sendAdminMessage(message);
  }

  // Send system alert
  async sendSystemAlert(type, message) {
    const alertMessage = `
🔔 <b>CLINICQ System Alert</b>

📋 <b>Type:</b> ${type}
⏰ <b>Time:</b> ${new Date().toLocaleString('id-ID')}
📝 <b>Message:</b> ${message}
    `;

    return await this.sendAdminMessage(alertMessage);
  }

  // Test connection
  async testConnection() {
    const testMessage = `
🧪 <b>CLINICQ Telegram Bot Test</b>

✅ Bot is working correctly!
📅 Test Date: ${new Date().toLocaleString('id-ID')}
🤖 Bot Token: Active
💬 Chat ID: ${this.adminChatId}
👤 Admin: Gunawan (@GYF_78)
    `;

    return await this.sendAdminMessage(testMessage);
  }
}

// Export singleton instance
const telegramService = new TelegramService();

// Example usage functions
export const sendTransactionNotification = (transaction) => {
  return telegramService.sendTransactionNotification(transaction);
};

export const sendDailyRevenueSummary = (stats) => {
  return telegramService.sendDailyRevenueSummary(stats);
};

export const sendSubscriptionWarning = (clinic, daysLeft) => {
  return telegramService.sendSubscriptionWarning(clinic, daysLeft);
};

export const sendSystemAlert = (type, message) => {
  return telegramService.sendSystemAlert(type, message);
};

export const testTelegramConnection = () => {
  return telegramService.testConnection();
};

export default telegramService;

// Usage examples:
/*
// In your cashier system, after processing payment:
import { sendTransactionNotification } from './services/telegramService';

const processPayment = async () => {
  // ... payment processing logic
  
  // Send notification to admin
  await sendTransactionNotification(transaction);
};

// For daily summaries (can be called from N8N or cron job):
await sendDailyRevenueSummary({
  transactionCount: 25,
  totalRevenue: 50000,
  activeClinics: 3,
  revenueTarget: true,
  growth: 15
});

// For subscription warnings:
await sendSubscriptionWarning(clinic, 3); // 3 days left
*/
