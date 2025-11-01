import api from './api';

interface FeedbackRequest {
  type: 'FEEDBACK' | 'BUG';
  subject: string;
  description: string;
  attachment?: File | null;
}

export const feedbackService = {
  submitFeedback: async (feedback: FeedbackRequest): Promise<void> => {
    console.log('[FeedbackService] Submitting feedback:', {
      type: feedback.type,
      subject: feedback.subject,
      hasAttachment: !!feedback.attachment,
    });

    try {
      // Backend có 2 endpoints riêng biệt:
      // 1. POST /feedback (consumes = "application/json") - dùng @RequestBody
      // 2. POST /feedback (consumes = "multipart/form-data") - dùng @ModelAttribute
      // Frontend sẽ chọn endpoint phù hợp:
      // - Nếu có attachment → dùng FormData → endpoint Form Data
      // - Nếu không có attachment → dùng JSON → endpoint JSON (nhanh hơn)
      
      if (feedback.attachment) {
        // Có attachment → dùng FormData → endpoint Form Data
        const formData = new FormData();
        formData.append('type', feedback.type);
        formData.append('subject', feedback.subject.trim());
        // Backend auto-maps 'content' → 'message', nên gửi 'content' để match với backend fix
        formData.append('content', feedback.description.trim());
        formData.append('attachment', feedback.attachment);
        
        console.log('[FeedbackService] Submitting with FormData (has attachment):', {
          fileName: feedback.attachment.name,
          fileSize: feedback.attachment.size,
        });
        
        // Axios tự động set Content-Type: multipart/form-data với boundary
        // Interceptor đã xử lý: nếu là FormData thì không set Content-Type manually
        // Không set Content-Type ở đây, để axios tự động set với boundary
        await api.post('/feedback', formData);
      } else {
        // Không có attachment → dùng JSON → endpoint JSON
        // Backend auto-maps 'content' → 'message', nên gửi 'content' để match với backend fix
        const jsonData = {
          type: feedback.type,
          subject: feedback.subject.trim(),
          content: feedback.description.trim(),
        };
        
        console.log('[FeedbackService] Submitting with JSON (no attachment)');
        
        // Backend endpoint: POST /feedback (consumes = "application/json")
        // Backend sẽ auto-map 'content' → 'message' trước khi validate
        // Interceptor sẽ tự động set Content-Type: application/json nếu không phải FormData
        await api.post('/feedback', jsonData);
      }
      
      console.log('[FeedbackService] Feedback submitted successfully');
    } catch (error: any) {
      console.error('[FeedbackService] Error submitting feedback:', error);
      console.error('[FeedbackService] Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  },
};

