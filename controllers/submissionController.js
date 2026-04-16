const supabase = require('../config/supabase');

// ✅ UPLOAD VIDEO SUBMISSION
const uploadSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const { test_id, video_url } = req.body;

    if (!test_id || !video_url) {
      return res.status(400).json({
        success: false,
        message: 'Test ID and video URL are required!'
      });
    }

    // Check if test exists
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found!'
      });
    }

    // Check if already submitted
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', test_id)
      .single();

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this test!'
      });
    }

    // Insert submission
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert([{
        user_id: userId,
        test_id,
        video_url,
        ai_result: 'pending',
        admin_result: 'pending'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload submission!',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Video submitted successfully!',
      submission
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

// ✅ GET SUBMISSIONS BY USER ID
const getSubmissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        tests (name, description, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully!',
      submissions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

module.exports = { uploadSubmission, getSubmissionsByUser };