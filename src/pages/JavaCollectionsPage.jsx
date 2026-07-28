import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  AlertCircle,
  FileCode,
  ChevronDown,
  ChevronUp,
  Table,
  X,
  ArrowRight
} from 'lucide-react';
import { JAVA_COLLECTIONS_DATA, CATEGORIES } from '../lib/javaCollectionsData';

const ComplexityBadge = ({ complexity }) => {
  let style = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50';
  if (complexity.includes('O(1)')) {
    style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  } else if (complexity.includes('O(log n)')) {
    style = 'bg-sky-500/10 text-sky-400 border-sky-500/25';
  } else if (complexity.includes('O(n log n)')) {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  } else if (complexity.includes('O(n)')) {
    style = 'bg-orange-500/10 text-orange-400 border-orange-500/25';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${style}`}>
      {complexity}
    </span>
  );
};

const JavaCollectionsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCodeId, setExpandedCodeId] = useState(null);
  const [jumpSelectValue, setJumpSelectValue] = useState('');
  const [isMatrixOpen, setIsMatrixOpen] = useState(true);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCodeExpand = (id) => {
    setExpandedCodeId(prev => prev === id ? null : id);
  };

  const filteredStructures = useMemo(() => {
    return JAVA_COLLECTIONS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesName = item.name.toLowerCase().includes(q);
      const matchesTagline = item.tagline.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesOp = item.operations.some(
        op => op.method.toLowerCase().includes(q) || 
              op.description.toLowerCase().includes(q) || 
              op.timeComplexity.toLowerCase().includes(q)
      );
      const matchesMatrix = item.matrix && (
        item.matrix.add.toLowerCase().includes(q) ||
        item.matrix.get.toLowerCase().includes(q) ||
        item.matrix.delete.toLowerCase().includes(q) ||
        item.matrix.search.toLowerCase().includes(q) ||
        item.matrix.internal.toLowerCase().includes(q)
      );

      return matchesCategory && (matchesName || matchesTagline || matchesDesc || matchesOp || matchesMatrix);
    });
  }, [selectedCategory, searchQuery]);

  const totalOperationsCount = useMemo(() => {
    return JAVA_COLLECTIONS_DATA.reduce((acc, curr) => acc + curr.operations.length, 0);
  }, []);

  const scrollToStructure = (id) => {
    const target = JAVA_COLLECTIONS_DATA.find(d => d.id === id);
    if (target) {
      if (selectedCategory !== 'all' && selectedCategory !== target.category) {
        setSelectedCategory('all');
      }
      setSearchQuery('');
    }

    setJumpSelectValue(id);

    setTimeout(() => {
      const el = document.getElementById(`ds-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => setJumpSelectValue(''), 1000);
    }, 60);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-3 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto font-sans pb-24">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Java Collections Guide
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
              Reference Sheet
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Master comparison matrix and detailed method reference for Java Data Structures & Collections.
          </p>
        </div>

        {/* Responsive Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-[#0e0e11] border border-zinc-800 rounded-lg flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Structures:</span>
            <span className="font-semibold text-white">{JAVA_COLLECTIONS_DATA.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#0e0e11] border border-zinc-800 rounded-lg flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Operations:</span>
            <span className="font-semibold text-white">{totalOperationsCount}+</span>
          </div>
        </div>
      </div>

      {/* Responsive Filter & Search Control Panel */}
      <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 shadow-sm">
        {/* Search Box + Quick Jump */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search methods (e.g. add, put, contains), complexity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Jump Dropdown */}
          <div className="relative sm:w-64 shrink-0">
            <select
              value={jumpSelectValue}
              onChange={(e) => {
                if (e.target.value) {
                  scrollToStructure(e.target.value);
                }
              }}
              className="w-full appearance-none px-3.5 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer pr-8"
            >
              <option value="">Jump to Collection...</option>
              {JAVA_COLLECTIONS_DATA.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.interface})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-1 border-t border-zinc-800/60 pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                    : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* MASTER COMPARISON MATRIX TABLE */}
      <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => setIsMatrixOpen(prev => !prev)}
          className="p-3.5 sm:p-4 border-b border-zinc-800/80 bg-[#121216] flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-violet-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Master Comparison Matrix
            </h2>
            <span className="text-[11px] text-zinc-500 hidden md:inline">(Click any row to jump to details)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 sm:hidden flex items-center gap-1">
              Scroll right <ArrowRight className="w-3 h-3" />
            </span>
            <button className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
              {isMatrixOpen ? 'Collapse' : 'Expand'}
              {isMatrixOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMatrixOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-x-auto custom-scrollbar"
            >
              <table className="w-full text-left border-collapse text-xs min-w-[1050px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#09090b] text-zinc-400 font-mono text-[11px]">
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap min-w-[160px]">Java Collection</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap min-w-[120px]">Interface / Type</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap min-w-[150px]">Internal Structure</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Add / Insert</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Get / Access</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Delete / Remove</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Search / Check</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Is Empty</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Size / Length</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Duplicates & Nulls</th>
                    <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredStructures.map((ds) => (
                    <tr 
                      key={ds.id}
                      onClick={() => scrollToStructure(ds.id)}
                      className="hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-white group-hover:text-violet-300 transition-colors text-xs sm:text-sm">
                        {ds.name}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap bg-zinc-950/20">
                        <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                          {ds.interface}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-xs text-zinc-300 whitespace-nowrap font-mono">
                        {ds.matrix?.internal || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-emerald-400 whitespace-nowrap bg-zinc-950/20">
                        {ds.matrix?.add || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-sky-300 whitespace-nowrap">
                        {ds.matrix?.get || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-rose-300 whitespace-nowrap bg-zinc-950/20">
                        {ds.matrix?.delete || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-violet-300 whitespace-nowrap">
                        {ds.matrix?.search || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-zinc-400 whitespace-nowrap bg-zinc-950/20">
                        {ds.matrix?.isEmpty || '-'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-amber-300 whitespace-nowrap">
                        {ds.matrix?.size || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-[11px] text-zinc-400 whitespace-nowrap bg-zinc-950/20">
                        {ds.matrix?.duplicatesAndNulls || '-'}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-zinc-300">
                          {ds.matrix?.complexity || ds.overallComplexity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Detailed Structures Grid */}
      {filteredStructures.length === 0 ? (
        <div className="text-center py-16 bg-[#0e0e11] rounded-xl border border-zinc-800/80 space-y-3">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-300">No matching collections found</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search terms or category filter.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {filteredStructures.map((ds) => (
            <div
              key={ds.id}
              id={`ds-${ds.id}`}
              className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm scroll-mt-24"
            >
              {/* Structure Header */}
              <div className="p-3.5 sm:p-5 border-b border-zinc-800/80 bg-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                      {ds.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                      {ds.interface}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {ds.package}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">{ds.tagline}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="px-2.5 py-1 bg-[#09090b] rounded border border-zinc-800 text-zinc-300 font-mono text-[11px] truncate max-w-[200px] sm:max-w-none">
                    {ds.overallComplexity}
                  </div>
                  <button
                    onClick={() => toggleCodeExpand(ds.id)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700/80 transition-colors cursor-pointer flex items-center gap-1 font-medium text-xs shrink-0"
                  >
                    <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                    {expandedCodeId === ds.id ? 'Hide Code' : 'View Code'}
                    {expandedCodeId === ds.id ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="px-3.5 py-2.5 sm:px-5 bg-[#0a0a0c] border-b border-zinc-800/60 text-xs text-zinc-400 leading-relaxed">
                {ds.description}
              </div>

              {/* Code Snippet Container (Expandable) */}
              <AnimatePresence>
                {expandedCodeId === ds.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-zinc-800 bg-[#09090b] p-3.5 sm:p-5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-violet-400" /> {ds.name} Implementation Code
                      </span>
                      <button
                        onClick={() => handleCopy(ds.codeSnippet, `code-${ds.id}`)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === `code-${ds.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 sm:p-4 bg-[#0c0c0e] border border-zinc-800/80 rounded-lg overflow-x-auto font-mono text-[11px] sm:text-xs text-zinc-200 leading-relaxed custom-scrollbar">
                      <code>{ds.codeSnippet}</code>
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Operations Table */}
              <div className="p-3.5 sm:p-5 space-y-3">
                <div className="overflow-x-auto custom-scrollbar rounded-lg border border-zinc-800/80 bg-[#09090b]">
                  <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#121216] text-zinc-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3 font-semibold">Method</th>
                        <th className="py-2.5 px-3 font-semibold">Time Complexity</th>
                        <th className="py-2.5 px-3 font-semibold">Space</th>
                        <th className="py-2.5 px-3 font-semibold">Description & Usage</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {ds.operations.map((op, opIdx) => {
                        const copyKey = `${ds.id}-op-${opIdx}`;
                        const isCopied = copiedId === copyKey;
                        return (
                          <tr key={opIdx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-violet-300 whitespace-nowrap">
                              {op.method}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <ComplexityBadge complexity={op.timeComplexity} />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-zinc-400 whitespace-nowrap">
                              {op.spaceComplexity}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-300 max-w-md leading-relaxed">
                              <span>{op.description}</span>
                              {op.example && (
                                <code className="block mt-1 text-[11px] font-mono text-emerald-400 bg-[#121216] px-2 py-0.5 rounded border border-zinc-800/80 w-fit">
                                  {op.example}
                                </code>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleCopy(op.example || op.method, copyKey)}
                                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                                title="Copy snippet"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Minimal Pitfalls / Notes */}
                {ds.pitfalls && ds.pitfalls.length > 0 && (
                  <div className="p-3 bg-amber-500/[0.03] border border-amber-500/15 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium font-mono text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Interview Tips & Pitfalls
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-zinc-400 pl-1 text-[11px] leading-relaxed">
                      {ds.pitfalls.map((pitfall, pIdx) => (
                        <li key={pIdx}>{pitfall}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JavaCollectionsPage;
