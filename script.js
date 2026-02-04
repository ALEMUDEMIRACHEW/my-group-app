window.onload = function() {
    fetchMembers();
    fetchSongs(); // This ensures songs load when you open the app
};
// 1. Your Supabase Connection Details
const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Automatically load members when the page opens
window.onload = function() {
    fetchMembers();
};

// 2. SAVE a member to Supabase
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

    if (error) {
        console.error("Error saving:", error.message);
        alert("Error saving: " + error.message);
    } else {
        nameInput.value = ""; 
        fetchMembers(); 
    }
}

// 3. GET all members from Supabase
async function fetchMembers() {
    let { data: members, error } = await _supabase
        .from('members')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching data:", error.message);
    } else {
        displayMembers(members);
    }
}

// 4. DISPLAY members with Delete and Toggle features
function displayMembers(members) {
    let memberList = document.getElementById('memberList');
    memberList.innerHTML = ""; 

    members.forEach(function(member) {
        let li = document.createElement('li');
        // Simple styling to make it look organized
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "5px 0";
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

// 5. UPDATE attendance status in the cloud
async function toggleAttendance(id, currentStatus) {
    const { error } = await _supabase
        .from('members')
        .update({ is_present: !currentStatus })
        .eq('id', id);

    if (error) {
        alert("Error updating: " + error.message);
    } else {
        fetchMembers(); // Refresh the list
    }
}

// 6. DELETE a member from the cloud
async function deleteMember(id) {
    if (confirm("Delete this member?")) {
        const { error } = await _supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            fetchMembers(); // Refresh the list
        }
    }
}
// --- SONG LIST FUNCTIONS ---

// 1. Fetch songs from Supabase when page loads
async function fetchSongs() {
    let { data: songs, error } = await _supabase
        .from('songs')
        .select('*')
        .order('id', { ascending: false });

    if (error) console.error(error);
    else displaySongs(songs);
}

// 2. Add a new song to the cloud
async function addSong() {
    const title = document.getElementById('songTitle').value;
    const link = document.getElementById('songLink').value;

    if (!title) { alert("Enter a song title!"); return; }

    const { error } = await _supabase
        .from('songs')
        .insert([{ title: title, link: link }]);

    if (error) alert(error.message);
    else {
        document.getElementById('songTitle').value = "";
        document.getElementById('songLink').value = "";
        fetchSongs();
    }
}

// 3. Display songs on the screen
function displaySongs(songs) {
    const list = document.getElementById('songList');
    list.innerHTML = "";
    songs.forEach(song => {
        let li = document.createElement('li');
        li.innerHTML = `
            <strong>${song.title}</strong> 
            ${song.link ? `<a href="${song.link}" target="_blank">🔗 View Link</a>` : ''}
            <button onclick="deleteSong(${song.id})" style="color:red; background:none; border:none; float:right;">X</button>
        `;
        list.appendChild(li);
    });
}

// 4. Delete a song
async function deleteSong(id) {
    if(confirm("Delete this song?")) {
        await _supabase.from('songs').delete().eq('id', id);
        fetchSongs();
    }
}

// Add this line inside your window.onload function so it loads songs too:
// fetchSongs();