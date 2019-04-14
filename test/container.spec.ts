import {Container as InversifyContainer} from 'inversify';
import {InversifyAdapter} from '../src/container';
import {expect} from 'chai';
import 'mocha';

describe('InversifyAdapter', () => {
  let container = new InversifyAdapter(new InversifyContainer());

  describe('constant value definition', () => {
    it('should store and retrieve a constant value', () => {
      expect(() => container.registerInstance('test.Constant', 123)).to.not.throw();
      expect(container.get<string>('test.Constant')).to.equal(123);
    });
    it('should override a previous binding', () => {
      expect(() => container.registerInstance('test.Constant', 456)).to.not.throw();
      expect(container.get<string>('test.Constant')).to.equal(456);
    });
  });
});
