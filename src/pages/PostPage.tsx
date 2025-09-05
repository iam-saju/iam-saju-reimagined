import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PostPage = () => {
  const { id } = useParams();

  // Sample post data - in a real app this would come from an API or database
  const posts = {
    "gradient-descent": {
      id: "gradient-descent",
      title: "Gradient Descent",
      date: "March 15, 2024",
      readTime: "8 min read",
      category: "optimization",
      content: {
        sections: [
          {
            type: "paragraph",
            content: "Gradient descent is one of the most fundamental optimization algorithms in machine learning and deep learning. At its core, it's a method for finding the minimum of a function by iteratively moving in the direction of steepest descent.",
            isIntro: true
          },
          {
            type: "heading",
            level: 2,
            content: "The Mathematical Foundation"
          },
          {
            type: "paragraph",
            content: "The basic idea behind gradient descent is surprisingly simple. Imagine you're standing on a hill and want to reach the bottom as quickly as possible. The steepest path downward at any point is given by the negative gradient of the height function at that point."
          },
          {
            type: "paragraph",
            content: "Mathematically, if we have a function f(x) that we want to minimize, gradient descent updates our current position x using the following rule:"
          },
          {
            type: "formula",
            content: "x_new = x_old - α ∇f(x_old)"
          },
          {
            type: "paragraph",
            content: "Where α (alpha) is the learning rate, and ∇f(x) represents the gradient of the function at point x."
          },
          {
            type: "heading",
            level: 2,
            content: "The Learning Rate Dilemma"
          },
          {
            type: "paragraph",
            content: "The learning rate α is crucial to the success of gradient descent. Too large, and we might overshoot the minimum, potentially diverging entirely. Too small, and convergence becomes painfully slow, requiring many iterations to reach the optimum."
          },
          {
            type: "list",
            items: [
              "Large learning rate: Fast initial progress but risk of overshooting",
              "Small learning rate: Stable convergence but slow progress", 
              "Adaptive learning rates: Start large and decrease over time"
            ]
          },
          {
            type: "heading",
            level: 2,
            content: "Variants of Gradient Descent"
          },
          {
            type: "heading",
            level: 3,
            content: "Batch Gradient Descent"
          },
          {
            type: "paragraph",
            content: "The classical approach computes the gradient using the entire dataset. While this provides the most accurate gradient estimate, it can be computationally expensive for large datasets."
          },
          {
            type: "heading",
            level: 3,
            content: "Stochastic Gradient Descent (SGD)"
          },
          {
            type: "paragraph",
            content: "Instead of using the entire dataset, SGD computes the gradient using only a single data point at each iteration. This introduces noise but can lead to faster convergence and better generalization."
          },
          {
            type: "heading",
            level: 3,
            content: "Mini-batch Gradient Descent"
          },
          {
            type: "paragraph",
            content: "A compromise between batch and stochastic approaches, mini-batch gradient descent uses a small subset of the data to compute gradients. This balances computational efficiency with gradient accuracy."
          },
          {
            type: "heading",
            level: 2,
            content: "Challenges and Limitations"
          },
          {
            type: "paragraph",
            content: "Despite its widespread use, gradient descent faces several challenges:"
          },
          {
            type: "numbered-list",
            items: [
              "Local minima: The algorithm can get stuck in local optima, especially in non-convex functions",
              "Saddle points: Points where the gradient is zero but are neither maxima nor minima",
              "Ill-conditioned problems: When the function has very different curvatures in different directions"
            ]
          },
          {
            type: "heading",
            level: 2,
            content: "Modern Improvements"
          },
          {
            type: "paragraph",
            content: "Researchers have developed numerous improvements to basic gradient descent:"
          },
          {
            type: "list",
            items: [
              "Momentum: Helps accelerate convergence and overcome local minima by maintaining a 'velocity' term",
              "Adam: Combines momentum with adaptive learning rates for each parameter",
              "RMSprop: Adapts the learning rate based on the magnitude of recent gradients"
            ]
          },
          {
            type: "heading",
            level: 2,
            content: "Practical Implementation"
          },
          {
            type: "paragraph",
            content: "When implementing gradient descent, several practical considerations emerge:"
          },
          {
            type: "code",
            content: `def gradient_descent(f, grad_f, x0, alpha=0.01, max_iter=1000):
    x = x0
    for i in range(max_iter):
        gradient = grad_f(x)
        x = x - alpha * gradient
        if np.linalg.norm(gradient) < 1e-6:
            break
    return x`
          },
          {
            type: "heading",
            level: 2,
            content: "Conclusion"
          },
          {
            type: "paragraph",
            content: "Gradient descent remains a cornerstone of optimization in machine learning. While simple in concept, its effective application requires careful consideration of learning rates, convergence criteria, and the specific characteristics of the optimization landscape."
          },
          {
            type: "paragraph",
            content: "Understanding gradient descent deeply provides insights not just into optimization, but into the fundamental nature of learning itself. As we continue to develop more sophisticated algorithms, the principles underlying gradient descent continue to inform and inspire new approaches to machine learning optimization."
          }
        ]
      }
    }
  };

  // Get the post data
  const post = posts[id as keyof typeof posts] || posts["gradient-descent"];

  const renderContent = (section: any, index: number) => {
    switch (section.type) {
      case "paragraph":
        return (
          <p key={index} className={`note-content mb-6 ${section.isIntro ? 'text-lg' : ''}`}>
            {section.content}
          </p>
        );
      case "heading":
        if (section.level === 2) {
          return (
            <h2 key={index} className="note-title text-2xl mt-10 mb-4">
              {section.content}
            </h2>
          );
        }
        if (section.level === 3) {
          return (
            <h3 key={index} className="font-academic text-xl font-semibold text-foreground mt-8 mb-3">
              {section.content}
            </h3>
          );
        }
        break;
      case "formula":
        return (
          <div key={index} className="my-8 p-6 bg-muted rounded-sm border border-border">
            <div className="text-center font-academic text-lg italic text-foreground">
              {section.content}
            </div>
          </div>
        );
      case "list":
        return (
          <ul key={index} className="my-6 space-y-2">
            {section.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex} className="note-content flex items-start">
                <span className="text-muted-foreground mr-3">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      case "numbered-list":
        return (
          <ol key={index} className="my-6 space-y-2">
            {section.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex} className="note-content flex items-start">
                <span className="text-muted-foreground mr-3 font-ui text-sm">
                  {itemIndex + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      case "code":
        return (
          <div key={index} className="my-8 bg-muted border border-border rounded-sm overflow-x-auto">
            <pre className="p-6 text-sm font-mono text-foreground leading-relaxed">
              <code>{section.content}</code>
            </pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-ui">
      {/* Navigation - matching existing design system */}
      <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            to="/posts" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            back to posts
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <article className="max-w-3xl">
            {/* Article Header */}
            <header className="mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="tag-pill">
                    {post.category}
                  </span>
                </div>
                
                <h1 className="text-4xl font-light text-foreground font-ui">
                  {post.title}
                </h1>
                
                <div className="note-meta flex items-center gap-4">
                  <time>{post.date}</time>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="space-y-0">
              {post.content.sections.map((section, index) => 
                renderContent(section, index)
              )}
            </div>

            {/* Article Footer */}
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <Link 
                  to="/posts"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← back to posts
                </Link>
                <div className="note-meta">
                  {post.date}
                </div>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
};

export default PostPage;