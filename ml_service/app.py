from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# 1. Load the trained model and the expected column names when the server starts
print("Loading Model...")
model = joblib.load('spa_risk_model.pkl')
model_columns = joblib.load('model_columns.pkl')


@app.route('/')
def home():
    return "SPA-EWS Risk Prediction API is running!"


# 2. Create the Prediction Endpoint
@app.route('/predict_risk', methods=['POST'])
def predict_risk():
    try:
        # Get the student data sent by the Frontend/Dashboard (in JSON format)
        student_data = request.json

        # Convert JSON into a Pandas DataFrame
        query_df = pd.DataFrame([student_data])

        # Ensure the incoming data has all the columns the model expects
        # If a column is missing, fill it with 0
        query_df = query_df.reindex(columns=model_columns, fill_value=0)

        # 3. Make the Prediction
        prediction = model.predict(query_df)  # Returns 0 (Safe) or 1 (At-Risk)
        probability = model.predict_proba(query_df)  # Returns the exact percentage/confidence

        # Extract the probability of being "At-Risk" (class 1)
        risk_probability = float(probability[0][1])

        # Convert prediction to an understandable label
        if risk_probability >= 0.75:
            risk_category = "Critical"
        elif risk_probability >= 0.50:
            risk_category = "High Risk"
        elif risk_probability >= 0.25:
            risk_category = "Medium Risk"
        else:
            risk_category = "Safe"

        # 4. Send the result back to the Dashboard
        return jsonify({
            'prediction': int(prediction[0]),
            'risk_category': risk_category,
            'risk_probability': f"{risk_probability * 100:.2f}%"
        })

    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    # Run the server on port 5000
    app.run(port=5000, debug=True)