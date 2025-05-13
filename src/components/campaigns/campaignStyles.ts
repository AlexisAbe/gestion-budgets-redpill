
/**
 * Returns the appropriate CSS class based on media channel
 */
export const getMediaChannelClass = (channel: string) => {
  switch(channel) {
    case 'META': return 'bg-blue-50 text-blue-800';
    case 'GOOGLE': return 'bg-green-50 text-green-800';
    case 'LINKEDIN': return 'bg-blue-800 text-white';
    case 'TWITTER': return 'bg-blue-400 text-white';
    case 'DISPLAY': return 'bg-purple-50 text-purple-800';
    case 'EMAIL': return 'bg-yellow-50 text-yellow-800';
    default: return 'bg-gray-50 text-gray-800';
  }
};

/**
 * Returns the appropriate CSS class based on objective
 */
export const getObjectiveClass = (objective: string) => {
  switch(objective) {
    case 'awareness': return 'bg-blue-50 text-blue-800';
    case 'consideration': return 'bg-purple-50 text-purple-800';
    case 'conversion': return 'bg-green-50 text-green-800';
    case 'loyalty': return 'bg-yellow-50 text-yellow-800';
    default: return 'bg-gray-50 text-gray-800';
  }
};
