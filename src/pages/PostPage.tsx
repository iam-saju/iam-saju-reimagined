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
      content: `
        <p class="drop-cap">Gradient descent is one of the most fundamental optimization algorithms in machine learning and deep learning. At its core, it's a method for finding the minimum of a function by iteratively moving in the direction of steepest descent.</p>

        <h2>The Mathematical Foundation</h2>

        <p>The basic idea behind gradient descent is surprisingly simple. Imagine you're standing on a hill and want to reach the bottom as quickly as possible. The steepest path downward at any point is given by the negative gradient of the height function at that point.</p>

        <p>Mathematically, if we have a function <em>f(x)</em> that we want to minimize, gradient descent updates our current position <em>x</em> using the following rule:</p>

        <div class="formula">
          <em>x<sub>new</sub> = x<sub>old</sub> - α ∇f(x<sub>old</sub>)</em>
        </div>

        <p>Where <em>α</em> (alpha) is the learning rate, and <em>∇f(x)</em> represents the gradient of the function at point <em>x</em>.</p>

        <h2>The Learning Rate Dilemma</h2>

        <p>The learning rate <em>α</em> is crucial to the success of gradient descent. Too large, and we might overshoot the minimum, potentially diverging entirely. Too small, and convergence becomes painfully slow, requiring many iterations to reach the optimum.</p>

        <ul>
          <li><strong>Large learning rate:</strong> Fast initial progress but risk of overshooting</li>
          <li><strong>Small learning rate:</strong> Stable convergence but slow progress</li>
          <li><strong>Adaptive learning rates:</strong> Start large and decrease over time</li>
        </ul>

        <h2>Variants of Gradient Descent</h2>

        <h3>Batch Gradient Descent</h3>
        <p>The classical approach computes the gradient using the entire dataset. While this provides the most accurate gradient estimate, it can be computationally expensive for large datasets.</p>

        <h3>Stochastic Gradient Descent (SGD)</h3>
        <p>Instead of using the entire dataset, SGD computes the gradient using only a single data point at each iteration. This introduces noise but can lead to faster convergence and better generalization.</p>

        <h3>Mini-batch Gradient Descent</h3>
        <p>A compromise between batch and stochastic approaches, mini-batch gradient descent uses a small subset of the data to compute gradients. This balances computational efficiency with gradient accuracy.</p>

        <h2>Challenges and Limitations</h2>

        <p>Despite its widespread use, gradient descent faces several challenges:</p>

        <ol>
          <li><strong>Local minima:</strong> The algorithm can get stuck in local optima, especially in non-convex functions</li>
          <li><strong>Saddle points:</strong> Points where the gradient is zero but are neither maxima nor minima</li>
          <li><strong>Ill-conditioned problems:</strong> When the function has very different curvatures in different directions</li>
        </ol>

        <h2>Modern Improvements</h2>

        <p>Researchers have developed numerous improvements to basic gradient descent:</p>

        <ul>
          <li><strong>Momentum:</strong> Helps accelerate convergence and overcome local minima by maintaining a "velocity" term</li>
          <li><strong>Adam:</strong> Combines momentum with adaptive learning rates for each parameter</li>
          <li><strong>RMSprop:</strong> Adapts the learning rate based on the magnitude of recent gradients</li>
        </ul>

        <h2>Practical Implementation</h2>

        <p>When implementing gradient descent, several practical considerations emerge:</p>

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

        <h2>Conclusion</h2>

        <p>Gradient descent remains a cornerstone of optimization in machine learning. While simple in concept, its effective application requires careful consideration of learning rates, convergence criteria, and the specific characteristics of the optimization landscape.</p>

        <p>Understanding gradient descent deeply provides insights not just into optimization, but into the fundamental nature of learning itself. As we continue to develop more sophisticated algorithms, the principles underlying gradient descent continue to inform and inspire new approaches to machine learning optimization.</p>
      `
    }
  };

  // Get the post data
  const post = posts[id as keyof typeof posts] || posts["gradient-descent"];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #fefefe 0%, #faf9f6 100%)',
      fontFamily: 'Georgia, Charter, "Times New Roman", serif'
    }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <Link 
            to="/posts" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-light"
          >
            <ArrowLeft size={16} />
            Back to Posts
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <article 
          className="max-w-3xl mx-auto px-8 py-12 bg-white shadow-lg"
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '750px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '2px'
          }}
        >
          {/* Article Header */}
          <header className="text-center mb-12 pb-8 border-b border-gray-200">
            <h1 
              className="text-4xl font-bold mb-4 text-gray-900"
              style={{ 
                fontFamily: 'Georgia, Charter, "Times New Roman", serif',
                fontWeight: 700,
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}
            >
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <time>{post.date}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            style={{
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#2d3748'
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        .prose h2 {
          font-family: Georgia, Charter, "Times New Roman", serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a202c;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .prose h3 {
          font-family: Georgia, Charter, "Times New Roman", serif;
          font-size: 1.375rem;
          font-weight: 600;
          color: #2d3748;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .prose p {
          margin-bottom: 1.5rem;
          text-align: justify;
          hyphens: auto;
        }

        .prose .drop-cap::first-letter {
          font-size: 4rem;
          line-height: 1;
          float: left;
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          font-weight: 700;
          color: #2d3748;
        }

        .prose ul, .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .prose li {
          margin-bottom: 0.75rem;
        }

        .prose .formula {
          text-align: center;
          font-style: italic;
          font-size: 1.1rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-left: 4px solid #e2e8f0;
          border-radius: 4px;
        }

        .prose .code-block {
          margin: 2rem 0;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow-x: auto;
        }

        .prose .code-block pre {
          margin: 0;
          padding: 1.5rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #2d3748;
        }

        .prose em {
          font-style: italic;
          color: #4a5568;
        }

        .prose strong {
          font-weight: 600;
          color: #1a202c;
        }

        @media (max-width: 768px) {
          article {
            margin: 0 1rem;
            padding: 2rem 1.5rem;
          }
          
          .prose {
            font-size: 16px;
          }
          
          .prose h1 {
            font-size: 2.5rem;
          }
          
          .prose h2 {
            font-size: 1.5rem;
          }
          
          .prose .drop-cap::first-letter {
            font-size: 3rem;
          }
        }

        /* Print styles */
        @media print {
          nav {
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