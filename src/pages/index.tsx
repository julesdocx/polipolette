import { useEffect, useState } from 'react';
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useLiveQuery } from 'next-sanity/preview'

import Card from '~/components/Card'
import Container from '~/components/Container'
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
  // State to handle the animation delay
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Delay the appearance of the cards
    const timeoutId = setTimeout(() => setLoaded(true), 100); // 100ms initial delay
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <Container>
      <section className='gallery'>
        {posts.length ? (
          posts.map((post, index) => (
          <div key={post._id}
              className={`card ${loaded ? 'fade-in' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
          ><Card key={post._id} post={post} /></div>
          ))
        ) : (
          <div>
            hello world
          </div>
        )}
      </section>
    </Container>
  )
}
