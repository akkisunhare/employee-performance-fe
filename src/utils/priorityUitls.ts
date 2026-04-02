export const formatDateWithYear = (dateInput: Date | string | undefined): string => {
        if (!dateInput) return '-';
        
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateInput);
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).replace(/ /g, '-');
    };