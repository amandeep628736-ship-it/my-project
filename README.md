# Personalized AI Models for Adaptive Yoga Training Using Wearable Sensors

## 🎯 Overview
A beginner-friendly full-stack web app that simulates wearable sensor data (heart rate, posture angle, calories burned) and uses simple AI logic to recommend personalized yoga exercises.

## 🧩 Technology Stack
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Python Flask
- **AI**: Simple rule-based decision logic (lightweight, no heavy ML deps)

## 📁 Project Structure
\`\`\`
.
├── README.md              # This file
├── frontend/
│   ├── index.html        # Main dashboard
│   ├── style.css         # Styling
│   └── script.js         # Frontend logic & charts
└── backend/
    ├── app.py            # Flask API server
    └── model.py          # AI recommendation logic
\`\`\`

## 🚀 Quick Start (VS Code)

1. **Start Backend** (Terminal 1):
   \`\`\`bash
   cd backend
   python -m venv venv
   venv\\Scripts\\activate
   pip install flask
   python app.py
   \`\`\`
   Backend runs on http://localhost:5000

2. **Start Frontend** (Terminal 2):
   \`\`\`bash
   cd frontend
   # Open index.html in Live Server extension or browser
   \`\`\`
   Or use VS Code Live Server: Right-click index.html → \"Open with Live Server\"

3. **Usage**:
   - Open http://localhost:5500 (Live Server) or index.html
   - Click \"Start Simulation\" to generate real-time sensor data
   - View charts, status, and AI yoga recommendations

## 🧪 Sample Output
- **Dashboard**: Live heart rate (60-120 bpm), posture (80-100°), calories charts
- **Status**: Normal/Green, Warning/Yellow, Alert/Red
- **Recommendations**: e.g., \"Deep Breathing (High HR)\", \"Tree Pose (Poor Posture)\"

## 🔧 Troubleshooting
- Ensure Python 3.8+ installed
- Flask installs automatically
- CORS enabled for frontend-backend communication
- No database needed (simulated data)

Built with clean, commented code. Enjoy your adaptive yoga training! 🧘‍♀️
