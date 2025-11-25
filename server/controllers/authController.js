const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { username: admin.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verify = async (req, res) => {
    try {
        // If middleware passed, token is valid
        res.json({ valid: true, user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
