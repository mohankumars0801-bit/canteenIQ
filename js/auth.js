import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { showToast } from './ui.js';

// Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const logoutBtn = document.getElementById('logout-btn');

// Toggle Login/Signup
if (showSignupBtn) {
  showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
  });
}

if (showLoginBtn) {
  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });
}

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.innerHTML = '<span class="loader"></span>';
      submitBtn.disabled = true;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await redirectUser(userCredential.user.uid);
    } catch (error) {
      showToast(error.message, 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Handle Signup
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = signupForm.name.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.innerHTML = '<span class="loader"></span>';
      submitBtn.disabled = true;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user to Firestore (default role: student)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: 'student',
        createdAt: new Date()
      });

      await redirectUser(userCredential.user.uid);
    } catch (error) {
      showToast(error.message, 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = '../index.html';
    } catch (error) {
      showToast('Error logging out', 'error');
    }
  });
}

async function redirectUser(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const role = userDoc.data().role;
    if (role === 'admin') {
      window.location.href = './admin/index.html';
    } else {
      window.location.href = './student/index.html';
    }
  } else {
    showToast('User data not found.', 'error');
  }
}

// Auth State Observer for Protected Pages
export function requireAuth(allowedRole = null) {
  // Login requirement bypassed as requested!
  onAuthStateChanged(auth, async (user) => {
    if (user && allowedRole) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
         // Display user info in sidebar if logged in
         const userNameEl = document.getElementById('user-name');
         if(userNameEl) userNameEl.textContent = userDoc.data().name;
      }
    }
  });
}
