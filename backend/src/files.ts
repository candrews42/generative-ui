import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import type { CodeSnippet } from '../../shared/types';

// File extensions to include in analysis
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt',
  '.c', '.cpp', '.h', '.hpp',
  '.sql', '.graphql', '.gql',
  '.json', '.yaml', '.yml', '.toml',
  '.md', '.mdx'
]);

// Directories to skip
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  '__pycache__', '.venv', 'venv', 'target',
  'coverage', '.nyc_output', '.cache'
]);

// Max file size to read (100KB)
const MAX_FILE_SIZE = 100 * 1024;

// Max total content size (500KB)
const MAX_TOTAL_SIZE = 500 * 1024;

interface FileInfo {
  path: string;
  relativePath: string;
  content: string;
  extension: string;
}

export async function readCodebaseFiles(basePath: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  let totalSize = 0;

  async function walkDir(dir: string): Promise<void> {
    if (totalSize >= MAX_TOTAL_SIZE) return;

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (totalSize >= MAX_TOTAL_SIZE) break;

        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          if (CODE_EXTENSIONS.has(ext)) {
            try {
              const stats = await stat(fullPath);
              if (stats.size <= MAX_FILE_SIZE && totalSize + stats.size <= MAX_TOTAL_SIZE) {
                const content = await readFile(fullPath, 'utf-8');
                files.push({
                  path: fullPath,
                  relativePath: relative(basePath, fullPath),
                  content,
                  extension: ext
                });
                totalSize += stats.size;
              }
            } catch {
              // Skip files we can't read
            }
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  await walkDir(basePath);
  return files;
}

export async function getCodeSnippet(
  filePath: string,
  startLine: number,
  endLine?: number
): Promise<CodeSnippet> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  const start = Math.max(1, startLine);
  const end = endLine ? Math.min(lines.length, endLine) : Math.min(lines.length, start + 50);

  const snippetLines = lines.slice(start - 1, end);

  const ext = extname(filePath).slice(1);
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'kt': 'kotlin',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'sql': 'sql',
    'graphql': 'graphql',
    'gql': 'graphql',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'mdx': 'markdown'
  };

  return {
    file: filePath,
    content: snippetLines.join('\n'),
    startLine: start,
    endLine: end,
    language: languageMap[ext] || ext
  };
}

export function summarizeFiles(files: FileInfo[]): string {
  const byExtension: Record<string, string[]> = {};

  for (const file of files) {
    if (!byExtension[file.extension]) {
      byExtension[file.extension] = [];
    }
    byExtension[file.extension].push(file.relativePath);
  }

  let summary = `Codebase contains ${files.length} files:\n\n`;

  for (const [ext, paths] of Object.entries(byExtension)) {
    summary += `${ext} files (${paths.length}):\n`;
    for (const path of paths.slice(0, 10)) {
      summary += `  - ${path}\n`;
    }
    if (paths.length > 10) {
      summary += `  ... and ${paths.length - 10} more\n`;
    }
    summary += '\n';
  }

  return summary;
}
