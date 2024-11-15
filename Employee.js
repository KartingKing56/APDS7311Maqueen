

const accountForm = document.getElementById("form");
const create = document.getElementById("signUpPage");
const login = document.getElementById("logInPage");
const homeSection = document.getElementById("home");
const verifySection = document.getElementById("verify");
const detailsPage = document.getElementById("payDetailsPage");
const accountInfoPage = document.getElementById("accountInformationPage");

const signUpBtn = document.getElementById("createAccount");
const chk = document.getElementById('chk');
const logInBtn = document.getElementById("login");
const nextBtn = document.querySelector("#pay .body .page .bottom #nextBtn");
const submitBtn = document.getElementById("submitBtn");
const localPaymentBtn = document.getElementById("localPaymentBtn");
const internationalPaymentBtn = document.getElementById("internationalPaymentBtn");

const signPassword = document.getElementById('signPassword');
const signConfirmPassword = document.getElementById('signConfPassword');

const loginPassword = document.getElementById('loginPassword');


let valid = true;

let myData;









let paymentData;

async function mainJS() {
    if (checkTokenAuthState())
    {
        try {
            
            const token = localStorage.getItem('jwtToken');
    
            if (!token) {
                console.error("No token found");
                displayAuth();
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/verifyToken', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const decodedToken = data.data;

                    myData = decodedToken;

                    displayHeader(myData);

                    // Check the role and perform actions accordingly
                    if (decodedToken.role === "employee") {
                        console.log("User is an Employee");
                        activateHTML(accountForm, homeSection);

                        window.history.pushState({ page: "home", action: "default" }, '', "");
                    } else {
                        console.log("User is a Customer");
                        window.location.href = "/Customer.html";
                    }
                } else {
                    console.error("Token verification failed:", data.message);
                    // Optionally, redirect to login or show an error message
                }
            } catch (error) {
                console.error("Error while verifying token:", error.message);
            }


            // ====================>   Start Up Functions   <======================

            mainNavigation();

            const tasks = [
                { func: () => getPaymentData(), name: "getPaymentData" },
            ];

            try {
                const results = await Promise.all(tasks.map(async ({ func, name }) => {
                    try {
                        return await func();
                    } catch (error) {
                        console.error(`${name} failed:`, error);
                        return null; // or handle as needed for each specific case
                    }
                }));


                // ====================>   Get data   


                paymentData = results[0];
                console.log("paymentData", paymentData)


                // ====================>   Initial Functions   


                //  >>> Main (Home)

                try {
                    displayPayments(paymentData);
                } catch (error) {
                    console.error(`Error in displayLeave: `, error);
                } 

                //  >>> Main (Drivers)



                //  >>> Main (Vehicles)

                

                //  >>> Main (Customers)



                //  >>> Main (Menu)




                // ====================>   Event Listeners   


                //  >>> Main (Home)
                
                document.querySelector("#home #morePending").addEventListener("click", () => {
                    try {
                        const activePage = document.querySelector("#home .body .page.active");
                        const seeMorePayments = document.querySelector("#home .body #seeMorePayments");

                        activateHTML(activePage, seeMorePayments);
                        window.history.pushState({ page: "home", action: "seeMore" }, '', "");
                
                        document.querySelector("#home .header").classList.add("active");
                
                        const title = "Pending Payments"
                
                        displayMorePayments(paymentData, paymentData.pendingPayments, title, "No Pending Payments...");

                    } catch (error) {
                        console.error(`Error in displayMorePayments`, error);
                    }
                });
                
                document.querySelector("#moreApproved").addEventListener("click", () => {
                    try {
                        const activePage = document.querySelector("#home .body .page.active");
                        const seeMorePayments = document.querySelector("#home .body #seeMorePayments");

                        activateHTML(activePage, seeMorePayments);
                        window.history.pushState({ page: "home", action: "seeMore" }, '', "");
                
                        document.querySelector("#home .header").classList.add("active");
                
                        const title = "Approved Payments"
                
                        displayMorePayments(paymentData, paymentData.approvedPayments, title, "No Approved Payments");
                    } catch (error) {
                        console.error(`Error in displayMorePayments:`, error);
                    }
                });

                goBackHome();

                //  >>> Main (Drivers)



                //  >>> Main (Verify)

                paymentInputVerification();

                //  >>> Main (Customers)



                //  >>> Main (Menu)



                //  >>> History Popstate

                // Add an event listener to the window to listen for 'popstate' events, which occur when the active history entry changes
                window.addEventListener("popstate", event => {
                    // Get the state object from the event
                    const state = event.state;
                    // Check if there's a valid state
                    if (!state) return;
                    // Destructure the state object to get the page and action properties
                    const { page, action } = state;

                    console.log('Page:', page);
                    console.log('Action:', action);

                    const activeSection = document.querySelector("main section.active")
                    const navItems = document.querySelectorAll("footer ul li");
                    const sections = document.querySelectorAll("section");

                    // Function to deactivate all navigation items and sections
                    const deactivateAll = () => {
                        navItems.forEach(item => item.classList.remove("active"));
                    };

                    // Function to activate a specific navigation item and section by index
                    const activateSection = index => {
                        navItems[index]?.classList.add("active");
                        activateHTML(activeSection, sections[index])
                    };

                    // Deactivate all navigation items and sections before activating the new one
                    deactivateAll();

                    // Switch statement to handle different pages
                    switch (page) {
                        case "home":
                            // Activate the first section (home)
                            activateSection(0);

                            document.querySelector("#home .header").classList.add("active");
                            const activeHomePage = document.querySelector("#home .body .page.active");
                            const approvalHistory = document.querySelector("#home .body #approvalHistory");
                            const seeMorePayments = document.querySelector("#home .body #seeMorePayments");

                            // Nested switch statement to handle different actions on the home page
                            switch (action) {
                                case "default":
                                    console.log("approvalHistory");
                                    activateHTML(activeHomePage, approvalHistory);
                                    break;
                                case "seeMore":
                                    console.log("seeMore");
                                    activateHTML(activeHomePage, seeMorePayments);
                                    break;
                                default:
                                    activateHTML(activeHomePage, approvalHistory);
                                    console.log("approvalHistory is default");
                                    break;
                            }
                            break;
                        case "verify":
                            // Log the drivers page action and activate the second section (verify)
                            console.log("Verify page");
                            activateSection(1);
                            break;
                        default:
                            // For any other pages, log the default home page action, replace the state to home page, and activate the home section
                            console.log("Home Page is default");
                            activateSection(0);
                            window.history.pushState({ page: "home", action: "default" }, '', window.location.pathname);
                            break;
                    }
                });

                // Replace the current history state with the default home page state
                window.history.replaceState({ page: "home", action: "default" }, '', window.location.pathname);

                document.querySelector("footer").classList.add("active");
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(`Error during user authentication state change:`, error);
        }
    }
}








document.addEventListener('DOMContentLoaded', async function() {
    await mainJS();
    await mainNavigation();
});







//---------------------------             Auth State                ----------------------------------//









function signOut() {
    // Remove the JWT token from localStorage
    localStorage.removeItem('jwtToken');

    // Update the UI to show the login interface
    displayAuth();

    console.log("User has been signed out successfully.");
}

function displayAuth() {
    const form = document.getElementById("form");
    form.style.display = "flex";
    setTimeout(() => {
        form.classList.add("active");
    }, 100);
}
// Function to check if the JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;

    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expirationTime = decodedPayload.exp * 1000; // exp is in seconds

    return Date.now() >= expirationTime;
}

// Function to handle token-based "auth state change"
async function checkTokenAuthState() {
    const token = localStorage.getItem('jwtToken'); // Retrieve JWT token from localStorage (or session/cookies)
    
    // If no token or token is expired, treat it as a logout
    if (!token || isTokenExpired(token)) {
        console.log("Token is expired or missing, logging out.");
        localStorage.removeItem('jwtToken');

        displayAuth();

        return false;
    }
    else {
        return true;
    }
}

async function displayHeader(myData) {
    const nameAndSurname = document.querySelector("#home .header.active h3")

    nameAndSurname.textContent = `${myData.name} ${myData.surname}`;
}









async function getPaymentData() {
    try {
        // Fetch payments from the API
        const response = await fetch('http://localhost:3000/api/getPayments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        
        const payments = await response.json();

        // Separate payments by status
        const approvedPayments = payments.filter(payment => payment.status !== 'Pending');
        const pendingPayments = payments.filter(payment => payment.status === 'Pending');

        // Sort approved payments by newest date first
        approvedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Sort pending payments by oldest date first
        pendingPayments.sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            approvedPayments,
            pendingPayments,
        };

    } catch (error) {
        console.error('Error processing payments:', error);
    }
}













/* -----------------------------         Main (Home)         ------------------------------------ */










function displayPayments(paymentData) {
    const pendingPaymentsUl = document.querySelector('#approvalHistory #pendingPayments');
    const approvedPaymentsUl = document.querySelector('#approvalHistory #approvedPayments');

    renderPaymentList(paymentData, paymentData.pendingPayments.slice(0, 3), pendingPaymentsUl, "No Pending Payments...");

    renderPaymentList(paymentData, paymentData.approvedPayments.slice(0, 3), approvedPaymentsUl, "Evaluate your first Payment...");
}

function displayMorePayments(paymentData, applications, title, emptyMsg) {
    const morePayments = document.querySelector("#seeMorePayments");
    const heading = document.querySelector("#seeMorePayments h1");

    heading.textContent = title;

    // Call the renderPaymentList to display the list of applications
    renderPaymentList(paymentData, applications, morePayments.querySelector("ul"), emptyMsg);
}

function openPayment(leaveItem) {
    const requests = document.querySelectorAll('#home .body page ul li:not(:first-child)');

    if (leaveItem.classList.contains('active')) {
        leaveItem.classList.remove('active');
        return;
    }

    requests.forEach(request => {
        request.classList.remove('active');
    });

    // Add 'active' class to the clicked request
    leaveItem.classList.add('active');
}


//      >>>     Helper functions


async function getCustomerNameById(customerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCustomerById?customerId=${encodeURIComponent(customerId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customer data');
        }

        const data = await response.json();

        if (data.name && data.surname) {
            console.log(`Customer's Name: ${data.name} ${data.surname}`);
            return `${data.name} ${data.surname}`;
        } else {
            console.error('Customer not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching customer details:', error);
    }
}

async function renderPaymentList(paymentData, payments, listElement, emptyMsg) {
    if (payments.length === 0) {
        listElement.innerHTML = `
            <p style="margin: 10px auto; text-align: center; width:100%;">${emptyMsg}</p>
        `;
        return;
    }

    listElement.innerHTML = ``;

    payments.forEach(async payment => {
        const payItem = document.createElement('li');
        const customerName = await getCustomerNameById(payment.customerId);
        
        payItem.innerHTML = `
            <div class="name">${customerName}</div>
            <div class="status">${payment.status}</div>
            <div class="hidden">
                <div class="currency"><b>Currency:</b>             ${payment.currency}</div>
                <div class="amount"><b>Amount:</b>               ${payment.amount}</div>
                <div class="recipient-name"><b>Recipient:</b>            ${payment.recipientName}</div>
                <div class="recipient-bank"><b>Recipent Bank:</b>        ${payment.recipientBank}</div>
                <div class="recipient-account"><b>Recipent Account:</b>     ${payment.recipientAccount}</div>
                <div class="swift"><b>Swift Code:</b>           ${payment.swiftCode}</div>
                <div class="date"><b>Date:</b>                 ${payment.formattedDate}</div>
            </div>
        `;
        listElement.appendChild(payItem);

        payItem.addEventListener('click', function() {
            openPayment(payItem);
        });
    });
}








/* -----------------------------         Main (Back Buttons)         ------------------------------------ */









function goBackHome() {
    const backBtns = document.querySelectorAll("#home .body .page .title .go-back");
    const approvalHistory = document.querySelector("#home .body #approvalHistory");

    backBtns.forEach(backBtn => {
        backBtn.addEventListener("click", () => {
            const activePage = document.querySelector("#home .body .page.active");

            // Hide the active page and show approvalHistory
            if (activePage && activePage !== approvalHistory) {
                // Add a new history state for "approvalHistory"
                window.history.pushState({ page: "home", action: "default" }, '', '');

                // Switch to the approvalHistory page
                activateHTML(activePage, approvalHistory);
            }
        });
    });
}









/* -----------------------------         Verify (Home)         ------------------------------------ */









function paymentInputVerification() {
    const verifyButtons = document.querySelectorAll('button[id^="verify"]'); // Select buttons with IDs starting with "verify"
    const submitPayment = document.querySelector("#verify .body .page .bottom #submit");
    const rejectPayment = document.querySelector("#verify .body .page .bottom #reject");
    
    verifyButtons.forEach(button => {
        button.addEventListener('click', function () {
            
            // Add active class to the input corresponding to the clicked button
            const inputField = this.closest('li').querySelector('input');


            if (inputField.id === "inName") {
                if (!inputField.value.match(/[a-zA-Z\s-]+/)) {
                    alert("Please enter a valid recipient name (letters, spaces, and hyphens only).");
                    valid = false;
                }
            } else if (inputField.id === "inBank") {
                if (!inputField.value.match(/[a-zA-Z\s]+/)) {
                    alert("Please enter a valid bank name (letters and spaces only).");
                    valid = false;
                }
            } else if (inputField.id === "inAccountNumber") {
                if (!inputField.value.match(/^\d+$/)) {
                    alert("Please enter a valid account number (only numbers allowed).");
                    valid = false;
                }
            } else if (inputField.id === "inAmount") {
                if (!inputField.value.match(/^\d+(\.\d{1,2})?$/)) {
                    alert("Please enter a valid amount (up to two decimal places).");
                    valid = false;
                }
            } else if (inputField.id === "inSwift") {
                if (!inputField.value.match(/[a-zA-Z\s]+/)) {
                    alert("Please enter a valid Swift code.");
                    valid = false;
                }
            }

            if (valid) {
                inputField.classList.add('active');
            }
        });
    });

    submitPayment.addEventListener('click', async function () {
        if (valid)
        {
            await updatePaymentStatus("Approved");

            resetInputsAndRemoveActiveClass();

            paymentData = await getPaymentData();
            displayPayments(paymentData);

            activateHTML(verifySection, homeSection);
            window.history.pushState({ page: "home", action: "default" }, '', '');
        }
        
    });

    rejectPayment.addEventListener('click', async function () {
        await updatePaymentStatus("Rejected");

        resetInputsAndRemoveActiveClass();

        paymentData = await getPaymentData();
        displayPayments(paymentData);

        activateHTML(verifySection, homeSection);
        alert("Payment Rejected.");
        window.history.pushState({ page: "home", action: "default" }, '', '');
    });
}

async function updatePaymentStatus(newStatus) {
    const name = document.getElementById("inName").value;
    const bank = document.getElementById("inBank").value;
    const accountNumber = document.getElementById("inAccountNumber").value;
    const amount = document.getElementById("inAmount").value;
    const swift = document.getElementById("inSwift").value;

    try {
        const response = await fetch('http://localhost:3000/api/updatePaymentStatus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                bank: bank,
                accountNumber: accountNumber,
                amount: amount,
                swift: swift,
                newStatus: newStatus  // Specify the new status here
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update payment status');
        }

        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Error updating payment status:', error);
    }
}

function resetInputsAndRemoveActiveClass() {
    // Get all input elements
    const inputs = [
        document.getElementById("inName"),
        document.getElementById("inBank"),
        document.getElementById("inAccountNumber"),
        document.getElementById("inAmount"),
        document.getElementById("inSwift")
    ];

    // Loop through each input to clear its value and remove the active class
    inputs.forEach(input => {
        input.value = '';           // Clear the input value
        input.classList.remove('active'); // Remove the 'active' class
    });
}


































// Client-side: Function to handle the signup process
async function handleSignup(event) {
    event.preventDefault(); // Prevent form submission

    // Collect values from the input fields
    const signName = document.getElementById('signName').value;
    const signSurname = document.getElementById('signSurname').value;
    const signId = document.getElementById('signId').value;
    const signEmail = document.getElementById('signEmail').value;
    const signAccount = document.getElementById('signAccount').value;
    const signPassword = document.getElementById('signPassword').value;
    const signConfPassword = document.getElementById('signConfPassword').value;

    // Validate password and confirm password
    if (signPassword !== signConfPassword) {
        alert('Passwords do not match');
        return;
    }

    // Construct the payload for the server
    const signupData = {
        name: signName,
        surname: signSurname,
        idNumber: signId,
        email: signEmail,
        accountNumber: signAccount,
        password: signPassword,
    };

    // Send the data to the server for processing
    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Signup successful');
            document.getElementById('signName').value = '';
            document.getElementById('signSurname').value = '';
            document.getElementById('signId').value = '';
            document.getElementById('signEmail').value = '';
            document.getElementById('signAccount').value = '';
            document.getElementById('signPassword').value = '';
            document.getElementById('signConfPassword').value = '';
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

    const homePage = document.getElementById("home");

    // Send the login credentials to the server for verification
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginName, password: loginPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('JWT Token:', data.token);

            localStorage.setItem('jwtToken', data.token);
            
            window.location.reload();
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

let navigationInitialized = false;

function mainNavigation() {

    if (navigationInitialized) return;
    navigationInitialized = true;
    
    const navItems = document.querySelectorAll("footer ul li");
    const sections = document.querySelectorAll("section");
    const pageNames = ["home", "verify"];

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
        signOut();
    });
    
    create.addEventListener('submit', async function() {
        
        event.preventDefault(); // Prevent form submission
        handleSignup(event); // Call the signup handler
        
    });

    login.addEventListener('submit', async function() {

        event.preventDefault(); // Prevent form submission
        handleLogin(); // Call the login handler

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