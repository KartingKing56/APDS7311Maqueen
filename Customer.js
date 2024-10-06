

// Number of salt rounds (cost factor)
const saltRounds = 13;

// Function to hash a password
async function hashPassword(password) {
    try {
        // Generate a salt
        const salt = await genSalt(saltRounds);
        
        // Hash the password with the salt
        const hashedPassword = await hash(password, salt);
        
        return hashedPassword;
    } catch (error) {
        console.error("Error while hashing password:", error);
        throw error;
    }
}

async function matchingPasswords(password, confirm) {

    const matches = password === confirm;

    return matches;
}

// Function to check if a password matches the stored hash
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        // Compare the provided plain password with the hashed password stored in the database
        const match = await compare(plainPassword, hashedPassword);
        
        return match;  // True if it matches, false otherwise
    } catch (error) {
        console.error("Error while verifying password:", error);
        throw error;
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

        if (matchingPasswords(plainPassword, confPassword))
        {
            const hashedPassword = await hashPassword(plainPassword);
            console.log('Hashed Password:', hashedPassword);
            
            // Store hashedPassword in your database
        }
        
    });

    logInBtn.addEventListener('click', async function() {

        const storedHashedPassword = 'stored-hash-from-db';  // Get this from your database
        const password = loginPassword.value;
        const isMatch = await verifyPassword(password, storedHashedPassword);
        
        if (isMatch) {
            console.log('Password is correct, proceed with login.');
        } else {
            console.log('Incorrect password.');
        }

        activateHTML(accountForm, paySection);
    });

    nextBtn.addEventListener('click', function() {
        activateHTML(detailsPage, accountInfoPage);
    });
})