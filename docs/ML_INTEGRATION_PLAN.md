# ML Integration Plan

**Purpose:** Explain how ML model integrates with the system

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                 │
│  - Faculty Dashboard shows risk badges                      │
│  - Student Profile shows risk indicator                    │
└───────────────────────────┬─────────────────────────────────┘
                          │ API Call
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│  - Calls ML service for predictions                          │
│  - Returns risk data to frontend                          │
└───────────────────────────┬─────────────────────────────────┘
                          │ HTTP POST
          ┌────────────────┴────────────────┐
          ▼                                   ▼
┌──────────────────────┐      ┌──────────────────────────────┐
│   ML SERVICE         │      │   LLM (Groq/Gemini)           │
│   (Python/FastAPI)  │      │   (Natural Language Insights) │
│   - XGBoost Model   │      │                              │
│   - Risk Prediction │      │   "Focus on attendance..."    │
└──────────────────────┘      └──────────────────────────────┘
```

---

## 2. ML Team Responsibilities

Your ML team must provide:

### A. Trained Model File
- Save as `model.pkl` or `model.json`
- Contains: trained XGBoost model
- Includes: feature names, thresholds

### B. Prediction API Service
- Create `ml_service/` folder
- File: `main.py` with FastAPI
- Endpoints:
  - `POST /predict` - Single student
  - `POST /predict/bulk` - Multiple students
  - `GET /health` - Health check

### C. Required Input Features
From database, ML service needs:
```python
features = {
    "attendance_percent": float,      # 0-100
    "cie_marks": float,               # 0-100
    "amcat_logical": float,           # 200-900
    "amcat_quantitative": float,       # 250-900
    "amcat_verbal": float,           # 300-850
    "amcat_domain": float,           # 200-800
    "backlogs": int,                 # 0+
    "portal_logins": int,              # count
}
```

### D. Output Format
```python
response = {
    "risk_level": "SAFE" | "WARNING" | "CRITICAL",
    "risk_score": float,              # 0-100
    "probability": {
        "safe": float,               # 0-1
        "warning": float,
        "critical": float
    },
    "factors": {
        "attendance": float,        # contribution
        "marks": float,
        "amcat": float,
        "backlogs": float
    }
}
```

---

## 3. Backend Integration

### A. Create EWS Service
File: `backend/src/services/ews.service.ts`

```typescript
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

interface StudentFeatures {
  attendancePercent: number;
  cieMarks: number;
  amcatLogical: number;
  amcatQuantitative: number;
  amcatVerbal: number;
  amcatDomain: number;
  backlogs: number;
  portalLogins: number;
}

interface RiskPrediction {
  riskLevel: "SAFE" | "WARNING" | "CRITICAL";
  riskScore: number;
  probability: { safe: number; warning: number; critical: number };
  factors: { attendance: number; marks: number; amcat: number; backlogs: number };
}

export async function predictRisk(studentId: string): Promise<RiskPrediction> {
  // 1. Get student data from DB
  const student = await getStudentData(studentId);
  
  // 2. Prepare features
  const features: StudentFeatures = {
    attendancePercent: student.attendance,
    cieMarks: student.cieMarks,
    amcatLogical: student.amcat?.logicalScore || 300,
    amcatQuantitative: student.amcat?.quantitativeScore || 250,
    amcatVerbal: student.amcat?.verbalScore || 300,
    amcatDomain: student.amcat?.domainScore || 200,
    backlogs: student.activeBacklogs,
    portalLogins: student.portalLogins || 0,
  };
  
  // 3. Call ML service
  const response = await axios.post(`${ML_SERVICE_URL}/predict`, features);
  
  // 4. Return prediction
  return response.data;
}

export async function getInsights(studentId: string): Promise<string> {
  // 1. Get risk prediction
  const risk = await predictRisk(studentId);
  
  // 2. If ML insights enabled, call LLM
  const config = await getSystemConfig("ai_insights_for_base_faculty");
  if (!config) return "";
  
  // 3. Call LLM service
  const llmResponse = await axios.post(`${ML_SERVICE_URL}/insight`, {
    student: getStudentName(studentId),
    risk: risk,
  });
  
  return llmResponse.data.insight;
}
```

### B. Add Routes
File: `backend/src/routes/ews.routes.ts`

```typescript
router.get("/ews/risk/:studentId", asyncHandler(getRisk));
router.get("/ews/risk/:studentId/insight", asyncHandler(getInsight));
router.get("/ews/alerts", asyncHandler(getAlerts)); // All WARNING/CRITICAL
```

---

## 4. Frontend Integration

### Faculty Dashboard
```tsx
// Show risk badge next to student name
<span className={`badge badge-${riskLevel.toLowerCase()}`}>
  {riskLevel}
</span>
```

### Faculty Alerts Page
```tsx
// Sort by risk: CRITICAL first
students.sort((a, b) => b.riskScore - a.riskScore);
```

### Student Profile
```tsx
// Show risk indicator
<div className="risk-indicator">
  <Progress value={riskScore} />
  <span>{riskLevel}</span>
</div>
```

---

## 5. Files to Create/Modify

### ML Team Creates:
```
ml_service/
├── main.py              # FastAPI app
├── model.pkl            # Trained model
├── requirements.txt     # Dependencies
└── .env               # API keys
```

### Backend Modifies:
```
backend/src/
├── services/
│   └── ews.service.ts      # NEW
├── routes/
│   └── ews.routes.ts      # NEW
└── server.ts              # Add routes
```

### Frontend Modifies:
```
frontend/src/app/
├── pages/
│   ├── faculty-dashboard.tsx   # Add risk badges
│   ├── faculty-alerts.tsx       # Sort by risk
│   └── student-profile.tsx       # Show indicator
```

---

## 6. Environment Variables

```env
# Backend (.env)
ML_SERVICE_URL=http://localhost:8000
GROQ_API_KEY=your_api_key_here    # For LLM insights
GEMINI_API_KEY=your_api_key_here  # Alternative LLM
```

---

## 7. Deployment Options

### Option A: Separate Service (Recommended)
```
# Run ML service on separate port
cd ml_service
uvicorn main:app --port 8000
```

### Option B: Same Server
```
# If resources limited, run both on same server
# Backend: port 5000
# ML: port 8000
```

---

## 8. Testing Checklist

- [ ] ML service starts without errors
- [ ] POST /predict returns correct format
- [ ] Backend calls ML service successfully
- [ ] Frontend displays risk badges
- [ ] Risk sorted correctly in alerts page
- [ ] LLM insights work (if enabled)

---

## 9. What YOU Need from ML Team

| Item | Description |
|------|--------------|
| Trained model file | `model.pkl` with XGBoost |
| Feature list | What inputs model expects |
| main.py | FastAPI server with /predict endpoint |
| requirements.txt | Python dependencies |

---

## 10. Integration Checklist

**ML Team does:**
- [ ] Train model on historical data
- [ ] Create ml_service/main.py
- [ ] Test /predict endpoint
- [ ] Push to branch

**You do:**
- [ ] Create ews.service.ts in backend
- [ ] Add routes to server.ts
- [ ] Add risk display to frontend
- [ ] Test end-to-end

---

*Document Version: 1.0*  
*Date: April 2026*