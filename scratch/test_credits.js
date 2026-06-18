import axios from 'axios';

async function testCredits() {
  const API_BASE_URL = 'https://ind-mumbai-api.tablesprint.com/api/platform/worksheet';
  const WORKSHEET_ID = 'd27c4025-e322-4f04-bd66-0cb72697e522';
  const CREDIT_VIEW_ID = '523ab772-17bd-4a8e-8598-49d56fbade84';
  const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXF1ZXN0SWQiOiI2MjAzZGZiZS04NjM4LTRlZmEtYjIwMi0wMWEwOTM3MmMxZTUiLCJ1c2VyVHlwZSI6IlBBVCIsImlhdCI6MTc4MTc3ODU3MSwiZXhwIjoxNzgxNzkyOTcxfQ.0-ZoRQTCBIila2_haCCGZAgixxq2VxOVvSpmYOlxQHM';

  const payload = {
    filter: [
      {
        condition: 'where',
        columnId: 'Email',
        operator: '=',
        operand1: { type: 'value', value: 'sksabbirali99@gmail.com' },
      },
    ],
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': AUTH_TOKEN,
  };

  try {
    const res = await axios.post(
      `${API_BASE_URL}/data/${WORKSHEET_ID}/${CREDIT_VIEW_ID}`,
      payload,
      { headers }
    );
    console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("ERROR STATUS:", error.response?.status);
    console.error("ERROR DATA:", JSON.stringify(error.response?.data, null, 2));
    console.error("ERROR MESSAGE:", error.message);
  }
}

testCredits();
