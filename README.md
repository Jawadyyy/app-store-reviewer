# 🤖 Play Store App Reviewer Simulator

An AI-powered system that analyzes Android app manifests for Google Play policy violations and generates realistic reviewer comments using a fine-tuned LLM with RAG (Retrieval-Augmented Generation).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.14+-blue.svg)
![Node](https://img.shields.io/badge/node-22.20+-green.svg)

## 🎯 Features

- **Permission Analysis**: Automatically classifies Android permissions by risk level (HIGH/MEDIUM/LOW)
- **Policy Violation Detection**: Cross-references permissions against Google Play policies (SMS, Location, User Data, etc.)
- **Rejection Probability Scoring**: Calculates likelihood of app rejection based on severity and number of violations
- **RAG-Enhanced Context**: Retrieves relevant policy documentation to ground LLM responses
- **Fine-Tuned LLM**: Custom-trained Llama 3.2 model generates professional reviewer comments
- **Full-Stack Dashboard**: Next.js frontend with upload, detailed reports, and history tracking

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js UI    │  ← Upload manifest, view reports
└────────┬────────┘
         │
    ┌────▼────────────┐
    │  Django API     │  ← Orchestrates the pipeline
    └────┬────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │                                        │
┌───▼────────┐  ┌──────────┐  ┌───────────▼──┐
│  Analyzer  │  │   RAG    │  │   Fine-Tuned │
│   Engine   │  │  Vector  │  │   LLM (Ollama)│
│            │  │  Store   │  │              │
│ • Parser   │  │ • Policy │  │ • Llama 3.2  │
│ • Risk     │  │   Docs   │  │ • LoRA       │
│ • Verdict  │  │ • Embed  │  │ • GGUF       │
└────────────┘  └──────────┘  └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.14+**
- **Node.js 22.20+**
- **Ollama** (for running the fine-tuned model locally)
- **Google Colab** (for fine-tuning, requires GPU)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/play-store-reviewer.git
cd play-store-reviewer
```

2. **Set up Python environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install lxml sentence-transformers requests
pip install django djangorestframework django-cors-headers python-dotenv
```

3. **Set up Frontend**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` in the project root:
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=play-reviewer

DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

5. **Embed policy documents**
```bash
cd rag
python embedder.py
cd ..
```

6. **Initialize database**
```bash
cd backend
python manage.py makemigrations api
python manage.py migrate
cd ..
```

### Running the Application

**Terminal 1: Start Ollama** (must be running first)
```bash
ollama serve
```

**Terminal 2: Start Django Backend**
```bash
cd backend
python manage.py runserver
# Backend runs at http://127.0.0.1:8000
```

**Terminal 3: Start Next.js Frontend**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:3000
```

**Access the app**: Open http://localhost:3000 in your browser

## 🧠 Fine-Tuning the Model

The project includes a fine-tuned Llama 3.2 3B model trained on Google Play reviewer comments.

### Training Dataset

The training dataset is located at `models/dataset/play_reviewer_dataset.json` and contains 15 examples of:
- Input: App metadata, verdict, policy issues
- Output: Professional reviewer comments with remediation steps

**Format:**
```json
{
  "input": "App: com.example.sms_app | Verdict: REJECTED | Issues: [SEND_SMS - HIGH]",
  "output": "Your app has been flagged for policy violation. The permission android.permission.SEND_SMS..."
}
```

### Fine-Tuning Process

1. **Open Google Colab** with T4 GPU runtime

2. **Upload the dataset**
   - Upload `models/dataset/play_reviewer_dataset.json` to Colab

3. **Run the fine-tuning notebook** (cells provided in project roadmap)
   - Install dependencies: `unsloth`, `trl`, `peft`, `bitsandbytes`
   - Load Llama 3.2 3B Instruct
   - Apply LoRA adapters (rank=16, alpha=32)
   - Train for 3 epochs (~5-10 minutes on T4)
   - Export to GGUF format (q4_k_m quantization)

4. **Download the GGUF file** from Colab

5. **Create Modelfile** (`models/Modelfile`):
```
FROM ./play-reviewer.gguf

PARAMETER temperature 0.5
PARAMETER top_p 0.9
PARAMETER stop "```"

SYSTEM "You are a Google Play Store app reviewer. Write concise, professional rejection or approval comments."
```

6. **Load into Ollama**:
```bash
cd models
ollama create play-reviewer -f Modelfile
ollama list  # Verify it's loaded
```

## 📁 Project Structure

```
play-store-reviewer/
├── analyzer/                   # Core analysis engine
│   ├── manifest_parser.py     # XML parser & analyzer
│   ├── risk_rules.py          # Permission risk classification
│   ├── policy_map.py          # Policy violation database
│   └── verdict_engine.py      # Rejection probability calculator
│
├── rag/                       # Retrieval-Augmented Generation
│   ├── policy_docs/           # Google Play policy text files
│   ├── chunker.py             # Document chunking logic
│   ├── vector_store.py        # Custom vector database
│   ├── embedder.py            # Sentence-Transformer embedding
│   └── retriever.py           # Semantic search & context builder
│
├── models/                    # Fine-tuning & inference
│   ├── dataset/
│   │   └── play_reviewer_dataset.json  # Training data
│   ├── Modelfile              # Ollama model config
│   └── play-reviewer.gguf     # Fine-tuned model (after training)
│
├── backend/                   # Django REST API
│   ├── api/
│   │   ├── models.py          # Database schema
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # JSON serialization
│   │   └── urls.py            # Route definitions
│   ├── config/
│   │   └── settings.py        # Django configuration
│   └── manage.py
│
├── frontend/                  # Next.js dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Upload page
│   │   │   ├── report/[id]/page.tsx  # Report details
│   │   │   └── history/page.tsx      # Analysis history
│   │   └── lib/
│   │       └── api.ts         # Backend API client
│   └── package.json
│
├── .env                       # Environment variables
└── AndroidManifest.xml        # Test manifest file
```

## 🔧 API Endpoints

### **POST** `/api/analyze/`
Upload an AndroidManifest.xml file for analysis

**Request:**
```bash
curl -X POST http://localhost:8000/api/analyze/ \
  -F "manifest=@AndroidManifest.xml"
```

**Response:**
```json
{
  "id": 1,
  "package_name": "com.example.app",
  "verdict": "REJECTED",
  "rejection_probability": 0.70,
  "policy_issues": [...],
  "reviewer_comment": "Your app has been flagged...",
  ...
}
```

### **GET** `/api/reports/`
List all analysis reports

### **GET** `/api/reports/{id}/`
Get a specific report by ID

## 📊 How It Works

### 1. **Manifest Analysis**
The analyzer parses `AndroidManifest.xml` files and extracts:
- Package name and app label
- All requested permissions
- Background services and receivers

### 2. **Risk Classification**
Permissions are categorized:
- **HIGH**: SMS, Call Log, Contacts (restricted permissions)
- **MEDIUM**: Location, Camera, Microphone (sensitive permissions)
- **LOW**: Internet, Network State (common permissions)

### 3. **Policy Cross-Reference**
Each permission is checked against Google Play policies:
- SMS and Call Log Policy
- Location Permissions Policy
- Microphone and Camera Policy
- User Data Policy

### 4. **RAG Context Retrieval**
Policy documents are:
- Chunked into ~300-word segments with overlap
- Embedded using `all-MiniLM-L6-v2` (sentence-transformers)
- Stored in a custom vector database
- Retrieved via cosine similarity search

The top 2-3 most relevant policy chunks are passed to the LLM as context.

### 5. **Verdict Calculation**
Rejection probability is computed based on:
- **1 HIGH violation**: 70% + 15% per additional HIGH (capped at 95%)
- **1 MEDIUM violation**: 40% + 8% per additional MEDIUM
- **No violations**: 5% (accounts for unknown risks)

### 6. **LLM Comment Generation**
The fine-tuned Llama 3.2 model generates reviewer comments using:
- App metadata
- Verdict and confidence level
- Policy violations with severity
- RAG-retrieved policy context

**Prompt format:**
```
### App Review Context:
App: com.example.app | Verdict: REJECTED | Confidence: HIGH
Policy Issues:
- android.permission.SEND_SMS: HIGH — Apps may not send SMS...

Relevant Policy Context:
[RAG-retrieved policy chunks]

### Reviewer Comment:
[LLM generates comment here]
```

## 🧪 Testing

### Test with the included manifest
```bash
# The project includes AndroidManifest.xml with intentional violations:
# - SEND_SMS (HIGH)
# - ACCESS_FINE_LOCATION (MEDIUM)
# - RECORD_AUDIO (MEDIUM)
# - BackgroundSmsService (suspicious)

# Expected: REJECTED verdict with 70% probability
```

### Create your own test manifests
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.testapp">
    
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.SEND_SMS"/>
    
    <application android:label="TestApp">
        <service android:name=".BackgroundService"/>
    </application>
</manifest>
```

## 🎨 Frontend Preview

### Upload Page
Clean, drag-and-drop interface for uploading AndroidManifest.xml files

### Report Page
Detailed analysis showing:
- Verdict badge (REJECTED/WARNING/APPROVED)
- Rejection probability meter
- Permissions list with risk badges
- Policy violations with fixes
- Suspicious services detection
- AI-generated reviewer comment

### History Page
Sortable table of all past analyses with quick access to reports

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

1. **Expand training dataset** (100+ examples for better LLM quality)
2. **Add APK parsing** (not just manifest files)
3. **Support more policies** (Ads, Payments, Children's apps)
4. **Improve remediation suggestions** (code snippets, documentation links)
5. **Add batch analysis** (analyze multiple apps at once)

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Unsloth** for efficient LLM fine-tuning
- **Ollama** for local LLM deployment
- **Sentence-Transformers** for embeddings
- **Django** and **Next.js** for the web stack

## 📧 Contact

For questions or feedback, open an issue or reach out at [your-email@example.com]

---

**Built with ❤️ for Android developers navigating Google Play policies**
