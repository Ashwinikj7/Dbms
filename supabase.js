import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://zqsehpfbmoapuygdqjai.supabase.co',
  'sb_publishable_hr3AIQbkYesPVNO_4aIrYQ_lMFSSA-T'
)

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', fetchData)

async function fetchData() {
  // Fetch donors data
  const { data: donorsData, error: donorsError } = await supabase
    .from('donors')
    .select('*')

  console.log("DONORS DATA:", donorsData)
  console.log("DONORS ERROR:", donorsError)

  // Fetch hospitals data
  const { data: hospData, error: hospError } = await supabase
    .from('hospitals')
    .select('*')

  console.log("HOSPITALS DATA:", hospData)
  console.log("HOSPITALS ERROR:", hospError)

  // Get the correct container based on which page we're on
  const donorContainer = document.getElementById('donorList') || document.getElementById('donorGrid')
  const hospContainer = document.getElementById('hospGrid')

  // Render donors if container exists
  if (donorContainer && donorsData && !donorsError) {
    donorContainer.innerHTML = ""
    
    if (donorsData.length === 0) {
      donorContainer.innerHTML = '<p>No donors found in database.</p>'
    } else {
      donorsData.forEach(donor => {
        const div = document.createElement('div')
        div.style.cssText = 'background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:12px;'
        div.innerHTML = `
          <h3 style="margin:0 0 8px 0;">${donor.name || 'Unknown'}</h3>
          <p style="margin:4px 0;"><strong>Blood Group:</strong> ${donor.blood_group || 'N/A'}</p>
          <p style="margin:4px 0;"><strong>City:</strong> ${donor.city || 'N/A'}</p>
          ${donor.phone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${donor.phone}</p>` : ''}
          ${donor.age ? `<p style="margin:4px 0;"><strong>Age:</strong> ${donor.age}</p>` : ''}
        `
        donorContainer.appendChild(div)
      })
    }
    
    // Update count if element exists
    const donorCountEl = document.getElementById('donorCount')
    if (donorCountEl) {
      donorCountEl.textContent = `${donorsData.length} donor${donorsData.length !== 1 ? 's' : ''} found`
    }
  } else if (donorContainer && donorsError) {
    donorContainer.innerHTML = '<p style="color:var(--red);">Error loading donors. Check console for details.</p>'
  }

  // Render hospitals if container exists
  if (hospContainer && hospData && !hospError) {
    hospContainer.innerHTML = ""
    
    if (hospData.length === 0) {
      hospContainer.innerHTML = '<p>No hospitals found in database.</p>'
    } else {
      hospData.forEach(hosp => {
        const card = document.createElement('div')
        card.className = 'hosp-card'
        card.innerHTML = `
          <div class="hosp-card-top">
            <div class="hosp-icon">🏥</div>
            <div class="hosp-name">${hosp.name || 'Unknown Hospital'}</div>
            <div class="hosp-loc"><i class="bi bi-geo-alt-fill" style="color:var(--red);"></i>${hosp.address || 'Address not provided'}</div>
          </div>
          <div class="hosp-card-body">
            ${hosp.stored_units !== undefined ? `<div class="hosp-stat"><span class="hosp-stat-lbl">Blood Units in Stock</span><span class="hosp-stat-val" style="color:${hosp.stored_units<15?'var(--red)':hosp.stored_units<25?'var(--yellow)':'var(--green)'};">${hosp.stored_units} units</span></div>` : ''}
            ${hosp.needed_units !== undefined ? `<div class="hosp-stat"><span class="hosp-stat-lbl">Units Needed</span><span class="hosp-stat-val" style="color:var(--red);">${hosp.needed_units} units</span></div>` : ''}
            ${hosp.phone ? `<div class="hosp-stat"><span class="hosp-stat-lbl">Phone</span><span class="hosp-stat-val">${hosp.phone}</span></div>` : ''}
            ${hosp.email ? `<div class="hosp-stat"><span class="hosp-stat-lbl">Email</span><span class="hosp-stat-val" style="font-size:11px;">${hosp.email}</span></div>` : ''}
          </div>
          <div class="hosp-card-foot">
            <button class="btn btn-red btn-sm btn-full" onclick="requestBlood('${hosp.name || 'Hospital'}')">Request Blood</button>
            <button class="btn btn-outline btn-sm" onclick="viewHospital('${hosp.name || 'Hospital'}')"><i class="bi bi-eye"></i></button>
          </div>
        `
        hospContainer.appendChild(card)
      })
    }
    
    // Update count if element exists
    const hospCountEl = document.getElementById('hospCount')
    if (hospCountEl) {
      hospCountEl.textContent = `Showing ${hospData.length} hospitals`
    }
  } else if (hospContainer && hospError) {
    hospContainer.innerHTML = '<p style="color:var(--red);">Error loading hospitals. Check console for details.</p>'
  }
}

// Dynamic hospital filtering function - filters hospitals client-side
window.filterHospitals = async function() {
  // Get filter values from input fields
  const nameFilter = document.getElementById('hSearch')?.value?.trim().toLowerCase() || ''
  const cityFilter = document.getElementById('hCity')?.value?.trim().toLowerCase() || ''
  const statusFilter = document.getElementById('hStatus')?.value || ''
  
  console.log('Filtering hospitals with:', { nameFilter, cityFilter, statusFilter })
  
  // Get the hospital container
  const hospContainer = document.getElementById('hospGrid')
  const hospCountEl = document.getElementById('hospCount')
  
  if (!hospContainer) {
    console.error('Hospital grid container not found')
    return
  }
  
  // Get all hospital cards
  const allCards = Array.from(hospContainer.querySelectorAll('.hosp-card'))
  
  if (allCards.length === 0) {
    console.log('No hospital cards found to filter')
    return
  }
  
  let visibleCount = 0
  
  // Filter each hospital card
  allCards.forEach(card => {
    const nameText = card.querySelector('.hosp-name')?.textContent?.toLowerCase() || ''
    const addressText = card.querySelector('.hosp-loc')?.textContent?.toLowerCase() || ''
    
    // Check name filter
    const nameMatch = !nameFilter || nameText.includes(nameFilter)
    
    // Check city filter (search in address)
    const cityMatch = !cityFilter || addressText.includes(cityFilter)
    
    // Check status filter (for now, we'll show all since we don't have online/offline status in the data)
    const statusMatch = !statusFilter || statusFilter === 'online' // Default to showing all for now
    
    // Show or hide the card based on filters
    if (nameMatch && cityMatch && statusMatch) {
      card.style.display = 'block'
      visibleCount++
    } else {
      card.style.display = 'none'
    }
  })
  
  // Update count
  if (hospCountEl) {
    if (visibleCount === allCards.length) {
      hospCountEl.textContent = `Showing all ${visibleCount} hospitals`
    } else {
      hospCountEl.textContent = `Showing ${visibleCount} of ${allCards.length} hospitals`
    }
  }
  
  console.log(`Filtered: ${visibleCount} of ${allCards.length} hospitals visible`)
}

// Clear hospital filters and show all hospitals
window.clearHospFilter = function() {
  // Clear input fields
  const nameInput = document.getElementById('hSearch')
  const cityInput = document.getElementById('hCity')
  const statusSelect = document.getElementById('hStatus')
  
  if (nameInput) nameInput.value = ''
  if (cityInput) cityInput.value = ''
  if (statusSelect) statusSelect.value = ''
  
  // Trigger filter to show all
  filterHospitals()
}

// Dynamic donor filtering function - builds query based on filter inputs
window.filterDonors = async function() {
  // Get filter values from input fields
  const nameFilter = document.getElementById('dSearch')?.value?.trim() || ''
  const bloodGroupFilter = document.getElementById('dBlood')?.value || ''
  const cityFilter = document.getElementById('dCity')?.value?.trim() || ''
  const availFilter = document.getElementById('dAvail')?.value || ''
  
  console.log('Filtering donors with:', { nameFilter, bloodGroupFilter, cityFilter, availFilter })
  
  // Start building the Supabase query
  let query = supabase.from('donors').select('*')
  
  // Apply name filter using ilike for case-insensitive partial match
  if (nameFilter) {
    query = query.ilike('name', `%${nameFilter}%`)
  }
  
  // Apply blood group filter using exact match
  if (bloodGroupFilter) {
    query = query.eq('blood_group', bloodGroupFilter)
  }
  
  // Apply city filter using ilike for case-insensitive partial match
  if (cityFilter) {
    query = query.ilike('city', `%${cityFilter}%`)
  }
  
  // Apply availability filter
  if (availFilter === '1') {
    query = query.eq('is_available', true)
  } else if (availFilter === '0') {
    query = query.eq('is_available', false)
  }
  
  // Execute the filtered query
  try {
    const { data, error } = await query
    
    if (error) {
      console.error('Filter error:', error)
      return
    }
    
    // Get the donor container
    const donorContainer = document.getElementById('donorGrid') || document.getElementById('donorList')
    const donorCountEl = document.getElementById('donorCount')
    
    if (donorContainer) {
      donorContainer.innerHTML = ''
      
      if (!data || data.length === 0) {
        donorContainer.innerHTML = '<p style="color:var(--gray);text-align:center;padding:40px;">No donors found matching your criteria.</p>'
      } else {
        data.forEach(donor => {
          const div = document.createElement('div')
          div.className = 'donor-card'
          div.style.cssText = 'background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:22px;transition:var(--t);'
          div.innerHTML = `
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div class="donor-avatar">${(donor.name || '?').charAt(0).toUpperCase()}</div>
              <div style="flex:1;">
                <h3 style="margin:0 0 8px 0;font-size:16px;font-weight:800;">${donor.name || 'Unknown'}</h3>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
                  <span class="blood-pill">${donor.blood_group || 'N/A'}</span>
                  ${donor.is_available 
                    ? '<span style="font-size:11px;color:var(--green);font-weight:700;">✓ Available</span>' 
                    : '<span style="font-size:11px;color:var(--gray);font-weight:700;">✗ Unavailable</span>'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px;">
                  ${donor.city ? `<p style="margin:0;color:var(--gray);"><i class="bi bi-geo-alt-fill" style="color:var(--red);"></i> ${donor.city}</p>` : ''}
                  ${donor.age ? `<p style="margin:0;color:var(--gray);"><strong>Age:</strong> ${donor.age}</p>` : ''}
                  ${donor.phone ? `<p style="margin:0;color:var(--gray);"><i class="bi bi-telephone-fill"></i> ${donor.phone}</p>` : ''}
                  ${donor.weight ? `<p style="margin:0;color:var(--gray);"><strong>Weight:</strong> ${donor.weight}kg</p>` : ''}
                </div>
                ${donor.address ? `<p style="margin:8px 0 0 0;font-size:12px;color:var(--gray);"><i class="bi bi-geo-alt"></i> ${donor.address}</p>` : ''}
                ${donor.health_info && donor.health_info !== 'None' ? `<p style="margin:8px 0 0 0;font-size:11px;color:var(--gray);"><strong>Health:</strong> ${donor.health_info}</p>` : ''}
                <button class="btn btn-sm btn-outline" style="margin-top:12px;" onclick="contactThis(this,'${(donor.name || 'Donor').replace(/'/g, "\\'")}')">Contact</button>
              </div>
            </div>
          `
          donorContainer.appendChild(div)
        })
      }
      
      // Update count
      if (donorCountEl) {
        const count = data ? data.length : 0
        donorCountEl.textContent = `${count} donor${count !== 1 ? 's' : ''} found`
      }
    }
  } catch (error) {
    console.error('Error filtering donors:', error)
  }
}

// Clear all donor filters and reload all donors
window.clearDFilters = async function() {
  // Clear input fields
  const searchInput = document.getElementById('dSearch')
  const bloodSelect = document.getElementById('dBlood')
  const cityInput = document.getElementById('dCity')
  const availSelect = document.getElementById('dAvail')
  
  if (searchInput) searchInput.value = ''
  if (bloodSelect) bloodSelect.value = ''
  if (cityInput) cityInput.value = ''
  if (availSelect) availSelect.value = ''
  
  // Reload all donors
  await fetchData()
}

// Make functions globally available for buttons
window.requestBlood = function(name) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({icon:'info',title:'Redirecting…',text:`Opening emergency request for ${name}`,timer:1200,showConfirmButton:false,background:'#fff'})
      .then(()=>window.location.href='emergency.html');
  } else {
    window.location.href='emergency.html';
  }
}

window.viewHospital = function(name) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({title:name,text:'Full hospital profile — connect to backend API to load details.',icon:'info',background:'#fff'});
  } else {
    alert(name + ' - Full hospital profile');
  }
}

// Save donor registration data to Supabase
window.saveDonor = async function() {
  console.log('Starting donor registration...')
  
  // Get form values
  const name = document.getElementById('r_name').value
  const age = document.getElementById('r_age').value
  const email = document.getElementById('r_email').value
  const phone = document.getElementById('r_phone').value
  const blood = document.getElementById('r_blood').value
  const aadhar = document.getElementById('r_aadhar').value
  const weight = document.getElementById('r_weight').value
  const height = document.getElementById('r_height').value
  const city = document.getElementById('r_city').value
  const state = document.getElementById('r_state').value
  const pincode = document.getElementById('r_pin').value
  
  // Get selected ailments for health_info
  const ailments = []
  document.querySelectorAll('#ailmentPills .pill.checked').forEach(pill => {
    if (pill.textContent !== 'None') ailments.push(pill.textContent)
  })
  const ailmentsStr = ailments.length > 0 ? ailments.join(', ') : 'None'
  
  const allergy = document.getElementById('r_allergy').value
  const meds = document.getElementById('r_meds').value

  // Build health_info string
  const healthInfoParts = []
  if (allergy) healthInfoParts.push(`Allergies: ${allergy}`)
  if (meds) healthInfoParts.push(`Medications: ${meds}`)
  if (ailmentsStr !== 'None') healthInfoParts.push(`Conditions: ${ailmentsStr}`)
  const healthInfo = healthInfoParts.length > 0 ? healthInfoParts.join('; ') : 'None'
  
  // Build address string
  const address = state ? `${city}, ${state} ${pincode || ''}`.trim() : city

  console.log('Collected data:', { name, age, phone, blood, aadhar, weight, city, address, healthInfo })

  if (!name || !age || !phone || !blood || !aadhar || !weight || !city) {
    alert('Please fill in all required fields marked with *')
    return
  }

  try {
    console.log('Sending data to Supabase...')
    const { data, error } = await supabase
      .from('donors')
      .insert([{
        name: name,
        age: parseInt(age),
        email: email || null,
        phone: phone,
        blood_group: blood,
        aadhar: aadhar,
        weight: parseInt(weight),
        height: height ? parseInt(height) : null,
        city: city,
        address: address,
        health_info: healthInfo,
        is_available: true
      }])

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Donor saved successfully!')
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Registration Complete!',
        text: 'You are now a verified Pulse of Hope donor. Your data has been saved to the database.',
        background: '#fff'
      }).then(() => {
        // Switch to search tab and refresh data
        switchTab(0)
        fetchData()
      })
    } else {
      alert('Registration successful! Your data has been saved to the database.')
      switchTab(0)
      fetchData()
    }
  } catch (error) {
    console.error('Error saving donor:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: `Error: ${error.message || 'Failed to save data'}. Check browser console for details.`,
        background: '#fff',
        footer: `<small>Error code: ${error.code || 'UNKNOWN'}</small>`
      })
    } else {
      alert(`Error saving data: ${error.message}. Please check console for details.`)
    }
  }
}

// Save hospital data to Supabase
window.saveHospital = async function() {
  console.log('Starting hospital registration...')
  
  // Get form values
  const name = document.getElementById('h_name').value
  const address = document.getElementById('h_address').value
  const phone = document.getElementById('h_phone').value
  const email = document.getElementById('h_email').value
  const storedUnits = document.getElementById('h_stored').value
  const neededUnits = document.getElementById('h_needed').value

  console.log('Collected data:', { name, address, phone, email, storedUnits, neededUnits })

  // Validate required fields
  if (!name || !address || !phone || !storedUnits || !neededUnits) {
    alert('Please fill in all required fields marked with *')
    return
  }

  try {
    console.log('Sending data to Supabase...')
    const { data, error } = await supabase
      .from('hospitals')
      .insert([{
        name: name,
        address: address,
        phone: phone,
        email: email || null,
        stored_units: parseInt(storedUnits),
        needed_units: parseInt(neededUnits)
      }])

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Hospital saved successfully!')
    
    // Show success message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Hospital Added!',
        text: 'Hospital data has been saved to the database.',
        background: '#fff'
      }).then(() => {
        // Clear form and refresh data
        document.getElementById('hospitalForm').reset()
        fetchData()
      })
    } else {
      alert('Hospital data saved successfully!')
      document.getElementById('hospitalForm').reset()
      fetchData()
    }
  } catch (error) {
    console.error('Error saving hospital:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: `Error: ${error.message || 'Failed to save data'}. Check browser console for details.`,
        background: '#fff',
        footer: `<small>Error code: ${error.code || 'UNKNOWN'}</small>`
      })
    } else {
      alert(`Error saving hospital data: ${error.message}. Please check console for details.`)
    }
  }
}

// Verify uploaded document using OCR backend
window.verifyDocument = async function() {
  const fileInput = document.getElementById('documentUpload');
  const statusDiv = document.getElementById('verificationStatus');
  const verifyBtn = document.getElementById('verifyBtn');

  // Check if file is selected
  if (!fileInput.files || fileInput.files.length === 0) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select an image file (JPEG or PNG) to verify.',
        background: '#fff'
      });
    } else {
      alert('Please select an image file (JPEG or PNG) to verify.');
    }
    return;
  }

  const file = fileInput.files[0];

  // Validate file type
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Only JPEG and PNG files are allowed.',
        background: '#fff'
      });
    } else {
      alert('Only JPEG and PNG files are allowed.');
    }
    return;
  }

  // Show loading state
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = '<i class="bi bi-arrow-repeat bi-spin"></i> Verifying...';
  statusDiv.style.display = 'block';
  statusDiv.innerHTML = '<span style="color:var(--gray);"><i class="bi bi-hourglass-split"></i> Processing document...</span>';

  try {
    // Create FormData and append file
    const formData = new FormData();
    formData.append('document', file);

    // Send POST request to backend
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // Handle response
    if (response.ok && result.success) {
      // Success
      let icon = 'success';
      let message = result.message;
      let color = 'var(--green)';

      if (result.type === 'aadhar') {
        icon = 'success';
        color = 'var(--green)';
      } else if (result.type === 'medical') {
        icon = 'info';
        color = 'var(--blue)';
      }

      statusDiv.innerHTML = `<span style="color:${color};"><i class="bi bi-check-circle-fill"></i> ${message}</span>`;

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: icon,
          title: 'Document Verified!',
          text: message,
          background: '#fff',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        alert(message);
      }
    } else {
      // Document not recognized or error
      statusDiv.innerHTML = `<span style="color:var(--red);"><i class="bi bi-x-circle-fill"></i> ${result.message || 'Verification failed'}</span>`;

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: result.message || 'Could not verify document. Please try again.',
          background: '#fff'
        });
      } else {
        alert(result.message || 'Could not verify document. Please try again.');
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    statusDiv.innerHTML = `<span style="color:var(--red);"><i class="bi bi-x-circle-fill"></i> Error: ${error.message}</span>`;

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: `Could not connect to verification server. Make sure the backend is running on port 5000. Error: ${error.message}`,
        background: '#fff',
        footer: '<small>Run: npm start</small>'
      });
    } else {
      alert(`Could not connect to verification server. Make sure the backend is running on port 5000.\nError: ${error.message}`);
    }
  } finally {
    // Reset button state
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = '<i class="bi bi-search"></i> Verify Document';
  }
};

// Save emergency blood request to Supabase
// Inserts into blood_requests table with exact column names
window.saveEmergencyRequest = async function(event) {
  // Prevent page reload if called from form submit
  if (event) {
    event.preventDefault()
  }

  console.log('Starting emergency blood request submission...')

  // Get form input values
  const bloodGroupNeeded = document.getElementById('e_blood')?.value || ''
  const unitsRequired = document.getElementById('e_units')?.value || ''
  const urgencyLevel = document.getElementById('e_urgency')?.value || ''
  const hospitalName = document.getElementById('e_hospital')?.value || ''
  const patientName = document.getElementById('e_patient')?.value || ''
  const contactNumber = document.getElementById('e_contact')?.value || ''
  const altContact = document.getElementById('e_alt_contact')?.value || ''
  const additionalNotes = document.getElementById('e_notes')?.value || ''

  console.log('Collected form data:', {
    bloodGroupNeeded,
    unitsRequired,
    urgencyLevel,
    hospitalName,
    patientName,
    contactNumber
  })

  // Validate required fields
  if (!bloodGroupNeeded || !unitsRequired || !urgencyLevel || !hospitalName || !patientName || !contactNumber) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields marked with *',
        background: '#fff'
      })
    } else {
      alert('Please fill in all required fields marked with *')
    }
    return
  }

  try {
    // First, try to find the hospital_id by hospital name
    // If hospital doesn't exist, we'll create a placeholder entry
    let hospitalId = null
    
    const { data: hospitalData, error: hospitalError } = await supabase
      .from('hospitals')
      .select('hospital_id')
      .ilike('name', `%${hospitalName}%`)
      .single()

    if (hospitalError && hospitalError.code !== 'PGRST116') {
      console.error('Error finding hospital:', hospitalError)
    }

    if (hospitalData && hospitalData.hospital_id) {
      hospitalId = hospitalData.hospital_id
      console.log('Found existing hospital with ID:', hospitalId)
    } else {
      // Create a new hospital entry if not found
      console.log('Hospital not found, creating new entry...')
      const { data: newHospital, error: newHospitalError } = await supabase
        .from('hospitals')
        .insert([{
          name: hospitalName,
          address: 'Address not provided',
          phone: contactNumber,
          stored_units: 0,
          needed_units: parseInt(unitsRequired)
        }])
        .select('hospital_id')
        .single()

      if (newHospitalError) {
        console.error('Error creating hospital:', newHospitalError)
        // Use a default hospital_id of 1 if creation fails
        hospitalId = 1
      } else {
        hospitalId = newHospital.hospital_id
        console.log('Created new hospital with ID:', hospitalId)
      }
    }

    // Get today's date in YYYY-MM-DD format for request_date
    const today = new Date().toISOString().split('T')[0]
    
    // Set donation_date to tomorrow (or same day for critical cases)
    const donationDate = urgencyLevel === 'critical' 
      ? today 
      : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    console.log('Inserting blood request with hospital_id:', hospitalId)

    // Insert into blood_requests table with exact column names
    const { data, error } = await supabase
      .from('blood_requests')
      .insert([{
        hospital_id: hospitalId,
        blood_group_needed: bloodGroupNeeded,
        units_required: parseInt(unitsRequired),
        request_date: today,
        urgency_level: urgencyLevel,
        donation_date: donationDate,
        status: true  // Set status to TRUE by default
      }])

    if (error) {
      console.error('Supabase error inserting blood request:', error)
      throw error
    }

    console.log('Blood request saved successfully! Data:', data)

    // Show success message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Request Submitted Successfully!',
        text: `Emergency blood request for ${patientName} (${bloodGroupNeeded}, ${unitsRequired} units) has been submitted. Hospitals will be notified immediately.`,
        background: '#fff',
        timer: 3000,
        showConfirmButton: true
      }).then(() => {
        // Reset form after successful submission
        document.getElementById('emergencyForm')?.reset()
      })
    } else {
      alert('Request submitted successfully!')
      document.getElementById('emergencyForm')?.reset()
    }
  } catch (error) {
    console.error('Error saving emergency blood request:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))

    // Show error message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: `Error: ${error.message || 'Failed to submit request'}. Please try again or contact support.`,
        background: '#fff',
        footer: `<small>Error code: ${error.code || 'UNKNOWN'}</small>`
      })
    } else {
      alert(`Error submitting request: ${error.message}. Please check console for details.`)
    }
  }
}
