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
  const posts = await getPosts(client)

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

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Function to handle card click
  const handleCardClick = (post: Post) => {
    const projectTitle = post.slug.current.split('_')[0].replace(/-/g, ' ');
    const relatedPosts = posts.filter((p) => p.slug.current.startsWith(`${post.slug.current.split('_')[0]}`));
    console.log(relatedPosts)
    setSelectedProjectTitle(projectTitle);
    setOverlayPosts(relatedPosts);
  };

  // Function to close overlay
  const closeOverlay = () => {
    setOverlayPosts(null);
    setSelectedProjectTitle(null);
  };

  return (
    <Container>
      <section className="gallery">
        {posts.length ? (
          posts.map((post, index) => (
            <div
              key={post._id}
              className={`card ${loaded ? 'fade-in' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleCardClick(post)}  // Handle card click
            >
              <Card post={post} />
            </div>
          ))
        ) : (
          <div>No posts available</div>
        )}
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
