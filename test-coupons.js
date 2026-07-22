const axios = require('axios');

async function run() {
  try {
    // 1. Create a coupon
    console.log("Creating coupon...");
    const createRes = await axios.post('http://localhost:3001/api/v1/admin/coupons', {
      code: 'TEST10',
      type: 'percentage',
      value: 10,
      minOrderCents: 10000, // $100.00
      status: 'active'
    }, {
      headers: {
        Authorization: 'Bearer test_token_if_needed' // wait, the admin endpoint requires admin authentication... 
      }
    });
    console.log("Create Response:", createRes.data);
  } catch (err) {
    console.log("Error creating:", err.response?.data || err.message);
  }
}

run();
