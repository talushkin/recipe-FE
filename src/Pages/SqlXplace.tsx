
import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://be-tan-theta.vercel.app';

function SqlXplace() {
  const [freeText, setFreeText] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{freeText: string, sql: string, timestamp?: string}>>([]);


  const convertToSql = async () => {
    if (!freeText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const requestBody: any = { q: freeText.trim() };
      const res = await axios.post(
        `${BASE_URL}/api/ai/get-sql-q`,
        requestBody,
        {
          headers: {
            'Authorization': 'Bearer 1234',
            'Content-Type': 'application/json'
          }
        }
      );
      const generatedSql = res.data.sqlQuery || res.data.sql || 'לא נוצר SQL';
      setSqlQuery(generatedSql);
      setQueryHistory(prev => [...prev, {
        freeText: freeText.trim(),
        sql: generatedSql,
        timestamp: new Date().toLocaleString('he-IL')
      }]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'נכשל בהמרה ל-SQL');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFreeText('');
    setSqlQuery('');
    setError(null);
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };


  // CSV upload logic removed for XPlace page

  return (
    <div style={{
      maxWidth: 800,
      margin: '2rem auto',
      padding: 24,
      border: '1px solid #ccc',
      borderRadius: 12,
      backgroundColor: '#f9f9f9',
      direction: 'rtl',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ color: '#024803', marginBottom: 8 }}>עוזר SQL XPlace</h1>
        <p style={{ color: '#666', marginBottom: 16 }}>
          המרת שאלות טקסט חופשי ל-SQL עבור טבלאות XPlace בלבד
          <br />
          תומך בשאילתות באנגלית ובעברית
        </p>
      </div>
      {error && (
        <div style={{
          color: 'red',
          backgroundColor: '#ffebee',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #ffcdd2'
        }}>
          שגיאה: {error}
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <label style={{
          display: 'block',
          marginBottom: 8,
          fontWeight: 'bold',
          color: '#024803'
        }}>
          הכנס את השאילתה שלך בטקסט חופשי:
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={`דוגמאות:\n• הראה לי את כל החברות עם השמות והערים שלהן\n• מצא את כל הפרויקטים עם תקציבים גדולים מ-50000\n• הראה חברות שהגישו הצעות מחיר עם סכומי ההצעות וכותרות הפרויקטים\n• ספור כמה פרויקטים כל חברה יצרה\n• Show me all companies with their names and cities`}
          style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', fontSize: 14, fontFamily: 'Arial, sans-serif' }}
          disabled={loading}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={convertToSql}
          disabled={loading || !freeText.trim()}
          style={{ padding: '12px 24px', borderRadius: 8, background: loading ? '#ccc' : '#024803', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading || !freeText.trim() ? 'not-allowed' : 'pointer', fontSize: 16 }}
        >
          {loading ? 'מתרגם...' : 'המר ל-SQL'}
        </button>
        <button
          onClick={handleClear}
          style={{ padding: '12px 24px', borderRadius: 8, background: '#666', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
        >
          נקה
        </button>
      </div>
      {sqlQuery && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 'bold', color: '#024803' }}>
              שאילתת SQL שנוצרה:
            </label>
            <button
              onClick={() => copyToClipboard(sqlQuery)}
              style={{ padding: '4px 12px', borderRadius: 4, background: '#024803', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              העתק
            </button>
          </div>
          <pre style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto', fontSize: 14, fontFamily: 'Consolas, Monaco, "Courier New", monospace', whiteSpace: 'pre-wrap' }}>
            {sqlQuery}
          </pre>
        </div>
      )}
      {queryHistory.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: '#024803', margin: 0 }}>היסטוריית שאילתות</h3>
            <button
              onClick={handleClearHistory}
              style={{ padding: '4px 12px', borderRadius: 4, background: '#d32f2f', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              נקה היסטוריה
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
            {queryHistory.slice(-5).reverse().map((item, index) => (
              <div key={index} style={{ padding: 12, borderBottom: index < 4 ? '1px solid #eee' : 'none', backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 'bold', color: '#024803', flex: 1 }}>
                    שאילתה: {item.freeText}
                  </div>
                  <div style={{ fontSize: 10, color: '#666', textAlign: 'left', marginRight: 8 }}>
                    {item.timestamp && <div>{item.timestamp}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'Consolas, Monaco, "Courier New", monospace', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4, cursor: 'pointer', direction: 'ltr', textAlign: 'left' }}
                  onClick={() => copyToClipboard(item.sql)}
                  title="לחץ כדי להעתיק">
                  {item.sql}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SqlXplace;