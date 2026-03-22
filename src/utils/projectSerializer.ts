import type { SavedProject } from '../engine/types';

export function exportProject(project: SavedProject): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_ ]/g, '')}.iotstudio`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<SavedProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as SavedProject;
        if (!data.id || !data.name || !data.boardState || !data.code) {
          reject(new Error('Invalid .iotstudio file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Failed to parse .iotstudio file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
