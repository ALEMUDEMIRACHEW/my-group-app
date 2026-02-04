// 1. Supabase Connection Details
const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Automatically load everything when the page opens
window.onload = function() {
    fetchMembers();
    fetchSongs();
    fetchCourses();
};

// --- MEMBER FUNCTIONS ---

async function fetchMembers() {
    let { data: members, error } = await _supabase
        .from('members')
        .select('*')
        .order('id', { ascending: true });

    if (error) console.error("Error fetching members:", error.message);
    else displayMembers(members);
}

async function addMember() {
    let nameInput = document.getElementById('nameInput');
    let nameValue = nameInput.value.trim();

    if (nameValue === "") {
        alert("Please type a name!");
        return;
    }

    const { error } = await _supabase
        .from('members')
        .insert([{ name: nameValue, is_present: false }]);

    if (error) alert("Error saving: " + error.message);
    else {
        nameInput.value = ""; 
        fetchMembers(); 
    }
}

function displayMembers(members) {
    let memberList = document.getElementById('memberList');
    memberList.innerHTML = ""; 

    members.forEach(function(member) {
        let li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";

        li.innerHTML = `
            <span>${member.name}</span> 
            <div>
                <input type="checkbox" ${member.is_present ? 'checked' : ''} 
                    onclick="toggleAttendance(${member.id}, ${member.is_present})"> 
                <span style="font-size: 0.8em; margin-right: 10px;">Present</span>
                <button onclick="deleteMember(${member.id})" 
                    style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">
                    [X]
                </button>
            </div>
        `;
        memberList.appendChild(li);
    });
}

async function toggleAttendance(id, currentStatus) {
    const { error } = await _supabase
        .from('members')
        .update({ is_present: !currentStatus })
        .eq('id', id);

    if (error) alert("Error updating: " + error.message);
    else fetchMembers();
}

async function deleteMember(id) {
    if (confirm("Delete this member?")) {
        const { error } = await _supabase.from('members').delete().eq('id', id);
        if (error) alert("Error deleting: " + error.message);
        else fetchMembers();
    }
}

// --- SONG LIST FUNCTIONS ---

async function fetchSongs() {
    let { data: songs, error } = await _supabase
        .from('songs')
        .select('*')
        .order('id', { ascending: false });

    if (error) console.error("Error fetching songs:", error.message);
    else displaySongs(songs);
}

async function addSong() {
    const title = document.getElementById('songTitle').value;
    const category = document.getElementById('songCategory').value; // Included Category
    const link = document.getElementById('songLink').value;

    if (!title) { alert("Enter a song title!"); return; }

    const { error } = await _supabase
        .from('songs')
        .insert([{ title: title, category: category, link: link }]);

    if (error) alert(error.message);
    else {
        document.getElementById('songTitle').value = "";
        document.getElementById('songCategory').value = "";
        document.getElementById('songLink').value = "";
        fetchSongs();
    }
}

function displaySongs(songs) {
    const list = document.getElementById('songList');
    list.innerHTML = "";
    songs.forEach(song => {
        let li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.padding = "10px";

        li.innerHTML = `
            <div>
                <small style="color: #27ae60; font-weight: bold; display: block;">${song.category || 'General'}</small>
                <strong>${song.title}</strong> 
            </div>
            <div>
                ${song.link ? `<a href="${song.link}" target="_blank" style="margin-right:10px;">🔗 View</a>` : ''}
                <button onclick="deleteSong(${song.id})" style="color:red; background:none; border:none; cursor:pointer;">[X]</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function deleteSong(id) {
    if(confirm("Delete this song?")) {
        await _supabase.from('songs').delete().eq('id', id);
        fetchSongs();
    }
}

// --- COURSE FUNCTIONS ---

async function fetchCourses() {
    let { data: courses, error } = await _supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: false });

    if (!error && courses.length > 0) {
        displayCourse(courses[0]); 
    }
}

async function addCourse() {
    const title = document.getElementById('courseTitle').value;
    const time = document.getElementById('courseTime').value;
    const link = document.getElementById('courseLink').value;

    const { error } = await _supabase
        .from('courses')
        .insert([{ title: title, meeting_time: time, material_link: link }]);

    if (error) alert(error.message);
    else {
        // Clear inputs after success
        document.getElementById('courseTitle').value = "";
        document.getElementById('courseTime').value = "";
        document.getElementById('courseLink').value = "";
        fetchCourses();
    }
}

function displayCourse(course) {
    const display = document.getElementById('courseDisplay');
    display.innerHTML = `
        <div class="course-item" style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top:0;">${course.title}</h3>
            <p><strong>Next Meeting:</strong> ${course.meeting_time}</p>
            ${course.material_link ? `<a href="${course.material_link}" target="_blank" class="link">Download PDF Material</a>` : ''}
        </div>
    `;
}