const express = require('express');
const router = express.Router();
const { register, login , getAllUsers,
    deleteUser,
    updateUserRole} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
// Fetch all users
router.get('/', getAllUsers);

// Delete a user
router.delete('/:id', deleteUser);

// Update a user’s role
router.put('/:id/role', updateUserRole);


module.exports = router;
