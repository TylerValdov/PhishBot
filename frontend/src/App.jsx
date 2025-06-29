import React, { useState, useEffect } from 'react';

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/history")
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    const data = await res.json();
    setResult(data);
    setHistory([data, ...history.slice(0,9)]);
  };

  return (
    <div style={{padding: '20px'}}>
      <textarea value={text} onChange={e => setText(e.target.value)} rows="8" style={{width: '100%'}} />
      <button onClick={handleSubmit}>Analyze</button>

      {result && (
        <div>
          <h3>Result:</h3>
          <p><b>Risk:</b> {result.risk_score}</p>
          <p><b>Summary:</b> {result.summary}</p>
          <p><b>Flags:</b> {Array.isArray(result.flags) && result.flags.length > 0
            ? result.flags.join(', ')
            : 'No flags found'}</p>
        </div>
      )}

      <h3>Recent Checks:</h3>
      {history.map((h,i) => (
        <div key={i} style={{borderBottom: '1px solid #ccc', marginTop: '10px'}}>
          <p><b>Risk:</b> {h.risk_score}</p>
          <p>{h.summary}</p>
        </div>
      ))}
    </div>
  );
}