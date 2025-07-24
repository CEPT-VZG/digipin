const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * Basic health check endpoint
 * Returns simple OK status for load balancers and basic monitoring
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DIGIPIN API'
  });
});

/**
 * Detailed health check endpoint
 * Returns comprehensive system information for monitoring and debugging
 */
router.get('/detailed', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DIGIPIN API',
    version: process.env.npm_package_version || '1.0.0',
    uptime: {
      process: uptime,
      formatted: formatUptime(uptime)
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        process: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        }
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
        processUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      }
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Readiness check endpoint
 * Verifies that the service is ready to accept requests
 * Can be used by Kubernetes and other orchestration systems
 */
router.get('/ready', (req, res) => {
  // Check if core DIGIPIN functions are available
  try {
    const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');
    
    if (typeof getDigiPin !== 'function' || typeof getLatLngFromDigiPin !== 'function') {
      return res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        service: 'DIGIPIN API',
        reason: 'Core DIGIPIN functions not available'
      });
    }

    // Test basic functionality
    const testLat = 12.9716;
    const testLon = 77.5946;
    const testDigipin = getDigiPin(testLat, testLon);
    const decodedCoords = getLatLngFromDigiPin(testDigipin);

    if (!testDigipin || !decodedCoords) {
      return res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        service: 'DIGIPIN API',
        reason: 'Core DIGIPIN functionality test failed'
      });
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      service: 'DIGIPIN API',
      checks: {
        coreFunctions: 'OK',
        encodeDecode: 'OK'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      service: 'DIGIPIN API',
      reason: 'Service initialization failed',
      error: error.message
    });
  }
});

/**
 * Liveness check endpoint
 * Simple check to verify the process is alive
 * Used by Kubernetes liveness probes
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    service: 'DIGIPIN API',
    pid: process.pid
  });
});

/**
 * Helper function to format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

module.exports = router;
