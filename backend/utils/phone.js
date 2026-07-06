// normalizeDigits(phone) -> string of digits only, e.g. "whatsapp:+91 98765-43210" -> "919876543210"
// Used to compare/store phone numbers consistently across submission storage,
// outbound Twilio addressing, and inbound webhook matching.
function normalizeDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

module.exports = { normalizeDigits };
