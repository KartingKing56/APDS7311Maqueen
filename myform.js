import React, { useState } from 'react';

const MyForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Regex patterns
    const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    const phonePattern = /^\+?[1-9]\d{1,14}$/;

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        let errors = [];

        // Validate email
        if (!emailPattern.test(email)) {
            errors.push("Invalid email format.");
        }

        // Validate password
        if (!passwordPattern.test(password)) {
            errors.push("Password must be at least 8 characters long and contain at least one letter and one number.");
        }

        // Validate username
        if (!usernamePattern.test(username)) {
            errors.push("Username must contain only alphanumeric characters.");
        }

        // Validate phone number
        if (!phonePattern.test(phone)) {
            errors.push("Phone number must be in a valid international format.");
        }

        // Check if there are any errors
        if (errors.length > 0) {
            setErrorMsg(errors.join(' ')); // Set the error message
        } else {
            setErrorMsg(''); // Clear any previous error messages
            // Proceed with form submission logic
            console.log("Form submitted:", { email, password, username, phone });
            // Here you can add logic to send data to your server or API
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
                <label>Phone:</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            <button type="submit">Submit</button>
        </form>
    );
};

export default MyForm;
