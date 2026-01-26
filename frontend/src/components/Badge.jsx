export default function Badge({ status, children }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Available':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Occupied':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'BookedOnline':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'HotelBlocked':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${getStatusStyles()}`}
    >
      {children}
    </span>
  );
}
