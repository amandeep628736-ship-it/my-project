// Adaptive Yoga Dashboard - Frontend Logic
class YogaDashboard {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.chart = null;
        this.sensorData = {
            heartRate: 70,
            posture: 95,
            calories: 0,
            time: []
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initChart();
        this.updateDisplay();
    }

    bindEvents() {
        document.getElementById('startBtn').onclick = () => this.startSimulation();
        document.getElementById('stopBtn').onclick = () => this.stopSimulation();
    }

    initChart() {
        const ctx = document.getElementById('sensorChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Heart Rate (bpm)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Posture (°)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Calories (cal)',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Heart Rate / Calories' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Posture (°)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    async startSimulation() {
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('status').textContent = 'Simulating...';
        document.getElementById('status').style.color = '#4CAF50';

        this.interval = setInterval(async () => {
            // Simulate wearable sensor data
            this.sensorData.heartRate = 60 + Math.random() * 60;  // 60-120 bpm
            this.sensorData.posture = 75 + Math.random() * 25;    // 75-100°
            this.sensorData.calories += Math.random() * 10;       // Accumulate

            // Send to AI backend
            await this.getRecommendation();

            // Update UI and chart
            this.updateDisplay();
            this.updateChart();

        }, 2000);  // Update every 2 seconds
    }

    stopSimulation() {
        this.isRunning = false;
        clearInterval(this.interval);
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('status').textContent = 'Stopped';
        document.getElementById('status').style.color = '#f44336';
    }

    async getRecommendation() {
        try {
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heart_rate: Math.round(this.sensorData.heartRate),
                    posture: Math.round(this.sensorData.posture),
                    calories: Math.round(this.sensorData.calories)
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.displayRecommendation(data.data);
            }
        } catch (error) {
            console.error('Backend connection failed:', error);
            document.getElementById('recommendationText').textContent = 
                'Backend not running? Start with: cd backend && python app.py';
        }
    }

    updateDisplay() {
        // Update sensor readings
        document.getElementById('heartRate').innerHTML = 
            `${Math.round(this.sensorData.heartRate)} <span>bpm</span>`;
        
        document.getElementById('posture').innerHTML = 
            `${Math.round(this.sensorData.posture)} <span>°</span>`;
        
        document.getElementById('calories').innerHTML = 
            `${Math.round(this.sensorData.calories)} <span>cal</span>`;

        // Update status colors
        this.updateStatusColor('heartRate', this.sensorData.heartRate, 100);
        this.updateStatusColor('posture', this.sensorData.posture, 90);
        this.updateStatusColor('calories', this.sensorData.calories, 100);
    }

    updateStatusColor(elementId, value, threshold) {
        const statusEl = document.getElementById(elementId + 'Status');
        const cardEl = statusEl.parentElement;
        statusEl.textContent = value > threshold ? 'Normal' : (elementId === 'calories' ? 'Low' : 'Poor');

        if (value > threshold) {
            statusEl.className = 'status normal';
            cardEl.style.borderLeftColor = '#27ae60';
        } else {
            statusEl.className = 'status warning';
            cardEl.style.borderLeftColor = '#f39c12';
        }
    }

    displayRecommendation(rec) {
        const statusEl = document.getElementById('recStatus');
        const textEl = document.getElementById('recommendationText');
        const confEl = document.getElementById('confidence');

        statusEl.className = `status-badge ${rec.status.toLowerCase().replace(/ /g, '-')}`;
        statusEl.textContent = rec.status;
        textEl.textContent = rec.recommendation;
        confEl.textContent = `Confidence: ${(rec.confidence * 100).toFixed(0)}%`;
    }

    updateChart() {
        const now = new Date().toLocaleTimeString();
        this.sensorData.time.push(now);

        // Keep last 10 points
        if (this.sensorData.time.length > 10) {
            this.sensorData.time.shift();
        }

        this.chart.data.labels = this.sensorData.time;
        this.chart.data.datasets[0].data = this.chart.data.labels.map(() => 
            Math.round(60 + Math.random() * 60));
        this.chart.data.datasets[1].data = this.chart.data.labels.map(() => 
            Math.round(75 + Math.random() * 25));
        this.chart.data.datasets[2].data = this.chart.data.labels.map((_, i) => 
            Math.round((i + 1) * 5 + Math.random() * 20));

        this.chart.update('none');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new YogaDashboard();
});
