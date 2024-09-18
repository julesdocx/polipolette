// components/OverlayContainer.tsx
import Image from 'next/image';

import { urlForImage } from '~/lib/sanity.image'
import { type Post } from '~/lib/sanity.queries';

interface OverlayContainerProps {
  posts: Post[];
  projectTitle: string;
  onClose: () => void;
}

export default function OverlayContainer({ posts, projectTitle, onClose }: OverlayContainerProps) {

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="overlay">
      <button className="overlay__close" onClick={onClose}>esc</button>
      <div className={`overlay__content ${posts.length == 1 ? "flex-center" : ""}`} onClick={handleBackgroundClick}>
        {posts.map((post) => {
          // Safely extract the post title from the slug
          const postTitle = post.title ? post.title : " ";

          return (
            <div key={post._id} className="overlay__item">
              {(post.mainImage && urlForImage(post.mainImage)) && (
                <div>
                    <Image
                      className='overlay__img'
                      src={urlForImage(post.mainImage).url()}
                      alt={postTitle}
                      quality={60}
                      priority={true}
                      // fill
                      width={window.innerWidth >= 800 ? ((window.innerWidth - 200) / posts.length) : (window.innerWidth -200)}
                      height={0}
                      // sizes="(max-width: 768px) 100vw, 50vw"   // Responsive sizes 
                      // style={{ objectFit: 'contain' }}  // Maintain aspect ratio without cutting offl
                    />
                    <Image
                      className="overlay__blur"
                      src={urlForImage(post.mainImage).url()}
                      alt={postTitle}
                      quality={10}
                      priority={true}
                      width={window.innerWidth >= 800 ? ((window.innerWidth - 200) / posts.length) : (window.innerWidth -200)}
                      height={0}
                    />
                    <h3 className='overlay__postname'>{postTitle}</h3>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <h2 className="overlay__project-title">{projectTitle}</h2>
    </div>
  );
}
