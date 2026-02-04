const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.onload = () => {
    fetchMembers();
    fetchSongs();
    fetchCourses();
    fetchAnnouncement();
};

// --- IMAGE PREVIEW LOGIC ---
function previewImage(event) {
    const reader = new FileReader();
    const preview = document.getElementById('imagePreview');
    reader.onload = function() {
        preview.src = reader.result;
        preview.style.display = 'block';
    }
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

// --- ANNOUNCEMENTS ---
async function fetchAnnouncement() {
    let { data } = await _supabase.from('announcements').select('*').order('id', { ascending: false }).limit(1);
    if (data && data.length > 0) document.getElementById('announcementDisplay').innerText = data[0].content;
}

async function updateAnnouncement() {
    const val = document.getElementById('announcementInput').value;
    if (!val) return;
    await _supabase.from('announcements').insert([{ content: val }]);
    document.getElementById('announcementInput').value = "";
    fetchAnnouncement();
}

// --- MEMBERS & PROFILES (WITH IMAGE UPLOAD) ---
async function fetchMembers() {
    let { data: members } = await _supabase.from('members').select('*').order('name', { ascending: true });
    if (members) {
        displayMembers(members);
        const present = members.filter(m => m.is_present).length;
        document.getElementById('headcount').innerText = `Total: ${members.length} | Present: ${present}`;
    }
}

async function addMember() {
    const submitBtn = document.getElementById('submitBtn');
    const fileInput = document.getElementById('photoFile');
    const file = fileInput.files[0];
    let photoUrl = 'https://via.placeholder.com/150'; // Default

    if (!document.getElementById('nameInput').value) {
        alert("Please enter a name");
        return;
    }

    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    // 1. Upload Image to Storage Bucket
    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await _supabase.storage
            .from('profile-photos') // MUST exist in your Supabase dashboard
            .upload(filePath, file);

        if (uploadError) {
            alert("Image upload failed: " + uploadError.message);
            submitBtn.innerText = "Create Profile";
            submitBtn.disabled = false;
            return;
        }

        // 2. Get Public URL
        const { data } = _supabase.storage.from('profile-photos').getPublicUrl(filePath);
        photoUrl = data.publicUrl;
    }

    // 3. Insert into Database
    const payload = {
        name: document.getElementById('nameInput').value,
        photo_url: photoUrl,
        age: document.getElementById('ageInput').value,
        job_status: document.getElementById('jobInput').value,
        marital_status: document.getElementById('maritalInput').value,
        location: document.getElementById('locationInput').value,
        role: document.getElementById('roleInput').value,
        activity: document.getElementById('activityInput').value,
        is_present: false
    };

    const { error } = await _supabase.from('members').insert([payload]);
    
    if (error) {
        alert("Error saving member: " + error.message);
    } else {
        // Reset Form
        document.querySelectorAll('.profile-grid-form input, select').forEach(i => i.value = "");
        document.getElementById('imagePreview').style.display = 'none';
        fetchMembers();
    }
    
    submitBtn.innerText = "Create Profile";
    submitBtn.disabled = false;
}

function displayMembers(members) {
    const list = document.getElementById('memberList');
    list.innerHTML = "";
    members.forEach(m => {
        const li = document.createElement('li');
        li.className = "profile-card";
        li.innerHTML = `
            <img src="${m.photo_url}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${m.name}</h3>
                    <input type="checkbox" ${m.is_present ? 'checked' : ''} onclick="toggleAttendance(${m.id}, ${m.is_present})">
                </div>
                <span class="role-badge">${m.role || 'Member'}</span>
                <div style="font-size: 0.85em; color: #666; margin-top: 10px;">
                    <p style="margin:2px 0;">📍 ${m.location || 'N/A'}</p>
                    <p style="margin:2px 0;">💼 ${m.job_status || 'N/A'}</p>
                    <p style="margin:2px 0;">🎯 ${m.activity || 'No current activity'}</p>
                </div>
                <button onclick="deleteMember(${m.id})" style="margin-top:10px; color:#e74c3c; border:none; background:none; cursor:pointer; font-size:0.8em; font-weight:bold;">[ Delete Profile ]</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function toggleAttendance(id, status) {
    await _supabase.from('members').update({ is_present: !status }).eq('id', id);
    fetchMembers();
}

async function deleteMember(id) {
    if (confirm("Permanently delete this profile?")) {
        await _supabase.from('members').delete().eq('id', id);
        fetchMembers();
    }
}

// --- SONGS & COURSES ---
async function fetchSongs() {
    let { data } = await _supabase.from('songs').select('*').order('id', { ascending: false });
    if (data) displaySongs(data);
}

function filterSongs() {
    const term = document.getElementById('songSearch').value.toLowerCase();
    document.querySelectorAll('#songList li').forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(term) ? "flex" : "none";
    });
}

async function addSong() {
    const title = document.getElementById('songTitle').value;
    const cat = document.getElementById('songCategory').value;
    const link = document.getElementById('songLink').value;
    await _supabase.from('songs').insert([{ title, category: cat, link }]);
    fetchSongs();
}

function displaySongs(songs) {
    const list = document.getElementById('songList');
    list.innerHTML = "";
    songs.forEach(s => {
        const li = document.createElement('li');
        li.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        li.innerHTML = `<div><strong>${s.title}</strong> <small>(${s.category})</small></div>
                        <div><a href="${s.link}" target="_blank">🔗</a></div>`;
        list.appendChild(li);
    });
}

async function fetchCourses() {
    let { data } = await _supabase.from('courses').select('*').order('id', { ascending: false }).limit(1);
    if (data && data.length > 0) {
        document.getElementById('courseDisplay').innerHTML = `
            <div style="background:#f0f7ff; padding:15px; border-radius:8px; border-left:4px solid #3498db;">
                <h3>${data[0].title}</h3>
                <p>Time: ${data[0].meeting_time}</p>
                <a href="${data[0].material_link}" target="_blank">View Material</a>
            </div>`;
    }
}

async function addCourse() {
    const title = document.getElementById('courseTitle').value;
    const time = document.getElementById('courseTime').value;
    const link = document.getElementById('courseLink').value;
    await _supabase.from('courses').insert([{ title, meeting_time: time, material_link: link }]);
    fetchCourses();
}