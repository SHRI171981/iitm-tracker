import React, { useEffect, useState, useMemo } from 'react';
import { useCourseStore } from '@/stores/useCourseStore';
import apiClient from '@/api/axios';
import type { Course } from '@/components/course-details-admin/types';

// ==========================================
// Type Definitions
// ==========================================

export interface DependencyResponse {
  id: string;
  from_course_id: string; // Dependent (Child)
  to_course_id: string;   // Prerequisite (Parent)
}

interface CourseEdge {
  source: string; // Prerequisite (Top)
  target: string; // Dependent (Bottom)
}

interface RenderNode extends Course {
  x: number;
  y: number;
}

// ==========================================
// Utility: Tier Parsing
// ==========================================

const getTierLevel = (level: string): number => {
  const normalized = String(level || '').toLowerCase();
  if (normalized.includes('foundation')) return 0;
  if (normalized.includes('diploma')) return 1;
  if (normalized.includes('degree')) return 2;
  return 3; // Fallback
};

// ==========================================
// Strict Swimlane Layout Engine
// ==========================================

const calculateLayout = (nodes: Course[], edges: CourseEdge[]) => {
  if (!nodes || nodes.length === 0) return { layoutedNodes: [], totalHeight: 0, sectionStarts: {} };

  const nodeDepths = new Map<string, number>();

  // 1. Calculate Absolute Topological Depth
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

  nodes.forEach(n => getDepth(String(n.id)));

  // 2. Group Nodes by Explicit Tiers (Foundation -> Diploma -> Degree)
  const tierGroups: Record<number, Course[]> = { 0: [], 1: [], 2: [] };
  
  nodes.forEach(n => {
    const tier = getTierLevel(n.level);
    if (tierGroups[tier]) tierGroups[tier].push(n);
  });

  const layoutedNodes: RenderNode[] = [];
  const containerWidth = 1200; // Base reference width for centering
  const rowSpacing = 140;      // Vertical space between rows
  const tierSpacing = 180;     // Extra vertical space between distinct tiers
  const nodeSpacing = 180;     // Horizontal space between nodes
  
  let currentY = 120;
  const sectionStarts: Record<string, { start: number, end: number }> = {};

  // 3. Process Each Tier Sequentially (Strict Top-to-Bottom Order)
  [0, 1, 2].forEach(tierIndex => {
    const tierNodes = tierGroups[tierIndex];
    if (tierNodes.length === 0) return;

    const tierKey = tierIndex === 0 ? 'foundation' : tierIndex === 1 ? 'diploma' : 'degree';
    const tierStartY = currentY;

    // Group nodes within this tier by their calculated depth
    const depthGroups = new Map<number, Course[]>();
    tierNodes.forEach(n => {
      const d = nodeDepths.get(String(n.id)) || 0;
      if (!depthGroups.has(d)) depthGroups.set(d, []);
      depthGroups.get(d)!.push(n);
    });

    // Sort the depths to process rows strictly from top to bottom
    const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b);

    sortedDepths.forEach(depth => {
      // Sort alphabetically for stable, predictable rendering
      const rowNodes = depthGroups.get(depth)!.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      
      // Center the row horizontally
      const totalRowWidth = (rowNodes.length - 1) * nodeSpacing;
      const startX = (containerWidth / 2) - (totalRowWidth / 2);

      rowNodes.forEach((node, idx) => {
        layoutedNodes.push({
          ...node,
          x: startX + (idx * nodeSpacing),
          y: currentY,
        });
      });

      currentY += rowSpacing; // Move down for the next row of dependencies
    });

    sectionStarts[tierKey] = { start: tierStartY - 60, end: currentY };
    currentY += tierSpacing; // Add visual gap before the next Tier begins
  });

  return { layoutedNodes, totalHeight: currentY, sectionStarts };
};

// ==========================================
// Component Render
// ==========================================

const ProgressView: React.FC = () => {
  const courses = useCourseStore((state) => state.courses || []);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const isCoursesLoading = useCourseStore((state) => state.loading);
  const storeError = useCourseStore((state) => state.error);
  
  const [dependencies, setDependencies] = useState<CourseEdge[]>([]);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        fetchCourses();

        const response = await apiClient.get('/dependency/all');
        
        if (isMounted && response.status === 200) {
          // to_course_id = Prerequisite (Source)
          // from_course_id = Dependent (Target)
          const mappedEdges: CourseEdge[] = response.data.map((dep: DependencyResponse) => ({
            source: String(dep.to_course_id), 
            target: String(dep.from_course_id)
          }));
          setDependencies(mappedEdges);
        }
      } catch (err: any) {
        if (isMounted) {
          setLocalError(err.response?.data?.message || 'Failed to fetch curriculum dependencies');
        }
      } finally {
        if (isMounted) setIsDependenciesLoading(false);
      }
    };

    initializeData();
    return () => { isMounted = false; };
  }, [fetchCourses]);

  const { layoutedNodes, totalHeight, sectionStarts } = useMemo(() => 
    calculateLayout(courses, dependencies), 
  [courses, dependencies]);

  const getLevelColor = (level: string) => {
    const normalized = String(level || '').toLowerCase();
    if (normalized.includes('foundation')) return 'bg-purple-100 border-purple-400 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
    if (normalized.includes('diploma')) return 'bg-blue-100 border-blue-400 text-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    if (normalized.includes('degree')) return 'bg-emerald-100 border-emerald-400 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    return 'bg-slate-100 border-slate-300 text-slate-600';
  };

  const isLoading = isCoursesLoading || isDependenciesLoading;
  const error = storeError || localError;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-bold uppercase tracking-widest">Mapping Curriculum...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-sm font-bold text-red-500 uppercase tracking-widest bg-red-50 px-6 py-3 rounded-lg border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#f8fafc] overflow-x-auto overflow-y-auto font-sans flex justify-center">
      <div 
        className="relative min-w-[1200px] w-[1200px] bg-white shadow-2xl rounded-2xl mx-8 my-8 border border-slate-200/60 overflow-hidden"
        style={{ height: `${Math.max(totalHeight, 800)}px` }}
      >
        
        {/* Tier Background Dividers and Labels */}
        {Object.entries(sectionStarts).map(([tier, bounds]) => (
          bounds && (
            <div key={tier} className="absolute w-full pointer-events-none" style={{ top: `${bounds.start}px`, height: `${bounds.end - bounds.start}px` }}>
              <div className="absolute inset-0 bg-slate-50/50 border-y border-slate-100" />
              <div className="absolute left-8 top-12 text-slate-200/50 text-8xl font-black uppercase tracking-widest origin-top-left -rotate-90 opacity-40">
                {tier}
              </div>
            </div>
          )
        ))}

        {/* Directed SVG Render Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
          
          {dependencies.map((edge, index) => {
            const sourceNode = layoutedNodes.find(n => String(n.id) === edge.source);
            const targetNode = layoutedNodes.find(n => String(n.id) === edge.target);
            if (!sourceNode || !targetNode) return null;

            // Offset the connection points slightly so the lines end exactly at the edge of the circular node
            const nodeRadius = 32;
            const d = `M ${sourceNode.x} ${sourceNode.y + nodeRadius} 
                       C ${sourceNode.x} ${sourceNode.y + nodeRadius + 50}, 
                         ${targetNode.x} ${targetNode.y - nodeRadius - 50}, 
                         ${targetNode.x} ${targetNode.y - nodeRadius - 4}`;

            return (
              <path
                key={`edge-${index}`}
                d={d}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
                className="opacity-80 transition-colors duration-500 hover:opacity-100 hover:stroke-indigo-400"
              />
            );
          })}
        </svg>

        {/* HTML Node Render Layer */}
        {layoutedNodes.map((node) => (
          <div
            key={String(node.id)}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
          >
            {/* The Main Node Circle */}
            <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-white z-10 ${getLevelColor(node.level)}`}>
              <span className="font-extrabold text-sm">{node.code}</span>
            </div>
            
            {/* Context Tooltip & Quick Info */}
            <div className="absolute top-[100%] mt-3 px-4 py-2.5 bg-slate-800 backdrop-blur-md border border-slate-700 text-white rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap z-20 flex flex-col items-center min-w-[140px]">
              <span className="text-sm font-bold text-white mb-0.5">{node.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{node.level}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[10px] text-indigo-300 font-bold">{node.credits} CR</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;