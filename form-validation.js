// RegEx pattern to validate email
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();  // Prevent form from submitting immediately

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  // Validate email using the RegEx pattern
  if (!emailPattern.test(email)) {
    messageDiv.innerHTML = "Invalid email format!";
    return;
  }

  // Create request body
  const body = { email, password };

  try {
    // Send a POST request to the backend
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // Process response from backend
    const data = await response.json();
    if (response.ok) {
      messageDiv.innerHTML = data.message;
    } else {
      messageDiv.innerHTML = data.error;
    }
  } catch (error) {
    messageDiv.innerHTML = "An error occurred. Please try again later.";
  }
});
