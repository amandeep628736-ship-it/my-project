from flask import Flask, request, jsonify
from flask_cors import CORS
from model import get_yoga_recommendation

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route('/')
def home():
    return 'Adaptive Yoga AI Backend - API Ready! Visit /predict with POST data.'

@app.route('/predict', methods=['POST'])
def predict():
    """
    API endpoint: Receive sensor data, return AI recommendation.
    Expected JSON: {"heart_rate": 85, "posture": 92, "calories": 45}
    """
    try:
        data = request.json
        heart_rate = data.get('heart_rate', 70)
        posture = data.get('posture', 95)
        calories = data.get('calories', 30)
        
        result = get_yoga_recommendation(heart_rate, posture, calories)
        
        return jsonify({
            'success': True,
            'data': result,
            'sensors': {
                'heart_rate': heart_rate,
                'posture': posture,
                'calories': calories
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    print("🚀 Adaptive Yoga AI Backend starting on http://localhost:5000")
    print("📡 API ready at /predict (POST)")
    app.run(debug=True, port=5000)
