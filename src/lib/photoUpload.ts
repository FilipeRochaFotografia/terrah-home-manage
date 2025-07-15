import { supabase } from './supabaseClient';

// Função para gerar UUID simples
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validação de tipos de arquivo permitidos
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Use: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { isValid: true };
}

/**
 * Redimensiona e comprime uma imagem
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novo tamanho mantendo proporção
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob comprimido
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erro ao comprimir imagem'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Faz upload de uma única foto para o Supabase Storage
 */
export async function uploadSinglePhoto(
  file: File, 
  tarefaId: string,
  compress: boolean = true
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Comprimir se solicitado
    let fileToUpload: File | Blob = file;
    if (compress) {
      fileToUpload = await compressImage(file);
    }

    // Gerar nome único do arquivo
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${generateUUID()}.${fileExtension}`;
    const filePath = `${tarefaId}/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('fotosapp')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('row-level security')) {
        return { 
          success: false, 
          error: 'Erro de permissão. Verifique se você está logado.' 
        };
      }
      
      if (error.message.includes('Bucket not found')) {
        return { 
          success: false, 
          error: 'Configuração de storage não encontrada. Contate o administrador.' 
        };
      }

      return { 
        success: false, 
        error: `Erro no upload: ${error.message}` 
      };
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('fotosapp')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return { 
        success: false, 
        error: 'Erro ao gerar URL da imagem' 
      };
    }

    return { 
      success: true, 
      url: publicUrlData.publicUrl 
    };

  } catch (error) {
    console.error('Erro no upload de foto:', error);
    return { 
      success: false, 
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
}

/**
 * Faz upload de múltiplas fotos
 */
export async function uploadMultiplePhotos(
  files: File[],
  tarefaId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ 
  success: boolean; 
  urls: string[]; 
  errors: string[]; 
  totalUploaded: number 
}> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    
    const result = await uploadSinglePhoto(files[i], tarefaId);
    
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || `Erro no arquivo ${i + 1}`);
    }
  }

  return {
    success: urls.length > 0,
    urls,
    errors,
    totalUploaded: urls.length
  };
}

/**
 * Remove uma foto do storage
 */
export async function deletePhoto(photoUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extrair caminho do arquivo da URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const tarefaId = urlParts[urlParts.length - 2];
    const filePath = `${tarefaId}/${fileName}`;

    const { error } = await supabase.storage
      .from('fotosapp')
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao deletar foto' 
    };
  }
}

/**
 * Verifica se o bucket existe e está acessível
 */
export async function checkStorageHealth(): Promise<{ 
  isHealthy: boolean; 
  error?: string;
  bucketExists?: boolean;
}> {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { 
        isHealthy: false, 
        error: 'Variáveis de ambiente do Supabase não configuradas' 
      };
    }

    // Tentar listar buckets com timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na verificação do storage')), 5000)
    );

    const listBucketsPromise = supabase.storage.listBuckets();
    
    const { data: buckets, error: bucketsError } = await Promise.race([
      listBucketsPromise,
      timeoutPromise
    ]) as any;
    
    if (bucketsError) {
      return { 
        isHealthy: false, 
        error: `Erro ao acessar storage: ${bucketsError.message}` 
      };
    }

    // Verificar se buckets é válido
    if (!Array.isArray(buckets)) {
      return { 
        isHealthy: false, 
        error: 'Resposta inválida do storage' 
      };
    }

    // Verificar se o bucket 'fotosapp' existe
    const fotosappBucket = buckets.find(bucket => bucket && bucket.name === 'fotosapp');
    
    if (!fotosappBucket) {
      return { 
        isHealthy: false, 
        bucketExists: false,
        error: 'Bucket "fotosapp" não encontrado' 
      };
    }

    return { 
      isHealthy: true, 
      bucketExists: true 
    };

  } catch (error) {
    console.error('Erro na verificação de storage:', error);
    
    // Tratamento específico para erros de parsing JSON
    if (error instanceof Error && error.message.includes('JSON')) {
      return { 
        isHealthy: false, 
        error: 'Erro de comunicação com storage - resposta inválida' 
      };
    }
    
    return { 
      isHealthy: false, 
      error: error instanceof Error ? error.message : 'Erro de conexão' 
    };
  }
} 