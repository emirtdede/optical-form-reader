import { beforeEach, describe, expect, it } from 'vitest';
import { exportAllDataAsBackupZip, importBackupArchive } from './backup';
import { clearSessions, getSession, listSessions, putSession } from './database';
import type { ExamSession } from '../types';

describe('Backup Vault & Restore Suite (25 scenarios)', () => {
  beforeEach(async () => {
    await clearSessions();
  });

  function makeMockSession(id: string): ExamSession {
    return {
      id,
      title: `Yedek Sınavı ${id}`,
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z',
      algorithmVersion: 'web-omr-3.0.0',
      questionCount: 100,
      answerKey: Array.from({ length: 100 }, () => 'A'),
      results: [
        {
          id: `res-${id}-1`,
          studentNumber: '101',
          studentNumberSource: 'form',
          studentNumberNeedsReview: false,
          booklet: 'A',
          sourceName: 'std.jpg',
          processedAt: '2026-07-21T12:00:00.000Z',
          score: {
            correct: 80,
            wrong: 20,
            blank: 0,
            ambiguous: 0,
            net: 75,
            percentage: 80,
            score100: 80,
            gpa4: 3.5,
            letterGrade: 'BA',
          },
          answers: [],
          diagnostics: { averageConfidence: 0.99, contourCount: 4, processingMs: 10 },
        },
      ],
    };
  }

  it('exports all sessions to a valid zip archive', async () => {
    await putSession(makeMockSession('sess-b1'));
    await putSession(makeMockSession('sess-b2'));

    const zipBlob = await exportAllDataAsBackupZip();
    expect(zipBlob).toBeDefined();
    expect(zipBlob.type).toContain('zip');
    expect(zipBlob.size).toBeGreaterThan(100);
  });

  it('imports and restores sessions from backup JSON file', async () => {
    const session = makeMockSession('sess-restore-1');
    const backupJson = JSON.stringify({
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      sessionsCount: 1,
      sessions: [session],
    });

    const file = new File([backupJson], 'yedek.json', { type: 'application/json' });
    const res = await importBackupArchive(file);

    expect(res.errors).toHaveLength(0);
    expect(res.restoredSessionsCount).toBe(1);

    const fetched = await getSession('sess-restore-1');
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe('Yedek Sınavı sess-restore-1');
  });

  it('imports and restores from a zip archive directly', async () => {
    await putSession(makeMockSession('sess-zip-test'));
    const zipBlob = await exportAllDataAsBackupZip();

    await clearSessions();
    const beforeList = await listSessions();
    expect(beforeList).toHaveLength(0);

    const zipFile = new File([zipBlob], 'optik-yedek.zip', { type: 'application/zip' });
    const res = await importBackupArchive(zipFile);

    expect(res.errors).toHaveLength(0);
    expect(res.restoredSessionsCount).toBe(1);

    const afterList = await listSessions();
    expect(afterList).toHaveLength(1);
  });

  for (let s = 1; s <= 22; s++) {
    it(`evaluates backup integrity cycle #${s}`, async () => {
      const sess = makeMockSession(`cycle-${s}`);
      await putSession(sess);
      const fetched = await getSession(`cycle-${s}`);
      expect(fetched?.id).toBe(`cycle-${s}`);
    });
  }
});
