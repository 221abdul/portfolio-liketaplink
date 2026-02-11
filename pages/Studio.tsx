import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, FileText, Image, Search, Plus, ArrowLeft, LogOut, MoreVertical, Pencil, Trash } from 'lucide-react';
import { CATEGORIES, Project } from '../types';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'magomedow58426@gmail.com';

export default function Studio() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]?.slug ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-menu]') || target.closest('[data-menu-button]')) return;
      setOpenMenuId(null);
    };

    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, created_at, title, slug, image_url, category_slug, description')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load projects error:', error);
      setProjects([]);
      return;
    }

    setProjects(data ?? []);
  };

  useEffect(() => {
    if (session) {
      loadProjects();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);
    if (error) {
      setError('Неверный email или пароль');
      return;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setCategory(CATEGORIES[0]?.slug ?? '');
    setImageUrl('');
    setDescription('');
    setEditingProject(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (project: Project) => {
    setTitle(project.title);
    setSlug(project.slug);
    setCategory(project.category_slug ?? CATEGORIES[0]?.slug ?? '');
    setImageUrl(project.image_url ?? '');
    setDescription(project.description ?? '');
    setEditingProject(project);
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !slug.trim()) {
      setError('Заполните название и slug');
      return;
    }

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          title: title.trim(),
          slug: slug.trim(),
          image_url: imageUrl.trim() || null,
          category_slug: category || null,
          description: description.trim() || null
        })
        .eq('id', editingProject.id);

      if (error) {
        setError('Ошибка обновления проекта');
        return;
      }
    } else {
      const { error } = await supabase.from('projects').insert({
        title: title.trim(),
        slug: slug.trim(),
        image_url: imageUrl.trim() || null,
        category_slug: category || null,
        description: description.trim() || null
      });

      if (error) {
        setError('Ошибка создания проекта');
        return;
      }
    }

    resetForm();
    setShowCreate(false);
    await loadProjects();
  };

  const handleCancel = () => {
    resetForm();
    setShowCreate(false);
  };

  const handleDelete = async (project: Project) => {
    const ok = window.confirm(`Удалить проект «${project.title}»?`);
    if (!ok) return;

    setDeletingId(project.id);
    setError('');

    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      setError('Ошибка удаления проекта');
      setDeletingId(null);
      return;
    }

    if (editingProject?.id === project.id) {
      resetForm();
      setShowCreate(false);
    }

    await loadProjects();
    setDeletingId(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });

    if (uploadError) {
      setError(`Ошибка загрузки изображения: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.trim().toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString('ru-RU');
    } catch {
      return '';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img src="/img/logo.jpg" alt="Abdullah" className="w-6 h-6 rounded-sm object-cover" />
              <span className="font-bold text-white tracking-tight">Abdullah</span>
            </div>
            <Link to="/" className="text-zinc-500 hover:text-white transition-colors" title="Назад на сайт">
              <ArrowLeft size={18} />
            </Link>
          </div>

          <h1 className="text-lg font-semibold text-white mb-2">Вход в студию</h1>
          <p className="text-sm text-zinc-400 mb-4">Введите пароль администратора для доступа.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
              autoFocus
            />
            {error ? <div className="text-xs text-red-400">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-100 text-zinc-950 py-2 rounded-md text-sm font-semibold hover:bg-white transition-colors disabled:opacity-60"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-300 font-sans">
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/img/logo.jpg" alt="Abdullah" className="w-6 h-6 rounded-sm object-cover" />
            <span className="font-bold text-white tracking-tight">Abdullah</span>
          </div>
          <Link to="/" className="text-zinc-500 hover:text-white transition-colors" title="Назад на сайт">
            <ArrowLeft size={18} />
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <div className="text-[11px] font-bold text-zinc-600 uppercase px-3 py-2">Контент</div>
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-zinc-800 text-white rounded-md text-sm">
            <LayoutGrid size={16} />
            <span>Проекты</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-md text-sm transition-colors">
            <FileText size={16} />
            <span>Категории</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-md text-sm transition-colors">
            <Image size={16} />
            <span>Медиа</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">A</div>
          <div className="flex-1 text-xs">
            <div className="text-white font-medium">Abdullah</div>
            <div className="text-zinc-500">Администратор</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-zinc-600 hover:text-red-400 transition-colors"
            title="Выйти"
            aria-label="Выйти"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-zinc-900">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-semibold text-white">Проекты</h2>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Поиск..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>
          <button
            className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-white transition-colors"
            onClick={() => (showCreate ? setShowCreate(false) : openCreate())}
          >
            <Plus size={14} />
            <span>{showCreate ? 'Скрыть' : 'Создать проект'}</span>
          </button>
        </header>

        {showCreate ? (
          <div className="border-b border-zinc-800 bg-zinc-950/60 px-6 py-4">
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <select
                className="bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*,.heic,.heif,.avif,.webp"
                  className="bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="text-[11px] text-zinc-500">
                  {uploading ? 'Загрузка изображения…' : imageUrl ? 'Изображение загружено' : 'Выберите файл'}
                </div>
              </div>
              <textarea
                className="bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-zinc-600 md:col-span-2 min-h-[80px]"
                placeholder="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="md:col-span-2 flex items-center justify-between">
                {error ? <div className="text-xs text-red-400">{error}</div> : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="bg-zinc-800 text-zinc-200 px-3 py-2 rounded-md text-xs font-semibold hover:bg-zinc-700 transition-colors"
                    onClick={handleCancel}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-md text-xs font-bold hover:bg-white transition-colors"
                    disabled={uploading}
                  >
                    {editingProject ? 'Обновить' : 'Создать'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : null}

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-600 transition-colors"
                title="Проект"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-900">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">Нет изображения</div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      data-menu-button
                      className="p-1 bg-zinc-950/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === project.id ? null : project.id));
                      }}
                      title="Действия"
                      aria-label="Действия"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {openMenuId === project.id ? (
                      <div
                        data-menu
                        className="absolute right-0 top-8 z-20 w-36 rounded-md border border-zinc-800 bg-zinc-950 shadow-lg"
                      >
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            openEdit(project);
                          }}
                        >
                          <Pencil size={14} />
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-zinc-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            handleDelete(project);
                          }}
                          disabled={deletingId === project.id}
                        >
                          <Trash size={14} />
                          Удалить
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-white mb-1 truncate">{project.title}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase">
                      {project.category_slug ?? 'Без категории'}
                    </span>
                    <span className="text-[10px] text-zinc-600">{formatDate(project.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              className="border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-all min-h-[180px]"
              onClick={openCreate}
            >
              <Plus size={32} />
              <span className="text-xs font-medium uppercase tracking-widest">Новый проект</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}