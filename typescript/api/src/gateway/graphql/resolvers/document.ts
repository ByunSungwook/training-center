import type { Resolvers } from '@/__generated__/resolvers-types.js';
import { adminGuard, authGuard, userGuard } from '../middlewares/auth-guard.js';
import { documentService } from '@/modules/document/index.js';

export const documentResolvers: Resolvers = {
  Query: {
    getDocumentsByTarget: authGuard(async (_, { targetType, targetId }) => {
      const documents = await documentService.list(targetType, targetId);
      return documents.map((document) => ({
        id: document.id,
        authorId: document.state.authorId,
        targetType: document.state.targetType,
        targetId: document.state.targetId,
        content: document.state.content,
        createdAt: document.state.createdAt,
        updatedAt: document.state.updatedAt,
      }));
    }),
    getDocumentsCountByTarget: async (_, { targetType, targetId }) => {
      const result = await documentService.getDocumentsCount(
        targetType,
        targetId,
      );
      return result;
    },
  },
  Mutation: {
    createDocument: userGuard(
      async (_, { targetType, targetId, content }, { actor }) => {
        const document = await documentService.create(
          { type: 'user', accountId: actor.accountId },
          {
            authorId: actor.accountId,
            targetType: targetType,
            targetId: targetId,
            content,
          },
        );
        return {
          id: document.id,
          authorId: document.state.authorId,
          targetType: document.state.targetType,
          targetId: document.state.targetType,
          content: document.state.content,
          createdAt: document.state.createdAt,
          updatedAt: document.state.updatedAt,
        };
      },
    ),
    updateDocument: userGuard(async (_, { id, content }, { actor }) => {
      const document = await documentService.update(
        { type: 'user', accountId: actor.accountId },
        {
          id,
          content,
        },
      );
      return {
        id: document.id,
        authorId: document.state.authorId,
        targetType: document.state.targetType,
        targetId: document.state.targetType,
        content: document.state.content,
        createdAt: document.state.createdAt,
        updatedAt: document.state.updatedAt,
      };
    }),
    deleteDocumentByUser: userGuard(async (_, { id }, { actor }) => {
      const document = await documentService.deleteByUser(
        {
          type: 'user',
          accountId: actor.accountId,
        },
        id,
      );
      return {
        id: document.id,
        authorId: document.state.authorId,
        targetType: document.state.targetType,
        targetId: document.state.targetType,
        content: document.state.content,
        createdAt: document.state.createdAt,
        updatedAt: document.state.updatedAt,
        deletedAt: document.state.deletedAt,
      };
    }),
    deleteDocumentByAdmin: adminGuard(async (_, { id }) => {
      const document = await documentService.deleteByAdmin(
        {
          type: 'admin',
        },
        id,
      );
      return {
        id: document.id,
        authorId: document.state.authorId,
        targetType: document.state.targetType,
        targetId: document.state.targetType,
        content: document.state.content,
        createdAt: document.state.createdAt,
        updatedAt: document.state.updatedAt,
        deletedAt: document.state.deletedAt,
      };
    }),
  },
};
