function addMember() {
    let name = document.getElementById('nameInput').value;
    if (name === "") {
        alert("Please type a name!");
        return;
    }
    let li = document.createElement('li');
    li.innerHTML = name + ' <input type="checkbox"> Present';
    document.getElementById('memberList').appendChild(li);
    document.getElementById('nameInput').value = ""; // Clear input
}