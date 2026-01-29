const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Mock Database (In-Memory) ---
let patients = [
    {
        id: "P-1001",
        name: "Eleanor Rigby",
        age: 72,
        gender: "Female",
        room: "304-A",
        status: "Stable",
        condition: "Hypertension",
        admissionDate: "2023-10-15",
        vitals: { bp: "128/82", hr: 76, temp: 98.6, spo2: 98 },
        riskScore: 20,
        history: []
    },
    {
        id: "P-1002",
        name: "John Doe",
        age: 45,
        gender: "Male",
        room: "201-B",
        status: "Critical",
        condition: "Post-op Cardiac",
        admissionDate: "2023-10-18",
        vitals: { bp: "110/70", hr: 110, temp: 99.1, spo2: 94 }, // Elevated HR
        riskScore: 85,
        history: []
    },
    {
        id: "P-1003",
        name: "Alice Smith",
        age: 29,
        gender: "Female",
        room: "105-C",
        status: "Recovering",
        condition: "Appendicitis",
        admissionDate: "2023-10-19",
        vitals: { bp: "118/75", hr: 72, temp: 98.4, spo2: 99 },
        riskScore: 10,
        history: []
    },
    {
        id: "P-1004",
        name: "Michael Chen",
        age: 58,
        gender: "Male",
        room: "305-A",
        status: "Stable",
        condition: "Type 2 Diabetes",
        admissionDate: "2023-10-12",
        vitals: { bp: "135/85", hr: 80, temp: 98.2, spo2: 97 },
        riskScore: 35,
        history: []
    }
];

// --- Helper Functions ---

// Simple Risk Scoring Algorithm
// Returns a score 0-100 and a 'status' string
function calculateRisk(vitals, age) {
    let score = 0;
    
    // 1. Heart Rate Risk
    const hr = vitals.hr;
    if (hr > 120 || hr < 40) score += 40;
    else if (hr > 100 || hr < 50) score += 20;

    // 2. SpO2 Risk
    const spo2 = vitals.spo2;
    if (spo2 < 90) score += 50;
    else if (spo2 < 95) score += 25;

    // 3. Blood Pressure Risk (Simplified systolic check)
    const systolic = parseInt(vitals.bp.split('/')[0]);
    if (systolic > 180 || systolic < 90) score += 40;
    else if (systolic > 140) score += 20;

    // 4. Age Factor
    if (age > 70) score += 10;

    // Cap at 100
    score = Math.min(score, 100);

    let status = 'Stable';
    if (score >= 70) status = 'Critical';
    else if (score >= 40) status = 'Attention';

    return { score, status };
}

// --- Routes ---

// Health Check
app.get('/', (req, res) => {
    res.send({ message: 'Nurse Dashboard API is running' });
});

// GET /api/patients - Fetch and Prioritize Patients
app.get('/api/patients', (req, res) => {
    // Sort logic: Higher Risk Score first
    const sortedPatients = [...patients].sort((a, b) => b.riskScore - a.riskScore);
    res.json(sortedPatients);
});

// GET /api/patients/:id - Single Patient
app.get('/api/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === req.params.id);
    if (patient) res.json(patient);
    else res.status(404).json({ error: 'Patient not found' });
});

// POST /api/patients - Add New Patient
app.post('/api/patients', (req, res) => {
    const { name, age, gender, room, diagnosis, vitals } = req.body;

    if (!name || !age || !room) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newId = `P-${1000 + patients.length + 1}`;
    
    // Default vitals if not provided
    const initialVitals = vitals || { bp: "120/80", hr: 72, temp: 98.6, spo2: 98 };
    const riskAnalysis = calculateRisk(initialVitals, age);

    const newPatient = {
        id: newId,
        name,
        age: parseInt(age),
        gender: gender || 'Unknown',
        room,
        status: riskAnalysis.status,
        condition: diagnosis || 'Under Observation',
        admissionDate: new Date().toISOString().split('T')[0],
        vitals: initialVitals,
        riskScore: riskAnalysis.score,
        history: []
    };

    patients.push(newPatient);
    res.json({ success: true, patient: newPatient });
});

// POST /api/vitals - Submit Vitals & Recalculate Risk
app.post('/api/vitals', (req, res) => {
    const { patientId, bp, hr, temp, spo2 } = req.body;

    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }

    // Update Vitals
    const newVitals = { 
        bp: bp || patient.vitals.bp,
        hr: parseInt(hr) || patient.vitals.hr,
        temp: parseFloat(temp) || patient.vitals.temp,
        spo2: parseInt(spo2) || patient.vitals.spo2
    };

    // Calculate New Risk
    const riskAnalysis = calculateRisk(newVitals, patient.age);

    // Update Patient Record
    patient.vitals = newVitals;
    patient.riskScore = riskAnalysis.score;
    patient.status = riskAnalysis.status; // Auto-update status based on AI score

    // Add to history (simple mock history)
    const systolic = parseInt(newVitals.bp.split('/')[0]);
    patient.history.push({ date: new Date().toLocaleDateString(), value: systolic });

    console.log(`Updated vitals for ${patient.name}. New Risk Score: ${riskAnalysis.score}`);

    res.json({ 
        success: true, 
        patient: patient,
        analysis: riskAnalysis
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
