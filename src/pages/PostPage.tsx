import { useParams, Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PostPage = () => {
  const { id } = useParams();

  // Sample post data - in a real app this would come from an API or database
  const posts = {
    "gradient-descent": {
      id: "gradient-descent",
      title: "gradient descent",
      date: "march 15, 2024",
      readTime: "8 min read",
      category: "optimization",
      content: `
        <p class="drop-cap">gradient descent is one of the most fundamental optimization algorithms in machine learning and deep learning. at its core, it's a method for finding the minimum of a function by iteratively moving in the direction of steepest descent.</p>

        <h2>the mathematical foundation</h2>

        <p>the basic idea behind gradient descent is surprisingly simple. imagine you're standing on a hill and want to reach the bottom as quickly as possible. the steepest path downward at any point is given by the negative gradient of the height function at that point.</p>

        <p>mathematically, if we have a function <em>f(x)</em> that we want to minimize, gradient descent updates our current position <em>x</em> using the following rule:</p>

        <div class="formula">
          <em>x<sub>new</sub> = x<sub>old</sub> - α ∇f(x<sub>old</sub>)</em>
        </div>

        <p>where <em>α</em> (alpha) is the learning rate, and <em>∇f(x)</em> represents the gradient of the function at point <em>x</em>.</p>

        <h2>the learning rate dilemma</h2>

        <p>the learning rate <em>α</em> is crucial to the success of gradient descent. too large, and we might overshoot the minimum, potentially diverging entirely. too small, and convergence becomes painfully slow, requiring many iterations to reach the optimum.</p>

        <ul>
          <li><strong>large learning rate:</strong> fast initial progress but risk of overshooting</li>
          <li><strong>small learning rate:</strong> stable convergence but slow progress</li>
          <li><strong>adaptive learning rates:</strong> start large and decrease over time</li>
        </ul>

        <h2>variants of gradient descent</h2>

        <h3>batch gradient descent</h3>
        <p>the classical approach computes the gradient using the entire dataset. while this provides the most accurate gradient estimate, it can be computationally expensive for large datasets.</p>

        <h3>stochastic gradient descent (sgd)</h3>
        <p>instead of using the entire dataset, sgd computes the gradient using only a single data point at each iteration. this introduces noise but can lead to faster convergence and better generalization.</p>

        <h3>mini-batch gradient descent</h3>
        <p>a compromise between batch and stochastic approaches, mini-batch gradient descent uses a small subset of the data to compute gradients. this balances computational efficiency with gradient accuracy.</p>

        <h2>challenges and limitations</h2>

        <p>despite its widespread use, gradient descent faces several challenges:</p>

        <ol>
          <li><strong>local minima:</strong> the algorithm can get stuck in local optima, especially in non-convex functions</li>
          <li><strong>saddle points:</strong> points where the gradient is zero but are neither maxima nor minima</li>
          <li><strong>ill-conditioned problems:</strong> when the function has very different curvatures in different directions</li>
        </ol>

        <h2>modern improvements</h2>

        <p>researchers have developed numerous improvements to basic gradient descent:</p>

        <ul>
          <li><strong>momentum:</strong> helps accelerate convergence and overcome local minima by maintaining a "velocity" term</li>
          <li><strong>adam:</strong> combines momentum with adaptive learning rates for each parameter</li>
          <li><strong>rmsprop:</strong> adapts the learning rate based on the magnitude of recent gradients</li>
        </ul>

        <h2>practical implementation</h2>

        <p>when implementing gradient descent, several practical considerations emerge:</p>

        <div class="code-block">
          <pre><code>def gradient_descent(f, grad_f, x0, alpha=0.01, max_iter=1000):
    x = x0
    for i in range(max_iter):
        gradient = grad_f(x)
        x = x - alpha * gradient
        if np.linalg.norm(gradient) < 1e-6:
            break
    return x</code></pre>
        </div>

        <h2>conclusion</h2>

        <p>gradient descent remains a cornerstone of optimization in machine learning. while simple in concept, its effective application requires careful consideration of learning rates, convergence criteria, and the specific characteristics of the optimization landscape.</p>

        <p>understanding gradient descent deeply provides insights not just into optimization, but into the fundamental nature of learning itself. as we continue to develop more sophisticated algorithms, the principles underlying gradient descent continue to inform and inspire new approaches to machine learning optimization.</p>
      `
    }
  };

  // Get the post data
  const post = posts[id as keyof typeof posts] || posts["gradient-descent"];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header matching site navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/posts" className="text-lg font-light hover:text-primary transition-colors">
            ← back
          </Link>
          <h1 className="text-lg font-light">posts</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <article className="max-w-3xl mx-auto">
            {/* Article Header */}
            <header className="text-center mb-12 pb-8 border-b border-border">
              <div className="mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
              <h1 className="text-4xl font-academic font-bold mb-4 text-foreground">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <time>{post.date}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </header>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none font-academic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>

      <Footer />

      {/* Custom Styles */}
      <style jsx>{`
        .prose {
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: hsl(var(--foreground));
        }

        .prose h2 {
          font-family: 'Charter', 'Georgia', 'Times New Roman', serif;
          font-size: var(--text-2xl);
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: var(--space-2xl);
          margin-bottom: var(--space-md);
          line-height: var(--leading-tight);
        }

        .prose h3 {
          font-family: 'Charter', 'Georgia', 'Times New Roman', serif;
          font-size: var(--text-xl);
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: var(--space-xl);
          margin-bottom: var(--space-sm);
          line-height: var(--leading-snug);
        }

        .prose p {
          margin-bottom: var(--space-lg);
          text-align: justify;
          hyphens: auto;
          color: hsl(var(--foreground));
        }

        .prose .drop-cap::first-letter {
          font-size: 4rem;
          line-height: 1;
          float: left;
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          font-weight: 700;
          color: hsl(var(--foreground));
        }

        .prose ul, .prose ol {
          margin: var(--space-lg) 0;
          padding-left: var(--space-xl);
        }

        .prose li {
          margin-bottom: var(--space-sm);
          color: hsl(var(--foreground));
        }

        .prose .formula {
          text-align: center;
          font-style: italic;
          font-size: var(--text-lg);
          margin: var(--space-xl) 0;
          padding: var(--space-lg);
          background: hsl(var(--muted));
          border-left: 4px solid hsl(var(--primary));
          border-radius: var(--radius);
          color: hsl(var(--foreground));
        }

        .prose .code-block {
          margin: var(--space-xl) 0;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow-x: auto;
        }

        .prose .code-block pre {
          margin: 0;
          padding: var(--space-lg);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: var(--text-sm);
          line-height: var(--leading-normal);
          color: hsl(var(--foreground));
        }

        .prose em {
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .prose strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .prose a {
          color: hsl(var(--primary));
          text-decoration: none;
        }

        .prose a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .prose {
            font-size: var(--text-base);
          }
          
          .prose h1 {
            font-size: var(--text-3xl);
          }
          
          .prose h2 {
            font-size: var(--text-xl);
          }
          
          .prose .drop-cap::first-letter {
            font-size: 3rem;
          }

          .prose ul, .prose ol {
            padding-left: var(--space-lg);
          }
        }

        @media (max-width: 640px) {
          .prose {
            font-size: var(--text-sm);
          }

          .prose h1 {
            font-size: var(--text-2xl);
          }

          .prose h2 {
            font-size: var(--text-lg);
          }

          .prose .formula, .prose .code-block {
            margin: var(--space-lg) 0;
            padding: var(--space-md);
          }
        }

        /* Print styles */
        @media print {
          header {
            display: none;
          }
          
          article {
            box-shadow: none;
            max-width: none;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PostPage;