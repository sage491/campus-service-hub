export function notFoundHandler(request, response) {
  response.status(404).json({ message: `Route ${request.method} ${request.originalUrl} was not found.` });
}

export function errorHandler(error, _request, response, _next) {
  if (!error.statusCode) console.error(error);
  if (error.name === 'ValidationError') return response.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') });
  if (error.name === 'CastError') return response.status(400).json({ message: 'One or more supplied IDs are invalid.' });
  if (error.code === 11000) return response.status(409).json({ message: 'A user with that email already exists.' });
  response.status(error.statusCode || 500).json({
    message: error.message || 'An unexpected server error occurred.'
  });
}
