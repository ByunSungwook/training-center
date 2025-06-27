export type DocumentViewModel = JsonSerializable<{
  id: string;
  type: string;

  createdAt: Date;
  updatedAt: Date;
}>;

export const sortDocumentViewModel = (
  models: DocumentViewModel[],
): DocumentViewModel[] => {
  return models.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });
};

export const formatDocumentViewModel = async (
  document: Document,
): Promise<DocumentViewModel> => {
  return {
    id: document.id,
    type: 'document',
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
};
