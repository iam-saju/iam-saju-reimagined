export interface Section {
  id: string;
  heading: string;
  body: string;
  code?: string;
  image?: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  readTime: string;
  draft?: boolean;
  lightBg?: boolean;
  link?: string;
  quote?: string;
  cardImage?: string;
  imagePosition?: string;
  cardImagePosition?: string;
  zoom?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  sections: Section[];
}

export const posts: Post[] = [
  {
    slug: 'gradient-descent',
    title: 'gradient descent',
    description:
      'understanding the fundamental optimization algorithm behind machine learning. from intuition to math to code.',
    image: '/lovable-uploads/gradient-descent-new.jpeg',
    cardImage: '/lovable-uploads/gradient-descent-new.jpeg',
    imagePosition: 'center',
    cardImagePosition: 'center',
    zoom: false,
    lightBg: true,
    tags: ['optimization', 'ml', 'math'],
    date: 'nov 2024',
    readTime: '5 min read',
    aspectRatio: 'natural',
    objectFit: 'contain',
    sections: [
      {
        id: 'best-fit-line',
        heading: "so, what's a best fit line?",
        body: `alright, so the whole point of machine learning is basically drawing a line that fits our data perfectly. imagine you're trying to guess a car's fuel efficiency based on its weight. we can plot all this on a graph.\n\nwe write the line as: \`f(x) = (w * x) + b\`\n\nhere, \`w\` is the weight (how steep the line is) and \`b\` is the bias (where the line starts on the y-axis). if we start with \`w=0\` and \`b=0\`, our line is just completely flat and wrong. gradient descent is the magic trick that moves our line from 'totally wrong' to 'spot on'.`,
        image: '/lovable-uploads/gradient-plot-internal.jpg',
      },
      {
        id: 'loss-function',
        heading: 'messing up and measuring it (mse)',
        body: `before we can fix our line, we need to know exactly how wrong it is. we use something called mean squared error (mse) for this.\n\nbasically, for every single data point, we subtract our completely wrong guess from the real answer, square it (so negative errors don't cancel out positive ones), and then take the average of all these screw-ups.\n\nthis gives us a single number — a 'badness score'. the higher the score, the worse our line is. gradient descent is just a game of trying to make this score as close to zero as possible.`,
      },
      {
        id: 'derivatives',
        heading: 'slopes and hills',
        body: `imagine our 'badness score' is a literal physical landscape with hills and valleys. we are blindfolded, standing somewhere high up on a hill, and we want to get to the lowest valley.\n\nwe do this by feeling the slope of the ground under our feet — this is the derivative! if the ground is tilting up, we walk the opposite way to go downhill.\n\nmathematically, we calculate how much the 'badness score' changes if we lightly nudge our \`w\` and \`b\` values. those nudges tell us exactly which direction is downhill.`,
      },
      {
        id: 'gradient-descent-steps',
        heading: 'taking steps downhill',
        body: `gradient descent is just doing this over and over again in a loop. we check the slope, take a step downhill, and repeat.\n\nwe update our \`w\` and \`b\` by subtracting a tiny bit of the slope. if we do this hundreds of times, our completely wrong flat line will magically snap into the perfect angle to fit our data!`,
        code: `# Python implementation
def gradient_descent(x, y, learning_rate=0.01, epochs=1000):
    w, b = 0, 0
    M = len(x)
    for _ in range(epochs):
        y_pred = w * x + b
        error = y_pred - y
        dw = (2/M) * sum(error * x)
        db = (2/M) * sum(error)
        w -= learning_rate * dw
        b -= learning_rate * db
    return w, b`,
      },
      {
        id: 'learning-rate',
        heading: 'how big should our steps be?',
        body: `there's a catch though. we have to decide how big those steps are. this size is called the learning rate (alpha).\n\nif you make the steps too massive, you literally overshoot the valley and end up bouncing back and forth on the hills forever.\n\nif you make the steps too tiny, it takes an absolute eternity to get to the bottom. finding the butter zone is part of the fun (or pain) of training these models!`,
      },
      {
        id: 'convergence',
        heading: 'when do we stop walking?',
        body: `as we walk downhill, our 'badness score' gets smaller and smaller. eventually, the slope flattens out, meaning we literally hit rock bottom (the perfect line!).\n\nwhen the score stops dropping by any meaningful amount, we say the model has converged. at this point, we just stop the loop and call it a day!`,
      },
    ],
  },
  {
    slug: 'bitcoin-server-cpp',
    title: 'bitcoin server in c++',
    description:
      'implementing a cryptocurrency server from scratch — utxo model, merkle trees, sha-256 hashing, and proof-of-work consensus. the full nakamoto stack.',
    image: '/lovable-uploads/naka.jpeg',
    tags: ['blockchain', 'c++', 'systems'],
    date: 'dec 2024',
    readTime: '8 min read',
    draft: true,
    aspectRatio: 'square',
    objectFit: 'contain',
    sections: [],
  },
  {
    slug: 'agentic-ai',
    title: 'intro to agentic ai',
    description:
      "building an ai agent with python and the gemini api. inspired by boot.dev.",
    image: '/lovable-uploads/agentic-ai-matrix.jpg',
    cardImage: '/lovable-uploads/agentic-ai-matrix.jpg',
    imagePosition: 'center',
    cardImagePosition: 'center',
    lightBg: true,
    tags: ['ai', 'agents', 'architecture'],
    date: 'mar 2024',
    readTime: '0 min read',
    draft: true,
    sections: [],
  },
];
