const appEl = document.getElementById('app');
const state = {
  user: null,
  dataset: [],
  sessions: [],
  poseLibrary: [],
  route: 'login',
  cameraActive: false,
  poseInfo: 'Camera is not active yet.',
  videoStream: null
};

const authToken = localStorage.getItem('yogaToken');
if (authToken) {
  state.user = { name: localStorage.getItem('yogaName') };
  state.route = 'dashboard';
}

const routes = {
  login: renderLogin,
  dashboard: renderDashboard,
  studio: renderStudio,
  wearable: renderWearable,
  camera: renderCamera
};

function setRoute(route) {
  state.route = route;
  render();
}

function render() {
  const routeFn = routes[state.route] || renderDashboard;
  appEl.innerHTML = '';
  routeFn();
}

function renderHeader() {
  const header = document.createElement('div');
  header.className = 'header';
  const title = document.createElement('div');
  title.innerHTML = `<div><h1>Adaptive Yoga Trainer</h1><p class="muted">Personalized AI model guidance with wearable sensor insights.</p></div>`;
  header.appendChild(title);

  if (state.user) {
    const nav = document.createElement('div');
    nav.className = 'navbar';
    ['dashboard', 'studio', 'wearable', 'camera'].forEach((page) => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = page === 'dashboard' ? 'Dashboard' : page.charAt(0).toUpperCase() + page.slice(1);
      btn.addEventListener('click', () => setRoute(page));
      nav.appendChild(btn);
    });
    const logout = document.createElement('button');
    logout.className = 'nav-btn button-secondary';
    logout.textContent = 'Logout';
    logout.addEventListener('click', handleLogout);
    nav.appendChild(logout);
    header.appendChild(nav);
  }
  appEl.appendChild(header);
}

function renderLogin() {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="header"><div><h2>Welcome Back</h2><p class="muted">Login to access the adaptive yoga dashboard and camera preview.</p></div></div>
    <div class="form-grid">
      <input id="email" type="email" placeholder="Email" value="user@example.com" />
      <input id="password" type="password" placeholder="Password" value="yoga123" />
      <button class="button-primary" id="loginButton">Login</button>
      <small>Use email <strong>user@example.com</strong> and password <strong>yoga123</strong>.</small>
      <div id="loginMessage" class="alert" style="display:none;"></div>
    </div>
  `;
  appEl.appendChild(card);
  document.getElementById('loginButton').addEventListener('click', handleLogin);
}

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const result = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const feedback = document.getElementById('loginMessage');

  if (!result.ok) {
    feedback.style.display = 'block';
    feedback.textContent = 'Login failed. Check your credentials.';
    return;
  }
  const user = await result.json();
  state.user = user;
  localStorage.setItem('yogaToken', user.token);
  localStorage.setItem('yogaName', user.name);
  state.route = 'dashboard';
  await loadData();
  render();
}

function handleLogout() {
  localStorage.removeItem('yogaToken');
  localStorage.removeItem('yogaName');
  state.user = null;
  state.route = 'login';
  stopCamera();
  render();
}

async function loadData() {
  const [datasetRes, sessionsRes, poseRes] = await Promise.all([
    fetch('/api/dataset'),
    fetch('/api/sessions'),
    fetch('/api/pose-library')
  ]);
  state.dataset = await datasetRes.json();
  state.sessions = await sessionsRes.json();
  state.poseLibrary = await poseRes.json();
}

function renderDashboard() {
  renderHeader();
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="header"><div><h2>Dashboard</h2><p class="muted">Quick insights from wearable training and AI pose modeling.</p></div></div>
    <div class="grid-3">
      <div class="overview-card"><p class="label">Active User</p><h3>${state.user?.name || 'Guest'}</h3></div>
      <div class="overview-card"><p class="label">Dataset samples</p><h3>${state.dataset.length}</h3></div>
      <div class="overview-card"><p class="label">Recorded sessions</p><h3>${state.sessions.length}</h3></div>
    </div>
    <div class="section-title">Latest session summary</div>
  `;
  const latest = state.sessions[state.sessions.length - 1];
  if (latest) {
    const summary = document.createElement('div');
    summary.className = 'card';
    summary.innerHTML = `
      <p class="label">${latest.sessionName}</p>
      <h3>${latest.date}</h3>
      <p>Duration: ${latest.durationMinutes} min</p>
      <p>Avg heart rate: ${latest.averageHeartRate} bpm</p>
      <p>Calories burned: ${latest.caloriesBurned}</p>
    `;
    appEl.appendChild(card);
    appEl.appendChild(summary);
  } else {
    appEl.appendChild(card);
  }
}

function renderStudio() {
  renderHeader();
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="header"><div><h2>AI Yoga Studio</h2><p class="muted">A unified page for model guidance, wearables, and pose training.</p></div></div>
    <div class="grid-2">
      <div class="overview-card"><p class="label">Model readiness</p><h3>Stable</h3><p>AI model has ${state.dataset.length} sensor samples and uses live camera monitoring.</p></div>
      <div class="overview-card"><p class="label">Recommended pose</p><h3>Tree Pose</h3><p>Balance practice with wearable sensor and camera alignment feedback.</p></div>
    </div>
    <div class="section-title">Pose library</div>
  `;

  const list = document.createElement('div');
  list.className = 'list-panel';
  state.poseLibrary.forEach((pose) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `<strong>${pose.name}</strong> <span class="label">${pose.stage}</span><p>${pose.focus}</p>`;
    list.appendChild(item);
  });

  const modelCard = document.createElement('div');
  modelCard.className = 'card';
  modelCard.innerHTML = `
    <div class="section-title">AI training preview</div>
    <p>Use the wearable sensor dataset and camera preview to refine your yoga model.</p>
    <button class="button-primary" id="gotoCamera">Open camera preview</button>
  `;
  appEl.appendChild(card);
  appEl.appendChild(list);
  appEl.appendChild(modelCard);
  document.getElementById('gotoCamera').addEventListener('click', () => setRoute('camera'));
}

function renderWearable() {
  renderHeader();
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="header"><div><h2>Wearable Sensor Dataset</h2><p class="muted">View the stored dataset and live session summaries for adaptive yoga training.</p></div></div>
    <div class="grid-2">
      <div class="overview-card"><p class="label">Total poses</p><h3>${state.dataset.length}</h3></div>
      <div class="overview-card"><p class="label">Sessions logged</p><h3>${state.sessions.length}</h3></div>
    </div>
  `;

  const list = document.createElement('div');
  list.className = 'list-panel';
  state.dataset.slice(0, 5).forEach((row) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <strong>${row.pose}</strong><p>${row.label}</p>
      <p>HR: ${row.heartRate} bpm • Confidence: ${(row.confidence * 100).toFixed(0)}%</p>
      <p>Accel: ${row.accel.x}, ${row.accel.y}, ${row.accel.z}</p>
    `;
    list.appendChild(item);
  });

  const sessionList = document.createElement('div');
  sessionList.className = 'card';
  sessionList.innerHTML = '<div class="section-title">Recorded sessions</div>';
  const sessionsPanel = document.createElement('div');
  sessionsPanel.className = 'list-panel';
  state.sessions.forEach((session) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <strong>${session.sessionName}</strong>
      <p>${session.date}</p>
      <p>${session.durationMinutes} min • ${session.averageHeartRate} bpm • ${session.caloriesBurned} cal</p>
    `;
    sessionsPanel.appendChild(item);
  });
  sessionList.appendChild(sessionsPanel);

  appEl.appendChild(card);
  appEl.appendChild(list);
  appEl.appendChild(sessionList);
}

function renderCamera() {
  renderHeader();
  const card = document.createElement('div');
  card.className = 'card preview-card';
  card.innerHTML = `
    <div class="header"><div><h2>Camera Pose Preview & Analysis</h2><p class="muted">Track your movement and analyze yoga pose correctness with AI.</p></div></div>
    
    <div style="margin-bottom: 20px;">
      <div class="section-title">Live Camera Preview</div>
      <div id="previewArea">
        <video id="webcam" autoplay playsinline muted></video>
        <canvas id="overlay"></canvas>
      </div>
      <div class="camera-controls">
        <button class="button-primary" id="startCamera">Start Camera</button>
        <button class="button-secondary" id="stopCamera">Stop Camera</button>
        <button class="button-secondary" id="capturePose">Capture Pose Sample</button>
      </div>
      <div id="poseStatus" class="alert" style="display:block;">${state.poseInfo}</div>
    </div>
    
    <div style="border-top: 1px solid rgba(148, 163, 184, 0.16); padding-top: 20px;">
      <div class="section-title">Upload Image for Pose Analysis</div>
      <div class="form-grid">
        <input type="file" id="poseImageInput" accept="image/*" placeholder="Choose an image" />
        <button class="button-primary" id="analyzeImage">Analyze Pose</button>
      </div>
      <div id="analysisResult" style="display:none; margin-top: 16px;">
        <div style="padding: 16px; border-radius: 16px; background: rgba(31, 41, 55, 0.96); border: 1px solid rgba(148, 163, 184, 0.1);">
          <div id="analysisContent"></div>
        </div>
      </div>
    </div>
  `;
  appEl.appendChild(card);
  document.getElementById('startCamera').addEventListener('click', startCamera);
  document.getElementById('stopCamera').addEventListener('click', stopCamera);
  document.getElementById('capturePose').addEventListener('click', capturePoseSample);
  document.getElementById('analyzeImage').addEventListener('click', analyzeUploadedImage);
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    state.poseInfo = 'Camera access is not supported in this browser.';
    render();
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (error) {
    state.poseInfo = 'Camera permission denied or device not available.';
    render();
    return;
  }

  state.cameraActive = true;
  state.videoStream = stream;
  state.poseInfo = 'Camera active. Position yourself in the frame.';
  render();

  const video = document.getElementById('webcam');
  const canvas = document.getElementById('overlay');
  if (!video) {
    state.poseInfo = 'Unable to initialize camera preview.';
    render();
    return;
  }

  video.srcObject = stream;
  try {
    await video.play();
  } catch (error) {
    console.warn('Video play failed', error);
  }
  trackPose(video, canvas);
}

function stopCamera() {
  const video = document.getElementById('webcam');
  if (state.videoStream) {
    state.videoStream.getTracks().forEach((track) => track.stop());
  }
  state.cameraActive = false;
  state.videoStream = null;
  state.poseInfo = 'Camera stopped.';
  if (video) video.srcObject = null;
  render();
}

function capturePoseSample() {
  state.poseInfo = 'Pose sample captured. Use the wearable dataset to improve alignment.';
  render();
}

async function trackPose(video, canvas) {
  if (!state.cameraActive || !video) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const drawSuggestions = () => {
    if (!state.cameraActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.font = '18px Inter';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Align your body in the center and raise your arms slowly.', 16, 36);
    requestAnimationFrame(drawSuggestions);
  };

  drawSuggestions();
}

async function analyzeUploadedImage() {
  const fileInput = document.getElementById('poseImageInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const img = new Image();
      img.onload = async () => {
        const analysisResult = document.getElementById('analysisResult');
        const analysisContent = document.getElementById('analysisContent');
        analysisContent.innerHTML = '<p>Analyzing pose...</p>';
        analysisResult.style.display = 'block';

        const poseData = await analyzePoseFromImage(img);
        displayPoseAnalysis(poseData, analysisContent);
      };
      img.src = event.target.result;
    } catch (error) {
      const analysisContent = document.getElementById('analysisContent');
      analysisContent.innerHTML = `<p style="color: #fb7185;">Error: ${error.message}</p>`;
    }
  };
  reader.readAsDataURL(file);
}

async function analyzePoseFromImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const poses = await fetch('/api/analyze-pose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageWidth: img.width,
      imageHeight: img.height
    })
  }).then((r) => r.json());

  return poses;
}

function displayPoseAnalysis(poseData, container) {
  const successColor = '#22c55e';
  const warningColor = '#fb7185';
  const neutralColor = '#38bdf8';

  let html = `
    <h3 style="margin-top: 0;">Pose Analysis Results</h3>
    <div style="display: grid; gap: 12px;">
  `;

  if (poseData.detected) {
    const matchedPose = poseData.matchedPose;
    const confidence = (poseData.confidence * 100).toFixed(0);

    if (poseData.isCorrect) {
      html += `
        <div style="padding: 12px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); border-left: 4px solid ${successColor};">
          <strong style="color: ${successColor};">✓ Pose Correct!</strong>
          <p>${matchedPose.name} (${matchedPose.label})</p>
          <p>Confidence: ${confidence}%</p>
          <p>Great job! Your pose alignment is excellent. Focus on breathing steadily and holding the position.</p>
        </div>
      `;
    } else {
      html += `
        <div style="padding: 12px; border-radius: 12px; background: rgba(251, 113, 133, 0.1); border-left: 4px solid ${warningColor};">
          <strong style="color: ${warningColor};">✗ Pose Needs Adjustment</strong>
          <p>${matchedPose.name} (${matchedPose.label})</p>
          <p>Confidence: ${confidence}%</p>
          <div style="margin-top: 8px;">
            <strong>Corrections needed:</strong>
            <ul style="margin: 8px 0; padding-left: 20px;">
              ${poseData.corrections.map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    html += `
      <div style="padding: 12px; border-radius: 12px; background: rgba(56, 189, 248, 0.1); border-left: 4px solid ${neutralColor};">
        <strong>Wearable Data Estimate:</strong>
        <p>Heart Rate: ${poseData.estimatedHeartRate} bpm</p>
        <p>Difficulty: ${matchedPose.difficulty}</p>
      </div>
    `;
  } else {
    html += `
      <div style="padding: 12px; border-radius: 12px; background: rgba(251, 113, 133, 0.1); border-left: 4px solid ${warningColor};">
        <strong style="color: ${warningColor};">⚠ No pose detected</strong>
        <p>Could not detect a clear pose. Ensure you're in frame and well-lit, then try again.</p>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}

render();
loadData();
