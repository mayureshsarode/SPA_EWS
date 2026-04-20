# Phase 4: AMCAT/PDF Pipeline Specification

**For:** Your friend's work  
**Purpose:** Extract scores from uploaded AMCAT PDF and display in frontend

---

## 1. Overview

```
Student uploads AMCAT PDF
        ▼
Backend extracts scores using regex patterns
        ▼
Save to externalAssessment table
        ▼
Frontend displays in Documents page
```

---

## 2. What to Extract

### Score Fields from PDF:

| Field | Database Column | Example Value |
|-------|----------------|--------------|
| Logical Ability | logicalScore | 350-900 |
| Quantitative | quantitativeScore | 250-900 |
| Verbal Ability | verbalScore | 300-850 |
| Domain (Technical) | domainScore | 200-800 |
| Overall Percentile | overallPercentile | 20-99 |

### Also Store:
- vendorName: "AMCAT"
- dateTaken: Date from PDF (or upload date)

---

## 3. Regex Patterns for PDF Extraction

Place in `backend/src/services/pdf-extractor.ts`:

```typescript
const PATTERNS = {
  logical: [
    /Logical\s*(Ability|Aptitude|Reasoning)[:\s]+(\d+)/i,
    /Logical[:\s]+(\d+)/i,
  ],
  quantitative: [
    /Quantitative\s*(Ability|Reasoning)[:\s]+(\d+)/i,
    /Quantitative[:\s]+(\d+)/i,
  ],
  verbal: [
    /Verbal\s*(Ability|Reasoning|Communication)[:\s]+(\d+)/i,
    /English\s*Proficiency[:\s]+(\d+)/i,
    /Verbal[:\s]+(\d+)/i,
  ],
  domain: [
    /Automata\s*(Engine|Skills)[:\s]+(\d+)/i,
    /Technical[:\s]+(\d+)/i,
    /Domain[:\s]+(\d+)/i,
  ],
  percentile: [
    /Overall\s*Percentile[:\s]+(\d+(?:\.\d+)?)/i,
    /Percentile[:\s]+(\d+(?:\.\d+)?)/i,
  ]
};
```

---

## 4. Files to Create

### Backend:

| File | Purpose |
|------|---------|
| `backend/src/services/pdf-extractor.ts` | Extract scores from PDF buffer |
| `backend/src/services/assessment.service.ts` | Save to DB, business logic |
| `backend/src/routes/assessment.routes.ts` | API routes (NEW) |

### Frontend:

| File | Purpose |
|------|---------|
| `frontend/src/app/pages/student-documents.tsx` | Update to show upload button |

---

## 5. API Endpoints

### POST /api/assessments/upload
**Input:** multipart/form-data with PDF file
```typescript
// Request
{
  file: File // PDF file
}

// Response
{
  success: true,
  data: {
    id: string,
    vendorName: "AMCAT",
    logicalScore: number,
    quantitativeScore: number,
    verbalScore: number,
    domainScore: number,
    overallPercentile: number,
    dateTaken: Date
  }
}
```

### POST /api/assessments/manual
**Input:** Manual entry (fallback if PDF fails)
```typescript
// Request
{
  logicalScore: number,
  quantitativeScore: number,
  verbalScore: number,
  domainScore: number,
  overallPercentile: number,
  dateTaken: string // "2026-01-15"
}
```

### GET /api/assessments
**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      vendorName: string,
      logicalScore: number,
      quantitativeScore: number,
      verbalScore: number,
      domainScore: number,
      overallPercentile: number,
      dateTaken: string
    }
  ]
}
```

---

## 6. Error Handling

| Error | What to Do |
|-------|------------|
| PDF parse fails | Return error, suggest manual entry |
| Invalid scores | Show which scores couldn't be extracted |
| No scores found | Return all null, allow manual entry |

---

## 7. Frontend Display

In `student-documents.tsx`:

```tsx
// Add upload section
<div className="amcat-upload">
  <input type="file" accept=".pdf" />
  <button>Upload AMCAT</button>
</div>

// Display scores as cards
<Card>
  <div className="score-row">
    <span>Logical</span> <span>{score}</span>
  </div>
  <div className="score-row">
    <span>Quantitative</span> <span>{score}</span>
  </div>
  ...
</Card>
```

---

## 8. Dependencies

```bash
# Backend - PDF parsing
npm install pdf-parse multer
```

---

## 9. Testing

1. Upload a real AMCAT PDF
2. Check all 5 scores extracted correctly
3. Try manual entry
4. View in Documents page
5. Faculty can view student's scores

---

## 10. Deliverables Checklist

- [ ] pdf-extractor.ts with all regex patterns
- [ ] assessment.service.ts with save logic
- [ ] POST /api/assessments/upload endpoint
- [ ] POST /api/assessments/manual endpoint
- [ ] GET /api/assessments endpoint
- [ ] Frontend upload component
- [ ] Frontend display of scores
- [ ] Test with sample PDF

---

*Created for: Your Friend*  
*Date: April 2026*