# NEXIS - Context-Aware Knowledge System

NEXIS is a web-based Context-Aware Knowledge System designed to help users organize, manage, and connect information intelligently. Unlike traditional note-taking applications, NEXIS enables context-based organization, relationship linking, version tracking, and machine learning-powered semantic similarity recommendations.

## 📌 Features

- Create, edit, delete, and search knowledge entries
- Context-based organization of information
- Relationship linking between entries
- Version history tracking and rollback support
- Intelligent semantic similarity recommendations
- Responsive and user-friendly interface
- Real-time data interaction
- Offline Machine Learning module for privacy

## 🏗️ System Architecture

The system consists of four major layers:

### Frontend Layer
- HTML
- CSS
- JavaScript
- Dynamic DOM Rendering

### Backend Layer
- Python HTTP Server
- REST API Handling
- CRUD Operations
- Context Management
- Relation Linking
- Version Tracking

### Database Layer
- SQLite Database
- Entries Management
- Context Storage
- Relations Storage
- Version History Storage

### Machine Learning Layer
- Sentence Transformers
- all-MiniLM-L6-v2 Model
- Semantic Similarity Detection
- Cosine Similarity Calculation
- Offline Processing

---

## 📂 Project Structure

```text
nexis/
│
├── index.html          # Main frontend UI
├── styles.css          # Styling and responsive design
├── script.js           # Frontend logic and API calls
│
├── server.py           # Backend server
├── requirements.txt    # Python dependencies
├── nexis.db            # SQLite database
│
├── utils/
│   └── embeddings.py   # ML semantic similarity module
│
├── migrate_db.py       # Database migration script
│
├── SETUP_ML.sh         # Linux/Mac setup
├── SETUP_ML.bat        # Windows setup
├── SETUP_ML.md         # ML setup guide
│
└── README.md
```

---

## 🎯 Objectives

- Develop a context-aware knowledge management system
- Organize information efficiently
- Enable relationship mapping between entries
- Provide version tracking and rollback
- Integrate machine learning for intelligent suggestions

---

## 🚀 Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python

### Database
- SQLite

### Machine Learning
- Sentence Transformers
- all-MiniLM-L6-v2
- Cosine Similarity

---

## 🧠 Machine Learning Enhancement

NEXIS includes a semantic similarity recommendation system that:

1. Converts entries into 384-dimensional embeddings.
2. Uses the all-MiniLM-L6-v2 transformer model.
3. Computes cosine similarity scores.
4. Suggests the top related entries automatically.

This helps users discover hidden connections between knowledge entries without manually creating links.

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/NEXIS.git
cd NEXIS
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Database Migration

```bash
python migrate_db.py
```

### Start Server

```bash
python server.py
```

### Open Application

Open:

```text
http://localhost:8000
```

---

## 📖 Key Modules

### Context Management
Organize entries into categories such as:
- Personal
- Academic
- Research
- Work

### Entry Management
- Create entries
- Edit entries
- Delete entries
- Search entries

### Relation Linking
Build connections between related knowledge entries.

### Version Tracking
Maintain history of changes and restore previous versions.

### Semantic Similarity
Automatically suggest related entries using Machine Learning.

---

## 🔮 Future Enhancements

- User Authentication
- Cloud Storage Integration
- Advanced Search
- Real-Time Synchronization
- Knowledge Graph Visualization
- GPU-Accelerated ML Processing
- 3D Embedding Visualization
