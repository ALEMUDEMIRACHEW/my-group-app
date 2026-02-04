const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.onload = () => {
    fetchMembers();
    fetchSongs();
    fetchCourses();
    fetchAnnouncement();
};

function previewImage(event) {
    const reader = new FileReader();
    const preview = document.getElementById('imagePreview');
    reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
    }
    if (event.target.files[0]) reader.readAsDataURL(event.target.files[0]);
}

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

async function fetchMembers() {
    let { data: members } = await _supabase.from('members').select('*').order('name', { ascending: true });
    if (members) {
        displayMembers(members);
        const present = members.filter(m => m.is_present).length;
        document.getElementById('headcount').innerText = `Total: ${members.length} | Present: ${present}`;
    }
}

async function addMember() {
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const submitBtn = document.getElementById('submitBtn');
    const progressContainer = document.getElementById('uploadProgressContainer');
    const progressBar = document.getElementById('uploadProgressBar');
    const fileInput = document.getElementById('photoFile');
    const file = fileInput.files[0];
    let photoUrl = 'https://via.placeholder.com/150';

    if (!document.getElementById('nameInput').value) { alert("Enter a name"); return; }

    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    if (file) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '40%'; 
        
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await _supabase.storage.from('profile-photos').upload(fileName, file);

        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            resetBtn();
            return;
        }
        
        progressBar.style.width = '100%';
        const { data } = _supabase.storage.from('profile-photos').getPublicUrl(fileName);
        photoUrl = data.publicUrl;
    }

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

    await _supabase.from('members').insert([payload]);
    
    document.querySelectorAll('.profile-grid-form input, select').forEach(i => i.value = "");
    document.getElementById('imagePreview').style.display = 'none';
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    resetBtn();
    fetchMembers();

    function resetBtn() {
        btnText.style.display = 'inline-block';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
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
                    <p style="margin:2px 0;">🎯 ${m.activity || 'No activity'}</p>
                </div>
                <button onclick="deleteMember(${m.id})" class="delete-btn">[ Delete Profile ]</button>
            </div>`;
        list.appendChild(li);
    });
}

async function toggleAttendance(id, status) {
    await _supabase.from('members').update({ is_present: !status }).eq('id', id);
    fetchMembers();
}

async function deleteMember(id) {
    if (confirm("Delete profile?")) {
        await _supabase.from('members').delete().eq('id', id);
        fetchMembers();
    }
}

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
        li.className = "song-item";
        li.innerHTML = `<div><strong>${s.title}</strong> <small>(${s.category})</small></div>
                        <div><a href="${s.link}" target="_blank">🔗</a></div>`;
        list.appendChild(li);
    });
}
async function fetchCourses() {
    let { data } = await _supabase.from('courses').select('*').order('id', { ascending: false }).limit(1);
    if (data && data.length > 0) {
        document.getElementById('courseDisplay').innerHTML = `
            <div class="course-badge">
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