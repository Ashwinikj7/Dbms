/**
 * Pulse of Hope - Authentication Backend Integration
 * 
 * This file handles all authentication operations with Supabase:
 * - Doctor signup/login
 * - Patient signup/login
 * - Donor signup/login
 * - Admin signup/login
 * - Login history tracking
 * 
 * IMPORTANT: This file works alongside the existing index.html
 * without modifying the UI or frontend validation logic.
 */

// Supabase client configuration
const SUPABASE_URL = 'https://zqsehpfbmoapuygdqjai.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hr3AIQbkYesPVNO_4aIrYQ_lMFSSA-T';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Store generated OTPs for verification
const otpStore = {};

/**
 * ========================================
 * SIGNUP FUNCTIONS
 * ========================================
 */

/**
 * Doctor Signup
 * Inserts data into doctors_auth table
 */
async function doctorSignup(formData) {
    try {
        const { data, error } = await supabase
            .from('doctors_auth')
            .insert([{
                doctor_id: formData.doctor_id,
                full_name: formData.full_name,
                licence_no: formData.licence_no,
                hospital_name: formData.hospital_name,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                specialization: formData.specialization || null,
                password: formData.password
            }]);

        if (error) throw error;
        return { success: true, message: 'Doctor account created successfully!' };
    } catch (error) {
        console.error('Doctor signup error:', error);
        if (error.code === '23505') {
            return { success: false, message: 'Doctor ID already exists. Please use a unique ID.' };
        }
        return { success: false, message: `Registration failed: ${error.message}` };
    }
}

/**
 * Patient Signup
 * Inserts data into patients_auth table
 */
async function patientSignup(formData) {
    try {
        const { data, error } = await supabase
            .from('patients_auth')
            .insert([{
                full_name: formData.full_name,
                age: parseInt(formData.age),
                aadhar_number: formData.aadhar_number,
                phone: formData.phone,
                email: formData.email || null,
                blood_group: formData.blood_group,
                hospital_name: formData.hospital_name || null,
                city: formData.city,
                urgency: formData.urgency
            }]);

        if (error) throw error;
        return { success: true, message: 'Patient account created successfully!' };
    } catch (error) {
        console.error('Patient signup error:', error);
        if (error.code === '23505') {
            return { success: false, message: 'Aadhar number already registered. Please login or use a different Aadhar.' };
        }
        return { success: false, message: `Registration failed: ${error.message}` };
    }
}

/**
 * Donor Signup
 * Inserts data into donors_auth table
 */
async function donorSignup(formData) {
    try {
        const { data, error } = await supabase
            .from('donors_auth')
            .insert([{
                full_name: formData.full_name,
                age: parseInt(formData.age),
                aadhar_number: formData.aadhar_number,
                email: formData.email,
                phone: formData.phone,
                blood_group: formData.blood_group,
                city: formData.city,
                password: formData.password
            }]);

        if (error) throw error;
        return { success: true, message: 'Donor account created successfully!' };
    } catch (error) {
        console.error('Donor signup error:', error);
        if (error.code === '23505') {
            return { success: false, message: 'Aadhar number already registered. Please login or use a different Aadhar.' };
        }
        return { success: false, message: `Registration failed: ${error.message}` };
    }
}

/**
 * Admin Signup
 * Inserts data into admins_auth table
 */
async function adminSignup(formData) {
    try {
        const { data, error } = await supabase
            .from('admins_auth')
            .insert([{
                admin_id: formData.admin_id,
                phone: formData.phone || null,
                email: formData.email || null,
                password: formData.password
            }]);

        if (error) throw error;
        return { success: true, message: 'Admin account created successfully!' };
    } catch (error) {
        console.error('Admin signup error:', error);
        if (error.code === '23505') {
            return { success: false, message: 'Admin ID already exists. Please use a unique ID.' };
        }
        return { success: false, message: `Registration failed: ${error.message}` };
    }
}

/**
 * ========================================
 * LOGIN FUNCTIONS
 * ========================================
 */

/**
 * Doctor Login
 * Matches doctor_id and password from doctors_auth table
 */
async function doctorLogin(doctorId, password) {
    try {
        const { data, error } = await supabase
            .from('doctors_auth')
            .select('doctor_id, password, full_name')
            .eq('doctor_id', doctorId)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, message: 'Invalid Doctor ID or Password.' };
        }

        // Log the login
        await logLogin('doctor', doctorId);

        return { 
            success: true, 
            message: `Welcome back, ${data.full_name || 'Doctor'}!`,
            user: data
        };
    } catch (error) {
        console.error('Doctor login error:', error);
        return { success: false, message: 'Login failed. Please check your credentials.' };
    }
}

/**
 * Patient Login
 * Matches aadhar_number from patients_auth table
 */
async function patientLogin(aadharNumber) {
    try {
        const { data, error } = await supabase
            .from('patients_auth')
            .select('aadhar_number, full_name, phone')
            .eq('aadhar_number', aadharNumber)
            .single();

        if (error || !data) {
            return { success: false, message: 'No patient found with this Aadhar number.' };
        }

        // Log the login
        await logLogin('patient', aadharNumber);

        return { 
            success: true, 
            message: `Welcome back, ${data.full_name || 'Patient'}!`,
            user: data
        };
    } catch (error) {
        console.error('Patient login error:', error);
        return { success: false, message: 'Login failed. Please check your credentials.' };
    }
}

/**
 * Donor Login
 * Matches aadhar_number and password from donors_auth table
 */
async function donorLogin(aadharNumber, password) {
    try {
        const { data, error } = await supabase
            .from('donors_auth')
            .select('aadhar_number, password, full_name')
            .eq('aadhar_number', aadharNumber)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, message: 'Invalid Aadhar number or Password.' };
        }

        // Log the login
        await logLogin('donor', aadharNumber);

        return { 
            success: true, 
            message: `Welcome back, ${data.full_name || 'Donor'}!`,
            user: data
        };
    } catch (error) {
        console.error('Donor login error:', error);
        return { success: false, message: 'Login failed. Please check your credentials.' };
    }
}

/**
 * Admin Login
 * Matches admin_id and password from admins_auth table
 * Uses safe query pattern to avoid 406 errors
 */
async function adminLogin(adminId, password) {
    try {
        const { data, error } = await supabase
            .from('admins_auth')
            .select('admin_id, password, full_name')
            .eq('admin_id', adminId)
            .eq('password', password);

        // Safe pattern: check data array length instead of using .single()
        if (error || !data || data.length === 0) {
            return { success: false, message: 'Invalid Admin ID or Password.' };
        }

        // Log the login
        await logLogin('admin', adminId);

        return { 
            success: true, 
            message: 'Welcome back, Admin!',
            user: data[0]
        };
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, message: 'Login failed. Please check your credentials.' };
    }
}

/**
 * ========================================
 * LOGIN HISTORY
 * ========================================
 */

/**
 * Log a successful login into login_history table
 */
async function logLogin(role, userIdentifier) {
    try {
        await supabase
            .from('login_history')
            .insert([{
                role: role,
                user_identifier: userIdentifier
            }]);
        console.log(`Login logged: ${role} - ${userIdentifier}`);
    } catch (error) {
        console.error('Failed to log login:', error);
        // Don't fail the login if logging fails
    }
}

/**
 * ========================================
 * OTP FUNCTIONS
 * ========================================
 */

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to patient's phone (simulated)
 * In production, this would integrate with an SMS service
 */
function sendOTPPatientSignin(phone, aadhar) {
    const otp = generateOTP();
    otpStore[aadhar] = otp;
    
    // Show OTP in SweetAlert for demo purposes
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'OTP Sent!',
            html: `<div style="font-size:15px;">OTP sent to <b>+91 ${phone}</b><br><br><span style="color:#6b7280;font-size:13px;">For demo purposes, your OTP is:</span><br><span style="font-size:2rem;font-weight:900;color:#dc2626;letter-spacing:6px;">${otp}</span></div>`,
            confirmButtonColor: '#dc2626',
            background: '#fff'
        });
    }
    
    return otp;
}

/**
 * Send OTP for patient signup
 */
function sendOTPSignup(phone) {
    const otp = generateOTP();
    otpStore[phone] = otp;
    
    // Show OTP in SweetAlert for demo purposes
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'OTP Sent!',
            html: `<div style="font-size:15px;">OTP sent to <b>+91 ${phone}</b><br><br><span style="color:#6b7280;font-size:13px;">For demo purposes, your OTP is:</span><br><span style="font-size:2rem;font-weight:900;color:#dc2626;letter-spacing:6px;">${otp}</span></div>`,
            confirmButtonColor: '#dc2626',
            background: '#fff'
        });
    }
    
    return otp;
}

/**
 * ========================================
 * UI HELPER FUNCTIONS
 * ========================================
 */

/**
 * Show error message in signin form
 */
function showSigninError(msg) {
    const b = document.getElementById('signinError');
    document.getElementById('signinErrorMsg').textContent = msg;
    b.classList.add('show');
    document.getElementById('signinSuccess').classList.remove('show');
}

/**
 * Show success message in signin form
 */
function showSigninSuccess(msg) {
    const b = document.getElementById('signinSuccess');
    document.getElementById('signinSuccessMsg').textContent = msg;
    b.classList.add('show');
    document.getElementById('signinError').classList.remove('show');
}

/**
 * Show error message in signup form
 */
function showSignupError(msg) {
    const b = document.getElementById('signupError');
    document.getElementById('signupErrorMsg').textContent = msg;
    b.classList.add('show');
}

/**
 * Hide all error/success messages
 */
function hideAllErrors() {
    ['signinError', 'signinSuccess', 'signupError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
}

/**
 * ========================================
 * FORM HANDLERS (Override existing ones)
 * ========================================
 */

/**
 * Handle Sign In with Supabase backend
 * This replaces the existing handleSignin function
 */
window.handleSignin = async function(role) {
    hideAllErrors();
    
    if (role === 'doctor') {
        const id = document.getElementById('d-id').value.trim();
        const licence = document.getElementById('d-licence').value.trim();
        const pass = document.getElementById('d-pass').value;
        
        if (!id || !licence || !pass) {
            showSigninError('Please enter your Doctor ID, Licence No and Password.');
            return;
        }
        if (licence.length < 5) {
            showSigninError('Please enter a valid Doctor Licence Number (min. 5 characters).');
            return;
        }
        if (!uploadVerified['si-d-licence-file']) {
            showSigninError('Please upload your Licence document before signing in.');
            return;
        }
        
        // Call Supabase login
        const result = await doctorLogin(id, pass);
        if (!result.success) {
            showSigninError(result.message);
            return;
        }
        
        // Success - store session and redirect
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', result.user.full_name || id);
        sessionStorage.setItem('bl_doctor_id', id);
        
        showSigninSuccess('Verified! Redirecting as Doctor…');
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: `Signed in successfully as Doctor`,
                timer: 1400,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'hospital.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'hospital.html';
            }, 1500);
        }
        
    } else if (role === 'patient') {
        const aadhar = document.getElementById('p-aadhar').value.replace(/\s/g, '');
        const phone = document.getElementById('p-phone-si').value.replace(/\D/g, '');
        const otp = document.getElementById('p-otp').value.trim();
        
        if (aadhar.length !== 12) {
            showSigninError('Please enter a valid 12-digit Aadhar number.');
            return;
        }
        if (!uploadVerified['si-p-aadhar-file']) {
            showSigninError('Please upload your Aadhar card before signing in.');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSigninError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (!otp) {
            showSigninError('Please enter the OTP sent to your registered mobile.');
            return;
        }
        if (!otpStore[aadhar]) {
            showSigninError('No OTP sent yet. Please click "Send OTP" first.');
            return;
        }
        if (otp !== otpStore[aadhar]) {
            showSigninError('Incorrect OTP. Please check and try again.');
            return;
        }
        
        // Call Supabase login (verify patient exists)
        const result = await patientLogin(aadhar);
        if (!result.success) {
            showSigninError(result.message);
            return;
        }
        
        // Success - store session and redirect
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', result.user.full_name || 'Patient');
        sessionStorage.setItem('bl_aadhar', aadhar);
        
        showSigninSuccess('Verified! Redirecting as Patient…');
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: `Signed in successfully as Patient`,
                timer: 1400,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'home.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        }
        
    } else if (role === 'donor') {
        const aadhar = document.getElementById('dn-aadhar').value.replace(/\s/g, '');
        const phone = document.getElementById('dn-phone-si').value.replace(/\D/g, '');
        const pass = document.getElementById('dn-pass').value;
        
        if (aadhar.length !== 12) {
            showSigninError('Please enter a valid 12-digit Aadhar number.');
            return;
        }
        if (!uploadVerified['si-dn-aadhar-file']) {
            showSigninError('Please upload your Aadhar card before signing in.');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSigninError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (!pass) {
            showSigninError('Please enter your Password.');
            return;
        }
        
        // Call Supabase login
        const result = await donorLogin(aadhar, pass);
        if (!result.success) {
            showSigninError(result.message);
            return;
        }
        
        // Success - store session and redirect
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', result.user.full_name || 'Donor');
        sessionStorage.setItem('bl_aadhar', aadhar);
        
        showSigninSuccess('Verified! Redirecting as Donor…');
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: `Signed in successfully as Donor`,
                timer: 1400,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'home.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        }
        
    } else if (role === 'admin') {
        const id = document.getElementById('a-user').value.trim();
        const phone = document.getElementById('a-phone-si').value.replace(/\D/g, '');
        const pass = document.getElementById('a-pass').value;
        
        if (!id || !pass) {
            showSigninError('Please enter your Admin ID and Password.');
            return;
        }
        if (!uploadVerified['si-a-card-file']) {
            showSigninError('Please upload your Admin ID card before signing in.');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSigninError('Please enter a valid 10-digit phone number.');
            return;
        }
        
        // Call Supabase login
        const result = await adminLogin(id, pass);
        if (!result.success) {
            showSigninError(result.message);
            return;
        }
        
        // Success - store session and redirect
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', 'System Admin');
        sessionStorage.setItem('bl_admin_id', id);
        
        showSigninSuccess('Verified! Redirecting as Admin…');
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: `Signed in successfully as Admin`,
                timer: 1400,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'admin.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        }
    }
};

/**
 * Handle Sign Up with Supabase backend
 * This replaces the existing handleSignup function
 */
window.handleSignup = async function(role) {
    hideAllErrors();
    
    if (role === 'doctor') {
        const name = document.getElementById('sd-name').value.trim();
        const age = document.getElementById('sd-age').value;
        const docId = document.getElementById('sd-docid').value.trim();
        const hospital = document.getElementById('sd-hospital').value.trim();
        const email = document.getElementById('sd-email').value.trim();
        const phone = document.getElementById('sd-phone').value.replace(/\D/g, '');
        const city = document.getElementById('sd-city').value.trim();
        const pass = document.getElementById('sd-pass').value;
        const licence = document.getElementById('sd-licence').value.trim();
        const spec = document.getElementById('sd-spec').value.trim();
        
        if (!name || !age || !docId || !licence || !hospital || !email || !phone || !city || !pass) {
            showSignupError('Please fill all required fields.');
            return;
        }
        if (licence.length < 5) {
            showSignupError('Please enter a valid Doctor Licence Number.');
            return;
        }
        if (!uploadVerified['su-d-licence-file']) {
            showSignupError('Please upload your Licence document to continue.');
            return;
        }
        if (!/^DOC\d+$/.test(docId.toUpperCase())) {
            showSignupError('Doctor ID must start with DOC followed by digits (e.g. DOC001).');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSignupError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showSignupError('Please enter a valid email address.');
            return;
        }
        if (pass.length < 8) {
            showSignupError('Password must be at least 8 characters long.');
            return;
        }
        
        // Call Supabase signup
        const result = await doctorSignup({
            doctor_id: docId.toUpperCase(),
            full_name: name,
            licence_no: licence,
            hospital_name: hospital,
            email: email,
            phone: phone,
            city: city,
            specialization: spec,
            password: pass
        });
        
        if (!result.success) {
            showSignupError(result.message);
            return;
        }
        
        // Success
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', name);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Your doctor account has been registered successfully.',
                timer: 1500,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'hospital.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'hospital.html';
            }, 1600);
        }
        
    } else if (role === 'patient') {
        const name = document.getElementById('sp-name').value.trim();
        const age = document.getElementById('sp-age').value;
        const aadhar = document.getElementById('sp-aadhar').value.replace(/\s/g, '');
        const phone = document.getElementById('sp-phone').value.replace(/\D/g, '');
        const blood = document.getElementById('sp-blood').value;
        const city = document.getElementById('sp-city').value.trim();
        const otp = document.getElementById('sp-otp').value.trim();
        const email = document.getElementById('sp-email').value.trim();
        const hospital = document.getElementById('sp-hospital').value.trim();
        const urgency = document.getElementById('sp-urgency').value;
        
        if (!name || !age || !aadhar || !phone || !blood || !city) {
            showSignupError('Please fill all required fields.');
            return;
        }
        if (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
            showSignupError('Aadhar number must be exactly 12 digits.');
            return;
        }
        if (!uploadVerified['su-p-aadhar-file']) {
            showSignupError('Please upload your Aadhar card to continue.');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSignupError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (!otp) {
            showSignupError('Please verify your phone number via OTP before registering.');
            return;
        }
        if (!otpStore[phone] || otp !== otpStore[phone]) {
            showSignupError('OTP is incorrect. Please request a new OTP.');
            return;
        }
        
        // Call Supabase signup
        const result = await patientSignup({
            full_name: name,
            age: age,
            aadhar_number: aadhar,
            phone: phone,
            email: email,
            blood_group: blood,
            hospital_name: hospital,
            city: city,
            urgency: urgency
        });
        
        if (!result.success) {
            showSignupError(result.message);
            return;
        }
        
        // Success
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', name);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Your patient account has been registered successfully.',
                timer: 1500,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'home.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1600);
        }
        
    } else if (role === 'donor') {
        const name = document.getElementById('sdn-name').value.trim();
        const age = document.getElementById('sdn-age').value;
        const aadhar = document.getElementById('sdn-aadhar').value.replace(/\s/g, '');
        const email = document.getElementById('sdn-email').value.trim();
        const phone = document.getElementById('sdn-phone').value.replace(/\D/g, '');
        const blood = document.getElementById('sdn-blood').value;
        const city = document.getElementById('sdn-city').value.trim();
        const pass = document.getElementById('sdn-pass').value;
        
        if (!name || !age || !aadhar || !email || !phone || !blood || !city || !pass) {
            showSignupError('Please fill all required fields.');
            return;
        }
        if (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
            showSignupError('Aadhar number must be exactly 12 digits.');
            return;
        }
        if (!uploadVerified['su-dn-aadhar-file']) {
            showSignupError('Please upload your Aadhar card to continue.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showSignupError('Please enter a valid email address.');
            return;
        }
        if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
            showSignupError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (pass.length < 8) {
            showSignupError('Password must be at least 8 characters long.');
            return;
        }
        if (parseInt(age) < 18 || parseInt(age) > 65) {
            showSignupError('Donors must be between 18 and 65 years old.');
            return;
        }
        
        // Call Supabase signup
        const result = await donorSignup({
            full_name: name,
            age: age,
            aadhar_number: aadhar,
            email: email,
            phone: phone,
            blood_group: blood,
            city: city,
            password: pass
        });
        
        if (!result.success) {
            showSignupError(result.message);
            return;
        }
        
        // Success
        sessionStorage.setItem('bl_role', role);
        sessionStorage.setItem('bl_name', name);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Your donor account has been registered successfully.',
                timer: 1500,
                showConfirmButton: false,
                background: '#fff',
                color: '#111827'
            }).then(() => {
                window.location.href = 'home.html';
            });
        } else {
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1600);
        }
    }
};

/**
 * Override OTP sending functions to use our implementation
 */
window.sendOTPPatientSignin = function() {
    const aadhar = document.getElementById('p-aadhar').value.replace(/\s/g, '');
    const phone = document.getElementById('p-phone-si').value.replace(/\D/g, '');
    
    if (aadhar.length !== 12) {
        showSigninError('Please enter a valid 12-digit Aadhar number first.');
        return;
    }
    if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
        showSigninError('Please enter a valid 10-digit phone number first.');
        return;
    }
    
    sendOTPPatientSignin(phone, aadhar);
    
    // Start countdown
    const btn = document.getElementById('p-otp-btn');
    btn.disabled = true;
    startCountdown('p-otp-timer', 'p-otp-btn', 60);
};

window.sendOTPSignup = function() {
    const phone = document.getElementById('sp-phone').value.replace(/\D/g, '');
    
    if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
        showSignupError('Please enter a valid 10-digit phone number first.');
        return;
    }
    
    sendOTPSignup(phone);
    
    // Start countdown
    const btn = document.getElementById('sp-otp-btn');
    btn.disabled = true;
    startCountdown('sp-otp-timer', 'sp-otp-btn', 60);
};

/**
 * Countdown timer for OTP resend
 */
function startCountdown(timerId, btnId, seconds) {
    const timerEl = document.getElementById(timerId);
    let remaining = seconds;
    
    const interval = setInterval(() => {
        remaining--;
        timerEl.textContent = `Resend OTP in ${remaining}s`;
        if (remaining <= 0) {
            clearInterval(interval);
            timerEl.textContent = '';
            document.getElementById(btnId).disabled = false;
        }
    }, 1000);
}

// Export functions for use in other modules if needed
export {
    doctorSignup,
    patientSignup,
    donorSignup,
    adminSignup,
    doctorLogin,
    patientLogin,
    donorLogin,
    adminLogin,
    logLogin,
    generateOTP,
    sendOTPPatientSignin,
    sendOTPSignup
};