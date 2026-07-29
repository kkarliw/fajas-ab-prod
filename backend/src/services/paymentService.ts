import crypto from 'crypto';

export const paymentService = {
  getPaymentUrl(reference: string, amountCents: number, currency = 'COP') {
    const publicKey = process.env.WOMPI_PUB_KEY || "pub_prod_R5wDypwYpfISMzlyXLCvWY9o9AXuknc6";
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "prod_integrity_HzWj1T1BmjvwxnUrdIa0QpzMZrYwIEz3";

    // Generate integrity signature required by Wompi Widget
    // Formula: SHA256(reference + amountInCents + currency + integritySecret)
    const stringToSign = `${reference}${amountCents}${currency}${integritySecret}`;
    const integritySignature = crypto.createHash('sha256').update(stringToSign).digest('hex');

    return {
      publicKey,
      reference,
      amountInCents: amountCents,
      currency,
      integritySignature
    };
  },

  verifyWebhookSignature(event: any) {
    // Wompi sends webhook signature inside the payload body: event.signature
    if (!event || !event.signature || !event.signature.properties || !event.signature.checksum) {
      return false;
    }
    
    const { signature, timestamp } = event;
    const { properties, checksum } = signature;
    const { transaction } = event.data;

    // Concat the values of the properties specified in the event
    let stringToSign = "";
    for (const prop of properties) {
      // prop is like "transaction.id" or "transaction.status"
      const keys = prop.split('.');
      let val = event.data;
      for (const k of keys) {
        val = val[k];
      }
      stringToSign += val;
    }
    
    // Add timestamp and events secret
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET || "prod_events_UmxlufToHtAYjG55mqLOZOF3RFQYW8R5";
    stringToSign += `${timestamp}${eventsSecret}`;
    
    const hash = crypto.createHash('sha256').update(stringToSign).digest('hex');
    return hash === checksum;
  }
};
