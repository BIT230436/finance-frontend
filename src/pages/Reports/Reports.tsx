import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSummary, fetchCashflow, setDateRange } from '../../store/slices/reportSlice';
import { reportService } from '../../services/reportService';
import Layout from '../../components/Layout/Layout';
import CashflowChart from '../../components/Charts/CashflowChart';
import CategoryChart from '../../components/Charts/CategoryChart';
import ComparativeAnalysis from '../../components/Reports/ComparativeAnalysis';
import CashflowForecastWidget from '../../components/CashflowForecast/CashflowForecastWidget';
import './Reports.css';

const Reports: React.FC = () => {
  const { summary, cashflow, loading, dateRange } = useAppSelector((state) => state.report);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [fromDate, setFromDate] = useState(
    dateRange.from?.toISOString().split('T')[0] ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(
    dateRange.to?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (user?.id && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Validate dates before using
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        console.log('[Reports] Fetching data for date range:', { from, to });
        dispatch(setDateRange({ from, to }));
        dispatch(fetchSummary({ from, to }))
          .then((result) => {
            console.log('[Reports] Summary fetched:', result);
          })
          .catch((error) => {
            console.error('[Reports] Error fetching summary:', error);
          });
        dispatch(fetchCashflow({ from, to }))
          .then((result) => {
            console.log('[Reports] Cashflow fetched:', result);
          })
          .catch((error) => {
            console.error('[Reports] Error fetching cashflow:', error);
          });
      }
    }
  }, [user, fromDate, toDate, dispatch]);

  const handleExportExcel = () => {
    if (!user?.id) return;
    const from = dateRange.from ? new Date(dateRange.from) : undefined;
    const to = dateRange.to ? new Date(dateRange.to) : undefined;
    reportService.exportExcel(from, to);
  };

  const handleExportPdf = () => {
    if (!user?.id) return;
    const from = dateRange.from ? new Date(dateRange.from) : undefined;
    const to = dateRange.to ? new Date(dateRange.to) : undefined;
    reportService.exportPdf(from, to);
  };

  return (
    <Layout>
      <div className="reports">
        <div className="page-header">
          <h1>Báo cáo</h1>
          <div className="export-buttons">
            <button onClick={handleExportExcel} className="btn btn-secondary">
              Xuất Excel
            </button>
            <button onClick={handleExportPdf} className="btn btn-secondary">
              Xuất PDF
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="date-filter">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Đến ngày</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        {loading && <p>Đang tải báo cáo...</p>}

        {!loading && summary && (
          <>
            {/* Summary Cards */}
            {/* Backend đã xử lý null safety, frontend chỉ cần đảm bảo display đúng */}
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Tổng thu</h3>
                <p className="amount income">
                  {(summary.totalIncome != null ? summary.totalIncome : 0).toLocaleString()} VND
                </p>
              </div>
              <div className="summary-card">
                <h3>Tổng chi</h3>
                <p className="amount expense">
                  {(summary.totalExpense != null ? summary.totalExpense : 0).toLocaleString()} VND
                </p>
              </div>
              <div className="summary-card">
                <h3>Số dư</h3>
                <p className="amount">
                  {(summary.balance != null ? summary.balance : 0).toLocaleString()} VND
                </p>
              </div>
              <div className="summary-card">
                <h3>Số giao dịch</h3>
                <p className="amount">{summary.transactionCount != null ? summary.transactionCount : 0}</p>
              </div>
            </div>

            {/* Category Breakdown - Always show if summary exists */}
            <div className="chart-section">
              <h2>Phân bổ theo thể loại</h2>
              {summary.categorySummaries && summary.categorySummaries.length > 0 ? (
                <CategoryChart data={summary.categorySummaries} />
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                  Chưa có dữ liệu phân bổ theo thể loại trong khoảng ngày đã chọn.
                </p>
              )}
            </div>

            {/* Cashflow Chart - Always show if summary exists */}
            <div className="chart-section">
              <h2>Xu hướng dòng tiền</h2>
              {cashflow && cashflow.length > 0 ? (
                <CashflowChart data={cashflow} />
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                  Chưa có dữ liệu xu hướng dòng tiền trong khoảng ngày đã chọn.
                </p>
              )}
            </div>

            {/* Comparative Analysis */}
            <ComparativeAnalysis />

            {/* Cashflow Forecast */}
            <CashflowForecastWidget days={30} />
          </>
        )}

        {!loading && !summary && (
          <div className="empty-state">
            <p>Không có dữ liệu trong khoảng ngày đã chọn.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;

