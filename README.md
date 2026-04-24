# Blood Donor Management System - OCR Document Verification

This project adds OCR-based document verification to the existing Blood Donor Management System using Node.js, Express, Multer, and Tesseract.js.

## Features

- **OCR Document Verification**: Upload Aadhar cards or medical documents for automatic verification
- **Aadhar Detection**: Automatically detects Aadhar documents and extracts 12-digit numbers with masking
- **Medical Document Detection**: Identifies hospital and medical documents
- **Real-time Processing**: Instant verification feedback in the donor registration form
- **Secure Backend**: Node.js server with proper error handling and file validation

## Backend Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Backend Server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Backend API

**Endpoint**: `POST /upload`

**Request**:
- Form field: `document` (image/jpeg or image/png)
- File size limit: 5MB

**Response**:
```json
{
  "success": true/false,
  "type": "aadhar" | "medical" | null,
  "message": "Verification result"
}
```

**Examples**:
- Aadhar document: `{"success": true, "type": "aadhar", "message": "Aadhar document verified. Number: XXXXXXXX1234"}`
- Medical document: `{"success": true, "type": "medical", "message": "Medical/Hospital document detected"}`
- Unknown document: `{"success": false, "message": "Document not recognized"}`

## Frontend Integration

The document verification is integrated into the donor registration form (`donors.html`):

1. **File Upload**: Users can upload JPEG or PNG images
2. **Verification Button**: "Verify Document" button triggers OCR processing
3. **Status Display**: Real-time feedback shows verification results
4. **Error Handling**: Clear error messages for invalid files or server issues

## Usage

### For Donors

1. Navigate to the Donor Portal
2. Click "Register" tab
3. Fill in personal and medical information
4. In the confirmation step, upload your Aadhar card or medical document
5. Click "Verify Document" to process the document
6. Review the verification result
7. Submit your registration

### For Testing

1. **Start Backend**: Run `npm start` in the project directory
2. **Open Frontend**: Open `donors.html` in a web browser
3. **Test Verification**: Upload sample Aadhar or medical documents
4. **Check Results**: Verify the OCR processing works correctly

## File Structure

```
dbms/
├── server.js              # Node.js backend server
├── package.json           # Backend dependencies
├── donors.html            # Donor registration form (updated)
├── supabase.js           # Frontend logic (updated with verifyDocument function)
├── uploads/              # Auto-created directory for temporary file storage
└── README.md             # This file
```

## Dependencies

### Backend (package.json)
- `express`: Web server framework
- `multer`: File upload middleware
- `cors`: Cross-origin resource sharing
- `tesseract.js`: OCR library

### Frontend
- Bootstrap Icons: UI icons
- SweetAlert2: User notifications
- Supabase: Database integration

## Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Ensure Node.js is installed: `node --version`
   - Check dependencies: `npm install`
   - Verify port 5000 is available

2. **OCR Processing Fails**
   - Check image quality (clear, well-lit documents)
   - Ensure documents are in English
   - Verify file format (JPEG/PNG only)

3. **CORS Errors**
   - Backend automatically enables CORS
   - Ensure frontend is served from a web server (not file://)

4. **File Upload Issues**
   - Check file size (< 5MB)
   - Verify file type (JPEG/PNG only)
   - Ensure file input has correct `accept` attribute

### Development Mode

For development with auto-restart:
```bash
npm install -g nodemon
npm run dev
```

## Security Notes

- File uploads are restricted to JPEG and PNG formats
- File size is limited to 5MB
- Temporary files are automatically deleted after processing
- Aadhar numbers are masked (first 8 digits hidden) in responses
- No sensitive data is stored on the server

## Integration Rules

- ✅ Document verification happens BEFORE donor registration
- ✅ Feature is separate from existing Supabase database operations
- ✅ No modification to existing donor insert code
- ✅ Verification is optional - registration can proceed without it

## Testing

To test the complete flow:

1. Start the backend server
2. Open `donors.html` in a browser
3. Navigate to Register tab
4. Fill in sample donor information
5. Upload a test document (Aadhar or medical)
6. Click Verify Document
7. Check the verification status
8. Submit registration

The system will show verification results in real-time and allow registration to proceed regardless of verification status.