import React, { useState } from 'react';
import axios from 'axios';

// Use LOCAL_URL for local backend testing, BASE_URL for production
const LOCAL_URL = 'http://localhost:5000';
const BASE_URL = 'https://be-tan-theta.vercel.app';

// Change this to LOCAL_URL for local testing
const API_URL = BASE_URL; // <-- switch to BASE_URL for production

function SqlFreeQ() {
  const [freeText, setFreeText] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{freeText: string, sql: string, usedCsv?: string | null, timestamp?: string}>>([]);
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [csvColumnsList, setCsvColumnsList] = useState<string[][]>([]);
  const [csvContents, setCsvContents] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  const convertToSql = async () => {
    if (!freeText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const requestBody: any = { q: freeText.trim() };
      if (csvFiles.length > 0 && csvContents.length === csvFiles.length) {
        requestBody.csv = csvFiles.map((file, idx) => ({ name: file.name, content: csvContents[idx] }));
      }
      // Log the request body before sending
      console.log('[SQL-FREEQ] Request body:', requestBody);
      const res = await axios.post(
        `${API_URL}/api/ai/get-sql-q`,
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
        usedCsv: csvFiles.length > 0 ? csvFiles.map(f => f.name).join(', ') : null,
        timestamp: new Date().toLocaleString('he-IL')
      }]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'נכשל בהמרה ל-SQL');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadLoading(true);
    setError(null);
    const newFiles: File[] = [];
    const newColumns: string[][] = [];
    const newContents: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.csv')) {
        setError('אנא העלה קובץ CSV בלבד');
        continue;
      }
      try {
        const text = await file.text();
        newFiles.push(file);
        newContents.push(text);
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
          newColumns.push(headers);
        } else {
          newColumns.push([]);
        }
      } catch (err) {
        setError('שגיאה בקריאת קובץ CSV');
      }
    }
    setCsvFiles(prev => [...prev, ...newFiles]);
    setCsvColumnsList(prev => [...prev, ...newColumns]);
    setCsvContents(prev => [...prev, ...newContents]);
    setUploadLoading(false);
  };

  const handleRemoveCsv = (idx: number) => {
    setCsvFiles(prev => prev.filter((_, i) => i !== idx));
    setCsvColumnsList(prev => prev.filter((_, i) => i !== idx));
    setCsvContents(prev => prev.filter((_, i) => i !== idx));
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

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#f9f9f9', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ color: '#024803', marginBottom: 8 }}>עוזר SQL חופשי</h1>
        <p style={{ color: '#666', marginBottom: 16 }}>
          המרת שאלות טקסט חופשי ל-SQL עבור כל טבלאות או קבצי CSV שתעלה
          <br />
          תומך בשאילתות באנגלית ובעברית + העלאת קבצי CSV למבנה טבלה מותאם אישית
        </p>
      </div>
      {error && (
        <div style={{ color: 'red', backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #ffcdd2' }}>
          שגיאה: {error}
        </div>
      )}
      {/* CSV Upload Section */}
      <div style={{ marginBottom: 24, padding: 16, border: '2px dashed #024803', borderRadius: 8, backgroundColor: '#f0fff0' }}>
        <h3 style={{ color: '#024803', margin: '0 0 12px 0' }}>העלאת קבצי CSV (אופציונלי)</h3>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 12px 0' }}>
          העלה קובצי CSV כדי שהשאילתות יתחשבו במבנה הטבלאות שלך
        </p>
        <div>
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileUpload}
            disabled={uploadLoading}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', backgroundColor: 'white', cursor: uploadLoading ? 'not-allowed' : 'pointer' }}
          />
          {uploadLoading && <span style={{ marginRight: 8, color: '#024803' }}>טוען...</span>}
        </div>
        {csvFiles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {csvFiles.map((file, idx) => (
              <div key={file.name + idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 8, background: '#e8f5e8', borderRadius: 6, padding: 8, border: '1px solid #4caf50' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#024803', marginBottom: 4 }}>
                    קובץ נטען: {file.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    עמודות זוהו ({csvColumnsList[idx]?.length}): {csvColumnsList[idx]?.join(', ')}
                  </div>
                  <div style={{ fontSize: 10, color: '#888' }}>
                    גודל קובץ: {(file.size / 1024).toFixed(1)} KB | שורות: {csvContents[idx]?.split('\n').length - 1} (בקירוב)
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCsv(idx)}
                  style={{ padding: '4px 12px', borderRadius: 4, background: '#d32f2f', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, marginRight: 8 }}
                >
                  הסר קובץ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#024803' }}>
          הכנס את השאילתה שלך בטקסט חופשי:
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={csvFiles.length > 0 ?
            `השאילתה תתחשב בטבלאות: ${csvFiles.map(f => `'${f.name.replace('.csv', '')}'`).join(', ')}\n${csvColumnsList.map((cols, idx) => `• ${csvFiles[idx]?.name.replace('.csv', '')}: ${cols.join(', ')}`).join('\n')}\n\nדוגמאות לשאילתות:\n• הראה לי את כל הרשומות\n• מצא רשומות עם ערך גדול מ-100 בעמודה הראשונה\n• ספור כמה רשומות יש בטבלה\n• סדר לפי העמודה השנייה` :
            `דוגמאות:\n• הראה לי את כל החברות עם השמות והערים שלהן\n• מצא את כל הפרויקטים עם תקציבים גדולים מ-50000\n• הראה חברות שהגישו הצעות מחיר עם סכומי ההצעות וכותרות הפרויקטים\n• ספור כמה פרויקטים כל חברה יצרה\n• Show me all companies with their names and cities`}
          style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', fontSize: 14, fontFamily: 'Arial, sans-serif' }}
          disabled={loading}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={convertToSql}
          disabled={loading || !freeText.trim()}
          style={{ padding: '12px 24px', borderRadius: 8, background: loading ? '#ccc' : (csvFiles.length > 0 ? '#2e7d32' : '#024803'), color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading || !freeText.trim() ? 'not-allowed' : 'pointer', fontSize: 16 }}
        >
          {loading ? 'מתרגם...' : (csvFiles.length > 0 ? `המר ל-SQL (עם ${csvFiles.map(f => f.name).join(', ')})` : 'המר ל-SQL')}
        </button>
        <button
          onClick={handleClear}
          style={{ padding: '12px 24px', borderRadius: 8, background: '#666', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
        >
          נקה
        </button>
        {csvFiles.length > 0 && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: '#e8f5e8', color: '#2e7d32', fontSize: 12, fontWeight: 'bold', border: '1px solid #4caf50' }}>
            📊 {csvFiles.length} קבצי CSV פעילים
          </div>
        )}
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
                    {item.usedCsv && <div>📊 {item.usedCsv}</div>}
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

export default SqlFreeQ;
