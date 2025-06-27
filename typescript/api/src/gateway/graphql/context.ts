import { authService } from '@/modules/auth/index.js';
import type { Admin, User } from '@/modules/shared/actor.js';
import type { YogaInitialContext } from 'graphql-yoga';

export type Context = {
  actor: User | Admin | null;
};

export async function createContext(
  context: YogaInitialContext,
): Promise<Context> {
  const value = context.request.headers.get('authorization') || '';
  const accessToken = value.replace('Bearer ', '');
  if (!accessToken) return { actor: null };
  const actor = await authService.getActorByAccessToken(
    { type: 'system' },
    { accessToken },
  );
  return { actor };
}
