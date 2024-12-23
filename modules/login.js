const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const executeQuery = require("../config/database");

const SECRET_KEY = process.env.PASS_SECRET;

module.exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log("Bodyyy :", req.body);
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please enter Email and Password.'});
    }
    const query = `select * from job_portal.users u where u.email = '${email}' and u.deleted = false`;
    let user = await executeQuery(query);
    console.log("User :", user);
    if (!user.length) {
        res.status(200).json({ success: false, message: 'No user found.'});
    } else {
        const userData = user[0];
        // const salt = await bcrypt.genSalt(10);
        //   const hashedPassword = await bcrypt.hash('testing@123', salt);
        //   console.log("Hashed Pass::",hashedPassword);
        const isPass = await bcrypt.compare(password, userData.password)
        console.log(">>>>>>", isPass);
        if (!userData || !isPass) {
            return res.status(401).json({ success: false, message: 'Invalid credentials',  pass: isPass});
        }
        
        const token = jwt.sign({ id: userData.id, email: userData.email }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,  // Prevent access to the cookie via JavaScript
            secure: process.env.ENV !== "DEV", // Set Secure flag in production
            sameSite: process.env.ENV === 'DEV' ? 'Strict' : 'None', // Controls cross-origin cookie sending
            maxAge: 60 * 60 * 1000, // 1 hour expiry
        });

        res.status(200).json({
            success: true, 
            message: 'Loged In Successfully', 
            // token: token 
        });
    }

}; 
