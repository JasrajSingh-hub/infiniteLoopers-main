// Core Application Logic

class App {
    constructor() {
        this.data = MOCK_DATA; // Assumes MOCK_DATA is loaded globally from data.js
        this.init();
    }

    init() {
        // Simple router logic based on path
        const path = window.location.pathname;
        
        // Auth check (skip for login page)
        if (!path.endsWith('index.html') && !path.endsWith('/') && !sessionStorage.getItem('isLoggedIn')) {
            // Check if we are actually NOT on the index page
            // Assuming local dev: path usually ends with filename
            // Safety: if we are on a page that isn't login, redirect
            if (document.querySelector('.auth-layout') === null) {
                 window.location.href = 'index.html';
                 return;
            }
        }

        if (document.getElementById('loginForm')) {
            this.setupLogin();
        } else if (document.getElementById('dashboard-container')) {
            this.renderDashboard();
        } else if (document.getElementById('patient-detail-container')) {
            this.renderPatientDetail();
        } else if (document.getElementById('vitals-form')) {
            this.setupVitalsForm();
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
                // Mock Authentication
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

    renderDashboard() {
        // Render Stats
        document.getElementById('stat-total').textContent = this.data.stats.totalPatients;
        document.getElementById('stat-critical').textContent = this.data.stats.critical;
        document.getElementById('stat-stable').textContent = this.data.stats.stable;

        // Render Patient List
        const grid = document.getElementById('patient-grid');
        grid.innerHTML = this.data.patients.map(patient => `
            <a href="patient.html?id=${patient.id}" class="card patient-card">
                <div class="patient-card-header">
                    <div>
                        <h3 class="text-md font-semibold">${patient.name}</h3>
                        <p class="text-xs text-muted">ID: ${patient.id}</p>
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
                        <span class="font-medium">${patient.diagnosis}</span>
                    </div>
                </div>
                <div class="vitals-row">
                    <div class="vital-item">
                        <span class="vital-label">HR</span>
                        <span class="vital-value">${patient.vitals.hr}</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">BP</span>
                        <span class="vital-value">${patient.vitals.bp}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    renderPatientDetail() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const patient = this.data.patients.find(p => p.id === id);

        if (!patient) {
            document.body.innerHTML = '<div class="container text-center mt-4">Patient not found</div>';
            return;
        }

        // Fill basic info
        document.getElementById('p-name').textContent = patient.name;
        document.getElementById('p-id').textContent = patient.id;
        document.getElementById('p-status').textContent = patient.status;
        document.getElementById('p-status').className = `patient-status status-${patient.status.toLowerCase()}`;
        
        document.getElementById('p-age').textContent = patient.age;
        document.getElementById('p-gender').textContent = patient.gender;
        document.getElementById('p-room').textContent = patient.room;
        document.getElementById('p-admitted').textContent = patient.admissionDate;
        document.getElementById('p-diagnosis').textContent = patient.diagnosis;

        // Fill Vitals
        document.getElementById('v-bp').textContent = patient.vitals.bp;
        document.getElementById('v-hr').textContent = patient.vitals.hr;
        document.getElementById('v-temp').textContent = patient.vitals.temp;
        document.getElementById('v-spo2').textContent = patient.vitals.spo2;

        // Render Chart (Simple CSS/JS Bar Chart implementation)
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
    }

    setupVitalsForm() {
        // Pre-fill patient select
        const select = document.getElementById('patient-select');
        this.data.patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} (${p.room})`;
            select.appendChild(option);
        });

        const form = document.getElementById('vitals-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Show success animation/toast
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Saved!';
            btn.style.backgroundColor = 'var(--success-color)';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }
}

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
