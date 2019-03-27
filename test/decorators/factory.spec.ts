import {InversifyAdapter} from '../../src/container';
import {factory} from '@ziggurat/tiamat';
import {expect} from 'chai';
import 'mocha';

describe('factory', () => {
  let container = new InversifyAdapter();

  class Foo {}
  class Bar {}

  describe('creating singleton object', () => {
    class SingletonFact {
      @factory({key: 'singleton'}) public fact() {
        return new Foo();
      }
    }

    it('should register provider', () => {
      expect(() => container.registerClass(SingletonFact, SingletonFact)).to.not.throw();
    });

    it('should create an instance', () => {
      expect(container.get<Foo>('singleton')).to.be.instanceof(Foo);
    });

    it('should be singleton', () => {
      const foo1 = container.get<Foo>('singleton');
      const foo2 = container.get<Foo>('singleton');

      expect(foo1).to.equal(foo2);
    });
  });

  describe('creating transient objects', () => {
    class TransientFact {
      @factory({key: 'transient', transient: true})
      public factory() {
        return new Foo();
      }
    }

    it('should register provider', () => {
      expect(() => container.registerClass(TransientFact, TransientFact)).to.not.throw();
    });

    it('should create an instance', () => {
      expect(container.get<Foo>('transient')).to.be.instanceof(Foo);
    });

    it('should be transient', () => {
      const foo1 = container.get<Foo>('transient');
      const foo2 = container.get<Foo>('transient');

      expect(foo1).to.not.equal(foo2);
    });
  });

  describe('inheritance', () => {
    class FactBase {
      @factory({key: 'inherited'})
      public factory() {
        return new Foo();
      }
    }

    describe('creating from factory defined in base class', () => {
      class DefaultFact extends FactBase {}

      it('should register provider', () => {
        expect(() => container.registerClass(DefaultFact, DefaultFact)).to.not.throw();
      });

      it('should create an instance', () => {
        expect(container.get('inherited')).to.be.instanceof(Foo);
      });
    });

    describe('creating from overloaded factory', () => {
      class OverloadFact extends FactBase {
        public factory() {
          return new Bar();
        }
      }

      it('should register provider', () => {
        expect(() => container.registerClass(OverloadFact, OverloadFact)).to.not.throw();
      });

      it('should create an overloaded instance', () => {
        expect(container.get('inherited')).to.be.instanceof(Bar);
      });
    });
  });
});
