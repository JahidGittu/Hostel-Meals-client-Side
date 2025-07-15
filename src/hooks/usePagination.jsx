import { useState, useMemo } from 'react';

const usePagination = ({ initialTotal = 0, initialPage = 1, limit = 10 }) => {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = Math.ceil(total / limit);

  const queryParams = useMemo(() => {
    return `?page=${page}&limit=${limit}`;
  }, [page, limit]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,     
    goToPage,
    goToNextPage,
    goToPrevPage,
    queryParams,
  };
};

export default usePagination;
