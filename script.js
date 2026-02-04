const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.onload = () => {
    if (document.getElementById('memberList')) {
        fetchMembers();
        fetchAnnouncement();
    }
};

// PREVIEW IMAGE
function previewImage(event) {
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; preview.style.display = 'block'; };
    if (event.target.files[0]) reader.readAsDataURL(event.target.files[0]);
}

// FETCH ALL MEMBERS FOR INDEX
async function fetchMembers() {
    let { data: members } = await _supabase.from('members').select('*').order('name', { ascending: true });
    if (members) {
        displayMembers(members);
        document.getElementById('headcount').innerText = `Total: ${members.length}`;
    }
}

function displayMembers(members) {
    const list = document.getElementById('memberList');
    list.innerHTML = "";
    members.forEach(m => {
        const li = document.createElement('li');
        li.className = "member-item";
        // LINKING TO PROFILE.HTML WITH ID
        li.innerHTML = `
            <a href="profile.html?id=${m.id}" class="member-link">
                <img src="${m.photo_url}">
                <div class="member-name">${m.name}</div>
                <div class="member-role">${m.role || 'Member'}</div>
            </a>
        `;
        list.appendChild(li);
    });
}

// FETCH SINGLE MEMBER FOR PROFILE PAGE
async function fetchSingleMember(id) {
    const { data, error } = await _supabase.from('members').select('*').eq('id', id).single();
    const container = document.getElementById('profileDetail');
    if (data) {
        container.innerHTML = `
            <img src="${data.photo_url}" class="large-avatar">
            <h1>${data.name}</h1>
            <span class="role-badge">${data.role || 'Member'}</span>
            <div class="profile-info-grid">
                <p><strong>Age:</strong> ${data.age || 'N/A'}</p>
                <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
                <p><strong>Job:</strong> ${data.job_status || 'N/A'}</p>
                <p><strong>Activity:</strong> ${data.activity || 'N/A'}</p>
            </div>
            <button onclick="deleteAndRedirect(${data.id})" class="btn-danger">Delete Profile</button>
        `;
    }
}

// ... (Add your existing addMember and updateAnnouncement functions here) ...

async function deleteAndRedirect(id) {
    if(confirm("Delete this member?")) {
        await _supabase.from('members').delete().eq('id', id);
        window.location.href = 'index.html';
    }
}