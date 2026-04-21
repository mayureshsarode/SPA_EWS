from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow your Node.js backend to call this

print("Loading Enterprise AI V4 Pipeline...")
# Load model and scaler on startup
with open("ews_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("ews_scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Hardcoded V4 Features (This is perfectly fine!)
FEATURES = [
    'OS_Attendance', 'OS_CIE', 'DBMS_Attendance', 'DBMS_CIE',
    'SE_Attendance', 'SE_CIE', 'MDM_Attendance', 'MDM_CIE',
    'Entrepreneurship_Attendance', 'Entrepreneurship_CIE',
    'ICSR_Attendance', 'ICSR_CIE', 'AMCAT_Logical', 'AMCAT_Quant',
    'AMCAT_Verbal', 'AMCAT_Domain', 'Active_Backlogs', 'Portal_Logins_Per_Month'
]

REVERSE_MAP = {0: "CRITICAL", 1: "WARNING", 2: "SAFE"}

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "XGBoost EWS v4"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    # 1. Map incoming data to our FEATURES list, defaulting to 0 if missing
    student_dict = {feature: data.get(feature, 0) for feature in FEATURES}
    student_df = pd.DataFrame([student_dict])

    # 2. Scale the data and predict
    student_scaled = scaler.transform(student_df)
    pred_class = model.predict(student_scaled)[0]
    pred_proba = model.predict_proba(student_scaled)[0]
    risk_label = REVERSE_MAP[pred_class]

    # 3. Generate LLM insight via Groq
    insight = None
    if os.environ.get("GROQ_API_KEY"):
        try:
            student_name = data.get("name", "this student")

            # Calculate averages for the LLM prompt
            subjects = ['OS', 'DBMS', 'SE', 'MDM', 'Entrepreneurship', 'ICSR']
            avg_att = sum([data.get(f'{sub}_Attendance', 0) for sub in subjects]) / 6
            avg_cie = sum([data.get(f'{sub}_CIE', 0) for sub in subjects]) / 6

            prompt = f"""You are a caring academic mentor. Student {student_name} 
            has {avg_att:.1f}% avg attendance, {avg_cie:.1f}/60 avg CIE marks, 
            {int(data.get("Active_Backlogs", 0))} backlogs. Risk: {risk_label}.
            Write 2-3 sentences: main concern, one action, encouragement. Under 60 words."""

            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150, temperature=0.7
            )
            insight = resp.choices[0].message.content.strip()
        except Exception as e:
            insight = f"Insight unavailable: {str(e)}"

    return jsonify({
        "riskLevel": risk_label,
        "riskScore": round(float(pred_proba[pred_class]) * 100, 1),
        "probabilities": {
            "CRITICAL": round(float(pred_proba[0]) * 100, 1),
            "WARNING": round(float(pred_proba[1]) * 100, 1),
            "SAFE": round(float(pred_proba[2]) * 100, 1)
        },
        "insight": insight,
        "model": "XGBoost v4"
    })


if __name__ == "__main__":
    print("Starting SPA-EWS ML API on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=True)