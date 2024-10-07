

// Number of salt rounds (cost factor)
const saltRounds = 13;

// Function to hash a password
// Client-side: Function to handle the signup process
async function handleSignup() {
    const signName = document.getElementById('signName').value;
    const signPassword = document.getElementById('signPassword').value;
    const signConfPassword = document.getElementById('signConfPassword').value;

    if (signPassword !== signConfPassword) {
        alert('Passwords do not match');
        return;
    }

    // Send the data to the server for hashing and storage
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: signName, password: signPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Signup successful');
        } else {
            alert(`Signup failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
    }
}

// Client-side: Function to handle the login process
async function handleLogin() {
    const loginName = document.getElementById('loginUsername').value;
    const loginPassword = document.getElementById('loginPassword').value;

    // Send the login credentials to the server for verification
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: loginName, password: loginPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Login successful');
            console.log('JWT Token:', data.token);
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

function mainNavigation() {
    const navItems = document.querySelectorAll("footer ul li");
    const sections = document.querySelectorAll("section");
    const pageNames = ["home", "pay"];

    // Add click event listeners to each navigation item
    navItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            // Deactivate the currently active nav item
            document.querySelector("footer ul li.active")?.classList.remove("active");
            item.classList.add("active");

            // Activate the corresponding section
            activateHTML(document.querySelector("section.active"), sections[index]);

            // Determine the page name for history state
            const pageName = pageNames[index] || "home"; // Default to "home" if index is out of range
            window.history.pushState({ page: pageName, action: "default" }, '', "");
        });
    });
    navItems[2].addEventListener("click", async function() {
        const activePage = document.querySelector("section.active");
        const matchingPage = document.getElementById("form");

        activateHTML(activePage, matchingPage);
    });
}

function activateHTML(hideThisBox, showThisBox) {
    // Check if showThisBox is already active
    if (showThisBox.classList.contains("active")) {
        return; // Exit early if already active
    }

    hideThisBox.classList.remove("active");

    setTimeout(() => {
        hideThisBox.style.display = "none";
        showThisBox.style.display = "flex";

        setTimeout(() => {
            showThisBox.classList.add("active");
        }, 100);
    }, 100);
}

document.addEventListener('DOMContentLoaded', async function() {
    await mainNavigation();
})


document.addEventListener('DOMContentLoaded', function() {
    const signUpBtn = document.getElementById("createAccount");
    const chk = document.getElementById('chk');
    const logInBtn = document.getElementById("login");
    const accountForm = document.getElementById("form");
    const paySection = document.getElementById("pay");
    const detailsPage = document.getElementById("payDetailsPage");
    const accountInfoPage = document.getElementById("accountInformationPage");
    const nextBtn = document.querySelector("#pay .body .page .bottom #nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    const signPassword = document.getElementById('signPassword');
    const signConfirmPassword = document.getElementById('signConfPassword');

    const loginPassword = document.getElementById('loginPassword');

    signUpBtn.addEventListener('click', async function() {

        const plainPassword = signPassword.value;
        const confPassword = signConfirmPassword.value;

        
        event.preventDefault(); // Prevent form submission
        handleSignup(); // Call the signup handler
        
    });

    logInBtn.addEventListener('click', async function() {

        event.preventDefault(); // Prevent form submission
        handleLogin(); // Call the login handler

        activateHTML(accountForm, paySection);
    });

    nextBtn.addEventListener('click', function() {
        activateHTML(detailsPage, accountInfoPage);
    });
})