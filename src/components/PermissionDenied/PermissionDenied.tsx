import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PermissionDenied.css';

interface PermissionDeniedProps {
  message?: string;
}

const PermissionDenied: React.FC<PermissionDeniedProps> = ({ 
  message = 'Bạn không có quyền truy cập tính năng này. Chỉ ADMIN và USER có thể quản lý.' 
}) => {
  const navigate = useNavigate();

  return (
    <div className="permission-denied">
      <div className="permission-denied-content">
        <div className="permission-icon">🔒</div>
        <h2>Không Có Quyền Truy Cập</h2>
        <p>{message}</p>
        <div className="permission-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Về Trang Chủ
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;

