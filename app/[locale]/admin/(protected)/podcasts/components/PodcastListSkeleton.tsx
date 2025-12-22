/* **************************************************
 * Imports
 **************************************************/
import baseStyles from "../../styles";

/* **************************************************
 * Podcast List Skeleton Component
 **************************************************/
export default function PodcastListSkeleton() {
  return (
    <div className={baseStyles.container}>
      <div className={baseStyles.loadingText}>Caricamento podcasts...</div>
    </div>
  );
}

