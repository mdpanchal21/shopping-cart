const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/product', {
      params: { page: 1, limit: 2, search: '' }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

test();
