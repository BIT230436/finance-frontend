import { useState, useEffect } from 'react';
import { Category, CategoryDto } from '../../types';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (category: CategoryDto) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [color, setColor] = useState('#666666');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || '#666666');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      color,
    });
  };

  const presetColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
    '#FF3366', '#33FFCC', '#FF9966', '#66FF33', '#3366FF',
    '#FF6633', '#33FF99', '#FF3399', '#99FF33', '#3399FF',
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h2>{category ? 'Sửa thể loại' : 'Thêm thể loại'}</h2>
      </div>

      <div className="form-group">
        <label>Tên thể loại</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label>Loại</label>
        <select value={type} onChange={(e) => setType(e.target.value as any)} required>
          <option value="INCOME">Thu</option>
          <option value="EXPENSE">Chi</option>
        </select>
      </div>

      <div className="form-group">
        <label>Màu sắc</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#RRGGBB"
            style={{ flex: 1 }}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setColor(presetColor)}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: presetColor,
                border: color === presetColor ? '2px solid #333' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {category ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;

