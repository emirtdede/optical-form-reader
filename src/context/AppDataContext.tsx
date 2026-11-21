import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearSessions, listSessions, putSession, putStudentResult, removeSession } from '../storage/database';
import type { ExamSession, StudentResult } from '../types';

interface AppDataValue {
  sessions: ExamSession[];
  loading: boolean;
  storageError: string | null;
  refresh: () => Promise<void>;
  saveSession: (session: ExamSession) => Promise<void>;
  saveStudentResult: (sessionId: string, result: StudentResult, updatedAt: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

const TEST_SESSION_ID_PATTERN =
  /^(sess-b\d+|sess-\d+|sess-restore-\d+|sess-zip-test|clear-test|job-alpha|cycle-\d+|sess-seq-\d+|job-step-\d+|schema-\d+|test-.*|mock-.*|demo-.*|sample-.*)$/i;

export function isTestOrSeedSession(session: ExamSession): boolean {
  if (TEST_SESSION_ID_PATTERN.test(session.id.trim())) return true;
  const titleLower = (session.title || '').trim().toLowerCase();
  return (
    titleLower === 'test session' ||
    titleLower === 'mock session' ||
    titleLower === 'sample session'
  );
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const all = await listSessions();
      const staleTestSessions = all.filter(isTestOrSeedSession);
      if (staleTestSessions.length > 0) {
        await Promise.all(staleTestSessions.map((s) => removeSession(s.id).catch(() => {})));
      }
      const clean = staleTestSessions.length > 0 ? all.filter((s) => !isTestOrSeedSession(s)) : all;
      setSessions(clean);
      setStorageError(null);
    } catch {
      setStorageError('Yerel kayıt alanına erişilemedi. Tarayıcı gizlilik veya depolama ayarlarını kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSession = useCallback(async (session: ExamSession) => {
    await putSession(session);
    await refresh();
  }, [refresh]);

  const saveStudentResult = useCallback(async (sessionId: string, result: StudentResult, updatedAt: string) => {
    await putStudentResult(sessionId, result, updatedAt);
    await refresh();
  }, [refresh]);

  const deleteSession = useCallback(async (id: string) => {
    await removeSession(id);
    await refresh();
  }, [refresh]);

  const deleteAll = useCallback(async () => {
    await clearSessions();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ sessions, loading, storageError, refresh, saveSession, saveStudentResult, deleteSession, deleteAll }),
    [sessions, loading, storageError, refresh, saveSession, saveStudentResult, deleteSession, deleteAll],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData, AppDataProvider içinde kullanılmalıdır.');
  return context;
}
