import { format } from 'date-fns';

// Function to format the date and time using date-fns
const formatDate = () => {
  const now = new Date();
  return format(now, 'yyyy-MM-dd_HHh-mmM-ssS');
};

export default formatDate;
