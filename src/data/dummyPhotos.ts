// Dummy photos para demonstração do sistema de upload
export const dummyPhotos = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574774045138-2a9b1b1f9d63?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1592928302636-c83cf1e6415c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
];

// Função para obter fotos dummy para uma tarefa
export function getDummyPhotosForTask(taskId: string, maxPhotos: number = 3): string[] {
  // Usar ID da tarefa como seed para sempre retornar as mesmas fotos
  const seed = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const numPhotos = (seed % maxPhotos) + 1; // 1 a maxPhotos fotos
  
  const selectedPhotos: string[] = [];
  for (let i = 0; i < numPhotos; i++) {
    const photoIndex = (seed + i) % dummyPhotos.length;
    selectedPhotos.push(dummyPhotos[photoIndex]);
  }
  
  return selectedPhotos;
}

// Simular fotos para tarefas concluídas (apenas essas terão fotos)
export function shouldTaskHavePhotos(taskStatus: string, taskId: string): boolean {
  if (taskStatus !== 'concluida') return false;
  
  // 70% das tarefas concluídas terão fotos
  const seed = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (seed % 10) < 7;
} 