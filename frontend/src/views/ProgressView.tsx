import React from 'react';
import { Check, Lock, Play } from 'lucide-react';

type NodeStatus = 'completed' | 'active' | 'locked';

interface ProgressNode {
  id: string;
  x: number;
  y: number;
  status: NodeStatus;
  label: string;
}

interface ProgressEdge {
  source: string;
  target: string;
}

const nodesData: ProgressNode[] = [
  { id: '1', x: 20, y: 70, status: 'completed', label: 'Foundation' },
  { id: '2', x: 25, y: 35, status: 'completed', label: 'Core I' },
  { id: '3', x: 40, y: 20, status: 'active', label: 'Advanced I' },
  { id: '4', x: 40, y: 55, status: 'completed', label: 'Core II' },
  { id: '5', x: 60, y: 25, status: 'locked', label: 'Advanced II' },
  { id: '6', x: 45, y: 85, status: 'active', label: 'Elective A' },
  { id: '7', x: 65, y: 85, status: 'locked', label: 'Elective B' },
  { id: '8', x: 80, y: 30, status: 'locked', label: 'Capstone' },
  { id: '9', x: 80, y: 60, status: 'locked', label: 'Prep' },
  { id: '10', x: 90, y: 80, status: 'locked', label: 'Final Exam' },
];

const edgesData: ProgressEdge[] = [
  { source: '1', target: '2' },
  { source: '2', target: '3' },
  { source: '1', target: '4' },
  { source: '4', target: '5' },
  { source: '1', target: '6' },
  { source: '6', target: '7' },
  { source: '8', target: '9' },
  { source: '8', target: '10' },
  { source: '9', target: '10' },
];

const ProgressView: React.FC = () => {
  const getEdgeColor = (sourceId: string, targetId: string) => {
    const source = nodesData.find(n => n.id === sourceId);
    const target = nodesData.find(n => n.id === targetId);
    
    if (source?.status === 'completed' && target?.status === 'completed') {
      return '#10b981'; 
    }
    if (source?.status === 'completed' && target?.status === 'active') {
      return '#3b82f6';
    }
    return '#cbd5e1';
  };

  const getNodeStyles = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 border-emerald-500 text-emerald-600';
      case 'active':
        return 'bg-blue-100 border-blue-500 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse';
      case 'locked':
        return 'bg-slate-100 border-slate-300 text-slate-400';
    }
  };

  const getIcon = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return <Check size={24} strokeWidth={3} />;
      case 'active':
        return <Play size={22} strokeWidth={3} className="ml-1" />;
      case 'locked':
        return <Lock size={20} strokeWidth={2.5} />;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      <div className="absolute top-10 left-10 z-20">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          PROGRESSION
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Track your learning journey</p>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {edgesData.map((edge, index) => {
          const sourceNode = nodesData.find(n => n.id === edge.source);
          const targetNode = nodesData.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          return (
            <line
              key={`edge-${index}`}
              x1={`${sourceNode.x}%`}
              y1={`${sourceNode.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke={getEdgeColor(edge.source, edge.target)}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {nodesData.map((node) => (
        <div
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
        >
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${getNodeStyles(node.status)}`}
          >
            {getIcon(node.status)}
          </div>
          
          <div className="absolute top-full mt-3 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg whitespace-nowrap shadow-sm">
            {node.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressView;