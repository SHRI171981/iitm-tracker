import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';

// ==========================================
// Type Definitions
// ==========================================

interface CourseNode {
  id: string;
  label: string;
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
// Raw Production Data Injection
// ==========================================

const rawEdges = [
  { "id": "0160ff64-4a9a-438b-88e4-318d8cfa2ac5", "from_course_id": "0a03d506-4e29-413f-9fe2-3dee39315228", "to_course_id": "74ba312e-dad7-4507-a172-84246a6a8676" },
  { "id": "f8fe8b7b-e755-4083-8f4c-cef89b982dee", "from_course_id": "c6d5c197-6791-4585-be2a-bf646022d264", "to_course_id": "180f9951-1247-4138-bc8a-a4ebc6d4be67" },
  { "id": "2831d672-a9f2-4400-b255-7e3e8e2445e7", "from_course_id": "3fb41f70-6f3a-447a-8654-4d693fd22325", "to_course_id": "0af15ef6-7dc8-499e-bb0f-82c705c0d8a3" },
  { "id": "f03ab43d-915a-4468-97e7-b693c3a6f9c9", "from_course_id": "88aec6a6-7e77-4fda-931b-d72fd7e98193", "to_course_id": "b7c9a00a-3f28-40fc-b45c-8d96abf5fdcf" },
  { "id": "02a229bc-3973-4297-bc3f-3b3ef7145cd5", "from_course_id": "46a49486-e4b5-47fa-9cdc-5618588a7e22", "to_course_id": "e01590d7-2fff-44b3-b010-0a3293b8994d" },
  { "id": "6a429b47-75fd-47d1-a735-829658debad7", "from_course_id": "e01590d7-2fff-44b3-b010-0a3293b8994d", "to_course_id": "93c43db7-5e0b-4bba-ba5d-5bb347004327" },
  { "id": "9c8389a1-9c3d-41eb-8aae-2fb4542ea143", "from_course_id": "119c6836-07fa-4617-9236-d94779d7ee0a", "to_course_id": "a7def215-8b34-4532-88ea-8326b763ead0" },
  { "id": "dcdd729b-89bd-4062-86a5-d33393a3f534", "from_course_id": "a7def215-8b34-4532-88ea-8326b763ead0", "to_course_id": "f54abff6-72e3-4ea6-90f0-58d9839be64b" },
  { "id": "57492737-fe82-4411-b154-f51933d362ae", "from_course_id": "a7def215-8b34-4532-88ea-8326b763ead0", "to_course_id": "8f53f5a0-368c-439c-898a-94476e0b1ebe" },
  { "id": "3a22598a-dccd-4e6c-a955-8ba6e64a1ba5", "from_course_id": "8f53f5a0-368c-439c-898a-94476e0b1ebe", "to_course_id": "17532e75-36ca-4528-9981-2cb1f74b403f" },
  { "id": "93d63bdb-fccd-4c80-a7e6-af928a017f7c", "from_course_id": "f54abff6-72e3-4ea6-90f0-58d9839be64b", "to_course_id": "17532e75-36ca-4528-9981-2cb1f74b403f" },
  { "id": "00a68967-77d4-4c6e-b626-0b45166fe2f2", "from_course_id": "180f9951-1247-4138-bc8a-a4ebc6d4be67", "to_course_id": "e9715066-f4c8-43fa-8c9d-ccf87da9f0a0" },
  { "id": "14a1966e-b6f4-45d1-b34f-aac68e781896", "from_course_id": "0af15ef6-7dc8-499e-bb0f-82c705c0d8a3", "to_course_id": "e9715066-f4c8-43fa-8c9d-ccf87da9f0a0" },
  { "id": "c2607443-1fad-44d9-a08f-812bf256dfda", "from_course_id": "e9715066-f4c8-43fa-8c9d-ccf87da9f0a0", "to_course_id": "30e336f1-39f6-4130-b1c7-596adfddc101" },
  { "id": "6bdc75d3-f4a3-4924-ac6c-1f26c7e15c5a", "from_course_id": "30e336f1-39f6-4130-b1c7-596adfddc101", "to_course_id": "7d91f8c1-1a26-429b-9364-f1d8aeba5346" },
  { "id": "4c4d576c-befb-4c38-8b9f-fc6183bd5ca9", "from_course_id": "7d91f8c1-1a26-429b-9364-f1d8aeba5346", "to_course_id": "26d8c086-409a-4820-a7c6-f9e59c981350" },
  { "id": "584c42c4-b7d4-4665-abd8-2a631f94b5f5", "from_course_id": "7d91f8c1-1a26-429b-9364-f1d8aeba5346", "to_course_id": "873ac257-1f8e-4a65-a593-d85c258a0f6f" },
  { "id": "ac14b9df-b929-4bdb-b786-52b766766284", "from_course_id": "26d8c086-409a-4820-a7c6-f9e59c981350", "to_course_id": "2ddc8f5a-8744-4e11-a562-4bc7f0ccdd2f" },
  { "id": "638bdcbb-86ba-4804-80e6-4b98d54dffcc", "from_course_id": "873ac257-1f8e-4a65-a593-d85c258a0f6f", "to_course_id": "2ddc8f5a-8744-4e11-a562-4bc7f0ccdd2f" },
  { "id": "1f08556f-0834-47ec-87a1-8145dc5088f2", "from_course_id": "b8418e53-7603-421a-bc27-ed736abba004", "to_course_id": "c8afda0f-fd74-4de0-8dac-1b975d54725a" },
  { "id": "02ba34ff-3f33-4e3f-b2aa-5c9aaaec30a5", "from_course_id": "b8418e53-7603-421a-bc27-ed736abba004", "to_course_id": "87a6f3e5-4803-4ec1-a9e9-8cb0ceb989f0" },
  { "id": "ee56b630-ec8b-46ae-b04e-181e17a9285a", "from_course_id": "7d91f8c1-1a26-429b-9364-f1d8aeba5346", "to_course_id": "c2b079df-3aa7-41e3-9449-28a04438e6d7" },
  { "id": "3135e475-ba05-4e71-a936-e65b3e958e33", "from_course_id": "7d91f8c1-1a26-429b-9364-f1d8aeba5346", "to_course_id": "aa27d025-08bb-4256-a021-99703665d871" },
  { "id": "07e40387-2d82-4e7b-84ef-75700f4f8599", "from_course_id": "aa27d025-08bb-4256-a021-99703665d871", "to_course_id": "73ac6702-0ca2-4c05-8654-f04ca78d4bdb" },
  { "id": "bd5dd0a9-ac16-42ad-8ac9-2438b6ab13e3", "from_course_id": "aa27d025-08bb-4256-a021-99703665d871", "to_course_id": "a191ae02-5e6c-4c69-8991-cb585178d484" }
];

// Automatically extract unique nodes from edges
const allEdges: CourseEdge[] = rawEdges.map(e => ({ source: e.from_course_id, target: e.to_course_id }));
const uniqueIds = Array.from(new Set([...allEdges.map(e => e.source), ...allEdges.map(e => e.target)]));

const allNodes: CourseNode[] = uniqueIds.map(id => ({
  id,
  label: id.substring(0, 4).toUpperCase(), // Short visual label
}));

// ==========================================
// Utility: Deterministic Randomness
// ==========================================

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
// Pure Topological Layout Engine
// ==========================================

const calculateLayout = (nodes: CourseNode[], edges: CourseEdge[]) => {
  const nodeDepths = new Map<string, number>();

  // 1. Calculate pure dependency depth (no tier boundaries)
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

  // 2. Group nodes purely by depth
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

  let currentY = initialYPadding;

  // 3. Scatter generation
  for (let d = 0; d <= maxDepth; d++) {
    const group = depthGroups.get(d) || [];
    if (group.length === 0) continue;

    const sortedGroup = [...group].sort((a, b) => a.id.localeCompare(b.id));

    let index = 0;
    while (index < sortedGroup.length) {
      const rowSizeSeed = getSeededRandom(`row-${d}-${index}`);
      const rowSize = Math.floor(rowSizeSeed * 3) + 2; // Chunks of 2 to 4
      const chunk = sortedGroup.slice(index, index + rowSize);

      const segmentWidth = usableWidth / chunk.length;

      chunk.forEach((node, idx) => {
        const baseX = safeStartX + (idx * segmentWidth) + (segmentWidth / 2);
        
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
    totalHeight: currentY + 100
  };
};

// ==========================================
// Component
// ==========================================

const ProgressView: React.FC = () => {
  const { layoutedNodes, totalHeight } = useMemo(() => calculateLayout(allNodes, allEdges), []);

  return (
    <div 
      className="relative w-full bg-[#f8fafc] overflow-x-auto overflow-y-auto font-sans" 
      style={{ height: `${totalHeight}px` }}
    >
      <div className="relative min-w-[1200px] w-[1200px] mx-auto h-full">
        
        {/* Dynamic Curved SVG Routing */}
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
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-70 transition-colors duration-500 hover:opacity-100 hover:stroke-slate-800"
              />
            );
          })}
        </svg>

        {/* Node Rendering Pipeline */}
        {layoutedNodes.map((node) => (
          <div
            key={node.id}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
          >
            <div
              className="w-14 h-14 rounded-full border-[3px] bg-indigo-50 border-indigo-400 text-indigo-600 flex items-center justify-center transition-all duration-300 hover:scale-125 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <span className="font-bold text-xs">{node.label}</span>
            </div>
            
            <div className="absolute top-[110%] mt-2 px-3 py-1.5 bg-slate-800 backdrop-blur-md border border-slate-700 text-xs font-bold text-white rounded-md shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap z-20">
              ID: <span className="text-indigo-300 font-mono font-normal ml-1">{node.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;