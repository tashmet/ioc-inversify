import {bootstrap, bootstrapDone, component, provider, Container} from '@ziggurat/tiamat';
import {InversifyAdapter} from '../../src/container';
import {expect} from 'chai';
import 'mocha';

describe('component', () => {
  describe('without providers', () => {
    @component()
    class TestComponent {}

    it('should bootstrap an empty component', async () => {
      return expect(
        await bootstrap(new InversifyAdapter(), TestComponent)
      ).to.be.instanceof(TestComponent);
    });
  });

  describe('with providers', () => {
    @provider()
    class TestProvider {}

    @component({
      providers: [TestProvider],
      inject: [TestProvider]
    })
    class TestComponent {
      constructor(
        public testProvider: TestProvider
      ) {}
    }

    it('should register providers', async () => {
      return expect(
        (await bootstrap(new InversifyAdapter(), TestComponent)).testProvider
      ).to.be.instanceOf(TestProvider);
    });
  });

  describe('with definitions', () => {
    @component({
      definitions: {
        'foo': 'bar'
      },
      inject: ['foo']
    })
    class TestComponent {
      constructor(
        public foo: string
      ) {}
    }

    it('should register definitions', async () => {
      return expect(
        (await bootstrap(new InversifyAdapter(), TestComponent)).foo
      ).to.eql('bar');
    });
  });

  describe('bootstrapDone', () => {
    @component({
      inject: ['tiamat.Container']
    })
    class TestComponent {
      constructor(
        public container: Container
      ) {}
    }

    it('should be called when bootstrapping is done', (done) => {
      bootstrap(new InversifyAdapter(), TestComponent, async (container) => {
        bootstrapDone(container, () => done());
      });
    });

    it('should be called if bootstrapping is already done', (done) => {
      bootstrap(new InversifyAdapter(), TestComponent).then(c => {
        bootstrapDone(c.container, () => done());
      });
    });
  });
});
