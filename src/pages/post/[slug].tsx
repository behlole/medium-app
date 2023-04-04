import React from "react";
import {sanityClient} from "../../../sanity";
import Header from "../../../components/Header";
import {Post} from "../../../typings/typings";
import {GetStaticProps} from "next";

interface Props {
    post: Post
}

function Posts({post}: Props) {
    console.log(post)
    return <main>
        <Header/>
    </main>
}

export default Posts

export const getStaticPaths = async () => {
    const posts = await sanityClient.fetch(`
    *[_type=='post']{
        _id,
        slug{
            current
        }
    }`
    );
    const paths = posts.map((post: Post) =>
        ({
            params: {
                slug: post.slug.current
            }
        })
    )
    return {paths, fallback: 'blocking'}
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const query = `
    *[_type=="post" && slug.current==$slug]{
        _id,
        _createdAt,
        author->{
            name,
            image
        },
        'comments':*[
            _type=="comment" && 
            post._ref==^._id &&
            approved==true
        ],
        description,
        mainImage,
        slug,
        body
    }
    `
    const post = await sanityClient.fetch(query, {slug: params?.slug})
    if (!post) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            post,
        },
        revalidate: 60 //after 60 seconds it will update content
    }
}