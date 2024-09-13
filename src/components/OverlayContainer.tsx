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

  return (
    <div className="overlay">
      <button className="overlay__close" onClick={onClose}>esc</button>
      <div className={`overlay__content ${posts.length == 1 ? "flex-center" : ""}`}>
        {posts.map((post) => {
          // Safely extract the post title from the slug
          const postTitle = post.title ? post.title : " ";

          return (
            <div key={post._id} className="overlay__item">
              {(post.mainImage && urlForImage(post.mainImage)) && (
                <div>
                    <Image
                      src={urlForImage(post.mainImage).url()}
                      alt={postTitle}
                      quality={90}
                      priority={true}
                      // fill
                      width={window.innerWidth >= 800 ? ((window.innerWidth - 200) / posts.length) : (window.innerWidth -200)}
                      height={500}
                      // sizes="(max-width: 768px) 100vw, 50vw"   // Responsive sizes 
                      // style={{ objectFit: 'contain' }}  // Maintain aspect ratio without cutting offl
                    />
                    <Image
                      className="overlay__blur"
                      src={urlForImage(post.mainImage).url()}
                      alt={postTitle}
                      quality={10}
                      priority={true}
                      fill
                    />
                </div>
              )}
              <h3 className='overlay__postname'>{postTitle}</h3>
            </div>
          );
        })}
      </div>
      <h2 className="overlay__project-title">{projectTitle}</h2>
    </div>
  );
}
