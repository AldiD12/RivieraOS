/**
 * Skeleton Loaders
 * MANDATORY: No blank screens while loading
 * Prevents layout shifts and improves perceived performance
 */

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-64 w-full rounded-[2rem]',
    button: 'h-12 w-32 rounded-full',
    image: 'h-48 w-full rounded-[2rem]'
  };

  return (
    <div
      className={`animate-pulse bg-stone-200 ${variants[variant]} ${className}`}
      aria-label="Loading..."
      role="status"
    />
  );
};

/**
 * Menu Card Skeleton
 */
export const MenuCardSkeleton = () => (
  <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-stone-200/40">
    <Skeleton variant="image" className="mb-4" />
    <Skeleton variant="title" className="mb-2" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="w-1/2 mb-4" />
    <Skeleton variant="button" />
  </div>
);

/**
 * Venue Card Skeleton
 */
export const VenueCardSkeleton = () => (
  <div className="bg-gradient-to-br from-white to-stone-50/50 rounded-[2rem] p-8 border border-stone-200/40">
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="w-2/3 mb-6" />
    <div className="flex gap-4">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

/**
 * List Skeleton
 */
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="text" className="mb-2" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
