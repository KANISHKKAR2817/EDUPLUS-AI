import React, { useState, useMemo } from 'react';
import { GraphNode, GraphEdge } from '../types';
import {
  Layers,
  Search,
  Filter,
  Info,
  ExternalLink,
  BookOpen,
  Target,
  GraduationCap,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  nodes,
  edges,
  onSelectNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const nodeTypes = ['ALL', 'Course', 'Concept', 'Student', 'Assessment', 'Question', 'LearningMaterial', 'Intervention'];

  const typeColors: Record<string, { bg: string; border: string; text: string; fill: string }> = {
    Course: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', fill: '#2563eb' },
    Concept: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', fill: '#059669' },
    Student: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', fill: '#9333ea' },
    Assessment: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', fill: '#d97706' },
    Question: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-800', fill: '#0891b2' },
    LearningMaterial: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-800', fill: '#0d9488' },
    Intervention: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', fill: '#e11d48' },
  };

  // Filter nodes based on type & search term
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesType = filterType === 'ALL' || n.type === filterType;
      const matchesSearch =
        searchTerm === '' ||
        n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [nodes, filterType, searchTerm]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
  }, [edges, activeNodeIds]);

  // Layout positions: Group by type in orbital clusters
  const nodePositions = useMemo(() => {
    const width = 850;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const posMap: Record<string, { x: number; y: number }> = {};

    // Organize in categorized orbits
    const clusters: Record<string, { cx: number; cy: number; radius: number }> = {
      Course: { cx: centerX, cy: centerY, radius: 45 },
      Concept: { cx: centerX + 180, cy: centerY - 90, radius: 110 },
      Student: { cx: centerX - 220, cy: centerY - 60, radius: 120 },
      Assessment: { cx: centerX + 160, cy: centerY + 130, radius: 90 },
      Question: { cx: centerX + 270, cy: centerY + 160, radius: 100 },
      LearningMaterial: { cx: centerX + 80, cy: centerY - 180, radius: 80 },
      Intervention: { cx: centerX - 120, cy: centerY + 160, radius: 95 },
    };

    const typeGroups: Record<string, GraphNode[]> = {};
    filteredNodes.forEach((n) => {
      if (!typeGroups[n.type]) typeGroups[n.type] = [];
      typeGroups[n.type].push(n);
    });

    Object.entries(typeGroups).forEach(([type, groupNodes]) => {
      const cluster = clusters[type] || { cx: centerX, cy: centerY, radius: 150 };
      groupNodes.forEach((node, i) => {
        const angle = (i / Math.max(1, groupNodes.length)) * 2 * Math.PI;
        // Distribute jitter slightly
        const dist = cluster.radius + (i % 2 === 0 ? 15 : -15);
        const x = Math.max(40, Math.min(width - 40, cluster.cx + Math.cos(angle) * dist));
        const y = Math.max(40, Math.min(height - 40, cluster.cy + Math.sin(angle) * dist));
        posMap[node.id] = { x, y };
      });
    });

    return posMap;
  }, [filteredNodes]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);
  }, [edges, selectedNodeId]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[700px] border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Interactive Graph Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Graph Controls Toolbar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts, students, courses..."
              className="w-full rounded-lg bg-white border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0 mr-1" />
            {nodeTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                  filterType === t
                    ? 'bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Network View */}
        <div className="flex-1 relative bg-slate-50/50 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full cursor-grab active:cursor-grabbing" viewBox="0 0 850 550">
            {/* Defs for arrow markers */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" opacity="0.8" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0d9488" />
              </marker>
            </defs>

            {/* Edges */}
            <g className="edges">
              {filteredEdges.map((e) => {
                const sPos = nodePositions[e.source];
                const tPos = nodePositions[e.target];
                if (!sPos || !tPos) return null;
                const isConnected =
                  selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId);

                return (
                  <g key={e.id}>
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={isConnected ? '#0d9488' : '#cbd5e1'}
                      strokeWidth={isConnected ? 2.5 : 1.2}
                      strokeOpacity={isConnected ? 1 : 0.6}
                      strokeDasharray={e.label === 'STRUGGLES_WITH' ? '4,4' : undefined}
                      markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />
                    {isConnected && (
                      <text
                        x={(sPos.x + tPos.x) / 2}
                        y={(sPos.y + tPos.y) / 2 - 4}
                        fill="#0f766e"
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((n) => {
                const pos = nodePositions[n.id];
                if (!pos) return null;
                const isSelected = selectedNodeId === n.id;
                const colorConfig = typeColors[n.type] || typeColors.Concept;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => {
                      setSelectedNodeId(n.id);
                      if (onSelectNode) onSelectNode(n);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring on selected node */}
                    {isSelected && (
                      <circle
                        r="20"
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2.5"
                        className="animate-ping opacity-50"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={isSelected ? 16 : 12}
                      fill="#ffffff"
                      stroke={colorConfig.fill}
                      strokeWidth={isSelected ? 3.5 : 2.5}
                      className="transition-all duration-150 group-hover:scale-125 shadow-sm"
                    />

                    {/* Inner color dot */}
                    <circle r="4" fill={colorConfig.fill} />

                    {/* Node label */}
                    <text
                      y={isSelected ? 26 : 22}
                      fill="#1e293b"
                      fontSize={isSelected ? '11' : '9.5'}
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                      className="pointer-events-none select-none drop-shadow-2xs"
                    >
                      {n.label.length > 20 ? n.label.substring(0, 18) + '...' : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-white/95 border border-slate-200 text-[10px] space-y-1.5 backdrop-blur-md shadow-sm">
            <span className="font-bold text-slate-600 block mb-1">Entity Schema</span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {Object.entries(typeColors).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.fill }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 p-5 overflow-y-auto shrink-0 flex flex-col">
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    typeColors[selectedNode.type]?.bg || ''
                  } ${typeColors[selectedNode.type]?.text || ''} ${
                    typeColors[selectedNode.type]?.border || ''
                  }`}
                >
                  {selectedNode.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {selectedNode.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{selectedNode.label}</h3>
            </div>

            {/* Entity Properties */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Entity Properties
              </span>
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs">
                {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-slate-800 font-mono text-right font-medium">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Academic Relationships */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Direct Relationships ({connectedEdges.length})
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {connectedEdges.map((e) => {
                  const isOutgoing = e.source === selectedNode.id;
                  const otherId = isOutgoing ? e.target : e.source;
                  const otherNode = nodes.find((n) => n.id === otherId);

                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedNodeId(otherId)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-[11px] flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-teal-50 text-[10px] font-mono text-teal-800 font-semibold border border-teal-200">
                          {e.label}
                        </span>
                        <span className="text-slate-800 font-semibold truncate max-w-[120px]">
                          {otherNode?.label || otherId}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Layers className="h-8 w-8 text-slate-400 mb-2" />
            <h4 className="text-xs font-semibold text-slate-700">Select any graph entity</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Click a course, concept weakness, student, assessment, or intervention node to traverse connected relationships.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
