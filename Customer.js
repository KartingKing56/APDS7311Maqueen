
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


document.addEventListener('DOMContentLoaded', function() {
    const signUpBtn = document.getElementById("createAccount");
    const chk = document.getElementById('chk');
    const logInBtn = document.getElementById("login");
    const accountForm = document.getElementById("form");
    const paySection = document.getElementById("pay");
    const detailsPage = document.getElementById("payDetailsPage");
    const accountInfoPage = document.getElementById("accountInformationPage");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    logInBtn.addEventListener('click', function() {
        activateHTML(accountForm, paySection);
    });

    nextBtn.addEventListener('click', function() {
        activateHTML(detailsPage, accountInfoPage);
        console.log("button pressed");
    });
})