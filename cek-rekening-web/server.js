const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// KREDENSIAL TUKANGCEK
const TUKANGCEK_API_KEY = 'b74a3473d19794266cce1163e9421246';

// Mapping untuk instId TukangCek
const TUKANGCEK_ID_MAP = {
  'BCA': 'BCA',
  'MANDIRI': 'MANDIRI',
  'BRI': 'BRI',
  'BNI': 'BNI',
  'BSI': 'BSI',
  'SEABANK': 'SEABANK',
  'DANA': 'DANA001',
  'OVO': 'OVO001',
  'GOPAY': 'GOPAY001',
  'LINKAJA': 'LINKAJA001',
  'SHOPEEPAY': 'SHOPEEPAY001'
};

app.post('/api/cek-rekening', async (req, res) => {
  const { bankCode, accountNumber } = req.body;

  if (!bankCode || !accountNumber) {
    return res.status(400).json({ success: false, message: 'Provider dan Nomor Rekening/HP wajib diisi.' });
  }

  // Tentukan tipe (bank atau ewallet)
  const isEwallet = ['DANA', 'OVO', 'GOPAY', 'LINKAJA', 'SHOPEEPAY'].includes(bankCode.toUpperCase());
  const type = isEwallet ? 'ewallet' : 'bank';
  
  // Ambil instId dari mapping
  const id = TUKANGCEK_ID_MAP[bankCode.toUpperCase()] || bankCode.toUpperCase();

  try {
    const response = await axios.post('https://tukangcek.id/api/check', {
      type: type,
      target: accountNumber.trim(),
      id: id
    }, {
      headers: {
        'X-API-Key': TUKANGCEK_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (response.data && response.data.found) {
      res.json({
        success: true,
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountHolderName: response.data.name,
        status: 'SUCCESS'
      });
    } else {
      res.json({
        success: false,
        message: response.data.name || 'Nomor rekening atau E-Wallet tidak ditemukan.'
      });
    }

  } catch (error) {
    console.error('Error TukangCek API:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    res.status(error.response?.status || 400).json({
      success: false,
      message: `Error: ${error.response?.data?.message || error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server web berjalan di http://localhost:${PORT}`);
});