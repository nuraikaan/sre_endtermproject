const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }

  return res;
}

function updateNav() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const show = id => document.getElementById(id)?.classList.remove('d-none');
  const hide = id => document.getElementById(id)?.classList.add('d-none');

  if (!token) {
    show('nav-login');
    hide('nav-logout');
    hide('nav-favorites');
    hide('nav-cart');
    hide('nav-admin');
    return;
  }

  hide('nav-login');
  show('nav-logout');
  show('nav-favorites');
  show('nav-cart');

  role === 'admin' ? show('nav-admin') : hide('nav-admin');
}


async function login(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Fill all fields');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`,  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Login failed');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    alert('Login successful 💖');
    window.location.href = 'catalog.html';

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}


async function register(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword =
    document.getElementById('confirmPassword').value;
  const role = document.getElementById('role').value;
  const adminCode = document.getElementById('adminCode')?.value; 

  if (!username || !password || !confirmPassword) {
    alert('Fill all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, adminCode })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Registration failed');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    alert('Registered successfully 💖');
    window.location.href = 'catalog.html';

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

async function addToFavorites(productId) {
  try {
    const res = await fetchWithAuth(`${API}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ product: productId })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Already in favorites');
    } else {
      alert('Added to favorites ❤️');
    }
  } catch {}
}

async function addToCart(productId) {
  if (!getToken()) {
    alert('Please login');
    location.href = 'login.html';
    return;
  }

  try {
    const res = await fetchWithAuth(`${API}/cart`, {
      method: 'POST',
      body: JSON.stringify({ product: productId })
    });

    if (res.ok) {
      alert('Added to cart 🛒');
    } else {
      alert('Failed to add');
    }
  } catch {
    alert('Server error');
  }
}

function requireAdmin() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    alert('Admins only');
    location.href = 'index.html';
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
