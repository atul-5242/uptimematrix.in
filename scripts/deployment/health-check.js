import express from 'express';

const app = express();
const PORT = process.env.HEALTH_PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// API health check
app.get('/health/api', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    res.json({ service: 'api', status: 'healthy', data });
  } catch (error) {
    res.status(503).json({ service: 'api', status: 'unhealthy', error: error.message });
  }
});

// Redis health check
app.get('/health/redis', async (req, res) => {
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: 'redis://localhost:6379' });
    await client.connect();
    const pong = await client.ping();
    await client.disconnect();
    res.json({ service: 'redis', status: 'healthy', response: pong });
  } catch (error) {
    res.status(503).json({ service: 'redis', status: 'unhealthy', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
