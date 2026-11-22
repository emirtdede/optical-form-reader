export const APP_ID: string;
export const APP_NAME: string;
export const APP_VERSION: string;
export const PUBLISHER_NAME: string;
export const BUILTIN_TEMPLATES: ReadonlyArray<{
  id: string;
  name: string;
  questionCount: number;
  choiceCount: number;
  choices: string[];
  sectionsCount: number;
  studentIdDigits: number;
  supportedBooklets: string[];
  category: string;
  description: string;
}>;
export function executeHeadlessCommand(
  argvOrParsed: string[] | Record<string, unknown>,
  options?: { dataDir?: string },
): Record<string, any>;
export function loadHeadlessStore(customDir?: string): Record<string, any>;
export function saveHeadlessStore(
  store: Record<string, any>,
  customDir?: string,
): Record<string, any>;
