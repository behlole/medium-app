import Head from 'next/head'
import {Inter} from 'next/font/google'
import React from "react";
import Header from "../../components/Header";
import {sanityClient} from '../../sanity';
import {Post} from "../../typings/typings";

const inter = Inter({subsets: ['latin']})

interface Props {
    posts: Post[]
}

export default function Home({posts}: Props) {
    console.log(posts);

    return (
        <div className={"max-w-7xl mx-auto"}>
            <Head>
                <title>Medium Blog</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Header/>
            <div className={"flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0"}>
                <div className={"px-10 space-y-5"}>
                    <h1 className={"text-6xl max-w-xl font-serif"}>
                        <span className={"underline decoration-black decoration-4"}>Medium</span> is the place to
                        write, read and
                        connect
                    </h1>
                    <h2>
                        It's easy and free to post your thinking on my topic and connect with millions of readers
                    </h2>
                </div>
                <img
                    className={"hidden md:inline-flex h-32 lg:h-full"}
                    alt={"M logo"} src={"https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"}/>
            </div>
        </div>
    )
}
export const getServerSideProps = async () => {
    const query = `*[_type == 'post']{
      _id,
        title,
        description,
        slug,
        author->{
          name
        }
    }`
    const posts = await sanityClient.fetch(query);
    return {
        props: {
            posts,
        }
    }
}