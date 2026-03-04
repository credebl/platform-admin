import { Loader } from 'lucide-react';

interface SpinnerProps {
  color?: 'info' | 'success' | 'failure' | 'warning' | 'pink' | 'purple'; 
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hideMessage?: boolean;
}

const CustomSpinner = ({ color, message, size, hideMessage }: SpinnerProps) => {
  const colorClass = color ? `fill-${color}-600` : 'fill-gray-700';
  const sizeClass = size ? `h-${size} w-${size}` : 'h-8 w-8';

  return (
    <div className="flex items-start justify-center min-h-screen p-4">
      <span className='flex items-center text-base font-normal text-gray-600 dark:text-gray-400'>
        <Loader
          color={colorClass}
          size={sizeClass}
        />
        {!hideMessage && <span className='text-lg'>{message ?? 'Loading...'}</span>}
      </span>
    </div>
  );
};

export default CustomSpinner;
