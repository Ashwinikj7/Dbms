/**
 * Pulse of Hope - Role-Based Access Control (RBAC)
 * 
 * This module enforces access control based on user roles:
 * - patient: Cannot register as donor, cannot create hospital entries
 * - donor: Cannot create hospital entries
 * - doctor, hospital, admin: Full access to all functionalities
 * 
 * Usage:
 * 1. Include this script in HTML files that need access control
 * 2. Call checkAccess() on page load to verify permissions
 * 3. Use hasRole() and canAccess() functions to conditionally show/hide UI elements
 */

// Role definitions and permissions
const ROLE_PERMISSIONS = {
    patient: {
        canRegisterAsDonor: false,
        canCreateHospital: false,
        canViewHospitals: true,
        canViewDonors: true,
        canRequestBlood: true,
        canAccessAdmin: false,
        canManageUsers: false,
        canDeleteRecords: false
    },
    donor: {
        canRegisterAsDonor: true,  // Already a donor
        canCreateHospital: false,
        canViewHospitals: true,
        canViewDonors: true,
        canRequestBlood: true,
        canAccessAdmin: false,
        canManageUsers: false,
        canDeleteRecords: false
    },
    doctor: {
        canRegisterAsDonor: true,
        canCreateHospital: true,
        canViewHospitals: true,
        canViewDonors: true,
        canRequestBlood: true,
        canAccessAdmin: false,
        canManageUsers: false,
        canDeleteRecords: false
    },
    hospital: {
        canRegisterAsDonor: true,
        canCreateHospital: true,
        canViewHospitals: true,
        canViewDonors: true,
        canRequestBlood: true,
        canAccessAdmin: false,
        canManageUsers: false,
        canDeleteRecords: false
    },
    admin: {
        canRegisterAsDonor: true,
        canCreateHospital: true,
        canViewHospitals: true,
        canViewDonors: true,
        canRequestBlood: true,
        canAccessAdmin: true,
        canManageUsers: true,
        canDeleteRecords: true
    }
};

// Full access roles (doctor, hospital, admin)
const FULL_ACCESS_ROLES = ['doctor', 'hospital', 'admin'];

/**
 * Get the current user's role from session storage
 * @returns {string|null} The user's role or null if not logged in
 */
function getCurrentUserRole() {
    return sessionStorage.getItem('bl_role') || null;
}

/**
 * Check if the current user has a specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean} True if user has one of the specified roles
 */
function hasRole(roles) {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    
    if (Array.isArray(roles)) {
        return roles.includes(currentRole);
    }
    return currentRole === roles;
}

/**
 * Check if the current user has full access (doctor, hospital, or admin)
 * @returns {boolean} True if user has full access
 */
function hasFullAccess() {
    return hasRole(FULL_ACCESS_ROLES);
}

/**
 * Check if the current user can perform a specific action
 * @param {string} action - The action to check (e.g., 'canCreateHospital')
 * @returns {boolean} True if the user can perform the action
 */
function canAccess(action) {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    
    const permissions = ROLE_PERMISSIONS[currentRole];
    if (!permissions) return false;
    
    return permissions[action] === true;
}

/**
 * Check access and show/hide elements based on permissions
 * Called automatically on page load for elements with data-requires-role or data-requires-access attributes
 */
function checkAccess() {
    const currentRole = getCurrentUserRole();
    
    // Hide/show elements based on data-requires-role attribute
    document.querySelectorAll('[data-requires-role]').forEach(el => {
        const requiredRoles = el.getAttribute('data-requires-role').split(',').map(r => r.trim());
        if (!hasRole(requiredRoles)) {
            el.style.display = 'none';
            el.setAttribute('data-hidden-by-rbac', 'true');
        }
    });
    
    // Hide/show elements based on data-requires-access attribute
    document.querySelectorAll('[data-requires-access]').forEach(el => {
        const action = el.getAttribute('data-requires-access');
        if (!canAccess(action)) {
            el.style.display = 'none';
            el.setAttribute('data-hidden-by-rbac', 'true');
        }
    });
    
    // Hide elements that should not be visible to current role
    document.querySelectorAll('[data-hide-from-role]').forEach(el => {
        const hiddenRoles = el.getAttribute('data-hide-from-role').split(',').map(r => r.trim());
        if (hasRole(hiddenRoles)) {
            el.style.display = 'none';
            el.setAttribute('data-hidden-by-rbac', 'true');
        }
    });
}

/**
 * Enforce access control for hospital creation
 * Blocks patients and donors from creating hospitals
 * @returns {boolean} True if user can create hospital
 */
function enforceHospitalCreationAccess() {
    if (!canAccess('canCreateHospital')) {
        const currentRole = getCurrentUserRole();
        showAccessDeniedMessage(currentRole, 'create or add hospital entries');
        return false;
    }
    return true;
}

/**
 * Enforce access control for donor registration
 * Blocks patients from registering as donors
 * @returns {boolean} True if user can register as donor
 */
function enforceDonorRegistrationAccess() {
    if (!canAccess('canRegisterAsDonor')) {
        const currentRole = getCurrentUserRole();
        showAccessDeniedMessage(currentRole, 'register as a donor');
        return false;
    }
    return true;
}

/**
 * Enforce access control for admin features
 * Blocks all except admin from accessing admin features
 * @returns {boolean} True if user can access admin features
 */
function enforceAdminAccess() {
    if (!canAccess('canAccessAdmin')) {
        const currentRole = getCurrentUserRole();
        showAccessDeniedMessage(currentRole, 'access admin features');
        return false;
    }
    return true;
}

/**
 * Show access denied message
 * @param {string} role - The user's current role
 * @param {string} action - The action they tried to perform
 */
function showAccessDeniedMessage(role, action) {
    console.warn(`[RBAC] Access Denied: User with role '${role}' attempted to ${action}`);
    
    // Show SweetAlert if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            html: `<p>You do not have permission to ${action}.</p>` +
                  `<p style="margin-top:10px;font-size:13px;color:#6b7280;">` +
                  `Your role: <strong>${role}</strong></p>` +
                  `<p style="font-size:12px;color:#9ca3af;margin-top:5px;">` +
                  `Only ${FULL_ACCESS_ROLES.join(', ')} roles can perform this action.</p>`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc2626',
            background: '#fff'
        });
    } else {
        alert(`Access Denied: You do not have permission to ${action}.\nYour role: ${role}`);
    }
}

/**
 * Redirect user if they don't have access to the current page
 * @param {string|string[]} requiredRoles - Roles allowed on this page
 * @param {string} redirectUrl - URL to redirect to if access denied
 */
function requireRole(requiredRoles, redirectUrl = 'home.html') {
    if (!hasRole(requiredRoles)) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'You do not have permission to access this page.',
                timer: 2000,
                showConfirmButton: false,
                background: '#fff'
            }).then(() => {
                window.location.href = redirectUrl;
            });
        } else {
            alert('Access Denied: You do not have permission to access this page.');
            window.location.href = redirectUrl;
        }
        return false;
    }
    return true;
}

/**
 * Initialize RBAC on page load
 * Automatically checks access and applies UI restrictions
 */
function initRBAC() {
    // Run access checks when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccess);
    } else {
        checkAccess();
    }
}

// Export functions for use in other modules
window.RBAC = {
    getCurrentUserRole,
    hasRole,
    hasFullAccess,
    canAccess,
    checkAccess,
    enforceHospitalCreationAccess,
    enforceDonorRegistrationAccess,
    enforceAdminAccess,
    requireRole,
    initRBAC,
    FULL_ACCESS_ROLES,
    ROLE_PERMISSIONS
};

// Auto-initialize RBAC when script loads
initRBAC();