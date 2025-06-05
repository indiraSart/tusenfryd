const express = require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'tusenfryd_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) return next();
  res.status(403).render('error', { message: 'Access denied' });
};

// Routes
// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Auth routes
app.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

app.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await axios.post(`${API_URL}/users/login`, { email, password });
    req.session.user = response.data.user;
    req.session.token = response.data.token;
    res.redirect('/attractions');
  } catch (error) {
    res.render('auth/login', { error: 'Invalid credentials' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await axios.post(`${API_URL}/users/register`, { name, email, password });
    res.redirect('/login');
  } catch (error) {
    res.render('auth/register', { error: 'Registration failed' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Attraction routes
app.get('/attractions', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    res.render('user/attractions', { 
      attractions: response.data,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Failed to fetch attractions' });
  }
});

app.get('/attractions/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/attractions/${req.params.id}`);
    res.render('user/attraction-detail', {
      attraction: response.data,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Attraction not found' });
  }
});

// Reservation routes
app.get('/my-reservations', isAuthenticated, async (req, res) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${req.session.token}` }
    };
    const response = await axios.get(`${API_URL}/reservations/user`, config);
    res.render('user/my-reservations', {
      reservations: response.data,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Failed to fetch reservations' });
  }
});

app.post('/reserve/:id', isAuthenticated, async (req, res) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${req.session.token}` }
    };
    await axios.post(`${API_URL}/reservations`, {
      attractionId: req.params.id,
      time: req.body.time
    }, config);
    res.redirect('/my-reservations');
  } catch (error) {
    res.redirect(`/attractions/${req.params.id}?error=true`);
  }
});

// Admin routes
app.get('/admin', isAdmin, async (req, res) => {
  res.render('admin/dashboard', { user: req.session.user });
});

app.get('/admin/attractions', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    res.render('admin/manage-attractions', {
      attractions: response.data,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Failed to fetch attractions' });
  }
});

app.get('/admin/attractions/new', isAdmin, (req, res) => {
  res.render('admin/edit-attraction', { 
    attraction: {}, 
    isNew: true,
    user: req.session.user
  });
});

app.get('/admin/attractions/:id/edit', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/attractions/${req.params.id}`);
    res.render('admin/edit-attraction', {
      attraction: response.data,
      isNew: false,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Attraction not found' });
  }
});

app.get('/admin/reservations', isAdmin, async (req, res) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${req.session.token}` }
    };
    const response = await axios.get(`${API_URL}/reservations`, config);
    res.render('admin/reservations', {
      reservations: response.data,
      user: req.session.user
    });
  } catch (error) {
    res.render('error', { message: 'Failed to fetch reservations' });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`API URL: ${API_URL}`);
});
