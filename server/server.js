const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Mock valid gift codes
const validGiftCodes = {
    "ABC123": true,
    "DEF456": true,
    "GHI789": true
};

// Function to encrypt data
const encryptData = (data) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // Secret key (in a real app, store this securely)
    const iv = crypto.randomBytes(16); // Initialization vector

    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    return { encrypted, iv: iv.toString('hex'), key: key.toString('hex') };
};

// Endpoint to verify gift code and generate certificate
app.post('/generate-certificate', (req, res) => {
    const { name, course, instructor, giftCode } = req.body;

    if (!validGiftCodes[giftCode]) {
        return res.status(400).json({ message: 'Invalid gift code.' });
    }

    const certificateId = `ID-${Date.now()}`;
    const { encrypted, iv, key } = encryptData(certificateId);

    res.json({
        name,
        course,
        instructor,
        encryptedCertificateId: encrypted,
        iv,
        key,
        date: new Date().toLocaleDateString(),
    });
});

// Admin access
const adminPassword = "admin123";
const generatedCertificates = [];

// Endpoint for admin to get generated certificates
app.post('/admin', (req, res) => {
    const { password } = req.body;

    if (password !== adminPassword) {
        return res.status(403).json({ message: 'Forbidden: Incorrect password.' });
    }

    res.json(generatedCertificates);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
