// 1. Paste your Supabase details here (from your Supabase settings)
const supabaseUrl = 'https://rntxwnovbkmnqiylvqnq.supabase.co';
const supabaseKey = 'YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudHh3bm92YmttbnFpeWx2cW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTIwMjEsImV4cCI6MjA4NTc2ODAyMX0.QpO8mXj4rx0uJRyUM94YyIzm0pPRgl00DQvePOIrF04OUR_ANON_PUBLIC_KEY_HERE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// This runs automatically when the page opens
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

    // This sends the data to your 'members' table in Supabase
    const { data, error } = await _supabase
        .from('members')
        .insert([{ name: nameValue }]);

    if (error) {
        console.error("Error saving to Supabase:", error.message);
        alert("Error saving: " + error.message);
    } else {
        nameInput.value = ""; // Clear the box
        fetchMembers(); // Refresh the list to show the new name
    }
}

// 3. GET all members from Supabase to show on screen
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

// 4. PUT the members onto your website
function displayMembers(members) {
    let memberList = document.getElementById('memberList');
    memberList.innerHTML = ""; // Clear current list

    members.forEach(function(member) {
        let li = document.createElement('li');
        li.innerHTML = `
            <span>${member.name}</span> 
            <input type="checkbox" ${member.is_present ? 'checked' : ''}> Present
        `;
        memberList.appendChild(li);
    });
}