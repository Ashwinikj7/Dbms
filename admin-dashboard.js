/**
 * Pulse of Hope - Admin Dashboard JavaScript
 * Handles all admin page functionality with Supabase integration
 */

// Supabase Configuration
const SUPABASE_URL = 'https://zqsehpfbmoapuygdqjai.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hr3AIQbkYesPVNO_4aIrYQ_lMFSSA-T';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show loading spinner
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
    }
}

/**
 * Show empty state
 */
function showEmpty(containerId, message = 'No data found') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>${message}</h3>
            </div>
        `;
    }
}

/**
 * Safe element text content update
 */
function setElementText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Safe element class update
 */
function setElementClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = className;
    }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// PAGE DETECTION
// ============================================

/**
 * Get current page name from URL
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('admin-report.html')) return 'admin-report';
    if (path.includes('manage-hospitals.html')) return 'manage-hospitals';
    if (path.includes('verify-donors.html')) return 'verify-donors';
    if (path.includes('system-settings.html')) return 'system-settings';
    return null;
}

// ============================================
// ADMIN REPORT PAGE FUNCTIONS
// ============================================

/**
 * Fetch and display system statistics for admin report
 */
async function loadAdminReport() {
    showLoading('statsContainer');
    
    try {
        // Fetch counts from all tables
        const [donorsResult, patientsResult, doctorsResult, hospitalsResult, loginHistoryResult] = await Promise.all([
            supabase.from('donors_auth').select('*', { count: 'exact', head: true }),
            supabase.from('patients_auth').select('*', { count: 'exact', head: true }),
            supabase.from('doctors_auth').select('*', { count: 'exact', head: true }),
            supabase.from('hospitals').select('*', { count: 'exact', head: true }),
            supabase.from('login_history').select('*', { count: 'exact', head: true })
        ]);

        // Update stat cards with null checks
        setElementText('totalDonors', donorsResult.count || 0);
        setElementText('totalPatients', patientsResult.count || 0);
        setElementText('totalDoctors', doctorsResult.count || 0);
        setElementText('totalHospitals', hospitalsResult.count || 0);
        setElementText('totalLogins', loginHistoryResult.count || 0);

        // Fetch recent login activity
        const { data: recentLogins, error } = await supabase
            .from('login_history')
            .select('*')
            .order('login_time', { ascending: false })
            .limit(10);

        if (error) throw error;

        renderLoginHistory(recentLogins);

    } catch (error) {
        console.error('Error loading admin report:', error);
        showToast('Error loading report data', 'error');
    }
}

/**
 * Render login history table
 */
function renderLoginHistory(logins) {
    const container = document.getElementById('loginHistoryBody');
    if (!container) return;

    if (!logins || logins.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--gray-500);">No login records found</td></tr>';
        return;
    }

    container.innerHTML = logins.map(login => `
        <tr>
            <td><span class="status-badge status-info">${capitalizeFirst(login.role || 'unknown')}</span></td>
            <td>${login.user_identifier || 'N/A'}</td>
            <td>${formatDate(login.login_time)}</td>
            <td><span class="status-badge status-active">✓ Success</span></td>
        </tr>
    `).join('');
}

// ============================================
// MANAGE HOSPITALS PAGE FUNCTIONS
// ============================================

/**
 * Load all hospitals for management - Optimized for speed
 */
async function loadHospitals() {
    console.time('hospital-load');
    console.log('Loading hospitals...');
    
    // Show loading immediately
    const container = document.getElementById('hospitalsTableContainer');
    if (container) {
        container.innerHTML = '<div class="loading-text">Loading hospitals...</div>';
    }
    
    try {
        // Single optimized query - fetch all columns from hospitals table
        const { data: hospitals, error } = await supabase
            .from('hospitals')
            .select(`
                hospital_id,
                name,
                address,
                phone,
                email,
                stored_units,
                needed_units
            `);

        console.log("Hospitals loaded:", hospitals);
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log(`Loaded ${hospitals ? hospitals.length : 0} hospitals`);
        
        // Update count immediately
        setElementText('totalHospitalsCount', hospitals ? hospitals.length : 0);
        
        // Render table immediately - no delays
        renderHospitalsTable(hospitals);

    } catch (error) {
        console.error('Error loading hospitals:', error);
        showToast('Error loading hospitals: ' + error.message, 'error');
    } finally {
        console.timeEnd('hospital-load');
    }
}

/**
 * Search hospitals
 */
async function searchHospitals() {
    const searchInput = document.getElementById('hospitalSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    if (!searchTerm) {
        loadHospitals();
        return;
    }

    try {
        const { data: hospitals, error } = await supabase
            .from('hospitals')
            .select(`
                hospital_id,
                name,
                address,
                phone,
                email,
                stored_units,
                needed_units
            `)
            .ilike('name', `%${searchTerm}%`);

        if (error) throw error;

        setElementText('totalHospitalsCount', hospitals ? hospitals.length : 0);
        renderHospitalsTable(hospitals);

    } catch (error) {
        console.error('Error searching hospitals:', error);
    }
}

/**
 * Delete hospital
 */
async function deleteHospital(hospitalId, hospitalName) {
    if (!confirm(`Are you sure you want to delete "${hospitalName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('hospitals')
            .delete()
            .eq('hospital_id', hospitalId);

        if (error) throw error;

        showToast(`Hospital "${hospitalName}" deleted successfully`, 'success');
        loadHospitals();

    } catch (error) {
        console.error('Error deleting hospital:', error);
        showToast('Error deleting hospital', 'error');
    }
}

/**
 * View hospital details (placeholder - can be expanded)
 */
function viewHospitalDetails(hospitalId) {
    showToast(`Viewing hospital ID: ${hospitalId}`, 'info');
}

/**
 * Render hospitals table
 */
function renderHospitalsTable(hospitals) {
    const container = document.getElementById('hospitalsTableBody');
    if (!container) return;

    if (!hospitals || hospitals.length === 0) {
        showEmpty('hospitalsTableContainer', 'No hospitals found');
        return;
    }

    container.innerHTML = hospitals.map(hosp => `
        <tr>
            <td><strong>${hosp.hospital_id || 'N/A'}</strong></td>
            <td>${hosp.name || 'Unknown Hospital'}</td>
            <td>${hosp.address || 'N/A'}</td>
            <td>${hosp.phone || 'N/A'}</td>
            <td>${hosp.email || 'N/A'}</td>
            <td>${hosp.stored_units !== undefined ? hosp.stored_units + ' units' : 'N/A'}</td>
            <td>${hosp.needed_units !== undefined ? hosp.needed_units + ' units' : 'N/A'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="viewHospitalDetails(${hosp.hospital_id})" title="View Details">
                        👁️
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteHospital(${hosp.hospital_id}, '${(hosp.name || '').replace(/'/g, "\\'")}') " title="Delete Hospital">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Load all donors for verification - Optimized for speed
 */
async function loadDonors() {
    console.time('donor-load');
    console.log('Loading donors...');
    
    // Show loading immediately
    const container = document.getElementById('donorsTableContainer');
    if (container) {
        container.innerHTML = '<div class="loading-text">Loading donors...</div>';
    }
    
    try {
        // Single optimized query - using donors table with exact columns
        const { data: donors, error } = await supabase
            .from('donors')
            .select(`
                donor_id,
                name,
                blood_group,
                phone,
                email,
                address,
                is_available
            `)
            .order('donor_id', { ascending: false });

        console.log("Donors loaded:", donors);
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log(`Loaded ${donors ? donors.length : 0} donors`);
        
        // Update count immediately
        setElementText('totalDonorsCount', donors ? donors.length : 0);
        
        // Render table immediately - no delays
        renderDonorsTable(donors);

    } catch (error) {
        console.error('Error loading donors:', error);
        showToast('Error loading donors: ' + error.message, 'error');
    } finally {
        console.timeEnd('donor-load');
    }
}

/**
 * Render donors table
 */
function renderDonorsTable(donors) {
    const container = document.getElementById('donorsTableBody');
    if (!container) return;

    if (!donors || donors.length === 0) {
        showEmpty('donorsTableContainer', 'No donors found');
        return;
    }

    container.innerHTML = donors.map(donor => `
        <tr>
            <td><strong>${donor.donor_id || 'N/A'}</strong></td>
            <td>${donor.name || 'Unknown'}</td>
            <td><span class="blood-badge">${donor.blood_group || 'N/A'}</span></td>
            <td>${donor.phone || 'N/A'}</td>
            <td>${donor.address || 'N/A'}</td>
            <td>${donor.is_available !== undefined ? (donor.is_available ? 'Active' : 'Inactive') : 'N/A'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-success" onclick="approveDonor(${donor.donor_id}, '${(donor.name || '').replace(/'/g, "\\'")}') " title="Approve">
                        ✅ Approve
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectDonor(${donor.donor_id}, '${(donor.name || '').replace(/'/g, "\\'")}') " title="Reject">
                        ❌ Reject
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Search donors
 */
async function searchDonors() {
    const searchInput = document.getElementById('donorSearch');
    const bloodGroupSelect = document.getElementById('bloodGroupFilter');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const bloodGroup = bloodGroupSelect ? bloodGroupSelect.value : '';
    
    try {
        let query = supabase.from('donors').select(`
            donor_id,
            name,
            blood_group,
            phone,
            email,
            address,
            is_available
        `);
        
        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        if (bloodGroup) {
            query = query.eq('blood_group', bloodGroup);
        }
        
        const { data: donors, error } = await query.order('donor_id', { ascending: false });

        if (error) throw error;

        setElementText('totalDonorsCount', donors ? donors.length : 0);
        renderDonorsTable(donors);

    } catch (error) {
        console.error('Error searching donors:', error);
    }
}

/**
 * Approve donor (frontend-only status)
 */
function approveDonor(donorId, donorName) {
    showToast(`Donor "${donorName}" (ID: ${donorId}) approved successfully!`, 'success');
}

/**
 * Reject donor (frontend-only status)
 */
function rejectDonor(donorId, donorName) {
    if (!confirm(`Are you sure you want to reject donor "${donorName}" (ID: ${donorId})?`)) {
        return;
    }
    showToast(`Donor "${donorName}" rejected.`, 'warning');
}

// ============================================
// SYSTEM SETTINGS PAGE FUNCTIONS
// ============================================

/**
 * Load system settings and health status
 */
async function loadSystemSettings() {
    try {
        // Check Supabase connection
        const { data, error } = await supabase.from('donors_auth').select('count', { count: 'exact', head: true });
        
        const supabaseStatus = !error ? 'Connected' : 'Disconnected';
        const supabaseClass = !error ? 'success' : 'danger';
        
        setElementText('supabaseStatus', supabaseStatus);
        setElementClass('supabaseStatus', `value ${supabaseClass}`);

        // Check OCR endpoint
        const ocrStatusEl = document.getElementById('ocrStatus');
        if (ocrStatusEl) {
            try {
                const response = await fetch('http://localhost:5000/health', { method: 'GET', signal: AbortSignal.timeout(2000) });
                if (response.ok) {
                    ocrStatusEl.textContent = 'Connected';
                    ocrStatusEl.className = 'value success';
                } else {
                    throw new Error('OCR endpoint not responding');
                }
            } catch (e) {
                ocrStatusEl.textContent = 'Disconnected';
                ocrStatusEl.className = 'value danger';
            }
        }

        // Fetch table counts
        const [donorsCount, patientsCount, doctorsCount, hospitalsCount] = await Promise.all([
            supabase.from('donors_auth').select('*', { count: 'exact', head: true }),
            supabase.from('patients_auth').select('*', { count: 'exact', head: true }),
            supabase.from('doctors_auth').select('*', { count: 'exact', head: true }),
            supabase.from('hospitals').select('*', { count: 'exact', head: true })
        ]);

        setElementText('totalTables', '5 tables active');
        setElementText('donorsCountSetting', donorsCount.count || 0);
        setElementText('patientsCountSetting', patientsCount.count || 0);
        setElementText('doctorsCountSetting', doctorsCount.count || 0);
        setElementText('hospitalsCountSetting', hospitalsCount.count || 0);

        // Fetch latest login from login_history table
        const { data: latestLogin, error: loginError } = await supabase
            .from('login_history')
            .select('login_time, role, user_identifier')
            .order('login_time', { ascending: false })
            .limit(1)
            .single();

        if (loginError && loginError.code !== 'PGRST116') {
            console.error('Error fetching latest login:', loginError);
            setElementText('lastLoginTime', 'Error loading data');
        } else if (latestLogin) {
            // Format the login time in human-readable format
            const formattedTime = formatDate(latestLogin.login_time);
            const userActivity = `${latestLogin.role || 'User'} (${latestLogin.user_identifier || 'Unknown'})`;
            
            // Update the last login time display
            setElementText('lastLoginTime', `${formattedTime} • ${userActivity}`);
        } else {
            setElementText('lastLoginTime', 'No login records found');
        }

        // Fetch recent login activity for additional context
        const { data: recentLogins, error: recentError } = await supabase
            .from('login_history')
            .select('login_time, role')
            .order('login_time', { ascending: false })
            .limit(5);

        if (!recentError && recentLogins && recentLogins.length > 0) {
            // Calculate today's logins
            const today = new Date().toDateString();
            const todayLogins = recentLogins.filter(login => 
                new Date(login.login_time).toDateString() === today
            ).length;
            
            // Update activity summary if elements exist
            const todayLoginsEl = document.getElementById('todayLogins');
            if (todayLoginsEl) {
                todayLoginsEl.textContent = `${todayLogins} today`;
                todayLoginsEl.className = 'value';
            }
        }

        // Database health summary
        const totalRecords = (donorsCount.count || 0) + (patientsCount.count || 0) + (doctorsCount.count || 0) + (hospitalsCount.count || 0);
        setElementText('dbHealthStatus', totalRecords > 0 ? 'Healthy' : 'Empty');
        setElementClass('dbHealthStatus', `value ${totalRecords > 0 ? 'success' : 'warning'}`);

    } catch (error) {
        console.error('Error loading system settings:', error);
        showToast('Error loading system settings', 'error');
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Show confirmation modal
 */
function showConfirmModal(title, message, onConfirm) {
    const overlay = document.getElementById('confirmModal');
    if (!overlay) return;

    overlay.querySelector('h3').textContent = title;
    overlay.querySelector('.modal-message').textContent = message;
    overlay.classList.add('active');

    const confirmBtn = overlay.querySelector('.btn-confirm');
    const cancelBtn = overlay.querySelector('.btn-cancel');

    if (confirmBtn) {
        confirmBtn.onclick = () => {
            overlay.classList.remove('active');
            onConfirm();
        };
    }

    if (cancelBtn) {
        cancelBtn.onclick = () => {
            overlay.classList.remove('active');
        };
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Make functions globally available
window.loadAdminReport = loadAdminReport;
window.loadHospitals = loadHospitals;
window.searchHospitals = searchHospitals;
window.deleteHospital = deleteHospital;
window.viewHospitalDetails = viewHospitalDetails;
window.loadDonors = loadDonors;
window.searchDonors = searchDonors;
window.approveDonor = approveDonor;
window.rejectDonor = rejectDonor;
window.loadSystemSettings = loadSystemSettings;
window.showToast = showToast;

// Auto-load data based on page detection
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = getCurrentPage();
    
    // Only run the function for the current page to avoid null element errors
    switch (currentPage) {
        case 'admin-report':
            loadAdminReport();
            break;
        case 'manage-hospitals':
            loadHospitals();
            break;
        case 'verify-donors':
            loadDonors();
            break;
        case 'system-settings':
            loadSystemSettings();
            // Start automatic updates for system settings page
            startAutoUpdates();
            break;
    }
});

/**
 * Start automatic updates for login history data
 */
function startAutoUpdates() {
    // Update login data every 30 seconds
    setInterval(() => {
        const currentPage = getCurrentPage();
        if (currentPage === 'system-settings') {
            loadSystemSettings();
        }
    }, 30000); // 30 seconds
}
