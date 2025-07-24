import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from '../config/api';
import './Reports.css';

const Reports = () => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collapsedItems, setCollapsedItems] = useState(new Set());
  const { logout } = useAuth();

  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { start, end } = getCurrentMonthRange();
      
      const response = await axios.get(`/reports/reports/materials?sort=name&start=${start}&end=${end}`);
      
      if (response.data) {
        setData(response.data);
        processData(response.data);
      }
    } catch (error) {
      setError(`Ошибка загрузки данных: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    const grouped = {};
    
    rawData.forEach(item => {
      const parent = item.parent || 'Unknown';
      const category = item.category || 'Unknown';
      
      if (!grouped[parent]) {
        grouped[parent] = {};
      }
      
      if (!grouped[parent][category]) {
        grouped[parent][category] = [];
      }
      
      grouped[parent][category].push(item);
    });

    const processedData = [];
    
    Object.keys(grouped).forEach(parent => {
      const parentData = {
        type: 'parent',
        name: parent,
        unit: 'dona',
        code: '-',
        last_price: 0,
        color: null,
        items: [],
        totals: calculateTotals(Object.values(grouped[parent]).flat())
      };
      
      Object.keys(grouped[parent]).forEach(category => {
        const categoryData = {
          type: 'category',
          name: category,
          parent: parent,
          unit: 'dona',
          code: '-',
          last_price: 0,
          color: null,
          items: grouped[parent][category],
          totals: calculateTotals(grouped[parent][category])
        };
        
        parentData.items.push(categoryData);
      });
      
      processedData.push(parentData);
    });

    setGroupedData(processedData);
  };

  const calculateTotals = (items) => {
    return items.reduce((acc, item) => {
      return {
        remind_start_amount: (acc.remind_start_amount || 0) + (item.remind_start_amount || 0),
        remind_start_sum: (acc.remind_start_sum || 0) + (item.remind_start_sum || 0),
        remind_income_amount: (acc.remind_income_amount || 0) + (item.remind_income_amount || 0),
        remind_income_sum: (acc.remind_income_sum || 0) + (item.remind_income_sum || 0),
        remind_outgo_amount: (acc.remind_outgo_amount || 0) + (item.remind_outgo_amount || 0),
        remind_outgo_sum: (acc.remind_outgo_sum || 0) + (item.remind_outgo_sum || 0),
        remind_end_amount: (acc.remind_end_amount || 0) + (item.remind_end_amount || 0),
        remind_end_sum: (acc.remind_end_sum || 0) + (item.remind_end_sum || 0)
      };
    }, {});
  };

  const calculateGrandTotal = () => {
    return calculateTotals(data);
  };

  const toggleCollapse = (itemKey) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(itemKey)) {
      newCollapsed.delete(itemKey);
    } else {
      newCollapsed.add(itemKey);
    }
    setCollapsedItems(newCollapsed);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const renderRow = (item, level = 0, index = 0) => {
    const isCollapsed = collapsedItems.has(`${item.type}-${item.name}-${index}`);
    const hasChildren = item.items && item.items.length > 0;
    
    return (
      <div key={`${item.type}-${item.name}-${index}`}>
        <div className={`table-row level-${level} ${item.type}`}>
          <div className="name-cell">
            <div style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button 
                  className="collapse-button"
                  onClick={() => toggleCollapse(`${item.type}-${item.name}-${index}`)}
                >
                  {isCollapsed ? '+' : '-'}
                </button>
              )}
              <span className="item-name">{item.name}</span>
            </div>
          </div>
          <div className="color-cell">
            <div className="color-indicator" style={{ 
              backgroundColor: item.color || '#6c757d' 
            }}></div>
          </div>
          <div className="unit-cell">{item.unit || 'dona'}</div>
          <div className="article-cell">{item.code || '-'}</div>
          <div className="price-cell">{formatNumber(item.last_price || 0)}</div>
          <div className="balance-start-cell">
            <div>{formatNumber(item.totals?.remind_start_amount || 0)}</div>
            <div>{formatNumber(item.totals?.remind_start_sum || 0)}</div>
          </div>
          <div className="income-cell">
            <div>{formatNumber(item.totals?.remind_income_amount || 0)}</div>
            <div>{formatNumber(item.totals?.remind_income_sum || 0)}</div>
          </div>
          <div className="outgo-cell">
            <div>{formatNumber(item.totals?.remind_outgo_amount || 0)}</div>
            <div>{formatNumber(item.totals?.remind_outgo_sum || 0)}</div>
          </div>
          <div className="balance-end-cell">
            <div>{formatNumber(item.totals?.remind_end_amount || 0)}</div>
            <div>{formatNumber(item.totals?.remind_end_sum || 0)}</div>
          </div>
        </div>
        
        {!isCollapsed && hasChildren && (
          <>
            {item.items.map((child, childIndex) => 
              renderRow(child, level + 1, childIndex)
            )}
          </>
        )}
      </div>
    );
  };



  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const grandTotal = calculateGrandTotal();

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error">{error}</div>
        <button onClick={fetchData}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="header">
        <h1>Отчет по материалам</h1>
        <button onClick={logout} className="logout-button">Выйти</button>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <div className="name-cell">Наименование</div>
          <div className="color-cell">Цвет</div>
          <div className="unit-cell">Ед изм</div>
          <div className="article-cell">Артикул</div>
          <div className="price-cell">Цена учетная</div>
          <div className="balance-start-cell">
            <div>Сальдо начало периода</div>
            <div className="sub-columns">
              <div>Кол-во</div>
              <div>Сумма</div>
            </div>
          </div>
          <div className="income-cell">
            <div>Приход</div>
            <div className="sub-columns">
              <div>Кол-во</div>
              <div>Сумма</div>
            </div>
          </div>
          <div className="outgo-cell">
            <div>Расход</div>
            <div className="sub-columns">
              <div>Кол-во</div>
              <div>Сумма</div>
            </div>
          </div>
          <div className="balance-end-cell">
            <div>Сальдо на конец периода</div>
            <div className="sub-columns">
              <div>Кол-во</div>
              <div>Сумма</div>
            </div>
          </div>
        </div>
        
        <div className="table-body">
          <div className="table-row grand-total">
            <div className="name-cell">
              <span className="item-name">Итог</span>
            </div>
            <div className="color-cell">
              <div className="color-indicator"></div>
            </div>
            <div className="unit-cell">dona</div>
            <div className="article-cell">-</div>
            <div className="price-cell">-</div>
            <div className="balance-start-cell">
              <div>{formatNumber(grandTotal.remind_start_amount || 0)}</div>
              <div>{formatNumber(grandTotal.remind_start_sum || 0)}</div>
            </div>
            <div className="income-cell">
              <div>{formatNumber(grandTotal.remind_income_amount || 0)}</div>
              <div>{formatNumber(grandTotal.remind_income_sum || 0)}</div>
            </div>
            <div className="outgo-cell">
              <div>{formatNumber(grandTotal.remind_outgo_amount || 0)}</div>
              <div>{formatNumber(grandTotal.remind_outgo_sum || 0)}</div>
            </div>
            <div className="balance-end-cell">
              <div>{formatNumber(grandTotal.remind_end_amount || 0)}</div>
              <div>{formatNumber(grandTotal.remind_end_sum || 0)}</div>
            </div>
          </div>
          {groupedData.map((parent, index) => renderRow(parent, 0, index))}
        </div>
      </div>
    </div>
  );
};

export default Reports; 