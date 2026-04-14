const supabase = require('../config/supabase');


const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { admit_card_url, fitness_certificate_url, aadhar_card_url } = req.body;

    if (!admit_card_url && !fitness_certificate_url && !aadhar_card_url) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required!'
      });
    }

   
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .single();

    let result;

    if (existingDoc) {
   
      const { data, error } = await supabase
        .from('documents')
        .update({ admit_card_url, fitness_certificate_url, aadhar_card_url })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update documents!',
          error: error.message
        });
      }
      result = data;
    } else {
  
      const { data, error } = await supabase
        .from('documents')
        .insert([{ user_id: userId, admit_card_url, fitness_certificate_url, aadhar_card_url }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload documents!',
          error: error.message
        });
      }
      result = data;
    }

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully!',
      documents: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};


const getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !documents) {
      return res.status(404).json({
        success: false,
        message: 'No documents found!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Documents fetched successfully!',
      documents
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message
    });
  }
};

module.exports = { uploadDocuments, getDocuments };