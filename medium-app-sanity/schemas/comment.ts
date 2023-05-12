import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string'
    }),
    defineField({
      name: 'email',
      title: 'email',
      type: 'email'
    }),
    defineField({
      name: 'approved',
      title: 'Aprroved',
      type: 'boolean',
      description: 'Comments won\'t show on the website without approval'
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'string'
    }),
    defineField(
      {
        name: 'post',
        title: 'Post',
        type: 'reference',
        to: [
          {
            type: 'post'
          }
        ]
      }
    )
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image'
    }
  }
})
