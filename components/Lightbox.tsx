import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface LightboxProps {
  project: Project | null;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ project, onClose }) => {
  if (!project || !project.image_url) return null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow || 'unset';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <button
        className="fixed top-6 right-6 z-[60] text-white bg-zinc-800/70 p-2.5 rounded-full hover:bg-zinc-700 backdrop-blur-md transition-all"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-sm transition-all animate-in fade-in"
        onClick={onClose}
      >
        <div className="min-h-screen flex flex-col items-center py-12 md:py-24 px-4 md:px-8">
          <div
            className="relative w-full max-w-5xl flex flex-col bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-zinc-950 flex justify-center items-center">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>

            <div className="w-full px-6 py-10 md:px-16 md:py-20 text-left bg-zinc-950">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">{project.title}</h2>
                {project.description && (
                  <p className="text-base md:text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lightbox;
