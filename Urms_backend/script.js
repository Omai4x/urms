// Base URL for API requests
const API_BASE_URL = 'http://localhost:3000';

// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Utility function to display messages
function displayMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = isError ? 'error' : 'success';
    setTimeout(() => element.textContent = '', 5000);
}

// Fetch and display pending students
async function loadPendingStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/pending_students`);
        const students = await response.json();
        const tbody = document.getElementById('pending-students-list');
        tbody.innerHTML = '';

        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.pending_student_id}</td>
                <td>${student.first_name}</td>
                <td>${student.last_name}</td>
                <td>${student.email}</td>
                <td>${student.department_id}</td>
                <td class="action-buttons">
                    <button onclick="deletePendingStudent('${student.pending_student_id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading pending students:', error);
        displayMessage('pending-students-list', 'Failed to load pending students', true);
    }
}

// Delete pending student
async function deletePendingStudent(studentId) {
    if (!confirm('Are you sure you want to delete this pending student?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/pending_students/${studentId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            displayMessage('pending-students-list', 'Pending student deleted successfully');
            loadPendingStudents();
        } else {
            throw new Error('Failed to delete pending student');
        }
    } catch (error) {
        console.error('Error deleting pending student:', error);
        displayMessage('pending-students-list', 'Failed to delete pending student', true);
    }
}

// Process admission
document.getElementById('admission-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        pending_student_id: document.getElementById('admission-student-id').value,
        action: document.getElementById('admission-action').value,
        matric_number: document.getElementById('admission-matric-number').value,
        rejection_reason: document.getElementById('admission-rejection-reason').value,
        processed_by_user_id: document.getElementById('admission-processed-by').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/process_student_admission`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('admission-message', result.message);
            document.getElementById('admission-form').reset();
            loadPendingStudents();
        } else {
            throw new Error(result.error || 'Failed to process admission');
        }
    } catch (error) {
        console.error('Error processing admission:', error);
        displayMessage('admission-message', error.message, true);
    }
});

// Assign courses
document.getElementById('course-assignment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        matric_number: document.getElementById('course-matric-number').value,
        session_id: document.getElementById('course-session-id').value,
        semester_id: document.getElementById('course-semester-id').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/assign_student_semester_courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('course-assignment-message', result.message);
            document.getElementById('course-assignment-form').reset();
        } else {
            throw new Error(result.error || 'Failed to assign courses');
        }
    } catch (error) {
        console.error('Error assigning courses:', error);
        displayMessage('course-assignment-message', error.message, true);
    }
});

// Create lecturer
document.getElementById('lecturer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        staffId: document.getElementById('lecturer-staff-id').value,
        departmentId: document.getElementById('lecturer-department-id').value,
        first_name: document.getElementById('lecturer-first-name').value,
        last_name: document.getElementById('lecturer-last-name').value,
        email: document.getElementById('lecturer-email').value,
        phone_number: document.getElementById('lecturer-phone-number').value,
        address: document.getElementById('lecturer-address').value,
        gender: document.getElementById('lecturer-gender').value,
        date_of_birth: document.getElementById('lecturer-date-of-birth').value,
        intended_password: document.getElementById('lecturer-password').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/lecturers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('lecturer-message', result.message);
            document.getElementById('lecturer-form').reset();
        } else {
            throw new Error(result.error || 'Failed to create lecturer');
        }
    } catch (error) {
        console.error('Error creating lecturer:', error);
        displayMessage('lecturer-message', error.message, true);
    }
});

// Update lecturer
document.getElementById('lecturer-update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const lecturerId = document.getElementById('update-lecturer-id').value;
    const updateData = {};

    const fields = ['first_name', 'last_name', 'email'];
    fields.forEach(field => {
        const value = document.getElementById(`update-lecturer-${field}`).value;
        if (value) updateData[field] = value;
    });

    try {
        const response = await fetch(`${API_BASE_URL}/lecturers/${lecturerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('lecturer-update-message', result.message);
            document.getElementById('lecturer-update-form').reset();
        } else {
            throw new Error(result.error || 'Failed to update lecturer');
        }
    } catch (error) {
        console.error('Error updating lecturer:', error);
        displayMessage('lecturer-update-message', error.message, true);
    }
});

// Post result
document.getElementById('result-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        student_id: document.getElementById('result-student-id').value,
        course_id: document.getElementById('result-course-id').value,
        semester_id: document.getElementById('result-semester-id').value,
        session_id: document.getElementById('result-session-id').value,
        score: parseFloat(document.getElementById('result-score').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('result-message', result.message);
            document.getElementById('result-form').reset();
        } else {
            throw new Error(result.error || 'Failed to post result');
        }
    } catch (error) {
        console.error('Error posting result:', error);
        displayMessage('result-message', error.message, true);
    }
});

// Update result
document.getElementById('result-update-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultId = document.getElementById('update-result-id').value;
    const formData = {
        score: parseFloat(document.getElementById('update-result-score').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/results/${resultId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            displayMessage('result-update-message', result.message);
            document.getElementById('result-update-form').reset();
        } else {
            throw new Error(result.error || 'Failed to update result');
        }
    } catch (error) {
        console.error('Error updating result:', error);
        displayMessage('result-update-message', error.message, true);
    }
});

// Initial load
loadPendingStudents();