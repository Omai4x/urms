import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend origin
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'urms_db',
    password: 'Omai4x',
    port: 5432,
});

// Database Connection Check
pool.on('connect', () => {
    console.log('Database connection established successfully.');
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Database CRUD Operations
async function createPendingStudent(studentData) {
    const client = await pool.connect();
    try {
        const sqlInsert = `
            INSERT INTO PendingStudents (
                first_name, last_name, date_of_birth, email,
                department_id, level_id, gender, phone_number, address,
                state_of_origin, local_government_area, profile_picture,
                intended_password
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING pending_student_id;
        `;
        const dateOfBirth = studentData.date_of_birth instanceof Date
            ? studentData.date_of_birth.toISOString().split('T')[0]
            : studentData.date_of_birth;
        const values = [
            studentData.first_name,
            studentData.last_name,
            dateOfBirth,
            studentData.email,
            studentData.department_id,
            studentData.level_id,
            studentData.gender,
            studentData.phone_number,
            studentData.address,
            studentData.state_of_origin,
            studentData.local_government_area,
            studentData.profile_picture || null,
            studentData.intended_password,
        ];
        const result = await client.query(sqlInsert, values);
        const generatedId = result.rows[0].pending_student_id;
        console.log(`Student with ID ${generatedId} inserted successfully into PendingStudents.`);
        return generatedId;
    } catch (error) {
        console.error('Error inserting student:', error);
        return null;
    } finally {
        client.release();
    }
}

async function getAllPendingStudents() {
    const client = await pool.connect();
    try {
        const sqlSelectAll = `
            SELECT
                pending_student_id, first_name, last_name, date_of_birth, email,
                department_id, level_id, gender, phone_number, address,
                state_of_origin, local_government_area, profile_picture,
                date_registered
            FROM PendingStudents;
        `;
        const result = await client.query(sqlSelectAll);
        console.log(`Retrieved ${result.rows.length} pending students.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving all pending students:', error);
        return [];
    } finally {
        client.release();
    }
}

async function getPendingStudentForProcessing(pendingStudentId) {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT
                pending_student_id, first_name, last_name, date_of_birth, email,
                department_id, level_id, gender, phone_number, address,
                state_of_origin, local_government_area, profile_picture,
                date_registered, intended_password
            FROM PendingStudents
            WHERE pending_student_id = $1;
        `;
        const result = await client.query(sqlSelect, [pendingStudentId]);
        if (result.rows.length > 0) {
            console.log(`Pending student ${pendingStudentId} found for processing.`);
            return result.rows[0];
        } else {
            console.log(`Pending student ${pendingStudentId} not found for processing.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving pending student for processing:', error);
        return null;
    } finally {
        client.release();
    }
}

async function recordAdmissionStatus(pendingStudentId, status, assignedMatricNumber, rejectionReason, processedByUserId) {
    const client = await pool.connect();
    try {
        const sqlInsert = `
            INSERT INTO AdmissionStatus (
                pending_student_id, status, assigned_matric_number,
                rejection_reason, processed_by_user_id
            ) VALUES (
                $1, $2, $3, $4, $5
            )
            RETURNING admission_status_id;
        `;
        const values = [
            pendingStudentId,
            status,
            assignedMatricNumber,
            rejectionReason,
            processedByUserId
        ];
        const result = await client.query(sqlInsert, values);
        const generatedAdmissionStatusId = result.rows[0].admission_status_id;
        console.log(generatedAdmissionStatusId);
        console.log(`Admission status recorded for pending student ${pendingStudentId}: ${status} with admission_status_id ${generatedAdmissionStatusId}`);
        return generatedAdmissionStatusId;
    } catch (error) {
        console.error('Error recording admission status:', error);
        return null;
    } finally {
        client.release();
    }
}

async function insertStudentIntoStudentsTable(pendingStudentData, matricNumber, admissionStatusId) {
    const client = await pool.connect();
    try {
        const sqlInsert = `
            INSERT INTO Students (
                admission_status_id, matriculation_number, first_name, last_name,
                date_of_birth, email, department_id, level_id, gender,
                phone_number, address, state_of_origin, local_government_area,
                profile_picture, date_of_admission
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP
            )
            RETURNING student_id;
        `;
        const values = [
            admissionStatusId,
            matricNumber,
            pendingStudentData.first_name,
            pendingStudentData.last_name,
            pendingStudentData.date_of_birth,
            pendingStudentData.email,
            pendingStudentData.department_id,
            pendingStudentData.level_id,
            pendingStudentData.gender,
            pendingStudentData.phone_number,
            pendingStudentData.address,
            pendingStudentData.state_of_origin,
            pendingStudentData.local_government_area,
            pendingStudentData.profile_picture
        ];
        const result = await client.query(sqlInsert, values);
        const generatedStudentId = result.rows[0].student_id;
        console.log(`Student record created in Students table with ID: ${generatedStudentId}, linked to AdmissionStatus ID: ${admissionStatusId}`);
        return generatedStudentId;
    } catch (error) {
        console.error('Error inserting student into Students table:', error);
        return null;
    } finally {
        client.release();
    }
}

async function insertUserIntoUsersTable(username, password, role, relatedId) {
    const client = await pool.connect();
    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const sqlInsert = `
            INSERT INTO Users (
                username, password, role, student_id
            ) VALUES (
                $1, $2, $3, $4
            )
            RETURNING user_id;
        `;
        const values = [
            username,
            passwordHash,
            role,
            relatedId
        ];
        const result = await client.query(sqlInsert, values);
        const generatedUserId = result.rows[0].user_id;
        console.log(`User record created in Users table with ID: ${generatedUserId}`);
        return generatedUserId;
    } catch (error) {
        console.error('Error inserting user into Users table:', error);
        return null;
    } finally {
        client.release();
    }
}

async function deletePendingStudent(studentId) {
    const client = await pool.connect();
    try {
        const sqlDelete = `
            DELETE FROM PendingStudents
            WHERE pending_student_id = $1;
        `;
        const result = await client.query(sqlDelete, [studentId]);
        if (result.rowCount > 0) {
            console.log(`Student ${studentId} deleted successfully from PendingStudents.`);
            return true;
        } else {
            console.log(`Student ${studentId} not found in PendingStudents for deletion.`);
            return false;
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getCourseIdsByDepartment(departmentId, client) {
    try {
        const sqlSelect = `
            SELECT course_id
            FROM Courses
            WHERE department_id = $1;
        `;
        const result = await client.query(sqlSelect, [departmentId]);
        console.log(`Found ${result.rows.length} courses for department ${departmentId}.`);
        return result.rows.map(row => row.course_id);
    } catch (error) {
        console.error('Error retrieving course IDs by department:', error);
        return [];
    }
}

async function insertStudentCourse(enrollmentData, client) {
    try {
        const sqlInsert = `
            INSERT INTO StudentCourses (
                student_id, session_id, semester_id, course_id
            ) VALUES (
                $1, $2, $3, $4
            )
            RETURNING student_course_id;
        `;
        const values = [
            enrollmentData.student_id,
            enrollmentData.session_id,
            enrollmentData.semester_id,
            enrollmentData.course_id
        ];
        const result = await client.query(sqlInsert, values);
        const generatedStudentCourseId = result.rows[0].student_course_id;
        console.log(`StudentCourse record created with ID: ${generatedStudentCourseId}`);
        return generatedStudentCourseId;
    } catch (error) {
        console.error('Error inserting student course:', error);
        return null;
    }
}

async function insertStudentLevelHistory(levelHistoryData, client) {
    try {
        const sqlInsert = `
            INSERT INTO StudentLevelHistory (
                student_id, session_id, level_id, start_date
            ) VALUES (
                $1, $2, $3, CURRENT_TIMESTAMP
            )
            RETURNING student_level_history_id;
        `;
        const values = [
            levelHistoryData.student_id,
            levelHistoryData.session_id,
            levelHistoryData.level_id
        ];
        const result = await client.query(sqlInsert, values);
        const generatedLevelHistoryId = result.rows[0].student_level_history_id;
        console.log(`StudentLevelHistory record created with ID: ${generatedLevelHistoryId}`);
        return generatedLevelHistoryId;
    } catch (error) {
        console.error('Error inserting student level history:', error);
        return null;
    }
}

async function getStudentDetailsByMatricNumber(matricNumber, client) {
    try {
        const sqlSelect = `
            SELECT student_id, department_id, level_id
            FROM Students
            WHERE matriculation_number = $1;
        `;
        const result = await client.query(sqlSelect, [matricNumber]);
        if (result.rows.length > 0) {
            console.log(`Student details found for matric number ${matricNumber}.`);
            return result.rows[0];
        } else {
            console.log(`Student with matric number ${matricNumber} not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving student details by matric number:', error);
        return null;
    }
}
async function deleteStudent(studentId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Delete related records from Results
        // This must be done BEFORE deleting from the Students table due to the foreign key constraint.
        await client.query('DELETE FROM Results WHERE student_id = $1', [studentId]);
        console.log(`Deleted related records from Results for student_id ${studentId}.`);

        // 2. Delete related records from StudentCourses
        await client.query('DELETE FROM StudentCourses WHERE student_id = $1', [studentId]);
        console.log(`Deleted related records from StudentCourses for student_id ${studentId}.`);

        // 3. Delete related records from StudentLevelHistory
        await client.query('DELETE FROM StudentLevelHistory WHERE student_id = $1', [studentId]);
        console.log(`Deleted related records from StudentLevelHistory for student_id ${studentId}.`);

        // 4. Delete related records from Users
        await client.query('DELETE FROM Users WHERE student_id = $1', [studentId]);
        console.log(`Deleted related records from Users for student_id ${studentId}.`);

        // 5. Find and delete related AdmissionStatus record
        const admissionStatusQuery = `
            SELECT admission_status_id
            FROM Students
            WHERE student_id = $1;
        `;
        const admissionStatusResult = await client.query(admissionStatusQuery, [studentId]);
        if (admissionStatusResult.rows.length > 0) {
            const { admission_status_id } = admissionStatusResult.rows[0];
            await client.query('DELETE FROM AdmissionStatus WHERE admission_status_id = $1', [admission_status_id]);
            console.log(`Deleted related record from AdmissionStatus with admission_status_id ${admission_status_id}.`);
        }

        // 6. Delete the student record from the Students table
        const sqlDeleteStudent = `
            DELETE FROM Students
            WHERE student_id = $1
            RETURNING student_id;
        `;
        const result = await client.query(sqlDeleteStudent, [studentId]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            console.log(`Student with ID ${studentId} not found in Students table.`);
            return false;
        }

        console.log(`Student with ID ${studentId} deleted successfully from Students table.`);

        // 7. Commit the transaction
        await client.query('COMMIT');
        return true;

    } catch (error) {
        // Rollback the transaction in case of any error
        await client.query('ROLLBACK');
        console.error('Error deleting student and related records:', error);
        // Re-throw the error if you want the caller to handle it
        // throw error;
        return false;
    } finally {
        // Release the client back to the pool
        client.release();
    }
}

async function updateStudent(studentId, updateData) {
    const client = await pool.connect();
    try {
        const allowedFields = [
            'first_name', 'last_name', 'date_of_birth', 'email',
            'department_id', 'level_id', 'matriculation_number', 'gender', 'phone_number',
            'address', 'state_of_origin', 'local_government_area',
            'profile_picture'
        ];
        const fieldsToUpdate = Object.keys(updateData)
            .filter(key => allowedFields.includes(key) && updateData[key] !== undefined)
            .map((key, index) => `${key} = $${index + 2}`);
        if (fieldsToUpdate.length === 0) {
            console.log('No valid fields provided for update.');
            return false;
        }
        const values = [studentId];
        const fieldValues = Object.keys(updateData)
            .filter(key => allowedFields.includes(key) && updateData[key] !== undefined)
            .map(key => {
                if (key === 'date_of_birth' && updateData[key] instanceof Date) {
                    return updateData[key].toISOString().split('T')[0];
                }
                return updateData[key];
            });
        values.push(...fieldValues);
        const sqlUpdate = `
            UPDATE Students
            SET ${fieldsToUpdate.join(', ')}
            WHERE student_id = $1
            RETURNING student_id;
        `;
        const result = await client.query(sqlUpdate, values);
        if (result.rowCount > 0) {
            console.log(`Student with ID ${studentId} updated successfully.`);
            return true;
        } else {
            console.log(`Student with ID ${studentId} not found for update.`);
            return false;
        }
    } catch (error) {
        console.error('Error updating student:', error);
        return false;
    } finally {
        client.release();
    }
}

async function createActiveLecturer(client, lecturerData) {
    try {
        const sqlInsert = `
            INSERT INTO Lecturers (
                staff_id, department_id, first_name, last_name, email,
                phone_number, address, gender, date_of_birth, date_of_employment
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
            )
            RETURNING lecturer_id;
        `;
        const values = [
            lecturerData.staffId,
            lecturerData.departmentId,
            lecturerData.first_name,
            lecturerData.last_name,
            lecturerData.email,
            lecturerData.phone_number,
            lecturerData.address,
            lecturerData.gender,
            lecturerData.date_of_birth
        ];
        console.log("Inserting into Lecturers table with values:", values);
        const result = await client.query(sqlInsert, values);
        const generatedLecturerId = result.rows[0].lecturer_id;
        console.log(`Lecturer record created in Lecturers table with ID: ${generatedLecturerId}`);
        return generatedLecturerId;
    } catch (error) {
        console.error('Error creating active lecturer:', error);
        throw error;
    }
}

async function insertUserIntoUsersTableForLecturer(client, username, password, relatedLecturerId) {
    try {
        const saltRounds = 10;
        console.log("Hashing password for user:", username);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully.");
        const sqlInsert = `
            INSERT INTO Users (
                username, password, role, lecturer_id
            ) VALUES (
                $1, $2, $3, $4
            )
            RETURNING user_id;
        `;
        const values = [
            username,
            passwordHash,
            'lecturer',
            relatedLecturerId
        ];
        console.log("Executing user insert query for lecturer:", username);
        const result = await client.query(sqlInsert, values);
        const generatedUserId = result.rows[0].user_id;
        console.log(`User record created in Users table for lecturer with ID: ${generatedUserId}`);
        return generatedUserId;
    } catch (error) {
        console.error('Error inserting user into Users table for lecturer:', error);
        throw error;
    }
}

async function deleteUserByLecturerId(client, lecturerId) {
    try {
        const sqlDelete = `
            DELETE FROM Users
            WHERE lecturer_id = $1
            RETURNING user_id;
        `;
        const values = [lecturerId];
        console.log(`Executing delete user query for lecturer ID: ${lecturerId}`);
        const result = await client.query(sqlDelete, values);
        if (result.rowCount === 0) {
            console.warn(`No user found for lecturer ID ${lecturerId} during deletion.`);
            return false;
        }
        console.log(`User record deleted for lecturer ID: ${lecturerId}. User ID: ${result.rows[0].user_id}`);
        return true;
    } catch (error) {
        console.error(`Error deleting user for lecturer ID ${lecturerId}:`, error);
        throw error;
    }
}

// New CRUD Operations
async function getAllLecturers() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT lecturer_id, staff_id, department_id, first_name, last_name, email,
                   phone_number, address, gender, date_of_birth, date_of_employment
            FROM Lecturers;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} lecturers.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving lecturers:', error);
        return [];
    } finally {
        client.release();
    }
}

async function getAllStudents() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT student_id, matriculation_number, first_name, last_name, email,
                   department_id, level_id, gender, phone_number, address,
                   state_of_origin, local_government_area, profile_picture,
                   date_of_admission
            FROM Students;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} students.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving students:', error);
        return [];
    } finally {
        client.release();
    }
}

async function getAllStudentsByDepartment_id(departmentId) {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT student_id, matriculation_number, first_name, last_name,level_id, gender
            FROM Students
            WHERE department_id = $1
        `;
        const result = await client.query(sqlSelect, [departmentId]); // Pass departmentId
        console.log(`Retrieved ${result.rows.length} students for department ${departmentId}`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving students:', error);
        return [];
    } finally {
        client.release();
    }
}


async function getAllCourses() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT course_id, course_code, course_title, department_id, credit_unit
            FROM Courses;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} courses.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving courses:', error);
        return [];
    } finally {
        client.release();
    }
}

async function getAllUsers() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT user_id, username, role, student_id, lecturer_id
            FROM Users;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} users.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving users:', error);
        return [];
    } finally {
        client.release();
    }
}

async function getAllStudentCourses() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT student_course_id, student_id, session_id, semester_id, course_id
            FROM StudentCourses;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} student courses.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving student courses:', error);
        return [];
    } finally {
        client.release();
    }
}

async function updateUserPassword(username, newPassword) {
    const client = await pool.connect();
    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        const sqlUpdate = `
            UPDATE Users
            SET password = $1
            WHERE username = $2
            RETURNING user_id;
        `;
        const result = await client.query(sqlUpdate, [passwordHash, username]);
        if (result.rowCount > 0) {
            console.log(`Password updated for user ${username}.`);
            return true;
        } else {
            console.log(`User ${username} not found for password update.`);
            return false;
        }
    } catch (error) {
        console.error('Error updating user password:', error);
        return false;
    } finally {
        client.release();
    }
}

async function getStudentInfoByMatricNumber(matricNumber) {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT 
                s.student_id, s.matriculation_number, s.first_name, s.last_name, 
                s.date_of_birth, s.email, s.gender, s.phone_number, s.address, 
                s.state_of_origin, s.local_government_area, s.profile_picture, 
                s.date_of_admission, s.department_id, d.department_name,
                s.level_id, l.level_name,
                u.user_id, u.username, u.role,
                sc.student_course_id, sc.session_id, sc.semester_id, sc.course_id,
                c.course_code, c.course_title, c.credit_unit,
                r.result_id, r.score, r.grade, r.grade_point, r.date_recorded
            FROM Students s
            LEFT JOIN Departments d ON s.department_id = d.department_id
            LEFT JOIN Levels l ON s.level_id = l.level_id
            LEFT JOIN Users u ON s.student_id = u.student_id
            LEFT JOIN StudentCourses sc ON s.student_id = sc.student_id
            LEFT JOIN Courses c ON sc.course_id = c.course_id
            LEFT JOIN Results r ON s.student_id = r.student_id AND sc.course_id = r.course_id
            WHERE s.matriculation_number = $1;
        `;
        const result = await client.query(sqlSelect, [matricNumber]);
        if (result.rows.length > 0) {
            console.log(`Retrieved info for student with matric number ${matricNumber}.`);
            return result.rows;
        } else {
            console.log(`Student with matric number ${matricNumber} not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving student info:', error);
        return null;
    } finally {
        client.release();
    }
}

async function getLecturerInfoByStaffId(staffId) {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT 
                l.lecturer_id, l.staff_id, l.first_name, l.last_name, 
                l.email, l.phone_number, l.address, l.gender, 
                l.date_of_birth, l.date_of_employment, 
                l.department_id, d.department_name,
                u.user_id, u.username, u.role
            FROM Lecturers l
            LEFT JOIN Departments d ON l.department_id = d.department_id
            LEFT JOIN Users u ON l.lecturer_id = u.lecturer_id
            WHERE l.staff_id = $1;
        `;
        const result = await client.query(sqlSelect, [staffId]);
        if (result.rows.length > 0) {
            console.log(`Retrieved info for lecturer with staff ID ${staffId}.`);
            return result.rows[0];
        } else {
            console.log(`Lecturer with staff ID ${staffId} not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving lecturer info:', error);
        return null;
    } finally {
        client.release();
    }
}

async function getAllDepartments() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT department_id, department_name, faculty_id
            FROM Departments;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} departments.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving departments:', error);
        return [];
    } finally {
        client.release();
    }
}

async function addDepartment(departmentData) {
    const client = await pool.connect();
    try {
        const { department_name, faculty_id } = departmentData;
        // Trim string inputs
        const trimmedDepartmentName = department_name ? department_name.trim() : null;
        if (!trimmedDepartmentName || !faculty_id) {
            console.log('Missing required fields for department.');
            return { success: false, error: 'Department name and faculty ID are required.' };
        }
        const sqlInsert = `
            INSERT INTO Departments (department_name, faculty_id)
            VALUES ($1, $2)
            RETURNING department_id, department_name, faculty_id;
        `;
        const result = await client.query(sqlInsert, [trimmedDepartmentName, faculty_id]);
        console.log(`Department '${trimmedDepartmentName}' added successfully.`);
        return { success: true, department: result.rows[0] };
    } catch (error) {
        console.error('Error adding department:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

async function getAllFaculties() {
    const client = await pool.connect();
    try {
        const sqlSelect = `
            SELECT faculty_id, faculty_name
            FROM Faculties;
        `;
        const result = await client.query(sqlSelect);
        console.log(`Retrieved ${result.rows.length} faculties.`);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving faculties:', error);
        return [];
    } finally {
        client.release();
    }
}
// Delete a department
async function deleteDepartment(departmentId) {
    const client = await pool.connect();
    try {
        const sqlDelete = `
            DELETE FROM Departments
            WHERE department_id = $1
            RETURNING department_id, department_name, faculty_id;
        `;
        const result = await client.query(sqlDelete, [departmentId]);
        if (result.rowCount === 0) {
            console.log(`Department with ID ${departmentId} not found.`);
            return { success: false, error: 'Department not found.' };
        }
        console.log(`Department with ID ${departmentId} deleted successfully.`);
        return { success: true, department: result.rows[0] };
    } catch (error) {
        console.error('Error deleting department:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// Add a new course
async function addCourse(courseData) {
    const client = await pool.connect();
    try {
        const { course_code, course_title, department_id, credit_units } = courseData;
        console.log(courseData)
        // Trim string inputs
        const trimmedCourseCode = course_code ? course_code.trim() : null;
        const trimmedCourseTitle = course_title ? course_title.trim() : null;
        // Validate inputs
        if (!trimmedCourseCode || !trimmedCourseTitle || !department_id || !credit_units) {
            console.log('Missing required fields for course.');
            return { success: false, error: 'Course code, title, department ID, and credit units are required.' };
        }
        const sqlInsert = `
        INSERT INTO Courses (course_code, course_title, department_id, credit_unit)
        VALUES ($1, $2, $3, $4)
        RETURNING course_id, course_code, course_title, department_id, credit_unit AS credit_units;;
        `;
         const result = await client.query(sqlInsert, [trimmedCourseCode, trimmedCourseTitle, department_id, credit_units]);
        console.log(`Course '${trimmedCourseCode}' added successfully.`);
        return { success: true, course: result.rows[0] };
    } catch (error) {
        console.error('Error adding course:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// Update a course
async function updateCourse(courseId, courseData) {
    const client = await pool.connect();
    try {
        const { course_code, course_title, department_id, credit_units } = courseData;
        // Trim string inputs
        const trimmedCourseCode = course_code ? course_code.trim() : null;
        const trimmedCourseTitle = course_title ? course_title.trim() : null;
        // Build dynamic query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (trimmedCourseCode) {
            updates.push(`course_code = $${paramCount}`);
            values.push(trimmedCourseCode);
            paramCount++;
        }
        if (trimmedCourseTitle) {
            updates.push(`course_title = $${paramCount}`);
            values.push(trimmedCourseTitle);
            paramCount++;
        } 
        if (department_id) {
            updates.push(`department_id = $${paramCount}`);
            values.push(parseInt(department_id));
            paramCount++;
        }
        if (credit_units) {
            if (isNaN(parseInt(credit_units))) {
                return { success: false, error: 'Credit units must be a valid number.' };
            }
            updates.push(`credit_unit = $${paramCount}`);
            values.push(parseInt(credit_units));
            paramCount++;
        }

        if (updates.length === 0) {
            console.log('No fields provided for update.');
            return { success: false, error: 'At least one field must be provided for update.' };
        }

        values.push(courseId);
        const sqlUpdate = `
            UPDATE Courses
            SET ${updates.join(', ')}
            WHERE course_id = $${paramCount}
            RETURNING course_id, course_code, course_title, department_id, credit_unit AS credit_units;
        `;
        const result = await client.query(sqlUpdate, values);
        if (result.rowCount === 0) {
            console.log(`Course with ID ${courseId} not found.`);
            return { success: false, error: 'Course not found.' };
        }
        console.log(`Course with ID ${courseId} updated successfully.`);
        return { success: true, course: result.rows[0] };
    } catch (error) {
        console.error('Error updating course:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// Delete a course
async function deleteCourse(courseId) {
    const client = await pool.connect();
    try {
        const sqlDelete = `
            DELETE FROM Courses
            WHERE course_id = $1
            RETURNING course_id, course_code, course_title, department_id, credit_unit;
        `;
        const result = await client.query(sqlDelete, [courseId]);
        if (result.rowCount === 0) {
            console.log(`Course with ID ${courseId} not found.`);
            return { success: false, error: 'Course not found.' };
        }
        console.log(`Course with ID ${courseId} deleted successfully.`);
        return { success: true, course: result.rows[0] };
    } catch (error) {
        console.error('Error deleting course:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

app.get('/results/student/:matriculationNumber', async (req, res) => {
    const { matriculationNumber } = req.params;

    if (!matriculationNumber) {
        return res.status(400).json({ error: 'Missing required parameter: matriculationNumber' });
    }

    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT 
                r.result_id,
                r.student_id,
                r.course_id,
                r.semester_id,
                r.score,
                r.grade,
                r.grade_point,
                r.session_id
            FROM results r
            JOIN students s ON r.student_id = s.student_id
            WHERE s.matriculation_number = $1
            ORDER BY r.date_recorded DESC;
        `;
        const values = [matriculationNumber];
        const result = await client.query(sqlQuery, values);
        const results = result.rows;

        res.status(200).json({ results });
    } catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching student results.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Express Routes
app.post('/registration', async (req, res) => {
    const registrationData = req.body;
    console.log("incoming data", registrationData);
    const processedRegistrationData = {};
    for (const key in registrationData) {
        if (registrationData.hasOwnProperty(key)) {
            const value = registrationData[key];
            if (typeof value === 'string') {
                const trimmedValue = value.trim();
                if (key === 'email') {
                    processedRegistrationData[key] = trimmedValue;
                } else if (key === 'gender') {
                    const lowerCaseGender = trimmedValue.toLowerCase();
                    if (lowerCaseGender === 'male') {
                        processedRegistrationData[key] = 'Male';
                    } else if (lowerCaseGender === 'female') {
                        processedRegistrationData[key] = 'Female';
                    } else if (lowerCaseGender === 'other') {
                        processedRegistrationData[key] = 'Other';
                    } else {
                        processedRegistrationData[key] = trimmedValue;
                        console.warn(`Received potentially invalid gender value: "${trimmedValue}"`);
                    }
                } else {
                    processedRegistrationData[key] = trimmedValue.toLowerCase();
                }
            } else {
                processedRegistrationData[key] = value;
            }
        }
    }
    const dataToProcess = processedRegistrationData;
    if (!dataToProcess || !dataToProcess.role) {
        return res.status(400).json({ error: 'Missing required registration data or role' });
    }
    const role = dataToProcess.role;
    let success = false;
    let userId = null;
    let userType = null;
    if (role === 'student') {
        if (!dataToProcess.first_name || !dataToProcess.last_name || !dataToProcess.date_of_birth || !dataToProcess.email || !dataToProcess.department_id || !dataToProcess.level_id || !dataToProcess.gender || !dataToProcess.phone_number || !dataToProcess.address || !dataToProcess.state_of_origin || !dataToProcess.local_government_area || !dataToProcess.intended_password) {
            return res.status(400).json({ error: 'Missing required student registration data' });
        }
        userId = await createPendingStudent(dataToProcess);
        success = userId !== null;
        userType = 'Student';
    } else if (role === 'lecturer') {
        console.log(dataToProcess);
        console.log("Lecturer Validation Check Details:");
        console.log("Checking first_name:", dataToProcess.first_name, "Falsy check:", !dataToProcess.first_name);
        console.log("Checking last_name:", dataToProcess.last_name, "Falsy check:", !dataToProcess.last_name);
        console.log("Checking email:", dataToProcess.email, "Falsy check:", !dataToProcess.email);
        console.log("Checking department_id:", dataToProcess.department_id, "Falsy check:", !dataToProcess.department_id);
        console.log("Checking phone_number:", dataToProcess.phone_number, "Falsy check:", !dataToProcess.phone_number);
        console.log("Checking address:", dataToProcess.address, "Falsy check:", !dataToProcess.address);
        console.log("Checking intended_password:", dataToProcess.intended_password, "Falsy check:", !dataToProcess.intended_password);
        if (!dataToProcess.first_name || !dataToProcess.last_name || !dataToProcess.email || !dataToProcess.department_id || !dataToProcess.phone_number || !dataToProcess.address || !dataToProcess.intended_password) {
            return res.status(400).json({ error: 'Missing required lecturer registration data' });
        }
        userId = await createPendingLecturer(dataToProcess);
        success = userId !== null;
        userType = 'Lecturer';
    } else {
        return res.status(400).json({ error: 'Invalid role specified. Must be "student" or "lecturer".' });
    }
    if (success) {
        res.status(201).json({ message: `${userType} registered successfully`, userId: userId });
    } else {
        res.status(500).json({ error: `Failed to register ${userType}` });
    }
});

app.get('/pending_students', async (req, res) => {
    const students = await getAllPendingStudents();
    if (students) {
        res.status(200).json(students);
    } else {
        res.status(500).json({ error: 'Failed to retrieve pending students' });
    }
});

app.delete('/pending_students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
        return res.status(400).json({ error: 'Missing required parameter: studentId' });
    }
    const success = await deletePendingStudent(studentId);
    if (success) {
        res.status(200).json({ message: `Pending student with ID ${studentId} deleted successfully.` });
    } else {
        res.status(404).json({ error: `Pending student with ID ${studentId} not found or deletion failed.` });
    }
});

app.get('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const student = await getPendingStudent(studentId);
    if (student) {
        res.status(200).json(student);
    } else {
        res.status(404).json({ error: 'Student not found' });
    }
});

app.post('/lecturers', async (req, res) => {
    console.log("Incoming request to directly create an active lecturer.");
    const lecturerData = req.body;
    console.log("Received Lecturer Data:", lecturerData);
    if (!lecturerData || !lecturerData.staffId || !lecturerData.departmentId || !lecturerData.first_name || !lecturerData.last_name || !lecturerData.email || !lecturerData.intended_password) {
        console.error("Validation Error: Missing required fields for active lecturer creation.");
        return res.status(400).json({ error: 'Missing required lecturer data (e.g., staffId, departmentId, first_name, last_name, email, intended_password)' });
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        let lecturerId = null;
        let userId = null;
        lecturerId = await createActiveLecturer(client, lecturerData);
        if (!lecturerId) {
            throw new Error('Failed to create lecturer record.');
        }
        const username = lecturerData.staffId;
        const password = lecturerData.intended_password;
        if (!password) {
            throw new Error('Intended password not provided.');
        }
        userId = await insertUserIntoUsersTableForLecturer(client, username, password, lecturerId);
        if (!userId) {
            throw new Error('Failed to create user account for lecturer.');
        }
        await client.query('COMMIT');
        console.log(`Active lecturer and user account created successfully for Staff ID: ${lecturerData.staffId}`);
        res.status(201).json({
            message: `Lecturer and user account created successfully.`,
            lecturerId: lecturerId,
            userId: userId
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error("Error creating active lecturer and user:", error);
        res.status(500).json({ error: 'An internal server error occurred during lecturer and user creation.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.post('/process_student_admission', async (req, res) => {
    const { pending_student_id, action, matric_number, rejection_reason, processed_by_user_id } = req.body;
    if (!pending_student_id || !action || !processed_by_user_id) {
        return res.status(400).json({ error: 'Missing required parameters (pending_student_id, action, processed_by_user_id)' });
    }
    const lowerCaseAction = action.toLowerCase();
    const pendingStudentData = await getPendingStudentForProcessing(pending_student_id);
    if (!pendingStudentData) {
        return res.status(404).json({ error: 'Pending student not found' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let admissionStatusId = null;
        let studentTableSuccess = false;
        let userTableSuccess = false;
        let deletePendingSuccess = false;
        let assignedMatric = null;
        let finalStatus = null;
        if (lowerCaseAction === 'approve') {
            if (!matric_number) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Matric number is required for approval' });
            }
            finalStatus = 'Approved';
            assignedMatric = matric_number;
            admissionStatusId = await recordAdmissionStatus(
                pending_student_id,
                finalStatus.trim(),
                assignedMatric,
                null,
                processed_by_user_id
            );
            if (admissionStatusId === null) {
                await client.query('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record admission status' });
            }
            const studentId = await insertStudentIntoStudentsTable(pendingStudentData, assignedMatric, admissionStatusId);
            studentTableSuccess = studentId !== null;
            if (!studentTableSuccess) {
                await client.query('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create student record' });
            }
            const userId = await insertUserIntoUsersTable(
                assignedMatric,
                pendingStudentData.intended_password,
                'student',
                studentId
            );
            userTableSuccess = userId !== null;
            if (!userTableSuccess) {
                await client.query('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create user record' });
            }
            deletePendingSuccess = await deletePendingStudent(pending_student_id);
            if (!deletePendingSuccess) {
                console.warn(`Failed to delete pending student ${pending_student_id} after successful approval.`);
            }
        } else if (lowerCaseAction === 'reject') {
            finalStatus = 'Rejected';
            admissionStatusId = await recordAdmissionStatus(
                pending_student_id,
                finalStatus.trim(),
                null,
                rejection_reason || null,
                processed_by_user_id
            );
            if (admissionStatusId === null) {
                await client.query('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record rejection status' });
            }
            deletePendingSuccess = await deletePendingStudent(pending_student_id);
            if (!deletePendingSuccess) {
                console.warn(`Failed to delete pending student ${pending_student_id} after successful rejection.`);
            }
        } else {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Invalid action specified. Must be "approve" or "reject".' });
        }
        await client.query('COMMIT');
        console.log(`Transaction committed for pending student ${pending_student_id}, action: ${finalStatus}`);
        if (finalStatus === 'Approved') {
            res.status(200).json({ message: 'Student approved successfully', pending_student_id: pending_student_id, matric_number: assignedMatric, admission_status_id: admissionStatusId });
        } else {
            res.status(200).json({ message: 'Student rejected successfully', pending_student_id: pending_student_id, admission_status_id: admissionStatusId });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction rolled back due to error:', error);
        res.status(500).json({ error: 'An error occurred during the admission process.' });
    } finally {
        client.release();
    }
});

app.post('/assign_student_semester_courses', async (req, res) => {
    console.log(req.body);
    const { matric_number, session_id, semester_id } = req.body;
    if (!matric_number || !session_id || !semester_id) {
        return res.status(400).json({ error: 'Missing required parameters (matric_number, session_id, semester_id)' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const studentDetails = await getStudentDetailsByMatricNumber(matric_number, client);
        if (!studentDetails) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Student with matric number ${matric_number} not found.` });
        }
        const { student_id, department_id, level_id } = studentDetails;
        const levelHistorySuccess = await insertStudentLevelHistory({
            student_id: student_id,
            session_id: session_id,
            level_id: level_id
        }, client);
        if (levelHistorySuccess === null) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Failed to record student level history.' });
        }
        const courseIds = await getCourseIdsByDepartment(department_id, client);
        if (!courseIds || courseIds.length === 0) {
            await client.query('COMMIT');
            return res.status(200).json({ message: `Student level history recorded, but no courses found for department ${department_id} to assign.` });
        }
        let allCoursesAssigned = true;
        const assignedCourseIds = [];
        for (const courseId of courseIds) {
            const enrollmentData = {
                student_id: student_id,
                session_id: session_id,
                semester_id: semester_id,
                course_id: courseId
            };
            const studentCourseId = await insertStudentCourse(enrollmentData, client);
            if (studentCourseId === null) {
                allCoursesAssigned = false;
                console.error(`Failed to assign course ${courseId} to student ${student_id}. Rolling back transaction.`);
                break;
            }
            assignedCourseIds.push(courseId);
        }
        if (!allCoursesAssigned) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Failed to assign all courses to student.' });
        }
        await client.query('COMMIT');
        console.log(`Transaction committed for assigning courses and level history to student with matric number ${matric_number}.`);
        res.status(200).json({
            message: 'Student assigned to department courses and level history recorded successfully.',
            student_id: student_id,
            matric_number: matric_number,
            session_id: session_id,
            semester_id: semester_id,
            level_id: level_id,
            assigned_course_count: assignedCourseIds.length,
            assigned_course_ids: assignedCourseIds
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction rolled back due to error during course assignment:', error);
        res.status(500).json({ error: 'An error occurred during the course assignment process.' });
    } finally {
        client.release();
    }
});

// Fetch student profile by user_id
app.get('/students/user/:userId', async (req, res) => {
    console.log(`Incoming request to fetch student profile for user ID: ${req.params.userId}`);
    const { userId } = req.params;
    if (!userId) {
        console.error('Validation Error: Missing user ID in route parameter.');
        return res.status(400).json({ error: 'Missing required parameter: userId' });
    }
    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT 
                s.student_id, s.matriculation_number, s.first_name, s.last_name, s.email, 
                s.department_id, d.department_name, s.level_id, s.gender
            FROM Users u
            JOIN Students s ON u.student_id = s.student_id
            JOIN Departments d ON s.department_id = d.department_id
            WHERE u.user_id = $1;
        `;
        const result = await client.query(sqlQuery, [userId]);
        if (result.rows.length === 0) {
            console.warn(`Student not found for user ID ${userId}.`);
            return res.status(404).json({ error: 'Student not found for this user ID' });
        }
        console.log(`Fetched student profile for user ID: ${userId}`);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching student profile.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});
// Assuming 'app' is your Express application instance
// Assuming 'pool' is your pg.Pool database connection pool

// Update a department by ID
app.patch('/departments/:departmentId', async (req, res) => {
    console.log(`Incoming request to update department ID: ${req.params.departmentId}`);
    const { departmentId } = req.params; // Extract departmentId from URL
    const { department_name } = req.body; // Extract department_name from body

    // --- Validation ---
    if (!departmentId) {
        console.error('Validation Error: Missing department ID in route parameter.');
        return res.status(400).json({ error: 'Missing required parameter: departmentId' });
    }

    // For a PATCH, department_name might be optional if updating other fields later,
    // but based on your client code, it's the primary field for this PATCH.
    // We should at least check if it was sent if we expect it for this specific PATCH operation.
    if (department_name === undefined) { // Check if the key exists
         console.error('Validation Error: Missing department_name in request body.');
         return res.status(400).json({ error: 'Missing required field in body: department_name' });
    }

    // Basic type and content validation for department_name
    if (typeof department_name !== 'string' || department_name.trim() === '') {
        console.error('Validation Error: department_name must be a non-empty string.');
        return res.status(400).json({ error: 'department_name must be a non-empty string.' });
    }
    // --- End Validation ---

    let client; // Variable to hold the database client
    try {
        client = await pool.connect(); // Get a client from the connection pool

        const sqlQuery = `
            UPDATE departments
            SET department_name = $1
            WHERE department_id = $2;
        `;
        const params = [department_name, departmentId]; // Parameters for the query

        const result = await client.query(sqlQuery, params);

        // Check if any row was updated
        if (result.rowCount === 0) {
            console.warn(`Update Warning: Department with ID ${departmentId} not found.`);
            // If no rows were affected, the department ID might not exist
            return res.status(404).json({ error: 'Department not found.' });
        }

        console.log(`Successfully updated department ID: ${departmentId}`);
        // Send a success response. 200 OK is common for a successful PATCH that modifies resources.
        // You could also send 204 No Content if you don't need to send back a body on success.
        res.status(200).json({ message: 'Department updated successfully.' });

    } catch (error) {
        console.error(`Error updating department ID ${departmentId}:`, error);
        // Send a server error response
        res.status(500).json({ error: 'An internal server error occurred while updating the department.' });
    } finally {
        // Release the client back to the pool
        if (client) {
            client.release();
        }
    }
});
// Fetch all courses for a department
app.get('/courses/department/:departmentId', async (req, res) => {
    console.log(`Incoming request to fetch courses for department ID: ${req.params.departmentId}`);
    const { departmentId } = req.params;
    if (!departmentId) {
        console.error('Validation Error: Missing department ID in route parameter.');
        return res.status(400).json({ error: 'Missing required parameter: departmentId' });
    }
    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT course_id, course_code, course_title, department_id
            FROM Courses
            WHERE department_id = $1;
        `;
        const result = await client.query(sqlQuery, [departmentId]);
        console.log(`Fetched ${result.rows.length} courses for department ID: ${departmentId}`);
        res.status(200).json({ courses: result.rows });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching courses.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Fetch all results for a student
app.get('/students/:studentId/results', async (req, res) => {
    console.log(`Incoming request to fetch results for student ID: ${req.params.studentId}`);
    const { studentId } = req.params;
    if (!studentId) {
        console.error('Validation Error: Missing student ID in route parameter.');
        return res.status(400).json({ error: 'Missing required parameter: studentId' });
    }
    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT 
                r.result_id, r.student_id, r.course_id, c.course_code, r.semester_id, 
                r.score, r.grade, r.grade_point, r.session_id
            FROM Results r
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.student_id = $1
            ORDER BY r.date_recorded DESC;
        `;
        const result = await client.query(sqlQuery, [studentId]);
        console.log(`Fetched ${result.rows.length} results for student ID: ${studentId}`);
        res.status(200).json({ results: result.rows });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching results.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Search results by student ID and course code
app.get('/students/:studentId/results/course/code/:courseCode', async (req, res) => {
    console.log(`Incoming request to fetch results for student ID: ${req.params.studentId}, course code: ${req.params.courseCode}`);
    const { studentId, courseCode } = req.params;
    if (!studentId || !courseCode) {
        console.error('Validation Error: Missing student ID or course code in route parameters.');
        return res.status(400).json({ error: 'Missing required parameters: studentId or courseCode' });
    }
    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT 
                r.result_id, r.student_id, r.course_id, c.course_code, r.semester_id, 
                r.score, r.grade, r.grade_point, r.session_id
            FROM Results r
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.student_id = $1 AND UPPER(c.course_code) = UPPER($2);
        `;
        const result = await client.query(sqlQuery, [studentId, courseCode]);
        console.log(`Fetched ${result.rows.length} results for student ID: ${studentId} and course code: ${courseCode}`);
        res.status(200).json({ results: result.rows });
    } catch (error) {
        console.error('Error fetching results by course code:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching results.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.delete('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
        return res.status(400).json({ error: 'Missing required parameter: studentId' });
    }
    const success = await deleteStudent(studentId);
    if (success) {
        res.status(200).json({ message: `Student with ID ${studentId} and all related records deleted successfully.` });
    } else {
        res.status(404).json({ error: `Student with ID ${studentId} not found or deletion failed.` });
    }
});


app.put('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const updateData = req.body;
    if (!studentId) {
        return res.status(400).json({ error: 'Missing required parameter: studentId' });
    }
    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided.' });
    }
    const success = await updateStudent(studentId, updateData);
    if (success) {
        res.status(200).json({ message: `Student with ID ${studentId} updated successfully.` });
    } else {
        res.status(404).json({ error: `Student with ID ${studentId} not found or update failed.` });
    }
});

function calculateGradeAndGradePoint(score) {
    if (score >= 70) return { grade: 'A', grade_point: 4.0 };
    if (score >= 60) return { grade: 'B', grade_point: 3.0 };
    if (score >= 50) return { grade: 'C', grade_point: 2.0 };
    if (score >= 45) return { grade: 'D', grade_point: 1.0 };
    if (score >= 40) return { grade: 'E', grade_point: 0.5 };
    return { grade: 'F', grade_point: 0.0 };
}

app.get('/results', async (req, res) => {
    console.log("Incoming request to get all results.");
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT result_id, student_id, course_id, semester_id, score, grade, grade_point, session_id 
             FROM results`
        );
        console.log(`Fetched ${result.rowCount} results.`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: 'An internal server error occurred while fetching results.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.get('/results/:resultId', async (req, res) => {
    console.log("Incoming request to get a specific result.");
    const { resultId } = req.params;
    if (!resultId) {
        console.error("Validation Error: Missing result ID in route parameter.");
        return res.status(400).json({ error: 'Missing required parameter: resultId' });
    }
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT result_id, student_id, course_id, semester_id, score, grade, grade_point, session_id 
             FROM results 
             WHERE result_id = $1`,
            [resultId]
        );
        if (result.rowCount === 0) {
            console.warn(`Result with ID ${resultId} not found.`);
            return res.status(404).json({ error: `Result with ID ${resultId} not found.` });
        }
        console.log(`Fetched result with ID: ${resultId}`);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching result:", error);
        res.status(500).json({ error: 'An internal server error occurred while fetching the result.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.post('/results', async (req, res) => {
    console.log("Incoming request to post a new result.");
    const { student_id, course_id, semester_id, score, session_id } = req.body;
    if (!student_id || !course_id || !semester_id || score === undefined || score === null || !session_id) {
        console.error("Validation Error: Missing required fields for posting result.");
        return res.status(400).json({ error: 'Missing required fields: student_id, course_id, semester_id, score, session_id' });
    }
    if (typeof score !== 'number' || isNaN(score)) {
        console.error("Validation Error: Score must be a number.");
        return res.status(400).json({ error: 'Score must be a number.' });
    }
    if (score < 0 || score > 100) {
        console.warn(`Score ${score} is outside typical 0-100 range.`);
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const { grade, grade_point } = calculateGradeAndGradePoint(score);
        console.log(`Calculated Grade: ${grade}, Grade Point: ${grade_point} for score: ${score}`);
        const sqlInsert = `
            INSERT INTO results (
                student_id, course_id, semester_id, score, grade,
                grade_point, session_id, date_recorded
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
            )
            RETURNING result_id;
        `;
        const values = [
            student_id,
            course_id,
            semester_id,
            score,
            grade,
            grade_point,
            session_id
        ];
        console.log("Executing result insert query.");
        const result = await client.query(sqlInsert, values);
        const newResultId = result.rows[0].result_id;
        console.log(`New result record created with ID: ${newResultId}`);
        await client.query('COMMIT');
        res.status(201).json({
            message: 'Result posted successfully.',
            resultId: newResultId,
            grade: grade,
            grade_point: grade_point
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error("Error posting result:", error);
        res.status(500).json({ error: 'An internal server error occurred while posting the result.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.patch('/results/:resultId', async (req, res) => {
    console.log("Incoming request to update a result.");
    const { resultId } = req.params;
    const { score } = req.body;
    console.log("Result ID to update:", resultId);
    console.log("Received Update Data:", { score });
    if (!resultId) {
        console.error("Validation Error: Missing result ID in route parameter for update.");
        return res.status(400).json({ error: 'Missing required parameter: resultId' });
    }
    if (score === undefined || score === null) {
        console.error("Validation Error: No update data provided (e.g., score).");
        return res.status(400).json({ error: 'No update data provided. Please provide the new score.' });
    }
    if (typeof score !== 'number' || isNaN(score)) {
        console.error("Validation Error: New score must be a number.");
        return res.status(400).json({ error: 'New score must be a number.' });
    }
    if (score < 0 || score > 100) {
        console.warn(`New score ${score} is outside typical 0-100 range.`);
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const { grade, grade_point } = calculateGradeAndGradePoint(score);
        console.log(`Calculated new Grade: ${grade}, Grade Point: ${grade_point} for score: ${score}`);
        const sqlUpdate = `
            UPDATE results
            SET
                score = $1,
                grade = $2,
                grade_point = $3,
                date_recorded = CURRENT_TIMESTAMP
            WHERE result_id = $4
            RETURNING result_id;
        `;
        const values = [
            score,
            grade,
            grade_point,
            resultId
        ];
        console.log(`Executing result update query for result ID: ${resultId}`);
        const result = await client.query(sqlUpdate, values);
        if (result.rowCount === 0) {
            console.warn(`Result with ID ${resultId} not found for update.`);
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Result with ID ${resultId} not found.` });
        }
        const updatedResultId = result.rows[0].result_id;
        console.log(`Result record updated for ID: ${updatedResultId}`);
        await client.query('COMMIT');
        res.status(200).json({
            message: 'Result updated successfully.',
            resultId: updatedResultId,
            newGrade: grade,
            newGradePoint: grade_point
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error("Error updating result:", error);
        res.status(500).json({ error: 'An internal server error occurred while updating the result.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.delete('/results/:resultId', async (req, res) => {
    console.log("Incoming request to delete a result.");
    const { resultId } = req.params;
    console.log("Result ID to delete:", resultId);
    if (!resultId) {
        console.error("Validation Error: Missing result ID in route parameter for deletion.");
        return res.status(400).json({ error: 'Missing required parameter: resultId' });
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const sqlDelete = `
            DELETE FROM results
            WHERE result_id = $1
            RETURNING result_id;
        `;
        const values = [resultId];
        console.log(`Executing result delete query for result ID: ${resultId}`);
        const result = await client.query(sqlDelete, values);
        if (result.rowCount === 0) {
            console.warn(`Result with ID ${resultId} not found for deletion.`);
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Result with ID ${resultId} not found.` });
        }
        const deletedResultId = result.rows[0].result_id;
        console.log(`Result record deleted for ID: ${deletedResultId}`);
        await client.query('COMMIT');
        res.status(200).json({
            message: `Result with ID ${deletedResultId} deleted successfully.`
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error("Error deleting result:", error);
        res.status(500).json({ error: 'An internal server error occurred while deleting the result.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.get('/results/department/:departmentId', async (req, res) => {
    console.log("Incoming request to fetch results for department.");
    const { departmentId } = req.params;

    if (!departmentId) {
        console.error("Validation Error: Missing department ID in route parameter.");
        return res.status(400).json({ error: 'Missing required parameter: departmentId' });
    }

    let client;
    try {
        client = await pool.connect();
        const sqlQuery = `
            SELECT 
                r.result_id,
                r.student_id,
                r.course_id,
                r.semester_id,
                r.score,
                r.grade,
                r.grade_point,
                r.session_id
            FROM results r
            JOIN courses c ON r.course_id = c.course_id
            WHERE c.department_id = $1
            ORDER BY r.date_recorded DESC;
        `;
        const values = [departmentId];
        console.log(`Executing query to fetch results for department ID: ${departmentId}`);
        const result = await client.query(sqlQuery, values);
        const results = result.rows;

        console.log(`Fetched ${results.length} results for department ID: ${departmentId}`);
        res.status(200).json({ results });
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: 'An internal server error occurred while fetching results.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.patch('/lecturers/:lecturerId', async (req, res) => {
    console.log("Incoming request to update a lecturer.");
    const { lecturerId } = req.params;
    const updateData = req.body;
    console.log("Lecturer ID to update:", lecturerId);
    console.log("Received Update Data:", updateData);
    if (!lecturerId) {
        console.error("Validation Error: Missing lecturer ID in route parameter for update.");
        return res.status(400).json({ error: 'Missing required parameter: lecturerId' });
    }
    const updateKeys = Object.keys(updateData);
    if (updateKeys.length === 0) {
        console.error("Validation Error: No update data provided in the request body.");
        return res.status(400).json({ error: 'No update data provided.' });
    }
    let client;
    try {
        client = await pool.connect();
        const setClauses = [];
        const values = [];
        let valueIndex = 1;
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                setClauses.push(`${key} = $${valueIndex}`);
                values.push(updateData[key]);
                valueIndex++;
            }
        }
        values.push(lecturerId);
        const sqlUpdate = `
            UPDATE Lecturers
            SET ${setClauses.join(', ')}
            WHERE lecturer_id = $${valueIndex}
            RETURNING lecturer_id;
        `;
        console.log("Executing lecturer update query:", sqlUpdate, values);
        const result = await client.query(sqlUpdate, values);
        if (result.rowCount === 0) {
            console.warn(`Lecturer with ID ${lecturerId} not found for update.`);
            return res.status(404).json({ error: `Lecturer with ID ${lecturerId} not found.` });
        }
        const updatedLecturerId = result.rows[0].lecturer_id;
        console.log(`Lecturer record updated for ID: ${updatedLecturerId}`);
        res.status(200).json({
            message: 'Lecturer updated successfully.',
            lecturerId: updatedLecturerId
        });
    } catch (error) {
        console.error("Error updating lecturer:", error);
        res.status(500).json({ error: 'An internal server error occurred while updating the lecturer.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.delete('/lecturers/:lecturerId', async (req, res) => {
    console.log("Incoming request to delete a lecturer.");
    const { lecturerId } = req.params;
    console.log("Lecturer ID to delete:", lecturerId);
    if (!lecturerId) {
        console.error("Validation Error: Missing lecturer ID in route parameter for deletion.");
        return res.status(400).json({ error: 'Missing required parameter: lecturerId' });
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const userDeletionSuccess = await deleteUserByLecturerId(client, lecturerId);
        if (!userDeletionSuccess) {
            console.warn(`No user found or failed to delete user for lecturer ID ${lecturerId}. Proceeding with lecturer deletion.`);
        }
        const sqlDelete = `
            DELETE FROM Lecturers
            WHERE lecturer_id = $1
            RETURNING lecturer_id;
        `;
        const values = [lecturerId];
        console.log(`Executing lecturer delete query for lecturer ID: ${lecturerId}`);
        const result = await client.query(sqlDelete, values);
        if (result.rowCount === 0) {
            console.warn(`Lecturer with ID ${lecturerId} not found for deletion.`);
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Lecturer with ID ${lecturerId} not found.` });
        }
        const deletedLecturerId = result.rows[0].lecturer_id;
        console.log(`Lecturer record deleted for ID: ${deletedLecturerId}`);
        await client.query('COMMIT');
        console.log(`Lecturer deletion transaction committed for ${lecturerId}.`);
        res.status(200).json({
            message: `Lecturer with ID ${deletedLecturerId} and related records deleted successfully.`
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back due to error.');
        }
        console.error("Error deleting lecturer:", error);
        res.status(500).json({ error: 'An internal server error occurred while deleting the lecturer.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// New Express Routes
app.get('/lecturers', async (req, res) => {
    const lecturers = await getAllLecturers();
    if (lecturers) {
        res.status(200).json(lecturers);
    } else {
        res.status(500).json({ error: 'Failed to retrieve lecturers' });
    }
});

app.get('/students', async (req, res) => {
    const students = await getAllStudents();
    if (students) {
        res.status(200).json(students);
    } else {
        res.status(500).json({ error: 'Failed to retrieve students' });
    }
});


app.get('/courses', async (req, res) => {
    const courses = await getAllCourses();
    if (courses) {
        res.status(200).json(courses);
    } else {
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
});

app.get('/users', async (req, res) => {
    const users = await getAllUsers();
    if (users) {
        res.status(200).json(users);
    } else {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

app.get('/student_courses', async (req, res) => {
    const studentCourses = await getAllStudentCourses();
    if (studentCourses) {
        res.status(200).json(studentCourses);
    } else {
        res.status(500).json({ error: 'Failed to retrieve student courses' });
    }
});

app.patch('/users/:username/password', async (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;
    if (!username || !newPassword) {
        return res.status(400).json({ error: 'Missing required parameters: username or newPassword' });
    }
    const success = await updateUserPassword(username, newPassword);
    if (success) {
        res.status(200).json({ message: `Password updated successfully for user ${username}` });
    } else {
        res.status(404).json({ error: `User ${username} not found or password update failed` });
    }
});

app.get('/students/info/:matricNumber', async (req, res) => {
    const { matricNumber } = req.params;
    if (!matricNumber) {
        return res.status(400).json({ error: 'Missing required parameter: matricNumber' });
    }
    const studentInfo = await getStudentInfoByMatricNumber(matricNumber);
    if (studentInfo) {
        res.status(200).json(studentInfo);
    } else {
        res.status(404).json({ error: `Student with matric number ${matricNumber} not found` });
    }
});

app.get('/lecturers/info/:staffId', async (req, res) => {
    const { staffId } = req.params;
    if (!staffId) {
        return res.status(400).json({ error: 'Missing required parameter: staffId' });
    }
    const lecturerInfo = await getLecturerInfoByStaffId(staffId);
    if (lecturerInfo) {
        res.status(200).json(lecturerInfo);
    } else {
        res.status(404).json({ error: `Lecturer with staff ID ${staffId} not found` });
    }
});

app.get('/courses/:departmentId', async (req, res) => {
    const { departmentId } = req.params;
    try {
        const result = await pool.query(`
            SELECT course_id, course_code, title, department_id
            FROM Courses
            WHERE department_id = $1
        `, [departmentId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No courses found for this department' });
        }
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Routes
app.get('/departments', async (req, res) => {
    try {
        const departments = await getAllDepartments();
        res.json(departments);
    } catch (error) {
        console.error('Error in /departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/departments', async (req, res) => {
    try {
        const result = await addDepartment(req.body);
        if (result.success) {
            res.status(201).json(result.department);
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error in POST /departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/faculties', async (req, res) => {
    try {
        const faculties = await getAllFaculties();
        res.json(faculties);
    } catch (error) {
        console.error('Error in /faculties:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/departments/:id', async (req, res) => {
    try {
        const departmentId = req.params.id;
        const result = await deleteDepartment(departmentId);
        if (result.success) {
            res.json({ message: 'Department deleted successfully', department: result.department });
        } else {
            res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error in DELETE /departments/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/courses', async (req, res) => {
    try {
        const result = await addCourse(req.body);
        if (result.success) {
            res.status(201).json(result.course);
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error in POST /courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const result = await updateCourse(courseId, req.body);
        if (result.success) {
            res.json(result.course);
        } else {
            res.status(result.error === 'Course not found.' ? 404 : 400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error in PATCH /courses/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const result = await deleteCourse(courseId);
        if (result.success) {
            res.json({ message: 'Course deleted successfully', course: result.course });
        } else {
            res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error in DELETE /courses/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST route to assign a student to a course
app.post('/student-courses', async (req, res) => {
    const { studentId, courseId, sessionId, semesterId } = req.body;

    // Validate request body
    if (!studentId || !courseId || !sessionId || !semesterId) {
        return res.status(400).json({ error: 'Missing required fields: studentId, courseId, sessionId, semesterId' });
    }

    try {
        // Insert new student-course record into the database
        const result = await pool.query(
            `INSERT INTO student_courses (studentId, courseId, sessionId, semesterId) 
             VALUES ($1, $2, $3, $4) 
             RETURNING student_course_id, studentId, courseId, sessionId, semesterId`,
            [studentId, courseId, sessionId, semesterId]
        );

        const newStudentCourse = result.rows[0];
        res.status(201).json(newStudentCourse);
    } catch (error) {
        console.error('Error assigning student to course:', error);
        res.status(500).json({ error: 'Failed to assign student to course' });
    }
});

// GET route to retrieve all student-courses
app.get('/student-courses', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT student_course_id, student_Id, course_Id, session_Id, semester_Id 
             FROM studentcourses`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching all student courses:', error);
        res.status(500).json({ error: 'Failed to fetch student courses' });
    }
});

// New Routes
app.get('/lecturer/:lecturerId', async (req, res) => {
    const { lecturerId } = req.params;
    if (!lecturerId) {
        return res.status(400).json({ error: 'Missing required parameter: lecturerId' });
    }
    const lecturerInfo = await getLecturerInfoByStaffId(lecturerId); // Assuming lecturerId matches staffId
    if (lecturerInfo) {
        res.status(200).json(lecturerInfo);
    } else {
        res.status(404).json({ error: `Lecturer with ID ${lecturerId} not found` });
    }
});

// Route to get all students by department_id
app.get('/students/department/:departmentId', async (req, res) => {
    const { departmentId } = req.params;
console.log("Incoming request to get students by department ID:", departmentId);
    try {
        const students = await getAllStudentsByDepartment_id(departmentId);
        console.log(students)
        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for this department' });
        }
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/courses/department/:departmentId', async (req, res) => {
    const { departmentId } = req.params;
    if (!departmentId) {
        return res.status(400).json({ error: 'Missing required parameter: departmentId' });
    }
    const courses = await getAllCourses();
   
    if (courses.length > 0) {
        console.log(courses)
        res.status(200).json({ courses });
    } else {
        res.status(404).json({ error: `No courses found for department ID ${departmentId}` });
    }
});

async function getAllResults(courseId = null) {
    const client = await pool.connect();
    try {
        let sqlSelect = `
            SELECT result_id, student_id, course_id, semester_id, score, grade, grade_point, session_id
            FROM results
        `;
        const values = [];
        if (courseId) {
            sqlSelect += ` WHERE course_id = $1`;
            values.push(courseId);
        }
        const result = await client.query(sqlSelect, values);
        console.log(`Fetched ${result.rowCount} results.`);
        return result.rows;
    } catch (error) {
        console.error('Error fetching results:', error);
        return [];
    } finally {
        client.release();
    }
}

app.get('/results/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) {
        return res.status(400).json({ error: 'Missing required parameter: courseId' });
    }
    const results = await getAllResults(courseId);
    if (results.length > 0) {
        res.status(200).json({ results: results });
    } else {
        res.status(404).json({ error: `No results found for course ID ${courseId}` });
    }
});

// GET route to retrieve courses for a specific student by studentId
app.get('/student-courses/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const result = await pool.query(
            `SELECT student_course_id, student_Id, course_Id, session_Id, semester_Id 
             FROM studentcourses 
             WHERE student_Id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No courses found for this student' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({ error: 'Failed to fetch student courses' });
    }
});

// Express Routes (only updating the /login route)
app.post('/login', async (req, res) => {
    console.log("Incoming login request.");
    const { loginId, password } = req.body;
    if (!loginId || !password) {
        console.error("Validation Error: Missing login ID or password.");
        return res.status(400).json({ error: 'Login ID and password are required.' });
    }
    let client;
    try {
        client = await pool.connect();
        
        // Step 1: Check if the loginId matches a student's matriculation_number
        let user = null;
        let role = null;
        let redirectUrl = '';

        const studentQuery = `
            SELECT u.user_id, u.username, u.password, u.role, u.student_id, u.lecturer_id
            FROM Users u
            JOIN Students s ON u.student_id = s.student_id
            WHERE s.matriculation_number = $1;
        `;
        let result = await client.query(studentQuery, [loginId]);
        if (result.rowCount > 0) {
            user = result.rows[0];
            role = 'student';
        } else {
            // Step 2: If not a student, check if loginId matches a lecturer's staff_id
            const lecturerQuery = `
                SELECT u.user_id, u.username, u.password, u.role, u.student_id, u.lecturer_id
                FROM Users u
                JOIN Lecturers l ON u.lecturer_id = l.lecturer_id
                WHERE l.staff_id = $1;
            `;
            result = await client.query(lecturerQuery, [loginId]);
            if (result.rowCount > 0) {
                user = result.rows[0];
                role = 'lecturer';
            } else {
                // Step 3: If not a lecturer, check if loginId matches an admin's username or admin_id
                const adminQuery = `
                    SELECT u.user_id, u.username, u.password, u.role, u.student_id, u.lecturer_id
                    FROM Users u
                    WHERE u.username = $1;
                `;
                result = await client.query(adminQuery, [loginId]);
                if (result.rowCount > 0) {
                    user = result.rows[0];
                    role = 'admin';
                }
            }
        }

        // Step 4: If no user is found, return an error
        if (!user) {
            console.warn(`User with login ID ${loginId} not found.`);
            return res.status(401).json({ error: 'Invalid login ID or password.' });
        }

        // Step 5: Compare the provided password with the hashed password using bcrypt
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.warn(`Incorrect password for login ID ${loginId}.`);
            return res.status(401).json({ error: 'Invalid login ID or password.' });
        }

        console.log(`User with login ID ${loginId} logged in successfully with role: ${user.role}`);

        // Step 6: Prepare redirect URL based on role
        if (user.role === 'student' && user.student_id) {
            redirectUrl = `/student-home.html?user_id=${user.user_id}&student_id=${user.student_id}`;
        } else if (user.role === 'lecturer' && user.lecturer_id) {
            redirectUrl = `/lecturer-home.html?user_id=${user.user_id}&lecturer_id=${user.lecturer_id}`;
        } else if (user.role === 'admin') {
            redirectUrl = `/admin-home.html?user_id=${user.user_id}`;
        } else {
            return res.status(403).json({ error: 'Invalid user role.' });
        }

        res.status(200).json({
            message: 'Login successful.',
            redirectUrl: redirectUrl,
            user: { user_id: user.user_id, role: user.role }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'An internal server error occurred during login.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Route to get staff details by staff_id
app.get('/staff/:staffId', async (req, res) => {
    const { staffId } = req.params;
    console.log(req.params)

    try {
        const staff = await getStaffById(staffId);
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.status(200).json(staff);
        console.log(staff)
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to fetch staff details from the database
async function getStaffById(staffId) {
    const query = `
      SELECT l.first_name, l.last_name, l.staff_id, l.email, l.department_id, d.department_name
        FROM Users u
        JOIN Lecturers l ON u.lecturer_id = l.lecturer_id
        LEFT JOIN Departments d ON l.department_id = d.department_id
        WHERE u.user_id = $1
    `;
    const values = [staffId];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});