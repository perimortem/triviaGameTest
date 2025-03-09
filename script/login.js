// Login Handle
let users = [];
// Fetch users data
fetch('../db/users.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        users = data.users; // Access the nested "users" array
        console.log("Users data loaded:", users); // Check if users array is loaded
    })
    .catch(error => console.error('Error loading user data:', error));

// Match username and password
function matchUsernameToPassword(username, password) {
    console.log("Attempting to match username:", username, "with password:", password);
    
    if (!Array.isArray(users) || users.length === 0) {
        alert("User data not loaded yet. Please try again.");
        console.log("User data not loaded yet");
        return false;
    }

    const user = users.find(user => user.username === username);
    console.log("Found user:", user);
    
    if (user) {
        if (user.password === password) {
            alert("Login successful!");
            console.log("Login successful!");

            // Store user info in session storage
            sessionStorage.setItem('user', JSON.stringify(user));

            // Redirect to the next page
            window.location.href = "choose-action.html";
            return true;
        } else {
            alert("Incorrect password.");
            console.log("Incorrect password.");
            return false;
        }
    } else {
        alert("Username not found.");
        console.log("Username not found.");
        return false;
    }
}

// Form handling
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Form submitted with:", { username, password });
    matchUsernameToPassword(username, password);
}