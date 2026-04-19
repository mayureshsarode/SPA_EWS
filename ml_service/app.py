from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

print("Loading Enterprise XGBoost Model...")
model = joblib.load('xgboost_risk_model_v2.pkl')
expected_features = joblib.load('xgb_features_v2.pkl')
reverse_mapping = {0: "SAFE", 1: "WARNING", 2: "CRITICAL"}


def generate_action_plan(student_data, risk_level):
    actions = []
    if risk_level == "SAFE":
        return ["✅ Great job! Keep up your current habits."]

    if student_data.get('Attendance_Pct', 100) < 75:
        actions.append(
            f"🚨 Attendance: Currently at {student_data['Attendance_Pct']}%. You must attend upcoming classes.")

    failing_subjects = []
    subjects = ['OS_CIE', 'DBMS_CIE', 'SE_CIE', 'MDM_CIE', 'Entrepreneurship_CIE', 'ICSR_CIE']
    for sub in subjects:
        if student_data.get(sub, 60) < 24:
            failing_subjects.append(sub.replace('_CIE', ''))

    if failing_subjects:
        actions.append(f"📚 Academics: Schedule a mentor meeting immediately for: {', '.join(failing_subjects)}.")

    if student_data.get('Active_Backlogs', 0) > 0:
        actions.append(
            f"⚠️ Backlogs: You have {student_data['Active_Backlogs']} active backlogs. Prioritize clearing these.")

    return actions


@app.route('/predict', methods=['POST'])
def predict_risk():
    try:
        student_data = request.json
        df = pd.DataFrame([student_data])

        # Match columns for XGBoost
        for col in expected_features:
            if col not in df.columns:
                df[col] = 0
        df = df[expected_features]

        # Predict
        predicted_numeric = model.predict(df)[0]
        risk_level = reverse_mapping[predicted_numeric]

        # Generate Recommendations
        recommendations = generate_action_plan(student_data, risk_level)

        return jsonify({
            "status": "success",
            "risk_level": risk_level,
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == '__main__':
    app.run(debug=True, port=5000)