import React, { useState, useMemo } from 'react';
import { GraphNode, GraphEdge } from '../types';
import {
  Layers,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Target,
  GraduationCap,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  AlertCircle
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

  // Precise essential academic entity types
  const nodeTypes = ['ALL', 'Course', 'Concept', 'Student', 'Intervention', 'Assessment'];

  const typeConfig: Record<string, { bg: string; border: string; text: string; fill: string; stroke: string; label: string }> = {
    Course: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', fill: '#2563eb', stroke: '#1d4ed8', label: 'Course' },
    Concept: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', fill: '#059669', stroke: '#047857', label: 'Concept' },
    Student: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', fill: '#9333ea', stroke: '#7e22ce', label: 'Student' },
    Intervention: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', fill: '#e11d48', stroke: '#be123c', label: 'Intervention' },
    Assessment: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', fill: '#d97706', stroke: '#b45309', label: 'Assessment' },
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

  // Structured, layered pedagogical layout (Left-to-Right flow)
  const nodePositions = useMemo(() => {
    const width = 900;
    const height = 520;
    const posMap: Record<string, { x: number; y: number }> = {};

    // Group nodes by category
    const courses = filteredNodes.filter((n) => n.type === 'Course');
    const concepts = filteredNodes.filter((n) => n.type === 'Concept');
    const students = filteredNodes.filter((n) => n.type === 'Student');
    const interventions = filteredNodes.filter((n) => n.type === 'Intervention');
    const assessments = filteredNodes.filter((n) => n.type === 'Assessment');

    // 1. Place Courses on the far left column
    courses.forEach((c, idx) => {
      const y = courses.length === 1 ? height / 2 : 120 + idx * 160;
      posMap[c.id] = { x: 90, y };
    });

    // 2. Place Concepts in structured vertical flow in the center (X: 340 to 480)
    // Order concepts if possible by difficulty or alphabetical
    concepts.forEach((c, idx) => {
      const total = concepts.length || 1;
      const stepY = (height - 120) / Math.max(1, total - 1);
      const y = total === 1 ? height / 2 : 70 + idx * stepY;
      // Stagger X slightly for clean visual rhythm
      const x = 320 + (idx % 2 === 0 ? 0 : 70);
      posMap[c.id] = { x, y };
    });

    // 3. Place Assessments at top center (X: 300, Y: 45)
    assessments.forEach((a, idx) => {
      const x = 240 + idx * 200;
      posMap[a.id] = { x, y: 45 };
    });

    // 4. Place Struggling Students and Interventions on the right (X: 680 to 800)
    students.forEach((s, idx) => {
      const y = 140 + idx * 160;
      posMap[s.id] = { x: 670, y };
    });

    interventions.forEach((intv, idx) => {
      const y = 240 + idx * 150;
      posMap[intv.id] = { x: 780, y };
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

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    connectedEdges.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return ids;
  }, [connectedEdges]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[640px] border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Interactive Graph Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Graph Controls Toolbar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts or courses..."
              className="w-full rounded-xl bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {nodeTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  filterType === t
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Network View */}
        <div className="flex-1 relative bg-slate-50/40 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full select-none" viewBox="0 0 900 520">
            {/* Defs for arrow markers */}
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
              <marker
                id="arrow-prereq"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0d9488" />
              </marker>
              <marker
                id="arrow-struggle"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
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
                const isPrereq = e.label === 'PREREQUISITE_OF';
                const isStruggle = e.label === 'STRUGGLES_WITH';
                const isTarget = e.label === 'TARGETS';

                let strokeColor = '#cbd5e1';
                let markerId = 'arrow-default';
                let strokeWidth = 1.3;

                if (isConnected) {
                  strokeColor = '#0d9488';
                  markerId = 'arrow-prereq';
                  strokeWidth = 2.4;
                } else if (isStruggle) {
                  strokeColor = '#f43f5e';
                  markerId = 'arrow-struggle';
                  strokeWidth = 2;
                } else if (isPrereq) {
                  strokeColor = '#059669';
                  markerId = 'arrow-prereq';
                  strokeWidth = 1.6;
                } else if (isTarget) {
                  strokeColor = '#0284c7';
                  strokeWidth = 1.8;
                }

                // Bezier curve for clean layout
                const dx = tPos.x - sPos.x;
                const dy = tPos.y - sPos.y;
                const cx1 = sPos.x + dx * 0.5;
                const cy1 = sPos.y;
                const cx2 = sPos.x + dx * 0.5;
                const cy2 = tPos.y;
                const pathD = `M ${sPos.x} ${sPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tPos.x} ${tPos.y}`;

                return (
                  <g key={e.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isStruggle ? '4,3' : isPrereq ? '6,3' : undefined}
                      markerEnd={`url(#${markerId})`}
                      className="transition-all duration-200"
                    />
                    {(isConnected || isPrereq || isStruggle) && (
                      <text
                        x={(sPos.x + tPos.x) / 2}
                        y={(sPos.y + tPos.y) / 2 - 4}
                        fill={isStruggle ? '#e11d48' : isConnected ? '#0f766e' : '#64748b'}
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                        className="font-mono bg-white px-1"
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
                const isConnected = connectedNodeIds.has(n.id);
                const config = typeConfig[n.type] || typeConfig.Concept;
                const isStrugglingConcept = n.id === 'concept_1'; // Java Arrays
                const nodeRadius = n.type === 'Course' ? 17 : isSelected ? 15 : 13;

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
                    {/* Ring highlight on active or connected node */}
                    {(isSelected || isConnected) && (
                      <circle
                        r={nodeRadius + 6}
                        fill="none"
                        stroke={isSelected ? '#0d9488' : '#94a3b8'}
                        strokeWidth="2"
                        strokeDasharray={isSelected ? undefined : '3,3'}
                        className={isSelected ? 'animate-pulse' : ''}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={nodeRadius}
                      fill="#ffffff"
                      stroke={isStrugglingConcept ? '#e11d48' : config.stroke}
                      strokeWidth={isSelected ? 3.5 : 2.5}
                      className="transition-all duration-200 group-hover:scale-115 shadow-sm"
                    />

                    {/* Center indicator dot */}
                    <circle
                      r={n.type === 'Course' ? 6 : 4}
                      fill={isStrugglingConcept ? '#e11d48' : config.fill}
                    />

                    {/* Node Text Label */}
                    <text
                      y={nodeRadius + 14}
                      fill={isSelected ? '#0f172a' : '#334155'}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                      className="pointer-events-none select-none tracking-tight"
                    >
                      {n.label.length > 24 ? n.label.substring(0, 22) + '…' : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Clean Legend Overlay */}
          <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-white/95 border border-slate-200/90 text-[10px] space-y-1 shadow-xs">
            <span className="font-bold text-slate-700 block">Academic Ontology:</span>
            <div className="flex flex-wrap items-center gap-3">
              {Object.entries(typeConfig).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.fill }} />
                  <span>{t}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-rose-600" />
                <span>Identified Learning Gap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Node Inspector Drawer */}
      <div className="w-full lg:w-76 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    typeConfig[selectedNode.type]?.bg || ''
                  } ${typeConfig[selectedNode.type]?.text || ''} ${
                    typeConfig[selectedNode.type]?.border || ''
                  }`}
                >
                  {selectedNode.type}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {selectedNode.id}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedNode.label}</h3>
            </div>

            {/* Properties */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attributes
              </span>
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-slate-800 font-mono text-right font-semibold">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Relationships */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connected Links ({connectedEdges.length})
              </span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {connectedEdges.map((e) => {
                  const isOutgoing = e.source === selectedNode.id;
                  const otherId = isOutgoing ? e.target : e.source;
                  const otherNode = nodes.find((n) => n.id === otherId);

                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedNodeId(otherId)}
                      className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-[11px] flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-teal-50 text-[9.5px] font-mono text-teal-800 font-bold border border-teal-200 shrink-0">
                          {e.label}
                        </span>
                        <span className="text-slate-800 font-medium truncate">
                          {otherNode?.label || otherId}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Layers className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700">Select any entity</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Click any Course, Concept, or Student node to inspect its prerequisite learning path and targeted intervention.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 leading-tight">
            Ontology maps prerequisite chains so faculty can address root causes rather than symptoms.
          </p>
        </div>
      </div>
    </div>
  );
};
