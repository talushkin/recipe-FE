import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const BASE_URL = 'https://be-tan-theta.vercel.app';

interface SqlResponse {
  sql?: string;
  query?: string;
  explanation?: string;
  error?: string;
  [key: string]: any;
}

const SqlExplain: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<SqlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/ai/get-sql-q`,
        { q: question },
        {
          headers: {
            'Authorization': 'Bearer 1234',
            'Content-Type': 'application/json'
          }
        }
      );

      setResponse(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to get SQL query');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          SQL Query Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your question in Hebrew or English, and get an SQL query
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Your Question"
            placeholder="מצא את כל הפרויקטים עם תקציבים גדולים מ-50000"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Generating...' : 'Send'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              backgroundColor: '#f5f5f5',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom color="primary">
              Response:
            </Typography>

            {response.sql && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  SQL Query:
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#263238',
                    color: '#aed581',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    overflow: 'auto',
                    borderRadius: 1
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {response.sql}
                  </pre>
                </Paper>
              </Box>
            )}

            {response.query && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Query:
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#263238',
                    color: '#aed581',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    overflow: 'auto',
                    borderRadius: 1
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {response.query}
                  </pre>
                </Paper>
              </Box>
            )}

            {response.explanation && (
              <Box sx={{ mb: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Explanation:
                </Typography>
                <Typography variant="body2">
                  {response.explanation}
                </Typography>
              </Box>
            )}

            {/* Display any other fields from response */}
            {Object.keys(response).filter(key => 
              !['sql', 'query', 'explanation', 'error'].includes(key)
            ).map(key => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {key}:
                </Typography>
                <Typography variant="body2">
                  {typeof response[key] === 'object' 
                    ? JSON.stringify(response[key], null, 2) 
                    : String(response[key])
                  }
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default SqlExplain;
