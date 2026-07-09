/**
 * @module routes
 * @description THIN route layer — maps URLs to service calls.
 * No business logic here. Just: extract params → call service → send response.
 */

const { Router } = require('express');
const { ipWhitelist } = require('./middleware');
const roadmapService = require('./services/RoadmapService');

const AppError = require('./lib/AppError');
const { MESSAGES, APP_NAME } = require('./config');

const router = Router();

/** Wraps sync/async handlers to forward thrown errors to Express. */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: APP_NAME,
    uptime: process.uptime(),
  });
});

router.get('/roadmap/stories', ipWhitelist, wrap(async (req, res) => {
  const data = await roadmapService.findAll({
    status: req.query.status || '',
    project: req.query.project || '',
    month: req.query.month || '',
    search: req.query.search || '',
  });

  res.json({
    statusCode: 200,
    message: MESSAGES.STORIES_OK,
    data,
    timestamp: new Date().toISOString(),
  });
}));

router.get('/roadmap/stories/:id', ipWhitelist, wrap(async (req, res) => {
  const data = await roadmapService.findOne(req.params.id);

  if (!data) {
    throw AppError.notFound(MESSAGES.STORY_NOT_FOUND(req.params.id));
  }

  res.json({
    statusCode: 200,
    message: MESSAGES.STORY_DETAIL_OK,
    data,
    timestamp: new Date().toISOString(),
  });
}));

router.get('/roadmap/attachment/:id', ipWhitelist, wrap(async (req, res) => {
  const { id } = req.params;

  try {
    const { stream, contentType, contentLength } = await roadmapService.getAttachmentStream(id);
    
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    stream.pipe(res);
  } catch (err) {
    if (err.message === 'Jira not configured' || err.response?.status === 404) {
      throw AppError.notFound('Attachment not found or Jira not configured');
    }
    throw err;
  }
}));

module.exports = router;
