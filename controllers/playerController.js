const supabase = require('../config/supabase');
// const { get } = require('../routes/playerRoutes');
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!'
      });
    }

  
    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully!',
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      date_of_birth,
      gender,
      state,
      city,
      sport_type
    } = req.body;


    const updateData = {};
    if (name)          updateData.name = name;
    if (phone)         updateData.phone = phone;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (gender)        updateData.gender = gender;
    if (state)         updateData.state = state;
    if (city)          updateData.city = city;
    if (sport_type)    updateData.sport_type = sport_type;


    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kuch bhi update karne ke liye bhejo!'
      });
    }

  
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const mergedUser = { ...existingUser, ...updateData };

    if (
      mergedUser.name &&
      mergedUser.phone &&
      mergedUser.date_of_birth &&
      mergedUser.gender &&
      mergedUser.state &&
      mergedUser.city
    ) {
      updateData.profile_complete = true; 
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Profile update failed!',
        error: error.message
      });
    }

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile_complete: updatedUser.profile_complete,
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

module.exports = { getProfile, updateProfile 
 
};