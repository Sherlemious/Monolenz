import app from './app';
import { config } from 'dotenv';
import findOpenPort from './utils/find-open-port';

// Load environment variables
config();

const startServer = async () => {
  const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  const PORT = await findOpenPort(preferredPort, preferredPort + 100);

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });

  server.on('error', (err: any) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });
};

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
