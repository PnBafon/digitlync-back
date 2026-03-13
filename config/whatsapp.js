/**
 * WhatsApp API Configuration (Meta Cloud API)
 * Credentials from environment variables - never hardcode in source.
 */

module.exports = {
  enabled: !!(process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID),
  provider: 'meta',
  accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.META_WHATSAPP_VERIFY_TOKEN || 'digilync-webhook-verify',
  appSecret: process.env.META_APP_SECRET,
};
