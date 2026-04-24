const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter to allow only JPEG and PNG
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /upload endpoint
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file (JPEG or PNG).'
      });
    }

    const filePath = req.file.path;
    console.log('Processing file:', filePath);

    // Use Tesseract OCR to extract text
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase().trim();
    console.log('Extracted text:', lowerText);

    // Clean up the uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Could not delete temp file:', err.message);
    }

    // Check for Aadhar document
    if (lowerText.includes('aadhaar') || lowerText.includes('aadhar')) {
      // Extract 12-digit number using regex
      const aadharRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
      const matches = lowerText.match(aadharRegex);
      
      if (matches && matches.length > 0) {
        // Take the first match and clean it (remove spaces)
        let aadharNumber = matches[0].replace(/\s/g, '');
        
        // Ensure it's exactly 12 digits
        if (aadharNumber.length === 12 && /^\d{12}$/.test(aadharNumber)) {
          // Mask first 8 digits
          const maskedNumber = 'XXXXXXXX' + aadharNumber.substring(8);
          
          return res.json({
            success: true,
            type: 'aadhar',
            message: `Aadhar document verified. Number: ${maskedNumber}`
          });
        }
      }
      
      // If no valid 12-digit number found
      return res.json({
        success: false,
        message: 'Aadhar document detected but no valid 12-digit number found.'
      });
    }

    // Check for medical/hospital documents
    const medicalKeywords = ['hospital', 'medical', 'licence', 'license'];
    const hasMedicalKeyword = medicalKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasMedicalKeyword) {
      return res.json({
        success: true,
        type: 'medical',
        message: 'Medical/Hospital document detected'
      });
    }

    // Document not recognized
    return res.json({
      success: false,
      message: 'Document not recognized'
    });

  } catch (error) {
    console.error('Error processing document:', error);

    // Clean up file if error occurred
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Could not delete temp file on error:', err.message);
      }
    }

    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }

    if (error.message.includes('Only JPEG and PNG files are allowed')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG and PNG files are allowed.'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Error processing document. Please try again.',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('OCR Document Verification API is ready!');
  console.log('Upload endpoint: POST /upload');
  console.log('Expected field: document (image/jpeg or image/png)');
});