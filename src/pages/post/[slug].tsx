import React from "react";
import {sanityClient, urlFor} from "../../../sanity";
import Header from "../../../components/Header";
import {Post} from "../../../typings/typings";
import {GetStaticProps} from "next";

interface Props {
    post: Post
}

function Posts({post}: Props) {
    return <main>
        <Header/>
        <img
            className={"w-full h-40 object-cover"}
            src={urlFor(post?.mainImage).url()!}
            alt={"Banner"}
        />
        <article className={"max-w-3xl mx-auto p-5"}>
            <h1 className={"text-3xl mt-10 mb-3"}>{post.title}</h1>
            <h2 className={"text-xl font-light text-grey-500 mb-2"}>{post.description}</h2>
            <div className={"flex items-center space-x-2"}>
                <img className={"h-10 w-10 rounded-full"} src={urlFor(post.author.image).url()} alt={""}/>
                <p className={"font-extralight text-sm"}>Blog Post By <span className={"text-green-600"}>{post.author.name}</span> - Published
                    at {new Date(post._createdAt).toLocaleString()}</p>
            </div>
        </article>
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
        title,
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
    let post = await sanityClient.fetch(query, {slug: params?.slug})
    if (!post) {
        return {
            notFound: true
        }
    }
    post = post[0]
    return {
        props: {
            post,
        },
        revalidate: 60 //after 60 seconds it will update content
    }
}