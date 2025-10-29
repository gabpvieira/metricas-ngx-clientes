const { VercelRequest, VercelResponse } = require('@vercel/node');

module.exports = function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    success: true,
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}