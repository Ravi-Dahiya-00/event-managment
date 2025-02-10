// Require necessary modules
require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Add static files serving
app.use(express.static(path.join(__dirname, '../frontend')));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Add user login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Assuming User is a model you've defined (e.g., with MongoDB)
    const user = await User.findOne({ email });
    if(!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    res.json({ token });
});

// Add authentication middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Protect routes
app.use('/api/register', authenticate);
app.use('/api/events', authenticate);

// Set up CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Update with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
