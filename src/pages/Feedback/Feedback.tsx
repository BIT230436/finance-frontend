import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { feedbackService } from '../../services/feedbackService';
import Layout from '../../components/Layout/Layout';
import './Feedback.css';

const Feedback: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [type, setType] = useState<'FEEDBACK' | 'BUG'>('FEEDBACK');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!subject.trim() || !description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('[Feedback] Submitting feedback...');
      
      await feedbackService.submitFeedback({
        type,
        subject: subject.trim(),
        description: description.trim(),
        attachment,
      });
      
      console.log('[Feedback] Feedback submitted successfully');
      
      setSuccess(true);
      setSubject('');
      setDescription('');
      setAttachment(null);
      setError('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('[Feedback] Error submitting feedback:', err);
      
      // Backend trả về error messages rõ ràng
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Không thể gửi phản hồi';
      
      setError(errorMessage);
      
      // Log chi tiết để debug
      console.error('[Feedback] Error details:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File đính kèm không được vượt quá 10MB');
        return;
      }
      setAttachment(file);
      setError('');
    }
  };

  return (
    <Layout>
      <div className="feedback-page">
        <h1>Gửi phản hồi</h1>
        <p className="page-description">
          Chúng tôi rất mong nhận được ý kiến đóng góp của bạn để cải thiện ứng dụng.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label>Loại phản hồi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'FEEDBACK' | 'BUG')}
              required
            >
              <option value="FEEDBACK">Ý kiến đóng góp</option>
              <option value="BUG">Báo lỗi</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề phản hồi của bạn"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Nội dung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết ý kiến hoặc lỗi bạn gặp phải..."
              required
              rows={8}
              maxLength={2000}
            />
            <small>{description.length}/2000 ký tự</small>
          </div>

          <div className="form-group">
            <label>Đính kèm (tùy chọn)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
            <small>Hình ảnh, PDF, DOC (tối đa 10MB)</small>
            {attachment && (
              <div className="attachment-preview">
                <span>📎 {attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="remove-attachment"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Feedback;

