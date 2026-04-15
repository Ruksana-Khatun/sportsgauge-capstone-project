const supabase = require('../config/supabase');
const axios = require('axios');

// ✅ ANALYZE VIDEO USING HUGGING FACE
const analyzeVideo = async (req, res) => {
  try {
    const { submission_id, video_url } = req.body;

    if (!submission_id || !video_url) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID and video URL are required!'
      });
    }

    // Check if submission exists
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (subError || !submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found!'
      });
    }

    // Send video to Hugging Face for analysis
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/your-model-here',
      { inputs: video_url },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Process AI result
    const aiResult = hfResponse.data;
    const resultLabel = aiResult[0]?.label === 'REAL' ? 'pass' : 'fail';
    const feedback = aiResult[0]?.label === 'REAL'
      ? 'Video passed AI verification!'
      : 'Video failed AI verification - possible cheating detected!';

    // Update submission with AI result
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        ai_result: resultLabel,
        ai_feedback: feedback
      })
      .eq('id', submission_id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update AI result!',
        error: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Video analyzed successfully!',
      result: {
        submission_id,
        ai_result: resultLabel,
        ai_feedback: feedback,
        raw_response: aiResult
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'AI analysis failed!',
      error: error.message
    });
  }
};

// ✅ GET AI RESULT BY SUBMISSION ID
const getAiResult = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        id,
        video_url,
        ai_result,
        ai_feedback,
        admin_result,
        admin_feedback,
        created_at,
        tests (name, category)
      `)
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AI result fetched successfully!',
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

module.exports = { analyzeVideo, getAiResult };