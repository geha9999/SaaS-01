// src/services/nowPayments.js
class NOWPaymentsService {
  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.REACT_APP_NOWPAYMENTS_API_KEY;
    this.baseURL = 'https://api.nowpayments.io/v1';
    
    console.log('NOWPayments service initialized'); // For testing
  }

  // Function to create a new payment
  async createPayment({ 
    price_amount,           // How much to charge (e.g., 15 for $15)
    price_currency = 'USD', // Original currency
    pay_currency = 'USDT',  // What customer pays with
    order_id,              // Unique order ID
    order_description,     // Description of what they're buying
    ipn_callback_url,      // Where NOWPayments sends updates
    success_url,           // Where to redirect after successful payment
    cancel_url             // Where to redirect if payment canceled
  }) {
    try {
      console.log('Creating payment with amount:', price_amount);
      
      const response = await fetch(`${this.baseURL}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount,
          price_currency,
          pay_currency,
          order_id,
          order_description,
          ipn_callback_url,
          success_url,
          cancel_url
        })
      });

      const result = await response.json();
      console.log('Payment created:', result);
      return result;
      
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Function to check payment status
  async getPaymentStatus(payment_id) {
    try {
      const response = await fetch(`${this.baseURL}/payment/${payment_id}`, {
        headers: { 
          'x-api-key': this.apiKey 
        }
      });
      
      const result = await response.json();
      console.log('Payment status:', result);
      return result;
      
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Function to get available currencies (for testing)
  async getAvailableCurrencies() {
    try {
      const response = await fetch(`${this.baseURL}/currencies`, {
        headers: { 
          'x-api-key': this.apiKey 
        }
      });
      
      const result = await response.json();
      console.log('Available currencies:', result);
      return result;
      
    } catch (error) {
      console.error('Error getting currencies:', error);
      throw error;
    }
  }
}

// Export a single instance that can be used throughout the app
export default new NOWPaymentsService();