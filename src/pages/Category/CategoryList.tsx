import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';
import Layout from '../../components/Layout/Layout';
import CategoryForm from '../../components/Category/CategoryForm';
import { Category, CategoryDto } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './CategoryList.css';

const CategoryList: React.FC = () => {
  const { categories, incomeCategories, expenseCategories, loading, error } = useAppSelector(
    (state) => state.category
  );
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { canCreateCategories, canUpdateCategories, canDeleteCategories } = usePermissions();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCategories());
    }
  }, [user, dispatch]);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa thể loại này?')) {
      if (user?.id) {
        try {
          await dispatch(deleteCategory(id)).unwrap();
          // Refresh data after successful deletion
          await dispatch(fetchCategories());
          alert('Xóa thể loại thành công!');
        } catch (error: any) {
          // Backend trả về error message rõ ràng nếu không thể xóa
          // Ví dụ: "Không thể xóa danh mục này vì đang có 5 giao dịch đang sử dụng..."
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Không thể xóa thể loại';
          alert(`Lỗi: ${errorMessage}`);
          console.error('[CategoryList] Delete error:', error);
        }
      }
    }
  };

  const handleSubmit = async (category: CategoryDto) => {
    if (!user?.id) return;

    try {
      console.log('[CategoryList] Submitting category:', category);
      
      if (editingCategory) {
        console.log('[CategoryList] Updating category:', editingCategory.id);
        const result = await dispatch(updateCategory({ id: editingCategory.id, category })).unwrap();
        console.log('[CategoryList] Update success:', result);
        alert('Cập nhật thể loại thành công!');
      } else {
        console.log('[CategoryList] Creating category...');
        const result = await dispatch(createCategory(category)).unwrap();
        console.log('[CategoryList] Create success:', result);
        alert('Tạo thể loại thành công!');
      }
      
      // Refresh data
      await dispatch(fetchCategories());
      
      setShowModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('[CategoryList] Error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Không thể lưu thể loại';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const filteredCategories =
    filterType === 'ALL'
      ? categories
      : filterType === 'INCOME'
      ? incomeCategories
      : expenseCategories;

  return (
    <Layout>
      <div className="category-list">
        <div className="page-header">
          <h1>Thể loại</h1>
          {canCreateCategories() && (
            <button onClick={handleCreate} className="btn btn-primary">
              + Thêm thể loại
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="INCOME">Thu</option>
            <option value="EXPENSE">Chi</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p>Đang tải...</p>}

        {!loading && filteredCategories.length === 0 && (
          <div className="empty-state">
            <p>Chưa có thể loại nào.</p>
            {canCreateCategories() && <p>Hãy tạo thể loại đầu tiên của bạn!</p>}
            {!canCreateCategories() && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Chỉ ADMIN và USER mới có thể tạo thể loại.
              </p>
            )}
          </div>
        )}

        {!loading && filteredCategories.length > 0 && (
          <div className="category-grid">
            {filteredCategories.map((category) => (
              <div key={category.id} className="category-card">
                <div
                  className="category-color"
                  style={{ backgroundColor: category.color || '#666' }}
                ></div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className={`type-badge ${category.type.toLowerCase()}`}>
                    {category.type === 'INCOME' ? 'Thu' : 'Chi'}
                  </span>
                </div>
                <div className="category-actions">
                  {canUpdateCategories() && (
                    <button onClick={() => handleEdit(category)} className="btn btn-secondary">
                      Sửa
                    </button>
                  )}
                  {canDeleteCategories() && (
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="btn btn-danger"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <CategoryForm
                category={editingCategory}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryList;

