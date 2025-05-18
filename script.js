document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const logoImage = document.getElementById('logoImage');
    const body = document.body;

    const loginSection = document.getElementById('loginSection');
    const passwordsSection = document.getElementById('passwordsSection');

    const passwordInput = document.getElementById('passwordInput');
    const accessBtn = document.getElementById('accessBtn');
    const errorMessageElement = document.getElementById('errorMessage');

    const sectionNameElement = document.getElementById('sectionName');
    const passwordsDisplay = document.getElementById('passwordsDisplay');
    const goBackBtn = document.getElementById('goBackBtn');

    const darkThemeLogo = 'MehtaLogoWhiteNobackground.png';
    const lightThemeLogo = 'MehtaLogoNobackground.png';

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            logoImage.src = lightThemeLogo;
            themeToggleBtn.textContent = "Switch to Dark Theme";
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            logoImage.src = darkThemeLogo;
            themeToggleBtn.textContent = "Switch to Light Theme";
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);


    // --- Password and Display Logic ---
    const validPasswords = ["Raj", "Maitri", "Jagruti", "Dharmesh"]; // Case-sensitive

    accessBtn.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });

    function checkPassword() {
        const enteredPassword = passwordInput.value;
        errorMessageElement.textContent = ''; // Clear previous errors

        if (validPasswords.includes(enteredPassword)) {
            showPasswordsSection(enteredPassword);
        } else {
            errorMessageElement.textContent = 'Invalid access name. Please try again.';
            passwordInput.value = '';
        }
    }

    function showLoginSection() {
        passwordsSection.classList.remove('active-section');
        passwordsSection.classList.add('hidden-section');
        loginSection.classList.remove('hidden-section');
        loginSection.classList.add('active-section');
        passwordInput.value = ''; // Clear password input
        errorMessageElement.textContent = ''; // Clear any error messages
    }

    function showPasswordsSection(section) {
        loginSection.classList.remove('active-section');
        loginSection.classList.add('hidden-section');
        passwordsSection.classList.remove('hidden-section');
        passwordsSection.classList.add('active-section');

        sectionNameElement.textContent = section;
        fetchAndDisplayPasswords(section);
    }

    async function fetchAndDisplayPasswords(sectionName) {
        passwordsDisplay.innerHTML = '<p>Loading...</p>'; // Show loading state
        try {
            const response = await fetch('passwords.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - Could not load passwords.txt`);
            }
            const text = await response.text();
            const passwords = parsePasswordsForSection(text, sectionName);

            if (passwords.length > 0) {
                passwordsDisplay.innerHTML = ''; // Clear "Loading..."
                passwords.forEach(pwd => {
                    const p = document.createElement('p');
                    p.textContent = pwd;
                    passwordsDisplay.appendChild(p);
                });
            } else {
                passwordsDisplay.innerHTML = `<p>No information found for "<strong>${sectionName}</strong>" or section is empty.</p>`;
            }
        } catch (error) {
            console.error('Error fetching or parsing passwords:', error);
            passwordsDisplay.innerHTML = `<p style="color: ${body.classList.contains('light-theme') ? 'var(--error-light)' : 'var(--error-dark)'};">Error loading information: ${error.message}.</p>`;
        }
    }

    function parsePasswordsForSection(allPasswordsText, sectionName) {
        const lines = allPasswordsText.split(/\r?\n/);
        let inSection = false;
        const sectionPasswords = [];
        const sectionHeader = ` ${sectionName} `; // Note the spaces, matches passwords.txt format

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (inSection) {
                // If we encounter another section header or a completely empty line after collecting some passwords
                if ((trimmedLine.startsWith(' ') && trimmedLine.endsWith(' ') && trimmedLine.length > 2 && trimmedLine !== sectionHeader.trim()) || 
                    (trimmedLine === '' && sectionPasswords.length > 0)) {
                    inSection = false;
                    break; 
                }
                if (trimmedLine !== '' && trimmedLine !== sectionHeader.trim()) { // Only add non-empty lines that are not the header itself
                    sectionPasswords.push(trimmedLine);
                }
            }

            if (line.trim() === sectionHeader.trim()) { // Match the trimmed header
                inSection = true;
            }
        }
        return sectionPasswords;
    }

    goBackBtn.addEventListener('click', showLoginSection);

});
