
/**
 * OWNER CONFIGURATION FILE
 * 
 * Use this file to manage your payout details and the advertisements 
 * shown in the app.
 */

export const OWNER_CONFIG = {
  // PAYOUT CONFIGURATION
  // In a real app, you would use your Stripe Connect ID or Merchant ID here.
  // DO NOT put your actual credit card number here.
  payoutDetails: {
    method: "GCash / Bank Transfer",
    accountIdentifier: "0917-XXX-XXXX / **** 1234", // Replace with your actual payout info
    currency: "USD"
  },

  // ADVERTISEMENT CONFIGURATION
  // These ads will be shown to all users in the app.
  activeAds: [
    { 
      id: 1, 
      text: "Level up your social skills with Pro Mode!", 
      link: "https://introvertup.com/pro" 
    },
    { 
      id: 2, 
      text: "Get unlimited hearts for just $9.99", 
      link: "https://introvertup.com/hearts" 
    },
    {
      id: 3,
      text: "Join our Discord community of 5,000+ explorers!",
      link: "https://discord.gg/introvertup"
    }
  ]
};
