const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadJson(fileName, fallback) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(fileName, data) {
  fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
}

const users = loadJson('users.json', [
  {
    id: 1,
    name: 'Yoga User',
    email: 'user@example.com',
    password: 'yoga123'
  }
]);

const dataset = loadJson('yoga_dataset.json', [
  {
    id: 1,
    pose: 'Mountain Pose',
    label: 'Tadasana',
    heartRate: 72,
    accel: { x: 0.08, y: 0.12, z: 0.95 },
    gyro: { x: 0.02, y: 0.01, z: 0.05 },
    confidence: 0.92,
    difficulty: 'Beginner',
    timestamp: '2026-04-09T08:20:00Z'
  },
  {
    id: 2,
    pose: 'Downward Dog',
    label: 'Adho Mukha Svanasana',
    heartRate: 78,
    accel: { x: 0.34, y: 0.81, z: 0.40 },
    gyro: { x: 0.12, y: 0.26, z: 0.09 },
    confidence: 0.89,
    difficulty: 'Intermediate',
    timestamp: '2026-04-09T08:22:30Z'
  },
  {
    id: 3,
    pose: 'Tree Pose',
    label: 'Vrikshasana',
    heartRate: 80,
    accel: { x: 0.15, y: 0.04, z: 0.96 },
    gyro: { x: 0.04, y: 0.15, z: 0.18 },
    confidence: 0.94,
    difficulty: 'Intermediate',
    timestamp: '2026-04-09T08:25:30Z'
  }
]);

const sessions = loadJson('wearable_sessions.json', [
  {
    id: 1,
    sessionName: 'Morning Flow',
    durationMinutes: 22,
    averageHeartRate: 76,
    caloriesBurned: 120,
    date: '2026-04-09'
  },
  {
    id: 2,
    sessionName: 'Balance Check',
    durationMinutes: 18,
    averageHeartRate: 74,
    caloriesBurned: 95,
    date: '2026-04-08'
  }
]);

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ id: user.id, name: user.name, email: user.email, token: 'demo-token' });
});

app.get('/api/dataset', (req, res) => {
  res.json(dataset);
});

app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.post('/api/session', (req, res) => {
  const record = req.body;
  const nextId = sessions.length ? Math.max(...sessions.map((item) => item.id)) + 1 : 1;
  const newRecord = { id: nextId, ...record };
  sessions.push(newRecord);
  saveJson('wearable_sessions.json', sessions);
  res.status(201).json(newRecord);
});

app.get('/api/pose-library', (req, res) => {
  res.json([
    { name: 'Mountain Pose', stage: 'Beginner', focus: 'Alignment' },
    { name: 'Downward Dog', stage: 'Intermediate', focus: 'Stretch' },
    { name: 'Tree Pose', stage: 'Intermediate', focus: 'Balance' },
    { name: 'Warrior II', stage: 'Advanced', focus: 'Strength' }
  ]);
});

app.post('/api/analyze-pose', (req, res) => {
  const { imageWidth, imageHeight } = req.body;

  const poseLibraryData = [
    {
      name: 'Mountain Pose',
      label: 'Tadasana',
      difficulty: 'Beginner',
      bodyKeypoints: { head: [0.5, 0.1], shoulders: [0.5, 0.25], hips: [0.5, 0.5], feet: [0.5, 0.85] },
      corrections: ['Keep feet parallel and hip-width apart', 'Distribute weight evenly', 'Engage core for better stability'],
      normalHeartRate: 70
    },
    {
      name: 'Downward Dog',
      label: 'Adho Mukha Svanasana',
      difficulty: 'Intermediate',
      bodyKeypoints: { head: [0.5, 0.3], shoulders: [0.5, 0.25], hips: [0.5, 0.2], feet: [0.5, 0.85] },
      corrections: ['Spread your fingers wide and press firmly', 'Level your shoulders', 'Keep hands shoulder-width apart', 'Feet hip-width apart'],
      normalHeartRate: 78
    },
    {
      name: 'Tree Pose',
      label: 'Vrikshasana',
      difficulty: 'Intermediate',
      bodyKeypoints: { head: [0.5, 0.15], shoulders: [0.5, 0.3], hips: [0.5, 0.5], feet: [0.5, 0.85] },
      corrections: ['Ground your standing foot', 'Engage your core', 'Lengthen your spine', 'Keep hips level'],
      normalHeartRate: 80
    },
    {
      name: 'Warrior II',
      label: 'Virabhadrasana II',
      difficulty: 'Advanced',
      bodyKeypoints: { head: [0.5, 0.15], shoulders: [0.5, 0.3], hips: [0.5, 0.5], feet: [0.3, 0.85] },
      corrections: ['Front knee over ankle', 'Back foot at 45 degrees', 'Chest open to the side', 'Shoulders relaxed'],
      normalHeartRate: 85
    }
  ];

  const randomPose = poseLibraryData[Math.floor(Math.random() * poseLibraryData.length)];
  const isCorrect = Math.random() > 0.35;
  const confidence = isCorrect ? 0.85 + Math.random() * 0.14 : 0.55 + Math.random() * 0.3;

  res.json({
    detected: true,
    matchedPose: randomPose,
    isCorrect: isCorrect,
    confidence: confidence,
    corrections: isCorrect ? [] : randomPose.corrections.slice(0, Math.floor(Math.random() * 3) + 1),
    estimatedHeartRate: randomPose.normalHeartRate + Math.floor((Math.random() - 0.5) * 10),
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Adaptive Yoga server running on http://localhost:${PORT}`);
});
