import React, { useState } from 'react';
import axios from 'axios';

// Use LOCAL_URL for local backend testing, BASE_URL for production
const LOCAL_URL = 'http://localhost:5000';
const BASE_URL = 'https://be-tan-theta.vercel.app';

// Change this to LOCAL_URL for local testing
const API_URL = BASE_URL; // <-- switch to BASE_URL for production

interface CharCountLimits {
  title?: number;
  description?: number;
  requirements?: number;
}

interface ProjectAiRequest {
  lang?: string;
  writingStyle?: string;
  freeText: string;
  jobRole?: string;
  jobType?: string;
  yearsExp?: string;
  mustSkills?: string;
  niceSkills?: string;
  charCountLimits?: CharCountLimits;
}

interface ProjectAiResponse {
  title?: string;
  description?: string;
  requirements?: string;
  [key: string]: any;
}

function ProjectAiWordCount() {
  const [freeText, setFreeText] = useState('');
  const [lang, setLang] = useState('עברית');
  const [writingStyle, setWritingStyle] = useState('Professional');
  const [jobRole, setJobRole] = useState('');
  const [jobType, setJobType] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [mustSkills, setMustSkills] = useState('');
  const [niceSkills, setNiceSkills] = useState('');
  const [titleLimit, setTitleLimit] = useState('100');
  const [descriptionLimit, setDescriptionLimit] = useState('200');
  const [requirementsLimit, setRequirementsLimit] = useState('180');
  
  const [response, setResponse] = useState<ProjectAiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestHistory, setRequestHistory] = useState<Array<{
    request: ProjectAiRequest;
    response: ProjectAiResponse;
    timestamp: string;
  }>>([]);

  const callProjectAi = async () => {
    if (!freeText.trim()) {
      setError('נא להזין טקסט חופשי');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: ProjectAiRequest = {
        freeText: freeText.trim(),
      };

      // Add optional fields only if they have values
      if (lang) requestBody.lang = lang;
      if (writingStyle) requestBody.writingStyle = writingStyle;
      if (jobRole) requestBody.jobRole = jobRole;
      if (jobType) requestBody.jobType = jobType;
      if (yearsExp) requestBody.yearsExp = yearsExp;
      if (mustSkills) requestBody.mustSkills = mustSkills;
      if (niceSkills) requestBody.niceSkills = niceSkills;
      
      // Add char count limits if any are specified
      const limits: CharCountLimits = {};
      if (titleLimit) limits.title = parseInt(titleLimit);
      if (descriptionLimit) limits.description = parseInt(descriptionLimit);
      if (requirementsLimit) limits.requirements = parseInt(requirementsLimit);
      
      if (Object.keys(limits).length > 0) {
        requestBody.charCountLimits = limits;
      }

      console.log('[PROJECT-AI-WORDCOUNT] Request body:', requestBody);
      
      const res = await axios.post(
        `${API_URL}/api/ai/project-ai`,
        requestBody,
        {
          headers: {
            'Authorization': 'Bearer 1234',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[PROJECT-AI-WORDCOUNT] Response:', res.data);
      setResponse(res.data);
      
      setRequestHistory(prev => [...prev, {
        request: requestBody,
        response: res.data,
        timestamp: new Date().toLocaleString('he-IL')
      }]);
      
    } catch (err: any) {
      console.error('[PROJECT-AI-WORDCOUNT] Error:', err);
      setError(err.response?.data?.message || err.message || 'שגיאה בקריאה ל-API');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFreeText('');
    setResponse(null);
    setError(null);
  };

  const handleClearHistory = () => {
    setRequestHistory([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLoadExample = () => {
    setFreeText('הצטרף/י לחברה מובילה');
    setLang('עברית');
    setWritingStyle('Professional');
    setJobRole('Full Stack Developer');
    setJobType('משרה מלאה');
    setYearsExp('2-3');
    setMustSkills('React, Node.js, MongoDB');
    setNiceSkills('TypeScript, AWS');
    setTitleLimit('100');
    setDescriptionLimit('200');
    setRequirementsLimit('180');
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#f9f9f9', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ color: '#024803', marginBottom: 8 }}>🤖 בדיקת Project AI - Word Count</h1>
        <p style={{ color: '#666', marginBottom: 16 }}>
          בדיקת endpoint של /api/ai/project-ai
          <br />
          מאפשר יצירת תוכן עבור פרויקטים/משרות עם הגבלות תווים
        </p>
        <button
          onClick={handleLoadExample}
          style={{ padding: '8px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}
        >
          טען דוגמה
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #ffcdd2' }}>
          שגיאה: {error}
        </div>
      )}

      {/* Required Field */}
      <div style={{ marginBottom: 24, padding: 16, border: '2px solid #024803', borderRadius: 8, backgroundColor: '#f0fff0' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#024803', fontSize: 16 }}>
          טקסט חופשי (שדה חובה) *
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="הכנס טקסט חופשי לתיאור הפרויקט/משרה"
          style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', fontSize: 14, fontFamily: 'Arial, sans-serif' }}
          disabled={loading}
        />
      </div>

      {/* Optional Fields - Basic */}
      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fff' }}>
        <h3 style={{ color: '#024803', marginTop: 0, marginBottom: 16 }}>פרטים כלליים (אופציונלי)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>שפה</label>
            <input
              type="text"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              placeholder="עברית / English"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>סגנון כתיבה</label>
            <input
              type="text"
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              placeholder="Professional / Casual"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fff' }}>
        <h3 style={{ color: '#024803', marginTop: 0, marginBottom: 16 }}>פרטי המשרה (אופציונלי)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>תפקיד</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Full Stack Developer"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>סוג משרה</label>
            <input
              type="text"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              placeholder="משרה מלאה"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>שנות ניסיון</label>
          <input
            type="text"
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value)}
            placeholder="2-3"
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>מיומנויות חובה</label>
          <input
            type="text"
            value={mustSkills}
            onChange={(e) => setMustSkills(e.target.value)}
            placeholder="React, Node.js, MongoDB"
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>מיומנויות רצויות</label>
          <input
            type="text"
            value={niceSkills}
            onChange={(e) => setNiceSkills(e.target.value)}
            placeholder="TypeScript, AWS"
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
            disabled={loading}
          />
        </div>
      </div>

      {/* Character Count Limits */}
      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fff' }}>
        <h3 style={{ color: '#024803', marginTop: 0, marginBottom: 16 }}>הגבלות תווים (אופציונלי)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>כותרת</label>
            <input
              type="number"
              value={titleLimit}
              onChange={(e) => setTitleLimit(e.target.value)}
              placeholder="100"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>תיאור</label>
            <input
              type="number"
              value={descriptionLimit}
              onChange={(e) => setDescriptionLimit(e.target.value)}
              placeholder="200"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>דרישות</label>
            <input
              type="number"
              value={requirementsLimit}
              onChange={(e) => setRequirementsLimit(e.target.value)}
              placeholder="180"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={callProjectAi}
          disabled={loading || !freeText.trim()}
          style={{ padding: '12px 24px', borderRadius: 8, background: loading ? '#ccc' : '#024803', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading || !freeText.trim() ? 'not-allowed' : 'pointer', fontSize: 16 }}
        >
          {loading ? 'שולח בקשה...' : 'שלח בקשה ל-API'}
        </button>
        <button
          onClick={handleClear}
          style={{ padding: '12px 24px', borderRadius: 8, background: '#666', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}
        >
          נקה
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 'bold', color: '#024803', fontSize: 18 }}>
              תשובה מה-API:
            </label>
            <button
              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
              style={{ padding: '4px 12px', borderRadius: 4, background: '#024803', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              העתק JSON
            </button>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, border: '1px solid #ddd' }}>
            {Object.entries(response).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold', color: '#024803', marginBottom: 8, fontSize: 14 }}>
                  {key}:
                </div>
                <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 6, fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </div>
                {typeof value === 'string' && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    אורך: {value.length} תווים
                  </div>
                )}
              </div>
            ))}
          </div>
          <pre style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto', fontSize: 12, fontFamily: 'Consolas, Monaco, "Courier New", monospace', marginTop: 12 }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Request History */}
      {requestHistory.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: '#024803', margin: 0 }}>היסטוריית בקשות</h3>
            <button
              onClick={handleClearHistory}
              style={{ padding: '4px 12px', borderRadius: 4, background: '#d32f2f', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              נקה היסטוריה
            </button>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
            {requestHistory.slice(-5).reverse().map((item, index) => (
              <div key={index} style={{ padding: 16, borderBottom: index < 4 ? '1px solid #eee' : 'none', backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold', color: '#024803', fontSize: 14 }}>
                    {item.timestamp}
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 }}>בקשה:</div>
                  <div style={{ fontSize: 12, fontFamily: 'Consolas, Monaco, "Courier New", monospace', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4, direction: 'ltr', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => copyToClipboard(JSON.stringify(item.request, null, 2))}
                    title="לחץ כדי להעתיק">
                    {JSON.stringify(item.request, null, 2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 }}>תשובה:</div>
                  <div style={{ fontSize: 12, fontFamily: 'Consolas, Monaco, "Courier New", monospace', backgroundColor: '#e8f5e9', padding: 8, borderRadius: 4, direction: 'ltr', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => copyToClipboard(JSON.stringify(item.response, null, 2))}
                    title="לחץ כדי להעתיק">
                    {JSON.stringify(item.response, null, 2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectAiWordCount;
