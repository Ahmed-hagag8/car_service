import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Pagination = ({ currentPage, lastPage, total, perPage, onPageChange }) => {
    const { t } = useLanguage();

    if (!lastPage || lastPage <= 1) return null;

    const safeTotal = total || 0;
    const safePerPage = perPage || 10;
    const from = (currentPage - 1) * safePerPage + 1;
    const to = Math.min(currentPage * safePerPage, safeTotal);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(lastPage, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {safeTotal > 0 && (
                <p className="text-sm text-gray-600">
                    {t('showing')} <span className="font-semibold">{from}</span> {t('to')} <span className="font-semibold">{to}</span> {t('of')} <span className="font-semibold">{safeTotal}</span> {t('results')}
                </p>
            )}

            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map(page => (
                    <button key={page} onClick={() => onPageChange(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${page === currentPage
                            ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= lastPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
