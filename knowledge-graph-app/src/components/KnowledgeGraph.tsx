import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { KnowledgeNode, KnowledgeLink } from '../types';

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
  selectedNodeId: string;
  onNodeClick: (nodeId: string) => void;
  onBackToPosts: () => void;
  breadcrumb: string[];
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  links,
  selectedNodeId,
  onNodeClick,
  onBackToPosts,
  breadcrumb
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<KnowledgeNode, KnowledgeLink> | null>(null);

  const getNodeColor = (node: KnowledgeNode) => {
    if (node.id === selectedNodeId) return '#3b82f6'; // Blue for selected
    
    switch (node.type) {
      case 'prerequisite': return '#10b981'; // Green
      case 'follow_up': return '#ef4444'; // Red
      case 'concept': return '#8b5cf6'; // Purple
      default: return '#6b7280'; // Gray
    }
  };

  const getLinkColor = (link: KnowledgeLink) => {
    switch (link.relationship) {
      case 'prerequisite': return '#3b82f6'; // Blue
      case 'related': return '#10b981'; // Green
      case 'follow_up': return '#ef4444'; // Red
      default: return '#9ca3af'; // Gray
    }
  };

  const getDifficultyBorderWidth = (level: string) => {
    switch (level) {
      case 'beginner': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      default: return 2;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = width < 768;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create zoom behavior with touch support
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter((event) => {
        // Allow touch events and mouse events
        return !event.ctrlKey && !event.button;
      })
      .on('zoom', (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);
        g.attr('transform', transform);
      });

    svg.call(zoom);

    // Main group for all elements
    const g = svg.append('g');

    // Create arrow markers for directed links
    const defs = svg.append('defs');
    
    Object.values(['prerequisite', 'related', 'follow_up']).forEach(relationship => {
      defs.append('marker')
        .attr('id', `arrow-${relationship}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getLinkColor({ relationship } as KnowledgeLink));
    });

    // Create simulation with mobile adjustments
    const simulation = d3.forceSimulation<KnowledgeNode>(nodes)
      .force('link', d3.forceLink<KnowledgeNode, KnowledgeLink>(links)
        .id(d => d.id)
        .distance(d => (isMobile ? 80 : 100) + (d.strength * (isMobile ? 30 : 50)))
        .strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(isMobile ? -200 : -300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<KnowledgeNode>().radius(d => (isMobile ? d.size * 0.8 : d.size) + 10));

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => getLinkColor(d))
      .attr('stroke-width', d => d.strength * 3)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.relationship})`);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, KnowledgeNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => isMobile ? d.size * 0.8 : d.size)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', d => getDifficultyBorderWidth(d.difficulty_level))
      .attr('opacity', d => d.id === selectedNodeId ? 1 : 0.8);

    // Add labels to nodes
    node.append('text')
      .text(d => {
        const maxLength = isMobile ? 15 : 20;
        return d.title.length > maxLength ? d.title.substring(0, maxLength) + '...' : d.title;
      })
      .attr('dy', d => (isMobile ? d.size * 0.8 : d.size) + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', isMobile ? '10px' : '12px')
      .attr('font-weight', d => d.id === selectedNodeId ? 'bold' : 'normal')
      .attr('fill', '#374151');

    // Add event listeners
    node
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        setMousePosition({ x: event.pageX, y: event.pageY });
        
        // Highlight connected links
        link.attr('stroke-opacity', linkData => 
          linkData.source === d.id || linkData.target === d.id ? 1 : 0.2
        );
        
        // Highlight connected nodes
        node.select('circle').attr('opacity', nodeData => {
          if (nodeData.id === d.id) return 1;
          const isConnected = links.some(l => 
            (l.source === d.id && l.target === nodeData.id) ||
            (l.target === d.id && l.source === nodeData.id)
          );
          return isConnected ? 0.8 : 0.3;
        });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        
        // Reset highlighting
        link.attr('stroke-opacity', 0.6);
        node.select('circle').attr('opacity', d => d.id === selectedNodeId ? 1 : 0.8);
      })
      .on('mousemove', (event) => {
        setMousePosition({ x: event.pageX, y: event.pageY });
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.id);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as KnowledgeNode).x!)
        .attr('y1', d => (d.source as KnowledgeNode).y!)
        .attr('x2', d => (d.target as KnowledgeNode).x!)
        .attr('y2', d => (d.target as KnowledgeNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Center the selected node
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode) {
      selectedNode.fx = width / 2;
      selectedNode.fy = height / 2;
      simulation.alpha(0.3).restart();
      
      setTimeout(() => {
        if (selectedNode) {
          selectedNode.fx = null;
          selectedNode.fy = null;
        }
      }, 1000);
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNodeId]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900"
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={onBackToPosts}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Posts</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              {breadcrumb.map((item, index) => (
                <React.Fragment key={item}>
                  <span>/</span>
                  <span className={index === breadcrumb.length - 1 ? 'text-blue-600 font-medium' : ''}>
                    {item.length > 20 ? item.substring(0, 20) + '...' : item}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="hidden sm:inline text-xs md:text-sm text-gray-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="absolute top-16 md:top-20 right-2 md:right-6 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
        <h3 className="font-medium text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Legend</h3>
        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500"></div>
            <span>Prerequisites</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500"></div>
            <span>Follow-ups</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gray-500"></div>
            <span className="hidden md:inline">Related Topics</span>
            <span className="md:hidden">Related</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-purple-500"></div>
            <span>Concepts</span>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-full pt-12 md:pt-16">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="bg-gradient-to-br from-gray-50 to-gray-100"
          style={{
            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-20 bg-white rounded-lg shadow-xl border p-4 max-w-sm pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <h4 className="font-bold text-gray-900 mb-2">{hoveredNode.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{hoveredNode.snippet}</p>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded ${
                hoveredNode.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                hoveredNode.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {hoveredNode.difficulty_level}
              </span>
              <span className="text-gray-500">{hoveredNode.type}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KnowledgeGraph;