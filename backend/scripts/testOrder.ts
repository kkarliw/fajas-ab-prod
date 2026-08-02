import { randomUUID } from 'crypto';

async function testOrder() {
  const payload = {
    cartId: randomUUID(),
    email: "test@example.com",
    phone: "123456789",
    customerName: "Test User",
    shippingAddress: {
      addressLine1: "123 Test St",
      city: "Test City",
      department: "Test Dept",
      country: "CO"
    }
  };

  try {
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testOrder();
