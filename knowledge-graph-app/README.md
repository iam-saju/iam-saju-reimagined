# Knowledge Graph Interface

A dynamic posts-to-knowledge-graph interface that transforms clickable posts into an interactive roadmap of interconnected learning topics. Built with React, TypeScript, D3.js, and Framer Motion.

## Features

### 🎯 Interactive Posts Page
- Clean LessWrong-style design with topic-based posts
- Visual cues showing difficulty levels and relationships
- Hover effects and smooth animations
- Category-based color coding
- Connection indicators (prerequisites, related topics, follow-ups)

### 🕸️ Dynamic Knowledge Graph
- Smooth transition from posts view to full-screen knowledge graph
- Central node highlighting for selected topics
- Force-directed layout with automatic positioning
- Interactive pan, zoom, and drag functionality
- Color-coded relationship types:
  - 🔵 **Blue**: Prerequisites
  - 🟢 **Green**: Related topics
  - 🔴 **Red**: Follow-up topics
  - 🟣 **Purple**: Concepts

### 🎨 Visual Design
- Clean, minimal aesthetic
- Responsive design for all screen sizes
- Smooth animations and transitions
- Breadcrumb navigation
- Interactive tooltips with detailed information
- Grid background with subtle visual cues

### 🔄 Navigation Features
- Click nodes to explore their connections
- Breadcrumb trail showing navigation path
- Back to posts functionality
- Zoom controls and reset view
- Mobile-friendly touch gestures

## Technology Stack

- **React 18** with TypeScript
- **D3.js** for graph visualization
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd knowledge-graph-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── PostsPage.tsx          # Main posts listing page
│   └── KnowledgeGraph.tsx     # Interactive graph visualization
├── data/
│   └── samplePosts.ts         # Sample data and graph generation
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main application component
├── App.css                    # Global styles
└── index.tsx                  # Application entry point
```

## Data Structure

### Posts
Each post contains:
- Basic information (title, description, author, timestamp)
- Metadata (difficulty level, estimated read time, category)
- Relationships (prerequisites, related topics, follow-ups)
- Tags for categorization

### Knowledge Graph
Generated dynamically from post relationships:
- **Nodes**: Posts, concepts, and related topics
- **Links**: Directional relationships with strength values
- **Layout**: Force-directed positioning with collision detection

## Customization

### Adding New Posts
Add posts to `src/data/samplePosts.ts`:

```typescript
{
  id: 'your-post-id',
  title: 'Your Post Title',
  description: 'Brief description...',
  // ... other properties
  prerequisites: ['prerequisite-id'],
  related_topics: ['related-topic-id'],
  follow_ups: ['follow-up-id']
}
```

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/App.css` for custom styles
- Adjust colors in component files

### Graph Layout
Modify force simulation parameters in `KnowledgeGraph.tsx`:
- `force('link')`: Link distance and strength
- `force('charge')`: Node repulsion strength
- `force('collision')`: Collision detection radius

## Features in Detail

### Graph Interactions
- **Pan**: Click and drag on empty space
- **Zoom**: Mouse wheel or zoom controls
- **Node Selection**: Click any node to center and explore
- **Node Dragging**: Drag nodes to rearrange layout
- **Hover Effects**: Highlight connected nodes and relationships

### Responsive Design
- Mobile-optimized touch interactions
- Adaptive text sizing
- Collapsible navigation elements
- Touch-friendly button sizes

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators for all interactive elements

## Performance Considerations

- Efficient D3.js simulation with alpha decay
- Optimized React re-renders with proper dependencies
- Lazy loading for large datasets
- Debounced zoom and pan operations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by LessWrong's clean post design
- D3.js community for graph visualization techniques
- React and TypeScript communities for excellent tooling