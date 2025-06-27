# BoomExtractor

A powerful tool for extracting and visualizing scientific workflows from research papers. BoomExtractor uses AI to analyze PDF documents and automatically generate interactive workflow diagrams, making it easier to understand complex research methodologies.

## 🚀 Features

- **PDF Upload & Processing**: Upload research papers in PDF format (up to 50MB)
- **AI-Powered Analysis**: Uses Google's Gemini AI to extract workflow information
- **Interactive Visualization**: Dynamic workflow diagrams built with React Flow
- **Real-time Processing**: Fast workflow generation with live feedback
- **Modern UI**: Clean, responsive interface built with React and TypeScript
- **RESTful API**: Well-documented FastAPI backend

## 🏗️ Architecture

This is a full-stack application with two main components:

- **Frontend (`workflow-visualizer/`)**: React + TypeScript application for the user interface
- **Backend (`workflow-backend/`)**: FastAPI Python server for PDF processing and AI integration

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **React Flow** for interactive diagrams
- **Styled Components** for styling
- **D3.js** for advanced visualizations

### Backend
- **FastAPI** for the REST API
- **Google Generative AI (Gemini)** for workflow extraction
- **PyMuPDF** for PDF text extraction
- **Uvicorn** ASGI server

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Google AI API Key** (for Gemini AI)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/BoomExtractor.git
cd BoomExtractor
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd workflow-backend

# Create virtual environment
python -m venv backend-env

# Activate virtual environment
# On macOS/Linux:
source backend-env/bin/activate
# On Windows:
backend-env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your Google AI API key
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd workflow-visualizer

# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the `workflow-backend/` directory:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

To get a Google AI API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## 🚀 Running the Application

### Quick Start (One Command)

```bash
cd workflow-backend && source backend-env/bin/activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload & cd ../workflow-visualizer && npm start
```

This will start both the backend (port 8000) and frontend (port 3000) services simultaneously.

### Manual Start (Step by Step)

#### Start the Backend Server

```bash
cd workflow-backend

# Activate virtual environment if not already active
source backend-env/bin/activate  # macOS/Linux
# or
backend-env\Scripts\activate  # Windows

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

#### Start the Frontend Application

```bash
cd workflow-visualizer

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Usage

1. **Open the Application**: Navigate to `http://localhost:3000` in your browser
2. **Upload a PDF**: Click the upload area and select a research paper (PDF format, max 50MB)
3. **Wait for Processing**: The AI will analyze the document and extract workflow information
4. **View the Workflow**: An interactive diagram will be generated showing the research methodology
5. **Interact with the Diagram**: Click, drag, and explore the workflow nodes and connections

## 📁 Project Structure

```
BoomExtractor/
├── workflow-visualizer/          # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── types/               # TypeScript type definitions
│   │   └── App.tsx              # Main application component
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── workflow-backend/            # Backend FastAPI application
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   ├── models/              # Data models
│   │   ├── services/            # Business logic
│   │   └── main.py              # Application entry point
│   ├── uploads/                 # File upload directory
│   └── requirements.txt         # Python dependencies
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🔌 API Endpoints

### POST `/api/upload`
Upload a PDF file and generate workflow visualization.

**Request:**
- `file`: PDF file (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "message": "Workflow generated successfully",
  "workflow": { ... },
  "metadata": {
    "filename": "research_paper.pdf",
    "text_length": 15420
  }
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "workflow-backend"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your Google AI API key is correctly set in the `.env` file
2. **CORS Issues**: Ensure both frontend and backend are running on the specified ports
3. **File Upload Fails**: Check that the PDF file is under 50MB and is a valid PDF
4. **Dependencies**: Make sure all dependencies are installed correctly

### Logs

Backend logs are available in the terminal where you started the FastAPI server. Check these for detailed error information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Flow Documentation](https://reactflow.dev/)
- [Google AI Documentation](https://ai.google.dev/)

## 💡 Future Enhancements

- Support for additional document formats (Word, LaTeX)
- Batch processing of multiple documents
- Export workflows to various formats (PNG, SVG, JSON)
- User authentication and workflow saving
- Integration with research databases

---

**Built with ❤️ for the research community**