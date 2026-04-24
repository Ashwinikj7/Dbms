CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    name TEXT,
    age INT,
    email TEXT,
    aadhar TEXT,
    phone TEXT,
    blood_group TEXT,
    ailments TEXT,
    is_available BOOLEAN,
    address TEXT,
    weight INT,
    height INT
);

CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    stored_units INT,
    needed_units INT
);

CREATE TABLE blood_requests (
    request_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES hospitals(hospital_id),
    blood_group_needed TEXT,
    units_required INT,
    request_date DATE,
    urgency_level TEXT,
    donation_date DATE,
    status BOOLEAN
);

CREATE TABLE contact_log (
    contact_id SERIAL PRIMARY KEY,
    donor_id INT REFERENCES donors(donor_id),
    request_id INT REFERENCES blood_requests(request_id),
    contact_date DATE,
    responded BOOLEAN
);

CREATE TABLE donation_history (
    donation_id SERIAL PRIMARY KEY,
    donor_id INT REFERENCES donors(donor_id),
    hospital_id INT REFERENCES hospitals(hospital_id),
    date DATE,
    units_donated INT
);
-- Combined dynamic filter
SELECT *
FROM donors
WHERE 
    LOWER(name) LIKE LOWER(CONCAT('%', :name, '%'))
AND (blood_group = :blood_group OR :blood_group IS NULL)
AND LOWER(address) LIKE LOWER(CONCAT('%', :city, '%'))
AND is_available = TRUE;
