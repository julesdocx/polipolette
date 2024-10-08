import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useLiveQuery } from 'next-sanity/preview'
import { useEffect, useState } from 'react';

import Card from '~/components/Card'
import Container from '~/components/Container'
import OverlayContainer from '~/components/OverlayContainer'  // Import the overlay component
import { readToken } from '~/lib/sanity.api'
import { getClient } from '~/lib/sanity.client'
import { getPosts, type Post, postsQuery } from '~/lib/sanity.queries'
import type { SharedPageProps } from '~/pages/_app'

export const getStaticProps: GetStaticProps<
  SharedPageProps & {
    posts: Post[]
  }
> = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? { token: readToken } : undefined)
  const allPosts = await getPosts(client);

  const shuffleArray = (arr) =>
  [...Array(arr.length)]
    .map((_, i) => Math.floor(Math.random() * (i + 1)))
    .reduce(
      (shuffled, r, i) =>
        shuffled.map((num, j) =>
          j === i ? shuffled[r] : j === r ? shuffled[i] : num
        ),
      arr
    );

  const posts = shuffleArray(allPosts);

  return {
    props: {
      draftMode,
      token: draftMode ? readToken : '',
      posts,
    },
  }
}


export default function IndexPage(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const [posts] = useLiveQuery<Post[]>(props.posts, postsQuery)
  const [loaded, setLoaded] = useState(false);
  const [overlayPosts, setOverlayPosts] = useState<Post[] | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState<Element[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  useEffect(() => {
    // Detect mobile screen width (less than 600px)
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const useKeypress = (key: string, action: Function) => {
		useEffect(() => {
		  const onKeyup = (e) => {
			if (e.key === key) action();
		  }
		  window.addEventListener("keyup", onKeyup);
		  return () => window.removeEventListener("keyup", onKeyup);
		});
	}
//for activate the function 
useKeypress("Escape", ()=>closeOverlay());

  // Function to handle card click
  const handleCardClick = (post: Post) => {
    const projectTitle = post.excerpt;
    const relatedPosts = posts.filter((p) => p.excerpt === projectTitle);
    setSelectedProjectTitle(projectTitle);
    setOverlayPosts(relatedPosts);
  };

  // Function to close overlay
  const closeOverlay = () => {
    setOverlayPosts(null);
    setSelectedProjectTitle(null);
  };  

  const handleMouseOver = (post: Post) => {
    if (isMobile) return; // Disable manual hover effect on mobile when auto-blur is running
    applyBlurEffect(post);
  }

const applyBlurEffect = (highlightedPost: Post) => {
  const projectTitle = highlightedPost.excerpt;
  const postElements = document.querySelectorAll(`[data-id="${projectTitle}"]`);
  const allCards = document.querySelectorAll('.gallery__item');
  const allCardsArray = Array.from(allCards);
  const postArray = Array.from(postElements);

  // Remove blur from the highlighted posts
  allCardsArray.forEach((element) => {
    element.classList.remove('blur');
  });

  // Apply blur to all other posts except the highlighted ones
  const blurredPosts = allCardsArray.filter((card) => !postArray.includes(card));
  blurredPosts.forEach((element) => {
    element.classList.add('blur');
  });

  setHoverState(blurredPosts);
};


  const handleMouseOut = () => {
    if (hoverState && hoverState !== null ) {
      hoverState.forEach((element) => {
        element.classList.remove('blur');
      })
    }
    setHoverState(null);
  }

  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        const nextIndex = (currentHighlightIndex + 1) % posts.length;
        applyBlurEffect(posts[nextIndex]);
        setCurrentHighlightIndex(nextIndex);
      }, 50);

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [isMobile, currentHighlightIndex, posts]);


  return (
    <Container>
      <section className='gallery__container'>
        <div className="gallery">
          {posts.length ? (
            posts.map((post, index) => (
              <div
                data-id={post.excerpt}
                key={post._id}
                className={`card gallery__item ${loaded ? 'fade-in' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleCardClick(post)}  // Handle card click
                onMouseEnter={() => handleMouseOver(post)} 
                onMouseLeave={() => handleMouseOut()}
              >
                <Card post={post} />
              </div>
            ))
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </section>

      {overlayPosts && selectedProjectTitle && (
        <OverlayContainer
          posts={overlayPosts}
          projectTitle={selectedProjectTitle}
          onClose={closeOverlay}
        />
      )}
    </Container>
  );
}
