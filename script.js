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

    if (error) alert("Error saving member: " + error.message);
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

    if (error) alert("Error updating attendance: " + error.message);
    else fetchMembers();
}

async function deleteMember(id) {
    if (confirm("Delete this member?")) {
        const { error } = await _supabase.from('members').delete().eq('id', id);
        if (error) alert("Error deleting member: " + error.message);
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
    const titleInput = document.getElementById('songTitle');
    const categoryInput = document.getElementById('songCategory');
    const linkInput = document.getElementById('songLink');

    const title = titleInput.value.trim();
    const category = categoryInput.value.trim(); 
    const link = linkInput.value.trim();

    if (!title) { alert("Enter a song title!"); return; }

    const { error } = await _supabase
        .from('songs')
        .insert([{ title: title, category: category, link: link }]);

    if (error) alert("Error saving song: " + error.message);
    else {
        titleInput.value = "";
        categoryInput.value = "";
        linkInput.value = "";
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
        li.style.alignItems = "center";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";

        li.innerHTML = `
            <div>
                <span style="background: #e1f5fe; color: #01579b; padding: 2px 8px; border-radius: 4px; font-size: 0.7em; font-weight: bold; margin-bottom: 5px; display: inline-block;">
                    ${song.category ? song.category.toUpperCase() : 'GENERAL'}
                </span>
                <strong style="display: block;">${song.title}</strong> 
            </div>
            <div>
                ${song.link ? `<a href="${song.link}" target="_blank" style="margin-right:10px; text-decoration: none;">🔗 View</a>` : ''}
                <button onclick="deleteSong(${song.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">[X]</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function deleteSong(id) {
    if(confirm("Delete this song?")) {
        const { error } = await _supabase.from('songs').delete().eq('id', id);
        if (error) alert("Error deleting song: " + error.message);
        else fetchSongs();
    }
}

// --- COURSE FUNCTIONS ---

async function fetchCourses() {
    let { data: courses, error } = await _supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: false });

    if (error) console.error("Error fetching courses:", error.message);
    else if (courses.length > 0) {
        displayCourse(courses[0]); // Display the latest update
    }
}

async function addCourse() {
    const titleInput = document.getElementById('courseTitle');
    const timeInput = document.getElementById('courseTime');
    const linkInput = document.getElementById('courseLink');

    const title = titleInput.value.trim();
    const time = timeInput.value.trim();
    const link = linkInput.value.trim();

    if (!title) { alert("Enter a course title!"); return; }

    const { error } = await _supabase
        .from('courses')
        .insert([{ title: title, meeting_time: time, material_link: link }]);

    if (error) alert("Error updating course: " + error.message);
    else {
        titleInput.value = "";
        timeInput.value = "";
        linkInput.value = "";
        fetchCourses();
    }
}

function displayCourse(course) {
    const display = document.getElementById('courseDisplay');
    display.innerHTML = `
        <div class="course-item" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 5px solid #3498db;">
            <h3 style="margin-top:0; color: #2c3e50;">${course.title}</h3>
            <p style="margin: 5px 0;"><strong>Next Meeting:</strong> ${course.meeting_time || 'TBD'}</p>
            ${course.material_link ? `<a href="${course.material_link}" target="_blank" class="link" style="color: #3498db; font-weight: bold;">Download PDF Material</a>` : '<p style="font-size: 0.8em; color: gray;">No links attached</p>'}
        </div>
    `;
}