import { startMockDataGenerator } from './modules/sensor';
import app from './server';

const PORT = 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startMockDataGenerator();
});

export default app;