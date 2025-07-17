import React, { useState } from 'react';

const questionData = {
  q: 'What is Suspense used for?',
  answers: [
    { text: 'A) Showing fallback UI during lazy-loading', correct: true },
    { text: 'B) Debugging apps', correct: false },
    { text: 'C) Suspends hooks', correct: false },
    { text: 'D) Prevents re-renders', correct: false },
  ],
  explanation: `Suspense lets you show a fallback UI (like a spinner) while React is waiting for something, such as a lazy-loaded component, to load. It does not debug apps, suspend hooks, or prevent re-renders. This feature improves user experience by handling loading states more gracefully.`
};

function Hooks() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSend = () => {
    if (selected !== null) setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
      <h2 style={{ marginBottom: 16 }}>{questionData.q}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questionData.answers.map((ans, idx) => (
          <button
            key={idx}
            onClick={() => !submitted && setSelected(idx)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: selected === idx ? '2px solid #1976d2' : '1px solid #aaa',
              background: submitted
                ? ans.correct
                  ? '#c8e6c9'
                  : selected === idx
                  ? '#ffcdd2'
                  : '#fff'
                : selected === idx
                ? '#e3f2fd'
                : '#fff',
              cursor: submitted ? 'default' : 'pointer',
              fontWeight: selected === idx ? 'bold' : 'normal',
              textAlign: 'left',
            }}
            disabled={submitted}
          >
            {ans.text}
          </button>
        ))}
      </div>
      {!submitted && (
        <button
          style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', cursor: selected !== null ? 'pointer' : 'not-allowed' }}
          onClick={handleSend}
          disabled={selected === null}
        >
          שלח
        </button>
      )}
      {submitted && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 'bold', color: questionData.answers[selected!].correct ? 'green' : 'red' }}>
            {questionData.answers[selected!].correct ? 'נכון!' : 'לא נכון.'}
          </div>
          <div style={{ marginTop: 12, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
            <strong>הסבר:</strong> {questionData.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

export default Hooks;