import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Trash2,
  Loader2,
  Smile,
  AlertTriangle,
  Pencil,
  Palette
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../context/auth-context';
import supabase from '../utils/supabase';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from '../layout/DashboardLayout';

const TAILWIND_COLORS = {
  'bg-slate-500': '#64748b', 'bg-gray-500': '#6b7280', 'bg-zinc-500': '#71717a', 'bg-neutral-500': '#737373', 'bg-stone-500': '#78716c',
  'bg-red-500': '#ef4444', 'bg-orange-500': '#f97316', 'bg-amber-500': '#f59e0b', 'bg-yellow-500': '#eab308', 'bg-lime-500': '#84cc16',
  'bg-green-500': '#22c55e', 'bg-emerald-500': '#10b981', 'bg-teal-500': '#14b8a6', 'bg-cyan-500': '#06b6d4', 'bg-sky-500': '#0ea5e9',
  'bg-blue-500': '#3b82f6', 'bg-indigo-500': '#6366f1', 'bg-violet-500': '#8b5cf6', 'bg-purple-500': '#a855f7', 'bg-fuchsia-500': '#d946ef',
  'bg-pink-500': '#ec4899', 'bg-rose-500': '#f43f5e',
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getColorDistance = (color1, color2) => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
};

const findNearestTailwindColor = (hex) => {
  const inputRgb = hexToRgb(hex);
  if (!inputRgb) return 'bg-blue-500';

  let minDistance = Infinity;
  let nearestColor = 'bg-blue-500';

  for (const [className, colorHex] of Object.entries(TAILWIND_COLORS)) {
    const colorRgb = hexToRgb(colorHex);
    if (colorRgb) {
      const distance = getColorDistance(inputRgb, colorRgb);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = className;
      }
    }
  }
  return nearestColor;
};

const COLORS = [
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

const CollectionCard = ({ collection, onDelete, onClick, onEdit }) => {
  const colorHex = TAILWIND_COLORS[collection.color] || TAILWIND_COLORS['bg-blue-500'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative h-[240px] rounded-3xl cursor-pointer transition-all duration-500"
    >
      {/* Dynamic Glow Behind */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 blur-2xl"
        style={{ 
          background: `radial-gradient(circle at 80% 20%, ${colorHex}40, transparent 60%)` 
        }}
      />
      
      {/* Main Glass Container */}
      <div className="relative h-full bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-white/10 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Top Color Edge */}
        <div 
          className="absolute top-0 inset-x-0 h-1.5 opacity-80"
          style={{ background: `linear-gradient(90deg, ${colorHex}, transparent)` }}
        />

        {/* Content Wrapper */}
        <div className="flex flex-col h-full p-6 relative z-10">
          
          {/* Header Area */}
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest font-bold text-stone-400">
               {collection.journals ? collection.journals[0]?.count : 0} ITEMS
            </span>

            {/* Actions Slide In */}
            <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0">
               <button 
                onClick={(e) => { e.stopPropagation(); onEdit(collection); }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
               >
                 <Pencil className="w-3.5 h-3.5" />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); onDelete(collection.id); }}
                 className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mb-auto pr-16 relative z-20">
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:underline decoration-2 underline-offset-4 decoration-white/20 transition-all">
              {collection.title}
            </h3>
            <p className="text-xs font-medium text-stone-500 line-clamp-3 leading-relaxed">
              {collection.description || 'No description provided for this collection.'}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex, boxShadow: `0 0 10px ${colorHex}` }} />
             <span className="text-xs text-stone-500 font-mono">
               UPDATED {new Date(collection.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
             </span>
          </div>

        </div>

        {/* Floating Huge Emoji Background */}
        <div 
          className="absolute -bottom-6 -right-6 text-9xl opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none select-none z-0"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.5))' }}
        >
          {collection.icon || <Folder className="w-32 h-32" />}
        </div>
        
        {/* Floating Mini Emoji Foreground (optional, if main one is too subtle) */}
         <div 
          className="absolute top-16 right-6 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl backdrop-blur-md border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
           style={{ 
             background: `linear-gradient(135deg, ${colorHex}20, rgba(255,255,255,0.05))`,
             boxShadow: `0 8px 32px -4px rgba(0,0,0,0.3), inset 0 0 0 1px ${colorHex}30`
           }}
         >
            {collection.icon || <Folder className="w-8 h-8 text-white/50" />}
         </div>

      </div>
    </motion.div>
  );
};

const CollectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', color: 'bg-blue-500', icon: '' });
  const [creating, setCreating] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Delete Alert State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          journals:journals(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const [editingId, setEditingId] = useState(null);

  const handleCreateOrUpdate = async () => {
    if (!newCollection.title.trim()) {
      toast.error('Collection title is required');
      return;
    }

    try {
      setCreating(true);

      const collectionData = {
        title: newCollection.title,
        description: newCollection.description,
        color: newCollection.color,
        icon: newCollection.icon,
        user_id: user.id
      };

      if (editingId) {
        // Update existing collection
        const { data, error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update for immediate feedback (though we fetch full list usually, this is cleaner)
        setCollections(prev => prev.map(c => c.id === editingId ? { ...c, ...data, journals: c.journals } : c));
        toast.success('Collection updated successfully');
      } else {
        // Create new collection
        const { data, error } = await supabase
          .from('collections')
          .insert([collectionData])
          .select()
          .single();

        if (error) throw error;

        setCollections([data, ...collections]);
        toast.success('Collection created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error(editingId ? 'Failed to update collection' : 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewCollection({ title: '', description: '', color: 'bg-blue-500', icon: '' });
    setEditingId(null);
  };

  const handleEditClick = (collection) => {
    setNewCollection({
        title: collection.title,
        description: collection.description || '',
        color: collection.color || 'bg-blue-500',
        icon: collection.icon || ''
    });
    setEditingId(collection.id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setCollections(collections.filter(c => c.id !== deleteId));
      toast.success('Collection deleted');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    } finally {
      setIsDeleteAlertOpen(false);
      setDeleteId(null);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewCollection({ ...newCollection, icon: emojiData.emoji });
    setShowEmojiPicker(false);
  };

  // Find the collection being deleted for the confirmation message
  const collectionToDelete = collections.find(c => c.id === deleteId);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400 tracking-tight">Collections</h1>
            <p className="text-stone-400 text-lg">Curate and organize your digital mind.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setShowEmojiPicker(false);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <button 
                onClick={resetForm}
                className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">New Collection</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a]/95 border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/50 max-h-[85vh] overflow-y-auto sm:max-w-[500px] p-6 gap-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">{editingId ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
                <p className="text-stone-400 text-sm">Customize your collection's appearance.</p>
              </DialogHeader>
              
              <div className="space-y-6">
                
                {/* Icon Selection */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`
                        w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl 
                        border transition-all duration-500 relative overflow-hidden
                        ${newCollection.color.replace('bg-', 'border-')}/30
                        group-hover:scale-105 active:scale-95
                        shadow-2xl
                      `}
                      style={{
                         boxShadow: `0 0 40px -10px ${ TAILWIND_COLORS[newCollection.color] || '#3b82f6' }40`
                      }}
                    >
                      <div className={`absolute inset-0 opacity-20 ${newCollection.color}`} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                      
                      <motion.div
                        key={newCollection.icon || 'default'}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative z-10 drop-shadow-xl"
                      >
                        {newCollection.icon || <Smile className={`w-12 h-12 text-white/80`} />}
                      </motion.div>

                      {/* Hover hint */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]">
                        <Pencil className="w-8 h-8 text-white" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 origin-top"
                        >
                          <div className="relative">
                            <div 
                              className="fixed inset-0 z-[-1]" 
                              onClick={() => setShowEmojiPicker(false)} 
                            />
                            
                            <div 
                              className="rounded-3xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10"
                            >
                              <EmojiPicker 
                                onEmojiClick={onEmojiClick}
                                theme="dark"
                                searchDisabled={false}
                                width={320}
                                height={350}
                                previewConfig={{ showPreview: false }}
                                skinTonesDisabled
                                lazyLoadEmojis
                                style={{
                                    backgroundColor: '#0c0a09',
                                    border: 'none',
                                    '--epr-bg-color': '#0c0a09',
                                    '--epr-category-label-bg-color': '#0c0a09',
                                    '--epr-text-color': '#e7e5e4',
                                    '--epr-picker-border-color': '#292524',
                                    '--epr-search-input-bg-color': '#1c1917',
                                    '--epr-search-input-text-color': '#e7e5e4',
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Name</label>
                    <input 
                      type="text" 
                      value={newCollection.title}
                      onChange={(e) => setNewCollection({...newCollection, title: e.target.value})}
                      placeholder="e.g., Work Projects"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-stone-600 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Description</label>
                    <textarea 
                      value={newCollection.description}
                      onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                      placeholder="What is this collection about?"
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-stone-600 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all resize-none h-24"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Color Theme</label>
                    <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewCollection({...newCollection, color: color.value})}
                          className={`w-9 h-9 rounded-full ${color.value} transition-all duration-300 relative ${newCollection.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                          title={color.name}
                        >
                             {newCollection.color === color.value && (
                                <motion.div layoutId="activeColor" className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                             )}
                        </button>
                      ))}
                      
                      {/* Manual Color Picker */}
                      <label className="relative cursor-pointer group">
                          <input 
                              type="color" 
                              className="absolute opacity-0 w-0 h-0"
                              onChange={(e) => {
                                  const nearest = findNearestTailwindColor(e.target.value);
                                  setNewCollection({...newCollection, color: nearest});
                              }}
                          />
                          <div className={`w-9 h-9 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center transition-all group-hover:border-stone-500 group-hover:bg-stone-800 ${!COLORS.some(c => c.value === newCollection.color) ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`} title="Custom Color">
                              <Palette className="w-4 h-4 text-stone-400 group-hover:text-white" />
                          </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-stone-400 font-medium hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateOrUpdate}
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#0c0a09]/50 border border-white/5 border-dashed rounded-[2rem] backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full bg-stone-900/50 flex items-center justify-center mb-6 shadow-2xl shadow-black">
              <Folder className="w-10 h-10 text-stone-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No collections yet</h3>
            <p className="text-stone-400 max-w-sm text-center mb-8">
              Create your first collection to start organizing your journey.
            </p>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-white hover:bg-stone-800 hover:border-stone-700 transition-all hover:scale-105 active:scale-95 font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Collection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              onClick={() => setIsDialogOpen(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-[#0c0a09] border border-dashed border-stone-800 cursor-pointer hover:border-primary/50 hover:bg-stone-900/40 transition-all min-h-[220px]"
            >
              <div className="w-16 h-16 rounded-full bg-stone-900/50 border border-stone-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:text-primary transition-all duration-300 text-stone-600">
                 <Plus className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-400 group-hover:text-white transition-colors">Create New Collection</h3>
              <p className="text-xs text-stone-600 mt-2 group-hover:text-stone-500">Add a new category for your thoughts</p>
            </motion.div>
            
            {collections.map((collection) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection} 
                onDelete={handleDeleteClick}
                onClick={() => navigate(`/dashboard/collections/${collection.id}`)}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        )}

        {/* Delete Alert Dialog */}
         <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent className="bg-[#050505]/95 border-stone-800 backdrop-blur-xl p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <AlertDialogHeader className="mb-2">
                    <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">Delete Collection?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="text-stone-400 text-sm leading-relaxed">
                    You are about to delete <span className="text-white font-semibold">"{collectionToDelete?.title}"</span>.
                    <br /><br />
                    <span className="block p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-200/80 text-xs">
                      <strong className="text-red-400 block mb-1 uppercase tracking-wider text-[10px] font-bold">Warning: Irreversible Action</strong>
                      This action cannot be undone. All journals, notes, and data associated with this collection will be permanently removed.
                    </span>
                  </AlertDialogDescription>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="bg-stone-900/50 p-4 border-t border-stone-800/50 flex items-center gap-3">
              <AlertDialogCancel className="bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-600 transition-all">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 border border-red-500/50 transition-all hover:scale-105 active:scale-95">
                Delete Collection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  );
};
export default CollectionPage;
