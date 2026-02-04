// ... (Supabase Config same as before) ...

let currentMembers = []; // Store members locally for easy detail lookup

async function fetchMembers() {
    let { data: members } = await _supabase.from('members').select('*').order('name', { ascending: true });
    if (members) {
        currentMembers = members;
        displayMembers(members);
        const present = members.filter(m => m.is_present).length;
        document.getElementById('headcount').innerText = `Total: ${members.length} | Present: ${present}`;
    }
}

function displayMembers(members) {
    const list = document.getElementById('memberList');
    list.innerHTML = "";
    members.forEach(m => {
        const li = document.createElement('li');
        li.className = "profile-tile";
        li.innerHTML = `
            <div onclick="openProfile(${m.id})">
                <img src="${m.photo_url}">
                <div class="tile-info">
                    <strong>${m.name}</strong>
                    <small>${m.role || 'Member'}</small>
                </div>
            </div>
            <input type="checkbox" ${m.is_present ? 'checked' : ''} onclick="toggleAttendance(${m.id}, ${m.is_present})">
        `;
        list.appendChild(li);
    });
}

// THE "NEW PAGE" DETAIL VIEW
function openProfile(id) {
    const m = currentMembers.find(member => member.id === id);
    const modal = document.getElementById('memberModal');
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <div class="detail-view">
            <img src="${m.photo_url}" class="detail-img">
            <h1>${m.name}</h1>
            <span class="role-badge" style="font-size:1rem;">${m.role || 'Member'}</span>
            <hr>
            <div class="detail-info">
                <p><strong>Age:</strong> ${m.age || 'N/A'}</p>
                <p><strong>Marital Status:</strong> ${m.marital_status || 'N/A'}</p>
                <p><strong>Job:</strong> ${m.job_status || 'N/A'}</p>
                <p><strong>Location:</strong> ${m.location || 'N/A'}</p>
                <p><strong>Current Activity:</strong> ${m.activity || 'None'}</p>
            </div>
            <button onclick="deleteMember(${m.id})" class="delete-btn">Delete Profile</button>
        </div>
    `;
    modal.style.display = "block";
}

function closeModal() {
    document.getElementById('memberModal').style.display = "none";
}

// ... (Other functions: addMember, toggleAttendance, etc. stay same) ...