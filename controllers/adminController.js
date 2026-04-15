const supabase = require('../config/supabase');


const getAllSubmissions = async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users (id, name, email, phone),
        tests (id, name, category)
      `)
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
      message: 'All submissions fetched successfully!',
      total: submissions.length,
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


const reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_result, admin_feedback } = req.body;

    if (!admin_result) {
      return res.status(400).json({
        success: false,
        message: 'Admin result is required!'
      });
    }

    if (!['approved', 'rejected'].includes(admin_result)) {
      return res.status(400).json({
        success: false,
        message: 'Result must be approved or rejected!'
      });
    }

    const { data: updatedSubmission, error } = await supabase
      .from('submissions')
      .update({ admin_result, admin_feedback })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to review submission!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Submission ${admin_result} successfully!`,
      submission: updatedSubmission
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};


const getDashboardStats = async (req, res) => {
  try {


    const { count: totalPlayers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });


    const { count: totalSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

   
    const { count: pendingSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('admin_result', 'pending');

   
    const { count: approvedSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('admin_result', 'approved');

    
    const { count: rejectedSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('admin_result', 'rejected');

    const { count: totalTests } = await supabase
      .from('tests')
      .select('*', { count: 'exact', head: true });


    const { count: aiPass } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ai_result', 'pass');


    const { count: aiFail } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ai_result', 'fail');

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully!',
      stats: {
        total_players: totalPlayers,
        total_tests: totalTests,
        total_submissions: totalSubmissions,
        pending_submissions: pendingSubmissions,
        approved_submissions: approvedSubmissions,
        rejected_submissions: rejectedSubmissions,
        ai_pass: aiPass,
        ai_fail: aiFail
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


const getAllPlayers = async (req, res) => {
  try {
    const { data: players, error } = await supabase
      .from('users')
      .select('id, name, email, phone, state, city, profile_complete, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch players!',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All players fetched successfully!',
      total: players.length,
      players
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

module.exports = { getAllSubmissions, reviewSubmission, getDashboardStats, getAllPlayers };