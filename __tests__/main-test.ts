import 'jest-rdf';
import { DataFactory } from 'n3';
import * as path from 'path';
import deref from 'rdf-dereference-store';
import { DatasetCore } from 'rdf-js';
import { EnrolleeShapeType } from '../ldo/enrollee.shapeTypes';
import { Enrollee } from '../ldo/enrollee.typings';
import {
  datasetFromShape, dereferenceShape, shapeFromDataset, shapeMatches,
} from '../lib';

const { namedNode } = DataFactory;

describe('shapeFromDataset & shapeMatches & datasetFromShape', () => {
  let obj: Enrollee;
  let data: DatasetCore;

  beforeAll(async () => {
    obj = {
      hasGuardian: [{
        '@id': 'http://example.org/bob',
      }],
    };
    data = (await deref(path.join(__dirname, 'data.ttl'), { localFiles: true })).store;
  });

  it('should handle shapeFromDataset', async () => {
    expect(shapeFromDataset(EnrolleeShapeType, data, namedNode('http://example.org/alice'))).toMatchObject<Enrollee>(obj);
  });

  it('should handle shapeFromDataset with a string subject', async () => {
    expect(shapeFromDataset(EnrolleeShapeType, data, 'http://example.org/alice')).toMatchObject<Enrollee>(obj);
  });

  it('should reject shapeFromDataset with a non-conformant subject', async () => {
    expect(() => shapeFromDataset(EnrolleeShapeType, data, namedNode('http://example.org/bob'))).toThrow();
  });

  it('should handle shapeMatches', async () => {
    expect([...shapeMatches(EnrolleeShapeType, data)]).toMatchObject<Enrollee[]>([obj]);
  });

  it('should handle dereferenceShape with a string subject', async () => {
    await expect(dereferenceShape(EnrolleeShapeType, path.join(__dirname, 'data.ttl'), 'http://example.org/alice', { localFiles: true })).resolves.toMatchObject<Enrollee>(obj);
  });

  it('should reject dereferenceShape with a non-conformant subject', async () => {
    await expect(dereferenceShape(EnrolleeShapeType, path.join(__dirname, 'data.ttl'), 'http://example.org/bob', { localFiles: true })).rejects.toThrow();
  });

  it('should handle datasetFromShape', () => {
    obj['@id'] = 'http://example.org/alice';
    expect(datasetFromShape(EnrolleeShapeType, obj)).toBeRdfIsomorphic(data);
  });
});
