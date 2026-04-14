const supabase = require('../config/supabase');

// ✅ GET ALL TESTS
const getAllTests = async (req, res) => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tests!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tests fetched successfully!',
      tests
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ GET SINGLE TEST
const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: test, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test fetched successfully!',
      test
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ CREATE TEST (Admin Only)
const createTest = async (req, res) => {
  try {
    const { name, description, category, deadline } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required!'
      });
    }

    const { data: newTest, error } = await supabase
      .from('tests')
      .insert([{ name, description, category, deadline }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create test!',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Test created successfully!',
      test: newTest
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ UPDATE TEST (Admin Only)
const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, deadline, is_active } = req.body;

    const { data: updatedTest, error } = await supabase
      .from('tests')
      .update({ name, description, category, deadline, is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update test!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test updated successfully!',
      test: updatedTest
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ DELETE TEST (Admin Only)
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete test!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test deleted successfully!'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

module.exports = { getAllTests, getTestById, createTest, updateTest, deleteTest };