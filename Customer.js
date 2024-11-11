

// Number of salt rounds (cost factor)
const saltRounds = 13;


const accountForm = document.getElementById("form");
const create = document.getElementById("signUpPage");
const login = document.getElementById("logInPage");
const homeSection = document.getElementById("home");
const paySection = document.getElementById("pay");
const detailsPage = document.getElementById("payDetailsPage");
const accountInfoPage = document.getElementById("accountInformationPage");

const signUpBtn = document.getElementById("createAccount");
const chk = document.getElementById('chk');
const logInBtn = document.getElementById("login");

const localPaymentBtn = document.getElementById("localPaymentBtn");
const internationalPaymentBtn = document.getElementById("internationalPaymentBtn");

const signPassword = document.getElementById('signPassword');
const signConfirmPassword = document.getElementById('signConfPassword');

const loginPassword = document.getElementById('loginPassword');

let currency;
let provider;
let amount;

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

                    getBankingDetails(myData)

                    // Check the role and perform actions accordingly
                    if (decodedToken.role === "employee") {
                        console.log("User is an Employee");
                        window.location.href = "/Employee.html";
                    } else {
                        console.log("User is a Customer");
                        activateHTML(accountForm, homeSection);

                        window.history.pushState({ page: "home", action: "default" }, '', "");
                    }
                } else {
                    console.error("Token verification failed:", data.message);
                    // Optionally, redirect to login or show an error message
                }
            } catch (error) {
                console.error("Error while paying token:", error.message);
            }


            // ====================>   Start Up Functions   <======================

            mainNavigation();
            paymentsNavigation();
            homeNavigation();

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
                    displayPayments();
                } catch (error) {
                    console.error(`Error in displayPayments: `, error);
                } 

                //  >>> Main (Drivers)



                //  >>> Main (Vehicles)

                

                //  >>> Main (Customers)



                //  >>> Main (Menu)




                // ====================>   Event Listeners   


                //  >>> Main (Home)



                //  >>> Main (Drivers)



                //  >>> Main (Vehicles)

                

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
                            console.log("home")
                            displayPayments();
                            activateSection(0);
                            break;
                        case "pay":
                            // Log the drivers page action and activate the second section (pay)
                            console.log("Pay page");

                            activateSection(1);
                            document.querySelector("#home .header").classList.add("active");
                            const activeHomePage = document.querySelector("#home .body .page.active");
                            const payDetails = document.querySelector("#home .body #payDetailsPage");
                            const accountInfo = document.querySelector("#home .body #accountInformationPage");

                            // Nested switch statement to handle different actions on the home page
                            switch (action) {
                                case "default":
                                    console.log("details");
                                    activateHTML(activeHomePage, payDetails);
                                    break;
                                case "info":
                                    console.log("info");
                                    activateHTML(activeHomePage, accountInfo);
                                    break;
                                default:
                                    activateHTML(activeHomePage, payDetails);
                                    console.log("payDetails is default");
                                    break;
                            }
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
















//---------------------------             Get Data                ----------------------------------//









async function getPaymentData() {
    try {
        const userId = myData.userId;  // Ensure this holds the actual user ID value

        // Fetch payments from the API
        const response = await fetch(`http://localhost:3000/api/getPaymentsByUser?userId=${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        
        const payments = await response.json();

        return payments

    } catch (error) {
        console.error('Error processing payments:', error);
    }
}

async function displayPayments() {
    const listElement = document.querySelector("#home .body .page .bottom .payment-receipts ul");
    const payments = await getPaymentData();
    
    if (payments.length === 0) {
        listElement.innerHTML = `
            <p style="margin: 10px auto; text-align: center; width:100%;">You have made no Payments</p>
        `;
        return;
    }

    listElement.innerHTML = ``;

    payments.forEach(payment => {
        const payItem = document.createElement('li');
        payItem.innerHTML = `
            <div class="icon"><i class="ri-bank-card-2-fill"></i></div>
            <div class="date">${payment.formattedDate}</div>
            <div class="name">${payment.recipientName}</div>
            <div class="button"><button>Pay Again</button></div>
        `;
        const payAgainBtn = payItem.querySelector(".button button");
        listElement.appendChild(payItem);

        payAgainBtn.addEventListener('click', function() {
            openPayment(payment);
        });
    });
}

async function openPayment(payment) {
    document.getElementById("currencyComboBox").value = "";
    document.getElementById("providerComboBox").value = "";
    document.getElementById("inAmount").value = "";
    
    document.getElementById("payName").value = payment.recipientName;
    document.getElementById("payBank").value = payment.recipientBank;
    document.getElementById("payAccountNum").value = payment.recipientAccount;
    document.getElementById("paySwiftCode").value = payment.swiftCode;

    activateHTML(homeSection, paySection);

    activateHTML(accountInfoPage, detailsPage);

    window.history.pushState({ page: "pay", action: "default" }, '', "");
}

async function getBankingDetails(myData) {
    const accountNumberContent = document.getElementById("accountNumberHome");

    accountNumberContent.innerText = `${myData.accountNumber}`;
}



































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

// Client-side: Function to handle the signup process
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
    // Prevent attaching event listeners multiple times
    if (navigationInitialized) return;
    navigationInitialized = true;

    const navItems = document.querySelectorAll("footer ul li");
    const sections = document.querySelectorAll("section");
    const pageNames = ["home", "pay"];

    // Add click event listeners to each navigation item
    navItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            // Deactivate the currently active nav item
            document.querySelector("footer ul li.active")?.classList.remove("active");
            item.classList.add("active");

            const activeSection = document.querySelector("section.active");

            // Activate the corresponding section
            activateHTML(activeSection, sections[index]);

            // Determine the page name for history state
            const pageName = pageNames[index] || "home"; // Default to "home" if index is out of range
            window.history.pushState({ page: pageName, action: "default" }, '', "");
        });
    });

    // Sign out functionality
    navItems[2].addEventListener("click", async function () {
        signOut();
    });

    // Signup form submission handler
    create.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent form submission
        handleSignup(event); // Call the signup handler
    });

    // Login form submission handler
    login.addEventListener('submit', async function (event) {
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

function paymentsNavigation() {
    const nextBtn = document.querySelector("#pay .body #payDetailsPage .bottom #nextBtn");
    const submitBtn = document.querySelector("#pay .body #accountInformationPage .bottom #submitBtn");
    const cancelBtn = document.querySelector("#pay .body #accountInformationPage .bottom #cancelBtn")

    nextBtn.addEventListener('click', () => {
        const currencyBox = document.getElementById("currencyComboBox");
        const providerBox = document.getElementById("providerComboBox");
        const amountInput = document.getElementById("inAmount");

        currency = currencyBox.value;
        provider = providerBox.value;
        amount = amountInput.value;

        let valid = true; // Track if all validations pass

        // Currency Validation
        if (!currency.match(/^[a-zA-Z\s]+$/)) {
            alert("Please select a valid currency (letters and spaces only).");
            valid = false;
        }

        // Provider Validation
        if (!provider.match(/^[a-zA-Z\s]+$/)) {
            alert("Please select a valid provider (letters and spaces only).");
            valid = false;
        }

        // Amount Validation
        if (!amount.match(/^\d+(\.\d{1,2})?$/)) {
            alert("Please enter a valid amount (up to two decimal places).");
            valid = false;
        }

        // Only proceed if all validations are successful
        if (valid) {

            activateHTML(detailsPage, accountInfoPage);

            window.history.pushState({ page: "pay", action: "info" }, '', "");
        }
    });

    cancelBtn.addEventListener('click', () => {
        clearPaymentInputs();

        activateHTML(accountInfoPage, detailsPage);

        window.history.pushState({ page: "pay", action: "default" }, '', "");
    });

    submitBtn.addEventListener('click', async () => {
        const payName = document.getElementById("payName").value;
        const payBank = document.getElementById("payBank").value;
        const payAccountNum = document.getElementById("payAccountNum").value;
        const swiftCode = document.getElementById("paySwiftCode").value;
        const amount = document.getElementById("inAmount").value;

        let valid = true; // Track if all validations pass

        // Recipient Name Validation
        if (!payName.match(/^[a-zA-Z\s-]+$/)) {
            alert("Please enter a valid recipient name (letters, spaces, and hyphens only).");
            valid = false;
        }

        // Bank Name Validation
        if (!payBank.match(/^[a-zA-Z\s]+$/)) {
            alert("Please enter a valid bank name (letters and spaces only).");
            valid = false;
        }

        // Account Number Validation
        if (!payAccountNum.match(/^\d+$/)) {
            alert("Please enter a valid account number (only numbers allowed).");
            valid = false;
        }

        // Swift Code Validation
        if (!swiftCode.match(/^[a-zA-Z\s]/)) {
            alert("Please enter a valid Swift code (only lettera allowed).");
            valid = false;
        }

        // Only proceed if all validations are successful
        if (valid) {
            const customerId = myData.userId;

            const paymentData = {
                currency: currency,
                provider: provider,
                amount: amount,
                recipientName: payName,
                recipientBank: payBank,
                recipientAccount: payAccountNum,
                swiftCode: swiftCode,
                date: new Date(),
                status: 'Pending',
                customerId: customerId,
            };

            const response = await fetch('http://localhost:3000/api/addPayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Payment added successfully:', result);

                clearPaymentInputs();

                activateHTML(accountInfoPage, homeSection);

                displayPayments();

                window.history.pushState({ page: "home", action: "default" }, '', "");

            } else {
                console.error('Failed to add payment:', result.error);
            }
        }
    });
}

function clearPaymentInputs() {
    document.getElementById("currencyComboBox").value = "";
    document.getElementById("providerComboBox").value = "";
    document.getElementById("inAmount").value = "";
    
    document.getElementById("payName").value = "";
    document.getElementById("payBank").value = "";
    document.getElementById("payAccountNum").value = "";
    document.getElementById("paySwiftCode").value = "";
}

function homeNavigation() {
    localPaymentBtn.addEventListener('click', async function() {
        activateHTML(homeSection, paySection);

        activateHTML(accountInfoPage, detailsPage);

        window.history.pushState({ page: paySection, action: "default" }, '', "");
    });

    internationalPaymentBtn.addEventListener('click', async function() {
        activateHTML(homeSection, paySection);

        activateHTML(accountInfoPage, detailsPage);

        window.history.pushState({ page: paySection, action: "default" }, '', "");
    });
}