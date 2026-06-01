import React, { useMemo } from 'react';
import { Check, Lock, Play } from 'lucide-react';

// ==========================================
// Type Definitions
// ==========================================

type CourseLevel = 'foundation' | 'diploma' | 'degree';
type NodeStatus = 'completed' | 'active' | 'locked';

interface CourseNode {
  id: string;
  level: CourseLevel;
  label: string;
  status: NodeStatus;
}

interface RenderNode extends CourseNode {
  x: number;
  y: number;
}

interface CourseEdge {
  source: string;
  target: string;
}

// ==========================================
// Mock Data Initialization
// ==========================================

const foundationNodes: CourseNode[] = Array.from({ length: 8 }, (_, i) => ({
  id: `F${i + 1}`, level: 'foundation', label: `Foundations ${i + 1}`, status: i < 5 ? 'completed' : 'active',
}));

const diplomaNodes: CourseNode[] = Array.from({ length: 16 }, (_, i) => ({
  id: `D${i + 1}`, level: 'diploma', label: `Diploma Core ${i + 1}`, status: i < 3 ? 'completed' : i < 6 ? 'active' : 'locked',
}));

const degreeNodes: CourseNode[] = Array.from({ length: 20 }, (_, i) => ({
  id: `G${i + 1}`, level: 'degree', label: `Degree Spec ${i + 1}`, status: 'locked',
}));

const allNodes: CourseNode[] = [...foundationNodes, ...diplomaNodes, ...degreeNodes];

const allEdges: CourseEdge[] = [
  { source: 'F1', target: 'F2' }, { source: 'F2', target: 'F4' },
  { source: 'F3', target: 'F5' }, { source: 'F5', target: 'F8' },
  { source: 'F2', target: 'D1' }, { source: 'F4', target: 'D2' }, { source: 'F8', target: 'D5' },
  { source: 'D1', target: 'D3' }, { source: 'D2', target: 'D4' },
  { source: 'D3', target: 'D6' }, { source: 'D5', target: 'D7' }, { source: 'D7', target: 'D10' },
  { source: 'D4', target: 'G1' }, { source: 'D6', target: 'G2' }, { source: 'D10', target: 'G5' },
  { source: 'G1', target: 'G3' }, { source: 'G2', target: 'G4' },
  { source: 'G4', target: 'G8' }, { source: 'G5', target: 'G10' },
  { source: 'G10', target: 'G15' }, { source: 'G15', target: 'G20' },
];

// ==========================================
// Utility: Deterministic Randomness
// ==========================================

/**
 * Generates a consistent pseudo-random number between 0 and 1 based on a string seed.
 * Ensures the randomized layout remains static across React re-renders.
 */
const getSeededRandom = (seed: string, offset: number = 0): number => {
  let hash = 0;
  const target = seed + offset.toString();
  for (let i = 0; i < target.length; i++) {
    hash = (hash << 5) - hash + target.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

// ==========================================
// Topological Layout Engine
// ==========================================

const calculateLayout = (nodes: CourseNode[], edges: CourseEdge[]) => {
  const nodeDepths = new Map<string, number>();

  const getDepth = (id: string): number => {
    if (nodeDepths.has(id)) return nodeDepths.get(id)!;
    
    const prereqs = edges.filter(e => e.target === id).map(e => e.source);
    if (prereqs.length === 0) {
      nodeDepths.set(id, 0);
      return 0;
    }
    
    const depth = 1 + Math.max(...prereqs.map(getDepth));
    nodeDepths.set(id, depth);
    return depth;
  };

  nodes.forEach(n => getDepth(n.id));

  let maxFoundationDepth = 0;
  nodes.filter(n => n.level === 'foundation').forEach(n => {
    maxFoundationDepth = Math.max(maxFoundationDepth, nodeDepths.get(n.id) || 0);
  });

  let maxDiplomaDepth = 0;
  nodes.filter(n => n.level === 'diploma').forEach(n => {
    const adjustedDepth = Math.max(nodeDepths.get(n.id) || 0, maxFoundationDepth + 1);
    nodeDepths.set(n.id, adjustedDepth);
    maxDiplomaDepth = Math.max(maxDiplomaDepth, adjustedDepth);
  });

  nodes.filter(n => n.level === 'degree').forEach(n => {
    const adjustedDepth = Math.max(nodeDepths.get(n.id) || 0, maxDiplomaDepth + 1);
    nodeDepths.set(n.id, adjustedDepth);
  });

  const depthGroups = new Map<number, CourseNode[]>();
  nodes.forEach(n => {
    const d = nodeDepths.get(n.id)!;
    if (!depthGroups.has(d)) depthGroups.set(d, []);
    depthGroups.get(d)!.push(n);
  });

  const layoutedNodes: RenderNode[] = [];
  const maxDepth = Math.max(...Array.from(nodeDepths.values()));
  
  const containerWidth = 1200;
  const safeStartX = 150;
  const usableWidth = containerWidth - (safeStartX * 2);
  const initialYPadding = 120;

  const sectionStarts: Record<CourseLevel, number> = {
    foundation: 0,
    diploma: 0,
    degree: 0
  };

  let currentY = initialYPadding;

  for (let d = 0; d <= maxDepth; d++) {
    const group = depthGroups.get(d) || [];
    if (group.length === 0) continue;

    const firstNodeLevel = group[0].level;
    if (sectionStarts[firstNodeLevel] === 0) {
      sectionStarts[firstNodeLevel] = currentY - 60;
    }

    // Sort group predictably to ensure stable chunking
    const sortedGroup = [...group].sort((a, b) => a.id.localeCompare(b.id));

    let index = 0;
    while (index < sortedGroup.length) {
      // Deterministically pick a row size between 2 and 4 based on the depth layer
      const rowSizeSeed = getSeededRandom(`row-${d}-${index}`);
      const rowSize = Math.floor(rowSizeSeed * 3) + 2; 
      const chunk = sortedGroup.slice(index, index + rowSize);

      const segmentWidth = usableWidth / chunk.length;

      chunk.forEach((node, idx) => {
        const baseX = safeStartX + (idx * segmentWidth) + (segmentWidth / 2);
        
        // Apply bounded jitter based on node ID to prevent overlapping
        const jitterX = (getSeededRandom(node.id, 1) - 0.5) * (segmentWidth * 0.5);
        const jitterY = (getSeededRandom(node.id, 2) - 0.5) * 50; 

        layoutedNodes.push({
          ...node,
          x: baseX + jitterX,
          y: currentY + jitterY,
        });
      });

      currentY += 130; 
      index += rowSize;
    }
    
    currentY += 40; 
  }

  return { 
    layoutedNodes, 
    totalHeight: currentY + 100,
    sectionStarts
  };
};

// ==========================================
// Component
// ==========================================

const ProgressView: React.FC = () => {
  const { layoutedNodes, totalHeight, sectionStarts } = useMemo(() => calculateLayout(allNodes, allEdges), []);

  const getEdgeColor = (sourceId: string, targetId: string) => {
    const source = layoutedNodes.find(n => n.id === sourceId);
    const target = layoutedNodes.find(n => n.id === targetId);
    
    if (source?.status === 'completed' && target?.status === 'completed') return '#10b981'; 
    if (source?.status === 'completed' && target?.status === 'active') return '#3b82f6';
    return '#cbd5e1';
  };

  const getNodeStyles = (level: CourseLevel, status: NodeStatus) => {
    if (status === 'locked') {
      return 'bg-slate-100 border-slate-300 text-slate-400 shadow-inner';
    }

    const styles = {
      foundation: {
        completed: 'bg-purple-100 border-purple-500 text-purple-600',
        active: 'bg-purple-100 border-purple-500 text-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse'
      },
      diploma: {
        completed: 'bg-blue-100 border-blue-500 text-blue-600',
        active: 'bg-blue-100 border-blue-500 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse'
      },
      degree: {
        completed: 'bg-emerald-100 border-emerald-500 text-emerald-600',
        active: 'bg-emerald-100 border-emerald-500 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
      }
    };

    return styles[level][status];
  };

  const getIcon = (status: NodeStatus) => {
    switch (status) {
      case 'completed': return <Check size={22} strokeWidth={3} />;
      case 'active': return <Play size={20} strokeWidth={3} className="ml-1" />;
      case 'locked': return <Lock size={18} strokeWidth={2.5} />;
    }
  };

  return (
    <div 
      className="relative w-full bg-[#f8fafc] overflow-x-auto overflow-y-auto font-sans" 
      style={{ height: `${totalHeight}px` }}
    >
      <div className="relative min-w-[1200px] w-[1200px] mx-auto h-full">
        
        <div 
          className="absolute left-12 text-slate-200/60 text-7xl font-black -z-10 pointer-events-none transition-all tracking-widest"
          style={{ top: `${sectionStarts.foundation}px` }}
        >FOUNDATION</div>
        <div 
          className="absolute right-12 text-slate-200/60 text-7xl font-black -z-10 pointer-events-none transition-all tracking-widest"
          style={{ top: `${sectionStarts.diploma}px` }}
        >DIPLOMA</div>
        <div 
          className="absolute left-12 text-slate-200/60 text-7xl font-black -z-10 pointer-events-none transition-all tracking-widest"
          style={{ top: `${sectionStarts.degree}px` }}
        >DEGREE</div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {allEdges.map((edge, index) => {
            const sourceNode = layoutedNodes.find(n => n.id === edge.source);
            const targetNode = layoutedNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const d = `M ${sourceNode.x} ${sourceNode.y} 
                       C ${sourceNode.x} ${sourceNode.y + 60}, 
                         ${targetNode.x} ${targetNode.y - 60}, 
                         ${targetNode.x} ${targetNode.y}`;

            return (
              <path
                key={`edge-${index}`}
                d={d}
                fill="none"
                stroke={getEdgeColor(edge.source, edge.target)}
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-70 transition-colors duration-500 hover:opacity-100 hover:stroke-slate-800"
              />
            );
          })}
        </svg>

        {layoutedNodes.map((node) => (
          <div
            key={node.id}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
          >
            <div
              className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 hover:scale-125 ${getNodeStyles(node.level, node.status)}`}
            >
              {getIcon(node.status)}
            </div>
            
            <div className="absolute top-[110%] mt-2 px-3 py-1.5 bg-slate-800 backdrop-blur-md border border-slate-700 text-xs font-bold text-white rounded-md shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap z-20">
              {node.label} <span className="text-slate-400 font-normal ml-1">({node.id})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;