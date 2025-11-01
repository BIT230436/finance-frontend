import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../services/categoryService';
import { Category, CategoryDto } from '../../types';

interface CategoryState {
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  incomeCategories: [],
  expenseCategories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (type?: 'INCOME' | 'EXPENSE') => {
    const categories = await categoryService.getAll(type);
    return categories;
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (category: CategoryDto) => {
    const newCategory = await categoryService.create(category);
    return newCategory;
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, category }: { id: number; category: CategoryDto }) => {
    const updatedCategory = await categoryService.update(id, category);
    return updatedCategory;
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id: number) => {
    await categoryService.delete(id);
    return id;
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.incomeCategories = action.payload.filter((c) => c.type === 'INCOME');
        state.expenseCategories = action.payload.filter((c) => c.type === 'EXPENSE');
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        if (action.payload.type === 'INCOME') {
          state.incomeCategories.push(action.payload);
        } else {
          state.expenseCategories.push(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (action.payload.type === 'INCOME') {
          const incomeIndex = state.incomeCategories.findIndex((c) => c.id === action.payload.id);
          if (incomeIndex !== -1) {
            state.incomeCategories[incomeIndex] = action.payload;
          }
        } else {
          const expenseIndex = state.expenseCategories.findIndex(
            (c) => c.id === action.payload.id
          );
          if (expenseIndex !== -1) {
            state.expenseCategories[expenseIndex] = action.payload;
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        state.incomeCategories = state.incomeCategories.filter((c) => c.id !== action.payload);
        state.expenseCategories = state.expenseCategories.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete category';
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;

