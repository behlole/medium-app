export interface Post {
  _id: string;
  _createdAt: string;
  title: string;
  author: {
    name: string;
    image: string;
  },
  description: string;
  mainImage: {
    asset: {
      url: string
    };
  };
  slug: {
    current: string;
  };
  body: [object],
  comments: [Comment],
}

export interface Comment {
  approved: boolean;
  name: string;
  comment: string;
  email: string;
  post: {
    _ref: string;
    _type: string;
  },
  _createdAt: string,
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
}
