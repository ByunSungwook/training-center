import { ObjectId } from 'mongodb';
import type { Document } from '../models/document.js';
import { dispatcher } from './document-event-dispatcher.js';
import { pick } from 'lodash-es';
import { mongodb } from '@/modules/shared/adapters/mongodb.js';

export type DocumentDocument = {
  _id: ObjectId;

  createdAt: Date;
  updatedAt: Date;
};

export const documentCollection = mongodb
  .db()
  .collection<DocumentDocument>('document.documents');

export const toDocument = (
  doc: DocumentDocument,
): Document => ({
  id: doc._id.toString(),

  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  uncommittedEvents: [],
});

export const fromDocument = (
  a: Document,
): DocumentDocument => ({
  _id: new ObjectId(a.id),

  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

export const getDocumentById = async (
  id: string,
): Promise<Document | null> => {
  const doc = await documentCollection.findOne({
    _id: new ObjectId(id),
  });
  return doc !== null
    ? toDocument(doc as DocumentDocument)
    : null;
};

export const getDocumentsByUserId = async (
  accountId: string,
  since: Date,
  until: Date,
): Promise<Document[]> => {
  const docs = await documentCollection
    .find({
      date: {
        $gte: since,
        $lte: until,
      },
      accountId: new ObjectId(accountId),
    })
    .toArray();
  return docs.map((doc) => toDocument(doc));
};

export const findDocuments = async (
  accountId: string,
  since: Date,
  until: Date,
): Promise<Document[]> => {
  const docs = await documentCollection
    .find({
      date: {
        $gte: since,
        $lte: until,
      },
      accountId: new ObjectId(accountId),
    })
    .toArray();
  return docs.map((doc) => toDocument(doc));
};

export const addDocument = async (
  a: Document,
): Promise<void> => {
  await documentCollection.insertOne(fromDocument(a));
  await dispatcher.dispatch(
    ...a.uncommittedEvents.map((event) => ({
      ...event,
      aggregateType: 'document',
      aggregateId: a.id,
    })),
  );
};

export const updateDocument = async (
  a: Document,
): Promise<void> => {
  await documentCollection.updateOne(
    { _id: new ObjectId(a.id) },
    {
      $set: pick(fromDocument(a), [
        'name',
        'updatedAt',
      ]),
    },
  );
  await dispatcher.dispatch(
    ...a.uncommittedEvents.map((event) => ({
      ...event,
      aggregateType: 'document',
      aggregateId: a.id,
    })),
  );
};

export const deleteDocument = async (
  a: Document,
): Promise<void> => {
  await documentCollection.deleteOne({
    _id: new ObjectId(a.id),
  });
  await dispatcher.dispatch(
    ...a.uncommittedEvents.map((event) => ({
      ...event,
      aggregateType: 'document',
      aggregateId: a.id,
    })),
  );
};
