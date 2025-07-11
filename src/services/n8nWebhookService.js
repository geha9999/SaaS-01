// src/services/n8nWebhookService.js
// N8N Integration Service to replace direct Telegram API calls

class N8NWebhookService {
  constructor() {
    // N8N webhook URLs (you'll need to set these up in N8N)
    this.webhooks = {
      transactionNotification: process.env.REACT_APP_N8N_TRANSACTION_WEBHOOK,
      dailyRevenueSummary: process.env.REACT_APP_N8N_DAILY_REVENUE_WEBHOOK,
      subscriptionWarning: process.env.REACT_APP_N8N_SUBSCRIPTION_WEBHOOK,
      systemAlert: process.env.REACT_APP_N8N_SYSTEM_ALERT_WEBHOOK,
      testConnection: process.env.REACT_APP_N8N_TEST_WEBHOOK
    };
    
    console.log('🔗 N8N Webhook Service initialized');
  }

  // Send webhook to N8N (N8N will handle Telegram notification)
  async sendWebhook(webhookUrl, data) {
    try {
      if (!webhookUrl) {
        console.warn('⚠️ N8N webhook URL not configured, falling back to direct Telegram');
        // Fallback to direct Telegram for now
        const { TelegramService } = await import('./telegramService');
        return await this.fallbackToDirectTelegram(data);
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'CLINICQ_APP'
        })
      });

      if (response.ok) {
        console.log('✅ N8N webhook sent successfully');
        return await response.json();
      } else {
        console.error('❌ N8N webhook failed:', response.status);
        throw new Error(`N8N webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ N8N webhook error:', error);
      // Fallback to direct Telegram
      return await this.fallbackToDirectTelegram(data);
    }
  }

  // Fallback to direct Telegram if N8N is not available
  async fallbackToDirectTelegram(data) {
    try {
      const { TelegramService } = await import('./telegramService');
      console.log('🔄 Using direct Telegram fallback');
      
      switch (data.type) {
        case 'transaction':
          return await TelegramService.sendTransactionNotification(data.transaction);
        case 'daily_revenue':
          return await TelegramService.sendDailyRevenueSummary(data.stats);
        case 'subscription_warning':
          return await TelegramService.sendSubscriptionWarning(data.clinic, data.daysLeft);
        case 'system_alert':
          return await TelegramService.sendSystemAlert(data.alertType, data.message);
        case 'test':
          return await TelegramService.testConnection();
        default:
          console.warn('Unknown notification type for fallback');
          return null;
      }
    } catch (error) {
      console.error('❌ Fallback to Telegram also failed:', error);
      return null;
    }
  }

  // Send transaction notification via N8N
  async sendTransactionNotification(transaction) {
    return await this.sendWebhook(this.webhooks.transactionNotification, {
      type: 'transaction',
      transaction: transaction,
      clinic: {
        id: transaction.clinicInfo?.id,
        name: transaction.clinicInfo?.name
      },
      patient: {
        name: transaction.patientName,
        amount: transaction.totalAmount
      },
      systemFee: transaction.systemFee
    });
  }

  // Send daily revenue summary via N8N
  async sendDailyRevenueSummary(stats) {
    return await this.sendWebhook(this.webhooks.dailyRevenueSummary, {
      type: 'daily_revenue',
      stats: stats,
      date: new Date().toISOString().split('T')[0]
    });
  }

  // Send subscription warning via N8N
  async sendSubscriptionWarning(clinic, daysLeft) {
    return await this.sendWebhook(this.webhooks.subscriptionWarning, {
      type: 'subscription_warning',
      clinic: clinic,
      daysLeft: daysLeft,
      urgency: daysLeft <= 1 ? 'critical' : daysLeft <= 3 ? 'high' : 'medium'
    });
  }

  // Send system alert via N8N
  async sendSystemAlert(alertType, message) {
    return await this.sendWebhook(this.webhooks.systemAlert, {
      type: 'system_alert',
      alertType: alertType,
      message: message,
      severity: this.getAlertSeverity(alertType)
    });
  }

  // Test N8N connection
  async testConnection() {
    return await this.sendWebhook(this.webhooks.testConnection, {
      type: 'test',
      message: 'N8N webhook test from CLINICQ',
      timestamp: new Date().toISOString()
    });
  }

  // Helper function to determine alert severity
  getAlertSeverity(alertType) {
    const severityMap = {
      'payment_failed': 'high',
      'system_down': 'critical',
      'subscription_expired': 'high',
      'database_error': 'critical',
      'user_registration': 'low',
      'clinic_onboarding': 'medium'
    };
    return severityMap[alertType] || 'medium';
  }
}

// Export singleton instance
const n8nWebhookService = new N8NWebhookService();

// Export convenience functions
export const sendTransactionNotification = (transaction) => {
  return n8nWebhookService.sendTransactionNotification(transaction);
};

export const sendDailyRevenueSummary = (stats) => {
  return n8nWebhookService.sendDailyRevenueSummary(stats);
};

export const sendSubscriptionWarning = (clinic, daysLeft) => {
  return n8nWebhookService.sendSubscriptionWarning(clinic, daysLeft);
};

export const sendSystemAlert = (alertType, message) => {
  return n8nWebhookService.sendSystemAlert(alertType, message);
};

export const testN8NConnection = () => {
  return n8nWebhookService.testConnection();
};

export default n8nWebhookService;

/*
N8N WORKFLOW SETUP INSTRUCTIONS:

1. Create N8N Workflows:
   - Transaction Notification Workflow
   - Daily Revenue Summary Workflow  
   - Subscription Warning Workflow
   - System Alert Workflow
   - Test Connection Workflow

2. Each workflow should:
   - Start with Webhook Trigger
   - Process the received data
   - Format message for Telegram
   - Send to Telegram Bot API
   - Log the result

3. Environment Variables to add:
   REACT_APP_N8N_TRANSACTION_WEBHOOK=https://your-n8n.domain/webhook/transaction
   REACT_APP_N8N_DAILY_REVENUE_WEBHOOK=https://your-n8n.domain/webhook/daily-revenue
   REACT_APP_N8N_SUBSCRIPTION_WEBHOOK=https://your-n8n.domain/webhook/subscription
   REACT_APP_N8N_SYSTEM_ALERT_WEBHOOK=https://your-n8n.domain/webhook/system-alert
   REACT_APP_N8N_TEST_WEBHOOK=https://your-n8n.domain/webhook/test

4. Benefits of N8N approach:
   - Visual workflow management
   - Scheduled tasks (daily summaries)
   - Complex automation logic
   - Multiple notification channels (Telegram + WhatsApp + Email)
   - Retry mechanisms
   - Logging and monitoring
*/
