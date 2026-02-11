import React, { useEffect, useMemo, useState } from 'react';
import { Instagram, Send, MessageCircle, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES, Project } from '../types';
import { supabase } from '../lib/supabase';
import CategoryFilter from '../components/CategoryFilter';
import Lightbox from '../components/Lightbox';

const CATEGORY_LABELS = new Map(CATEGORIES.map((c) => [c.slug, c.label]));

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);

      const selectWithViews = 'id, created_at, title, slug, image_url, category_slug, description, views';
      const selectWithoutViews = 'id, created_at, title, slug, image_url, category_slug, description';

      const { data, error } = await supabase
        .from('projects')
        .select(selectWithViews)
        .order('created_at', { ascending: false });

      if (error) {
        const retry = await supabase
          .from('projects')
          .select(selectWithoutViews)
          .order('created_at', { ascending: false });

        if (retry.error) {
          console.error('Error fetching projects:', retry.error);
          setProjects([]);
        } else {
          setProjects(retry.data ?? []);
        }
      } else {
        setProjects(data ?? []);
      }

      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter((p) => p.category_slug === selectedCategory);
  }, [projects, selectedCategory]);

  const incrementView = async (projectId: number) => {
    const { data, error } = await supabase.rpc('increment_project_views', { project_id: projectId });
    if (!error && data !== null) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, views: data as number } : p)));
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    incrementView(project.id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center">
      <Link
        to="/studio"
        className="fixed bottom-6 right-6 p-3 bg-zinc-900/50 hover:bg-zinc-800 backdrop-blur-md rounded-full text-zinc-500 hover:text-white transition-all z-50 border border-zinc-800 pointer-events-auto"
        title="Перейти в админку"
        aria-label="Перейти в админку"
      >
        <Settings size={20} />
      </Link>

      <header className="w-full max-w-2xl px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-800 mb-4 bg-zinc-900">
          <img src="/img/logo.jpg" alt="Abdullah" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Abdullah</h1>
        <p className="text-zinc-500 text-sm mb-6 max-w-xs">
          Визуальный дизайнер, специализация — айдентика брендов и цифровые продукты.
        </p>

        <div className="flex gap-4 mb-8">
          <a href="#" className="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="Instagram">
            <Instagram size={20} />
          </a>
          <a href="#" className="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="Telegram">
            <Send size={20} />
          </a>
          <a href="#" className="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="WhatsApp">
            <MessageCircle size={20} />
          </a>
          <a href="#" className="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="ВКонтакте">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M3.6 6.2C3.2 5 3.8 4 5.1 4h2.2c1 0 1.3.5 1.5 1.1.4 1.3 1.2 3 2.6 4.6.5.5.7.7 1 .7.2 0 .4-.2.4-.9V6.9c0-1 .3-1.5 1.1-1.5h2c.6 0 1 .3 1 .9 0 1-.2 2.3.7 3.4.4.5.6.7.8.7.2 0 .4-.2.8-.7.8-1.2 1.5-2.8 1.8-3.8.2-.6.5-.9 1.3-.9h2.2c1 0 1.4.4 1.1 1.4-.4 1.4-1.8 3.7-3.2 5.4-.6.7-.8 1-.1 1.7.5.6 1.8 1.6 2.7 2.7.6.7.9 1.1.8 1.7-.1.6-.6.9-1.4.9h-2.4c-1 0-1.4-.3-2-1-.6-.8-1.3-1.7-2-2.4-.6-.5-1-.6-1.2-.6-.3 0-.5.2-.5.8v2c0 .9-.3 1.2-1.1 1.2-1.2 0-4.2-.6-6.4-3.1-2.2-2.5-3.7-5.7-4.3-7.3z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="w-full max-w-4xl flex-1 px-4">
        <CategoryFilter categories={CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredProjects.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 pb-20">
                {filteredProjects.map((project) => {
                  const isLogoStyle = project.category_slug === 'logos' || project.category_slug === 'infographics';
                  const aspectClass = project.category_slug === 'infographics' ? 'aspect-[4/5]' : 'aspect-[4/3]';

                  return isLogoStyle ? (
                    <div
                      key={project.id}
                      className={`break-inside-avoid mb-6 group relative w-full ${aspectClass} bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-zinc-800/80 hover:border-zinc-500 transition-all duration-300 shadow-sm block`}
                      onClick={() => handleOpenProject(project)}
                    >
                      <div
                        className={`absolute inset-0 ${
                          project.category_slug === 'infographics' ? 'bg-zinc-900 p-3' : 'bg-white p-6'
                        } flex items-center justify-center transition-opacity duration-300 ease-in-out group-hover:opacity-0 z-10`}
                      >
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-zinc-400 text-xs">Нет фото</span>
                        )}
                      </div>

                      <div className="absolute inset-0 p-5 flex flex-col bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-0">
                        <h3 className="text-base font-bold text-white mb-2 leading-tight">{project.title}</h3>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-auto">
                          {project.description || 'Описание проекта...'}
                        </p>
                        <div className="pt-3 mt-3 flex items-center justify-between border-t border-zinc-800">
                          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
                            {project.category_slug === 'infographics' ? 'Инфографика' : 'Логотип'}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1">👁️ {project.views ?? 0}</span>
                            <span className="flex items-center gap-1">💬 0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={project.id}
                      className="break-inside-avoid mb-6 group flex flex-col cursor-pointer w-full outline-none"
                      onClick={() => handleOpenProject(project)}
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-colors duration-500 ease-out group-hover:border-zinc-700 aspect-[4/5] shadow-lg z-0">
                        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} className="w-full h-full object-contain p-4 transition-all transform-gpu duration-500 ease-out group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">Нет изображения</div>
                        )}
                        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none z-20"></div>
                      </div>
                      <div className="mt-5 flex flex-col items-start px-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2 font-medium transition-colors duration-300 group-hover:text-zinc-400">
                          {CATEGORY_LABELS.get(project.category_slug ?? '') ?? 'Без категории'}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight leading-none group-hover:text-white transition-colors duration-300">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full py-20 text-center text-zinc-500">Проекты в этой категории не найдены.</div>
            )}
          </>
        )}
      </main>

      <footer className="w-full py-8 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} Abdullah Design. Создано с использованием Supabase.
        </p>
      </footer>

      <Lightbox project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}