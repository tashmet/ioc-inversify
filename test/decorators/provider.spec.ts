import {provider, provide} from '@ziggurat/tiamat';
import {Container as InversifyContainer} from 'inversify';
import {InversifyAdapter} from '../../src/container';
import {expect} from 'chai';
import 'mocha';

describe('provider', () => {
  let container = new InversifyAdapter(new InversifyContainer());

  describe('singleton-scoped provider', () => {
    @provider({
      key: 'test.SingletonProvider'
    })
    class SingletonProvider {}

    it('should register', () => {
      expect(() => {
        provide(container, SingletonProvider);
      }).to.not.throw();
    });

    it('should only have a single instance', () => {
      let instance1 = container.get<SingletonProvider>('test.SingletonProvider');
      let instance2 = container.get<SingletonProvider>('test.SingletonProvider');

      expect(instance1).to.equal(instance2);
    });
  });

  describe('transient-scoped provider', () => {
    @provider({
      key: 'test.TransientProvider',
      transient: true
    })
    class TransientProvider {}

    it('should register', () => {
      expect(() => {
        provide(container, TransientProvider);
      }).to.not.throw();
    });

    it('should return instances for a registered name', () => {
      let instance1 = container.get<TransientProvider>('test.TransientProvider');
      let instance2 = container.get<TransientProvider>('test.TransientProvider');

      expect(instance1).to.not.equal(instance2);
    });
  });
});
