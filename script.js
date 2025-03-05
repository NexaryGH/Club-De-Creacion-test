// Local Storage for users, messages, and files
const users = JSON.parse(localStorage.getItem('users')) || [];
const messages = JSON.parse(localStorage.getItem('messages')) || [];
const files = JSON.parse(localStorage.getItem('files')) || [];
let currentUser = localStorage.getItem('currentUser') || null;

// Utility functions
function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('files', JSON.stringify(files));
    localStorage.setItem('currentUser', currentUser);
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('username_or_email').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
    
    if (user) {
        currentUser = user.username;
        saveToLocalStorage();
        window.location.href = 'index.html';
    } else {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = 'Credenciales incorrectas';
        errorDiv.style.display = 'block';
    }
});

// Register
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (users.some(u => u.email === email)) {
        document.getElementById('reg-error').textContent = 'El correo ya está registrado';
        document.getElementById('reg-error').style.display = 'block';
        return;
    }
    if (users.some(u => u.username === username)) {
        document.getElementById('reg-error').textContent = 'El nombre de usuario ya existe';
        document.getElementById('reg-error').style.display = 'block';
        return;
    }

    users.push({ username, email, password, verified: false, tester: false });
    saveToLocalStorage();
    window.location.href = 'login.html';
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('confirmationModal').classList.add('open');
});

document.getElementById('confirmLogout')?.addEventListener('click', function() {
    currentUser = null;
    saveToLocalStorage();
    window.location.href = 'login.html';
});

document.getElementById('cancelLogout')?.addEventListener('click', function() {
    document.getElementById('confirmationModal').classList.remove('open');
});

// Post Message and File
document.getElementById('postForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Por favor, inicia sesión primero');
        window.location.href = 'login.html';
        return;
    }

    const message = this.querySelector('textarea[name="message"]').value;
    const fileInput = this.querySelector('input[name="file"]');
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);

    if (!message && !fileInput.files[0]) {
        alert('Debes enviar al menos un mensaje o un archivo');
        return;
    }

    const newMessage = {
        username: currentUser,
        message: message || '',
        verified: false,
        tester: false,
        timestamp,
        file: null
    };

    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        const fileInfo = {
            name: file.name,
            owner: currentUser,
            owner_verified: false,
            owner_tester: false,
            upload_date: timestamp,
            size: `${(file.size / 1024).toFixed(2)} KB`
        };
        newMessage.file = fileInfo;
        files.push(fileInfo);
    }

    messages.push(newMessage);
    saveToLocalStorage();
    this.reset();
    window.location.href = 'messages.html';
});

// Load Messages
function loadMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = '';
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="no-messages">
                <i class="far fa-comment-dots"></i>
                <p>No hay mensajes disponibles</p>
            </div>`;
        return;
    }

    messages.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = 'message';
        div.setAttribute('data-id', index);
        div.innerHTML = `
            <div class="username">${msg.username}</div>
            ${msg.message ? `<p class="message-text">${msg.message}</p>` : ''}
            ${msg.file ? `
                <div class="file-attachment">
                    <a href="#" style="color: var(--primary);">${msg.file.name} (${msg.file.size})</a>
                </div>` : ''}
            ${msg.username === currentUser ? `
                <button class="delete-btn" onclick="deleteMessage(${index})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>` : ''}
        `;
        container.appendChild(div);
    });
}

// Delete Message
function deleteMessage(index) {
    messages.splice(index, 1);
    saveToLocalStorage();
    loadMessages();
}

// Load Files
function loadFiles() {
    const grid = document.getElementById('files-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (files.length === 0) {
        grid.parentElement.innerHTML += `
            <div class="empty-state">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>No tienes archivos subidos aún</p>
            </div>`;
        return;
    }

    files.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-info">
                <h3 class="file-name">${file.name}</h3>
                <p class="file-meta">
                    Subido por: <strong>${file.owner}</strong><br>
                    Subido el: <strong>${file.upload_date}</strong><br>
                    Tamaño: <strong>${file.size}</strong>
                </p>
            </div>
            <div class="file-actions">
                <button class="file-action-btn download-btn">Descargar</button>
                ${file.owner === currentUser ? `
                    <button class="file-action-btn delete-btn" onclick="deleteFile(${index})">Eliminar</button>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Delete File
function deleteFile(index) {
    files.splice(index, 1);
    saveToLocalStorage();
    loadFiles();
}

// Initialize
if (document.getElementById('username')) {
    document.getElementById('username').textContent = currentUser || 'Invitado';
}
loadMessages();
loadFiles();
