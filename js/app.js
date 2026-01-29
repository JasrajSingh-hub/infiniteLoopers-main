// Core Application Logic

// Core Application Logic

class App {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.init();
    }

    async init() {
        // Auth check (skip for login page)
        const path = window.location.pathname;
        if (!path.endsWith('index.html') && !path.endsWith('/') && !sessionStorage.getItem('isLoggedIn')) {
            if (document.querySelector('.auth-layout') === null) {
                window.location.href = 'index.html';
                return;
            }
        }

        if (document.getElementById('loginForm')) {
            this.setupLogin();
        } else if (document.getElementById('dashboard-container')) {
            await this.renderDashboard();
        } else if (document.getElementById('patient-detail-container')) {
            await this.renderPatientDetail();
        } else if (document.getElementById('vitals-form')) {
            await this.setupVitalsForm();
        } else if (document.getElementById('add-patient-form')) {
            this.setupAddPatientForm();
        }

        this.setupGlobalNav();
    }

    setupLogin() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email && password) {
                sessionStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            }
        });
    }

    setupGlobalNav() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = 'index.html';
            });
        }
    }

    async fetchPatients() {
        try {
            const res = await fetch(`${this.apiBase}/patients`);
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch patients', err);
            return [];
        }
    }

    async renderDashboard() {
        const patients = await this.fetchPatients();

        // Calculate Stats
        const total = patients.length;
        const critical = patients.filter(p => p.status === 'Critical').length;
        const stable = patients.filter(p => p.status === 'Stable').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-critical').textContent = critical;
        document.getElementById('stat-stable').textContent = stable;

        // Render Patient List
        const grid = document.getElementById('patient-grid');
        grid.innerHTML = patients.map(patient => `
            <a href="patient.html?id=${patient.id}" class="card patient-card">
                <div class="patient-card-header">
                    <div>
                        <h3 class="text-md font-semibold">${patient.name}</h3>
                        <div class="flex items-center gap-2">
                             <p class="text-xs text-muted mb-0">ID: ${patient.id}</p>
                             ${this.getRiskBadge(patient.riskScore)}
                        </div>
                    </div>
                     <span class="patient-status status-${patient.status.toLowerCase()}">${patient.status}</span>
                </div>
                <div class="patient-info mt-2">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-muted">Room</span>
                        <span class="font-medium">${patient.room}</span>
                    </div>
                     <div class="flex justify-between text-sm mb-1">
                        <span class="text-muted">Diagnosis</span>
                        <span class="font-medium">${patient.condition || patient.diagnosis}</span>
                    </div>
                </div>
                <div class="vitals-row">
                    <div class="vital-item">
                        <span class="vital-label">HR</span>
                        <span class="vital-value ${this.getVitalColor(patient.vitals.hr, 60, 100)}">${patient.vitals.hr}</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">BP</span>
                        <span class="vital-value">${patient.vitals.bp}</span>
                    </div>
                     <div class="vital-item">
                        <span class="vital-label">SpO2</span>
                         <span class="vital-value ${this.getVitalColor(patient.vitals.spo2, 95, 100, true)}">${patient.vitals.spo2}%</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    getRiskBadge(score) {
        let color = 'bg-gray-100 text-gray-800';
        if (score >= 70) color = 'badge-critical'; // Define CSS for these
        else if (score >= 40) color = 'badge-warning';
        else color = 'badge-success';

        // Inline styles for simplicity in prototype
        let style = "background:#ecfdf5; color:#065f46;";
        if (score >= 70) style = "background:#fef2f2; color:#b91c1c;";
        else if (score >= 40) style = "background:#fffbeb; color:#92400e;";

        return `<span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; ${style}">Risk: ${score}</span>`;
    }

    getVitalColor(val, min, max, isLowerBad = false) {
        // Simple logic for coloring text
        if (isLowerBad) {
            if (val < min) return 'text-danger';
        } else {
            if (val > max || val < min) return 'text-danger';
        }
        return '';
    }

    async renderPatientDetail() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        try {
            const res = await fetch(`${this.apiBase}/patients/${id}`);
            if (!res.ok) throw new Error('Not found');
            const patient = await res.json();

            // Fill basic info
            document.getElementById('p-name').textContent = patient.name;
            document.getElementById('p-id').textContent = patient.id;
            document.getElementById('p-status').textContent = patient.status;
            document.getElementById('p-status').className = `patient-status status-${patient.status.toLowerCase()}`;

            document.getElementById('p-age').textContent = patient.age;
            document.getElementById('p-gender').textContent = patient.gender;
            document.getElementById('p-room').textContent = patient.room;
            document.getElementById('p-admitted').textContent = patient.admissionDate;
            document.getElementById('p-diagnosis').textContent = patient.condition || patient.diagnosis;

            // Fill Vitals
            document.getElementById('v-bp').textContent = patient.vitals.bp;
            document.getElementById('v-hr').textContent = patient.vitals.hr;
            document.getElementById('v-temp').textContent = patient.vitals.temp;
            document.getElementById('v-spo2').textContent = patient.vitals.spo2;

            // Render Chart
            const chartContainer = document.getElementById('bp-history-chart');
            if (patient.history && patient.history.length > 0) {
                const maxVal = Math.max(...patient.history.map(h => h.value)) + 20;

                chartContainer.innerHTML = patient.history.map(h => {
                    const heightPercentage = (h.value / maxVal) * 100;
                    return `
                        <div class="flex flex-col items-center gap-1" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%;">
                            <div class="chart-bar" style="height: ${heightPercentage}%; width: 100%; position: relative;" title="${h.value}"></div>
                            <span class="text-xs text-muted" style="font-size: 10px;">${h.date}</span>
                        </div>
                    `;
                }).join('');
            } else {
                chartContainer.innerHTML = '<p class="text-muted text-center w-full">No history data available</p>';
            }

        } catch (e) {
            document.body.innerHTML = '<div class="container text-center mt-4">Patient not found</div>';
        }
    }

    async setupVitalsForm() {
        const select = document.getElementById('patient-select');
        const patients = await this.fetchPatients();

        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} (${p.room})`;
            select.appendChild(option);
        });

        const form = document.getElementById('vitals-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = 'Saving...';

            const data = {
                patientId: select.value,
                bp: document.getElementById('bp').value,
                hr: document.getElementById('hr').value,
                temp: document.getElementById('temp').value,
                spo2: document.getElementById('spo2').value,
            };

            try {
                const res = await fetch(`${this.apiBase}/vitals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.success) {
                    btn.innerHTML = 'Saved!';
                    btn.style.backgroundColor = 'var(--success-color)';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (err) {
                btn.innerHTML = 'Error';
                btn.style.backgroundColor = 'var(--danger-color)';
            }
        });
    }

    setupAddPatientForm() {
        const form = document.getElementById('add-patient-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = 'Admitting...';

            const data = {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                room: document.getElementById('room').value,
                diagnosis: document.getElementById('diagnosis').value,
                vitals: {
                    bp: document.getElementById('bp').value || "120/80",
                    hr: document.getElementById('hr').value || 72,
                    temp: 98.6, // Minimal default
                    spo2: 98    // Minimal default
                }
            };

            try {
                const res = await fetch(`${this.apiBase}/patients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.success) {
                    btn.innerHTML = 'Admitted!';
                    btn.style.backgroundColor = 'var(--success-color)';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (err) {
                console.error(err);
                btn.innerHTML = 'Error';
                btn.style.backgroundColor = 'var(--danger-color)';
            }
        });
    }
}

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
