export function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 15, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationResponse(page, limit, total) {
  return { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) };
}
