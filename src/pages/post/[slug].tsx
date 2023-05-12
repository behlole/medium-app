import React, {useState} from 'react'
import {sanityClient, urlFor} from '../../../sanity'
import Header from '../../../components/Header'
import {Post} from '../../../typings/typings'
import {GetStaticProps} from 'next'
import PortableText from 'react-portable-text'
import {SubmitHandler, useForm} from 'react-hook-form'
import {Simulate} from 'react-dom/test-utils'
import error = Simulate.error
import comment from '../../../medium-app-sanity/schemas/comment'

interface Props {
  post: Post
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Posts({post}: Props) {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<IFormInput>()
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then((data) => {
      setSubmitted(true)
    })
      .catch((error) => {
        console.log(error)
        setSubmitted(false)
      })
  }
  return <main>
    <Header />
    <img
      className={'w-full h-40 object-cover'}
      src={urlFor(post?.mainImage).url()!}
      alt={'Banner'}
    />
    <article className={'max-w-3xl mx-auto p-5'}>
      <h1 className={'text-3xl mt-10 mb-3'}>{post.title}</h1>
      <h2 className={'text-xl font-light text-grey-500 mb-2'}>{post.description}</h2>
      <div className={'flex items-center space-x-2'}>
        <img className={'h-10 w-10 rounded-full'} src={urlFor(post.author.image).url()} alt={''} />
        <p className={'font-extralight text-sm'}>Blog Post By <span
          className={'text-green-600'}>{post.author.name}</span> - Published
          at {new Date(post._createdAt).toLocaleString()}</p>
      </div>

      <div className={'mt-10'}>
        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={post.body}
          serializers={{
            h1: (props: any) => (
              <h1 className={'text-2xl font-bold my-5'} {...props} />
            ),
            h2: (props: any) => (
              <h1 className={'text-xl font-bold my-5'} {...props} />
            ),
            li: ({children}: any) => (
              <li className={'ml-4 list-disc'}>{children}</li>
            ),
            link: ({href, children}: any) => (
              <a href={href} className={'text-blue-500 hover:underline'}>
                {children}
              </a>
            )
          }}
        />
      </div>
    </article>
    <hr className={'max-w-lg my-5 mx-auto border border-yellow-500'} />

    {submitted ? (
        <div className={'flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'}>
          <h3 className={'text-3xl font-bold'}>
            Thank you for submitting
          </h3>
          <p>
            Once it has been approved, it will appear below
          </p>
        </div>
      ) :
      <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col p-5 max-w-2xl mx-auto mb-10'}>
        <h3 className={'text-sm text-yellow-500'}>Enjoyed this article?</h3>
        <h3 className={'text-3xl font-bold'}>Leave a comment below!</h3>
        <hr className={'py-3 mt-2'} />
        <input
          {...register('_id')}
          type={'hidden'}
          name={'_id'}
          value={post._id}
        />
        <label className={'block mb-5'}>
          <span className={'text-gray-700'}>Name</span>
          <input {...register('name', {required: true})}
                 className={'shadow border rounder py-2 px-3 form-input mt-1 block w-full ring-yellow-500  outline-none focus:ring'}
                 placeholder={'John Appleseed'} type={'text'} />
        </label>
        <label className={'block mb-5'}>
          <span className={'text-gray-700'}>Email</span>
          <input {...register('email', {required: true})}
                 className={'shadow border rounder py-2 px-3 form-input mt-1 block w-full ring-yellow-500  outline-none focus:ring'}
                 placeholder={'John Appleseed'} type={'email'} />
        </label>
        <label className={'block mb-5'}>
          <span className={'text-gray-700'}>Comment</span>
          <textarea {...register('comment', {required: true})}
                    className={'shadow border rounder py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring'}
                    placeholder={'John Appleseed'} rows={8} />
        </label>

        <div className={'flex flex-col p-5'}>
          {errors.name && (
            <span className={'text-red-500'}> - The Name Field is required</span>
          )}
          {errors.comment && (
            <span className={'text-red-500'}> - The Comment Field is required</span>
          )}
          {errors.email && (
            <span className={'text-red-500'}> - The Email Field is required</span>
          )}
        </div>
        <input type={'submit'}
               className={'shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 rounded cursor-pointer'} />
      </form>}
    <div className={'flex flex-col p-10 my-10 max-w-2xl shadow-yellow-500 shadow space-y-2 mx-auto'}>
      <h3 className={'text-4xl'}>Comments</h3>
      <hr className={'pb-2'} />
      {post.comments.map((singleComment, index) => {
        return (
          <div key={index}>
            <p><span className={'text-yellow-500'}>{singleComment.name}: </span>{singleComment.comment}</p>
          </div>
        )
      })}
    </div>
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
  )
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
      post
    },
    revalidate: 60 //after 60 seconds it will update content
  }
}
