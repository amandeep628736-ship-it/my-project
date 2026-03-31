def get_yoga_recommendation(heart_rate, posture, calories):
    \"\"\"
    Simple rule-based AI model for yoga recommendations.
    Mimics decision tree logic based on sensor thresholds.
    
    Thresholds:
    - Heart Rate: Normal 60-100, High >100
    - Posture: Good >90°, Poor <90°
    - Calories: Low <50, High >100 (per session)
    \"\"\"
    status = 'Normal'
    recommendation = 'Continue your practice'
    
    # Priority 1: High heart rate → Calming poses
    if heart_rate > 100:
        status = 'Alert'
        recommendation = 'Deep Breathing Exercise - Focus on slow inhales/exhales'
    # Priority 2: Poor posture → Alignment poses
    elif posture < 90:
        status = 'Needs Improvement'
        recommendation = \"Tree Pose (Vrksasana) - Improves balance and posture\"
    # Priority 3: High calories → Recovery
    elif calories > 100:
        status = 'Normal'
        recommendation = 'Childs Pose (Balasana) - Gentle recovery stretch'
    # Priority 4: Low activity
    elif calories < 20:
        status = 'Needs Improvement'
        recommendation = 'Sun Salutation (Surya Namaskar) - Full body activation'
    
    return {
        'status': status,
        'recommendation': recommendation,
        'confidence': 0.85  # Simulated model confidence
    }
