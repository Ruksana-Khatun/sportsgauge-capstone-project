const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// ✅ PLAYER REGISTER
const registerPlayer = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      aadhar_number,
      date_of_birth,
      gender,
      state,
      city
    } = req.body;

    if (!name || !email || !password || !phone || !aadhar_number) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required!'
      });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered!'
      });
    }

    const { data: existingAadhar } = await supabase
      .from('users')
      .select('*')
      .eq('aadhar_number', aadhar_number)
      .single();

    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number is already registered!'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: hashedPassword,
        phone,
        aadhar_number,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        state: state || null,
        city: city || null,
        profile_complete: false
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Registration failed!',
        error: error.message
      });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'player' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ PLAYER LOGIN
const loginPlayer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required!'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'player' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_complete: user.profile_complete
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required!'
      });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (!admin || error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful!',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};


module.exports = { registerPlayer, loginPlayer, loginAdmin };