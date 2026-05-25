import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DependencyBase {
  id: string;
  from_course_id: string;
  to_course_id: string;
}

interface CourseNode {
  id: string;
  code: string;
  name: string;
  status: 'completed' | 'available' | 'locked';
  x: number;
  y: number;
}

const Progress: React.FC = () => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const navigate = useNavigate();

  const nodes: CourseNode[] = [
    { id: 'c1', code: 'CS101', name: 'Intro to CS', status: 'completed', x: 200, y: 100 },
    { id: 'c2', code: 'MTH101', name: 'Calculus I', status: 'completed', x: 450, y: 100 },
    { id: 'c3', code: 'PHY101', name: 'Physics I', status: 'completed', x: 700, y: 100 },
    { id: 'c4', code: 'CS201', name: 'Data Structures', status: 'available', x: 200, y: 250 },
    { id: 'c5', code: 'MTH201', name: 'Linear Algebra', status: 'available', x: 450, y: 250 },
    { id: 'c6', code: 'CS301', name: 'Algorithms', status: 'locked', x: 325, y: 400 },
    { id: 'c7', code: 'ML101', name: 'Machine Learning', status: 'locked', x: 575, y: 400 },
  ];

  const dependencies: DependencyBase[] = [
    { id: 'd1', from_course_id: 'c1', to_course_id: 'c4' },
    { id: 'd2', from_course_id: 'c2', to_course_id: 'c5' },
    { id: 'd3', from_course_id: 'c4', to_course_id: 'c6' },
    { id: 'd4', from_course_id: 'c5', to_course_id: 'c6' },
    { id: 'd5', from_course_id: 'c5', to_course_id: 'c7' },
    { id: 'd6', from_course_id: 'c3', to_course_id: 'c7' },
  ];

  const isEdgeHighlighted = (dep: DependencyBase) => {
    if (!hoveredNodeId) return false;
    return dep.from_course_id === hoveredNodeId || dep.to_course_id === hoveredNodeId;
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNodeId) return false;
    if (nodeId === hoveredNodeId) return true;
    
    return dependencies.some(
      (dep) =>
        (dep.from_course_id === hoveredNodeId && dep.to_course_id === nodeId) ||
        (dep.to_course_id === hoveredNodeId && dep.from_course_id === nodeId)
    );
  };

  const getNodeCoordinates = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Progression Map</h2>
        <p className="text-slate-500 mt-1 text-sm">Track prerequisite pathways and unlockable curriculum.</p>
      </div>

      <div className="relative flex-1 w-full bg-slate-50/50 overflow-auto min-h-[600px]">
        <svg className="absolute inset-0 w-full h-full min-w-[900px] min-h-[600px] pointer-events-none">
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="38"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-300" />
            </marker>
            
            <marker
              id="arrow-highlighted"
              viewBox="0 0 10 10"
              refX="38"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-500" />
            </marker>
          </defs>

          {dependencies.map((dep) => {
            const start = getNodeCoordinates(dep.from_course_id);
            const end = getNodeCoordinates(dep.to_course_id);
            const highlighted = isEdgeHighlighted(dep);

            return (
              <line
                key={dep.id}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className={`transition-all duration-300 ${
                  highlighted 
                    ? 'stroke-blue-500 stroke-[3px]' 
                    : 'stroke-slate-300 stroke-2'
                } ${hoveredNodeId && !highlighted ? 'opacity-20' : 'opacity-100'}`}
                markerEnd={`url(#${highlighted ? 'arrow-highlighted' : 'arrow-default'})`}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 w-full h-full min-w-[900px] min-h-[600px]">
          {nodes.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const highlighted = isNodeHighlighted(node.id);
            const dimmed = hoveredNodeId !== null && !highlighted;

            let statusStyles = '';
            if (node.status === 'completed') {
              statusStyles = 'bg-slate-800 text-white border-slate-900';
            } else if (node.status === 'available') {
              statusStyles = 'bg-white text-slate-800 border-blue-400 shadow-sm';
            } else {
              statusStyles = 'bg-slate-100 text-slate-400 border-slate-300 border-dashed';
            }

            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => navigate(`/courses/${node.id}`)}
                className={`absolute w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform ${
                  statusStyles
                } ${isHovered ? 'scale-110 shadow-md border-blue-500 z-10' : 'z-0'} ${
                  dimmed ? 'opacity-30' : 'opacity-100'
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                }}
              >
                <span className="text-xs font-bold tracking-tight">{node.code}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Progress;