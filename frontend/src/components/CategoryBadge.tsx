import React from 'react';
import type { Email } from '../types';

interface CategoryBadgeProps {
    category: Email['category'];
}

const getCategoryClass = (category: Email['category']): string => {
    switch (category) {
        case 'Interested':
            return 'badge-interested';
        case 'Meeting Booked':
            return 'badge-meeting';
        case 'Not Interested':
            return 'badge-not-interested';
        case 'Spam':
            return 'badge-spam';
        case 'Out of Office':
            return 'badge-ooo';
        default:
            return 'badge-not-interested';
    }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
    return (
        <span className={`badge ${getCategoryClass(category)}`}>
            {category}
        </span>
    );
};
