# AI/ML Architecture for SPA-EWS Early Warning System

## Overview

The Early Warning System (EWS) analyzes student data to identify at-risk students BEFORE they fail, enabling proactive intervention by faculty mentors.

---

## 1. Data Sources Available

| Data Type | Description | Predictive Value |
|-----------|-------------|-----------------|
| **Attendance %** | Per-subject attendance rate | HIGH - Drop often precedes failure |
| **CIE Marks** | Continuous Internal Evaluation scores | HIGH - Direct academic performance |
| **AMCAT Scores** | Logical, Quant, Verbal, Domain | MEDIUM - Aptitude baseline |
| **Academic History** | 10th, 12th, Diploma scores | MEDIUM - Historical indicators |
| **Backlogs** | Active backlogs count | HIGH - Strong failure predictor |
| **Engagement** | Portal login frequency | HIGH - Leading indicator |
| **Demographics** | Hosteller/Day-scholar, commute time | LOW - Contextual |

---

## 2. Risk Classification Model

### Thresholds (Configurable)
```
SAFE      → Attendance ≥ 75% AND CIE ≥ 60%
WARNING   → Attendance 60-74% OR CIE 40-59%
CRITICAL  → Attendance < 60% OR CIE < 40%
```

### Weighting Factors
- Attendance: 40% weight
- CIE Marks: 35% weight  
- AMCAT Domain: 10% weight
- Backlogs: 15% weight

---

## 3. AI/ML Implementation Options

### Option A: Lightweight Rule-Based (Recommended for MVP)

**Simple, Fast, No GPU Required**

```python
# Pseudo-code for risk scoring
def calculate_risk_score(student):
    attendance_score = min(student.attendance / 75, 1.0) * 40
    marks_score = min(student.cie_marks / 60, 1.0) * 35
    amcat_score = min(student.amcat_domain / 500, 1.0) * 10
    backlog_penalty = max(0, student.backlogs * 5)  # -5 per backlog
    
    total = attendance_score + marks_score + amcat_score - backlog_penalty
    
    if total >= 75: return "SAFE"
    elif total >= 50: return "WARNING"
    else: return "CRITICAL"
```

**Pros:** Instant, no training needed, predictable
**Cons:** No learning, manual threshold tuning required

---

### Option B: XGBoost Classifier (Better Accuracy)

**Machine Learning with Explainability**

```python
from xgboost import XGBClassifier
import shap  # For explaining predictions

# Features: [attendance%, cie_marks, amcat_logical, amcat_quant, 
#           amcat_verbal, amcat_domain, backlogs, portal_logins]

model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    objective='multi:softmax',
    num_class=3  # safe, warning, critical
)

# Train on historical data (students who completed semester)
model.fit(X_train, y_train)

# Explain individual predictions
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(student_features)
```

**Pros:** Learns patterns, handles feature interactions, SHAP explanations
**Cons:** Requires training data, needs periodic retraining

---

### Option C: Hybrid Pipeline (Best Results)

**ML for Risk Classification + LLM for Insights**

```
┌─────────────────┐
│  Student Data   │
└────────┬────────┘
         ▼
┌─────────────────┐
│  XGBoost Risk   │──→ SAFE / WARNING / CRITICAL
│  Classifier     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Groq/Gemini    │──→ Natural Language Insights
│  LLM API       │
└─────────────────┘
```

```python
# Step 1: ML Prediction
risk_level = model.predict(student_features)[0]
risk_probability = model.predict_proba(student_features)[0]

# Step 2: Generate Insight with LLM
prompt = f"""
Student: {student_name}
Risk Level: {risk_level}
Attendance: {attendance}%
CIE Marks: {cie_marks}/100
AMCAT Domain: {amcat_domain}

Generate a 2-3 sentence mentor insight addressing:
1. Primary concern
2. Suggested action
3. Positive reinforcement if any
"""

insight = call_groq_api(prompt)  # or Gemini
```

---

## 4. Recommended Architecture for SPA-EWS

### Immediate (Week 1-2): Rule-Based Engine

```typescript
// backend/services/ews.service.ts

interface EWSResult {
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  riskScore: number;        // 0-100
  factors: {
    attendance: number;      // Contribution to risk
    marks: number;
    amcat: number;
    backlogs: number;
  };
  alerts: string[];         // Specific warnings
  recommendation: string;    // Suggested action
}

export function calculateRisk(enrollment: CourseEnrollment): EWSResult {
  const attScore = (enrollment.lecturesAttended / enrollment.offering.lecturesConducted) * 100;
  const marksScore = enrollment.cieMarks || 0;
  
  // Weighted scoring
  const attendanceComponent = Math.min(attScore / 75, 1) * 40;
  const marksComponent = Math.min(marksScore / 60, 1) * 35;
  const amcatScore = enrollment.student.externalAssessments?.[0]?.domainScore || 300;
  const amcatComponent = Math.min(amcatScore / 500, 1) * 10;
  const backlogPenalty = (enrollment.student.activeBacklogs || 0) * 5;
  
  const riskScore = Math.max(0, 
    attendanceComponent + marksComponent + amcatComponent - backlogPenalty
  );
  
  let riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  if (riskScore >= 75) riskLevel = 'SAFE';
  else if (riskScore >= 50) riskLevel = 'WARNING';
  else riskLevel = 'CRITICAL';
  
  return { riskLevel, riskScore, ... };
}
```

### Short-term (Week 3-4): Add LLM Insights

```python
# Python microservice: insights_service.py

import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_insight(student_data: dict) -> str:
    prompt = f"""
    You are a student mentor advisor. Analyze this student's data and provide actionable advice.
    
    Student: {student_data['name']}
    Attendance: {student_data['attendance']}%
    CIE Marks: {student_data['cie_marks']}/100
    AMCAT Domain: {student_data.get('amcat_domain', 'N/A')}
    Backlogs: {student_data.get('backlogs', 0)}
    
    Provide a brief, encouraging insight focusing on:
    - Key area of concern
    - Specific improvement suggestion
    - Positive note if applicable
    
    Keep it under 3 sentences. Be specific and actionable.
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )
    
    return response.choices[0].message.content
```

### Long-term (Month 2+): Full ML Pipeline

1. Collect historical data (completed semesters)
2. Train XGBoost classifier
3. Deploy model to production
4. Set up retraining pipeline (quarterly)

---

## 5. API Integration

### Endpoint: Calculate Risk
```
GET /api/ews/risk/:studentId
GET /api/ews/risk/:studentId/insight  (with LLM)
GET /api/ews/alerts  (all critical/warning students)
```

### Response Format
```json
{
  "studentId": "abc123",
  "riskLevel": "WARNING",
  "riskScore": 62,
  "factors": {
    "attendance": 28,
    "marks": 18,
    "amcat": 8,
    "backlogs": -2
  },
  "insight": "Rutuja's attendance dropped to 68% in Data Structures. Consider scheduling a mentoring session to discuss time management and potential attendance issues.",
  "recommendedActions": [
    "Schedule mentor meeting",
    "Notify class coordinator",
    "Flag for counselor referral"
  ]
}
```

---

## 6. Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `ews_enabled` | true | Enable/disable EWS |
| `ai_insights_enabled` | false | Use LLM for insights |
| `alert_threshold` | WARNING | Minimum level to trigger alerts |
| `auto_notify_mentor` | false | Auto-email mentors |

---

## 7. Free AI Services for LLM Insights

| Service | Free Tier | Models | Speed |
|---------|----------|--------|-------|
| **Groq** | 30 req/min | Llama-3.3-70B | Fastest |
| **Gemini 1.5 Flash** | 1.5M tokens/min | Gemini 1.5 Flash | Fast |
| **Ollama (Local)** | Unlimited | Llama-3 8B | Slow, needs GPU |

**Recommendation:** Start with **Groq API** - it's free, fast, and excellent for this use case.

---

## 8. Implementation Roadmap

```
Week 1: 
├── Implement rule-based EWS in backend
├── Create /api/ews/risk/:id endpoint
├── Integrate with faculty alerts page
└── Test with existing data

Week 2:
├── Build Python microservice for LLM
├── Connect Groq API
├── Generate mentor insights
└── Display in student profile

Week 3:
├── Collect historical semester data
├── Train XGBoost model
├── A/B test rule-based vs ML
└── Deploy best performing model

Week 4:
├── Set up retraining pipeline
├── Add automated alerts (email)
├── Dashboard analytics
└── Documentation
```

---

## 9. Questions for You

1. **Do you want to start with Rule-Based or go straight to ML?**
2. **Which AI service do you prefer: Groq, Gemini, or local Ollama?**
3. **Should I implement the EWS calculation in the existing backend (Node.js) or create a separate Python microservice?**
4. **What specific insights do you want generated? (e.g., "Focus on Data Structures", "Attend more labs", etc.)**

---

*This architecture balances accuracy, cost, and implementation complexity.*
