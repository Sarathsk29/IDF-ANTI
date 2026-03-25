# Multi-Modal Digital Forgery Detection System

A full-stack, AI-powered digital forensics investigation platform designed to detect copy-move forgeries, document tampering, and AI-generated image manipulations.

## Features
- **Image Forgery Detection:** Utilizes SIFT keypoint matching, RANSAC homography, and Error Level Analysis (ELA).
- **Document Analysis:** Employs OCR and metadata extraction to highlight textual and structural tampering.
- **AI Edit Detection:** Cross-references noise variation patterns (LBP), frequency domain artifacts (FFT), and edge distributions.
- **Forensic Case Management:** Group evidence files into cases with dynamic multi-stage analysis workflows.
- **PDF Report Generation:** Automated professional forensic reports ready for download and offline review.

## System Requirements
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Tesseract OCR (must be installed on the local system or server for document analysis)

## Local Development Setup

### 1. Database Setup
Ensure you have a local PostgreSQL instance running. Create a database called `forensics_db`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\\Scripts\\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Edit .env with your PostgreSQL credentials
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local

# Edit NEXT_PUBLIC_API_URL to point to your backend (default is http://localhost:8000)
npm run dev
```

## Deployment Guide (Zero-Cost Setup)

### 1. Database (Render Free Tier)
1. Go to Render.com and create a new **PostgreSQL** database.
2. Copy the Internal or External Database URL.

### 2. Backend API (Render Web Service)
1. Connect your GitHub repository to Render and deploy the `backend/` folder as a Web Service.
2. Use Python environment.
3. Build Command: `pip install -r requirements.txt && alembic upgrade head`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DATABASE_URL` = (Your Render DB URL)
   - `FRONTEND_URL` = (Your Vercel Frontend URL)

### 3. Frontend App (Vercel)
1. Go to Vercel and import your GitHub repository.
2. Set the Root Directory to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = (Your deployed Render backend URL)
4. Deploy the application.
