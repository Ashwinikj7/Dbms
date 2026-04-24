
SELECT *
FROM donors
WHERE LOWER(name) LIKE LOWER('%rahul%');


SELECT *
FROM donors
WHERE blood_group = 'O+';


SELECT *
FROM donors
WHERE LOWER(city) LIKE LOWER('%bangalore%');


SELECT *
FROM donors
WHERE is_available = true;


SELECT *
FROM donors
WHERE 
    LOWER(name) LIKE LOWER('%rahul%')
    AND blood_group = 'O+'
    AND LOWER(city) LIKE LOWER('%bangalore%')
    AND is_available = true;

SELECT blood_group, COUNT(*) as available_count
FROM donors
WHERE is_available = true
GROUP BY blood_group
ORDER BY available_count DESC;


SELECT *
FROM donors
WHERE blood_group IN ('O+', 'A+', 'B+')
  AND is_available = true;

-- Find donors by age range and availability
SELECT *
FROM donors
WHERE age BETWEEN 18 AND 65
  AND is_available = true
  AND weight >= 50;


SELECT donor_id, name, age, blood_group, city, phone
FROM donors
WHERE is_available = true
  AND blood_group = 'O+'
  AND LOWER(city) LIKE LOWER('%mangalore%')
ORDER BY age ASC;



INSERT INTO blood_requests 
(hospital_id, blood_group_needed, units_required, request_date, urgency_level, donation_date, status)
VALUES 
(1, 'O+', 2, '2026-04-21', 'High', '2026-04-22', TRUE);

-- Another example with different values
INSERT INTO blood_requests 
(hospital_id, blood_group_needed, units_required, request_date, urgency_level, donation_date, status)
VALUES 
(2, 'A-', 3, '2026-04-21', 'Critical', '2026-04-21', TRUE);


SELECT 
    br.request_id,
    h.name as hospital_name,
    br.blood_group_needed,
    br.units_required,
    br.request_date,
    br.urgency_level,
    br.donation_date,
    br.status
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
ORDER BY br.request_date DESC;

SELECT 
    br.request_id,
    h.name as hospital_name,
    br.blood_group_needed,
    br.units_required,
    br.urgency_level,
    br.request_date
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
WHERE br.status = TRUE 
  AND br.urgency_level IN ('Critical', 'Urgent')
ORDER BY br.request_date DESC;