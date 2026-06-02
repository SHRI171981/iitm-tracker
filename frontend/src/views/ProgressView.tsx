import React, { useEffect, useState, useMemo } from 'react';
import { useCourseStore } from '@/stores/useCourseStore';
import apiClient from '@/api/axios';
import type { Course } from '@/components/course-details-admin/types';
// If DependencyResponse is defined in types, import it. Otherwise, defined locally.

// ==========================================
// Type Definitions
// ==========================================

export interface DependencyResponse {
  id: string;
  from_course_id: string; // The course that has the dependency (Dependent)
  to_course_id: string;   // The course that is depended on (Prerequisite)
}

interface CourseEdge {
  source: string; // Prerequisite
  target: string; // Dependent
}

interface RenderNode extends Course {
  x: number;
  y: number;
}

// ==========================================
// Utility: Deterministic Randomness
// ==========================================

/**
 * Generates a consistent pseudo-random number based on a string seed.
 * Ensures nodes maintain stable positions across React re-renders.
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

/**
 * Calculates absolute pixel coordinates for nodes based on topological depth.
 * Dynamically handles orphaned nodes (courses with no dependencies) by assigning them to depth 0.
 */
const calculateLayout = (nodes: Course[], edges: CourseEdge[]) => {
  if (!nodes || nodes.length === 0) return { layoutedNodes: [], totalHeight: 0 };

  const nodeDepths = new Map<string, number>();

  const getDepth = (id: string): number => {
    if (nodeDepths.has(id)) return nodeDepths.get(id)!;
    
    const prereqs = edges.filter(e => e.target === id).map(e => e.source);
    
    // Nodes with zero prerequisites default to the top tier (Depth 0)
    if (prereqs.length === 0) {
      nodeDepths.set(id, 0);
      return 0;
    }
    
    const depth = 1 + Math.max(...prereqs.map(getDepth));
    nodeDepths.set(id, depth);
    return depth;
  };

  // Compute depths for all nodes
  nodes.forEach(n => getDepth(String(n.id)));

  // Group nodes by their calculated depth
  const depthGroups = new Map<number, Course[]>();
  nodes.forEach(n => {
    const d = nodeDepths.get(String(n.id)) || 0;
    if (!depthGroups.has(d)) depthGroups.set(d, []);
    depthGroups.get(d)!.push(n);
  });

  const layoutedNodes: RenderNode[] = [];
  const maxDepth = Math.max(0, ...Array.from(nodeDepths.values()));
  
  // Layout Constants
  const containerWidth = 1200;
  const safeStartX = 150;
  const usableWidth = containerWidth - (safeStartX * 2);
  let currentY = 120;

  for (let d = 0; d <= maxDepth; d++) {
    const group = depthGroups.get(d) || [];
    if (group.length === 0) continue;

    // Sort to ensure stable rendering order within rows
    const sortedGroup = [...group].sort((a, b) => String(a.id).localeCompare(String(b.id)));

    let index = 0;
    while (index < sortedGroup.length) {
      // Chunk nodes into sub-rows of 2 to 4 items
      const rowSizeSeed = getSeededRandom(`row-${d}-${index}`);
      const rowSize = Math.floor(rowSizeSeed * 3) + 2; 
      const chunk = sortedGroup.slice(index, index + rowSize);

      const segmentWidth = usableWidth / chunk.length;

      chunk.forEach((node, idx) => {
        const nodeId = String(node.id);
        const baseX = safeStartX + (idx * segmentWidth) + (segmentWidth / 2);
        
        // Apply bounded jitter to prevent rigid grid appearance
        const jitterX = (getSeededRandom(nodeId, 1) - 0.5) * (segmentWidth * 0.5);
        const jitterY = (getSeededRandom(nodeId, 2) - 0.5) * 50; 

        layoutedNodes.push({
          ...node,
          x: baseX + jitterX,
          y: currentY + jitterY,
        });
      });

      currentY += 130; 
      index += rowSize;
    }
    currentY += 40; // Spacing between depth layers
  }

  return { layoutedNodes, totalHeight: currentY + 100 };
};

// ==========================================
// Component Render
// ==========================================

const ProgressView: React.FC = () => {
  // Global Store State
  const courses = useCourseStore((state) => state.courses);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const isCoursesLoading = useCourseStore((state) => state.loading);
  const storeError = useCourseStore((state) => state.error);
  
  // Local State for Dependencies
  const [dependencies, setDependencies] = useState<CourseEdge[]>([]);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        // Trigger course fetch if the store is empty
        fetchCourses();

        // Fetch dependencies using the configured axios instance
        const response = await apiClient.get('/dependency/all');
        
        if (isMounted && response.status === 200) {
          const mappedEdges: CourseEdge[] = response.data.map((dep: DependencyResponse) => ({
            source: String(dep.to_course_id), // to_course_id is the prerequisite
            target: String(dep.from_course_id) // from_course_id is the dependent
          }));
          setDependencies(mappedEdges);
        }
      } catch (err: any) {
        if (isMounted) {
          setLocalError(err.response?.data?.message || 'Failed to fetch curriculum dependencies');
        }
      } finally {
        if (isMounted) {
          setIsDependenciesLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [fetchCourses]);

  // Execute topological sorting algorithm only when raw data changes
  const { layoutedNodes, totalHeight } = useMemo(() => 
    calculateLayout(courses, dependencies), 
  [courses, dependencies]);

  /**
   * Maps course level strings to corresponding Tailwind color classes.
   * Handles string normalization to prevent exact-match casing issues.
   */
  const getLevelColor = (level: string) => {
    const normalizedLevel = String(level || '').toLowerCase();
    
    if (normalizedLevel.includes('foundation')) {
      return 'bg-purple-100 border-purple-400 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    }
    if (normalizedLevel.includes('diploma')) {
      return 'bg-blue-100 border-blue-400 text-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
    }
    if (normalizedLevel.includes('degree')) {
      return 'bg-emerald-100 border-emerald-400 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
    
    return 'bg-slate-100 border-slate-300 text-slate-600';
  };

  const isLoading = isCoursesLoading || isDependenciesLoading;
  const error = storeError || localError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-bold uppercase tracking-widest">Mapping Curriculum...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-sm font-bold text-red-400 uppercase tracking-widest">Error: {error}</div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-[#f8fafc] overflow-x-auto overflow-y-auto font-sans" 
      style={{ height: `${Math.max(totalHeight, 1000)}px` }}
    >
      <div className="relative min-w-[1200px] w-[1200px] mx-auto h-full">
        
        {/* SVG Render Layer: Bezier curves for inter-node routing */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {dependencies.map((edge, index) => {
            const sourceNode = layoutedNodes.find(n => String(n.id) === edge.source);
            const targetNode = layoutedNodes.find(n => String(n.id) === edge.target);
            if (!sourceNode || !targetNode) return null;

            // Generate cubic bezier path forcing vertical entry/exit points
            const d = `M ${sourceNode.x} ${sourceNode.y} 
                       C ${sourceNode.x} ${sourceNode.y + 60}, 
                         ${targetNode.x} ${targetNode.y - 60}, 
                         ${targetNode.x} ${targetNode.y}`;

            return (
              <path
                key={`edge-${index}`}
                d={d}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-70 transition-colors duration-500 hover:opacity-100 hover:stroke-slate-500"
              />
            );
          })}
        </svg>

        {/* HTML Render Layer: Interactive course nodes */}
        {layoutedNodes.map((node) => (
          <div
            key={String(node.id)}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
          >
            <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 hover:scale-125 ${getLevelColor(node.level)}`}>
              <span className="font-bold text-xs">{node.code}</span>
            </div>
            
            {/* Context Tooltip */}
            <div className="absolute top-[110%] mt-2 px-3 py-2 bg-slate-800 backdrop-blur-md border border-slate-700 text-white rounded-md shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap z-20 flex flex-col items-center">
              <span className="text-xs font-bold">{node.name}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{node.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;