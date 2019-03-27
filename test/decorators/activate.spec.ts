import {InversifyAdapter} from '../../src/container';
import {activate} from '@ziggurat/tiamat';
import {expect} from 'chai';
import 'mocha';

describe('activate', () => {
  let container = new InversifyAdapter();

  interface Config {
    active: boolean;
  }

  class Foo {
    public activeByConstructor = false;
    public activeByID = false;
  }

  class Bar {
    public activatedObjects: Foo[] = [];

    @activate(Foo)
    private activateClassByConstructor(foo: Foo): Foo {
      this.activatedObjects.push(foo);
      foo.activeByConstructor = true;
      return foo;
    }

    @activate('test.Foo')
    private activateClassByKey(foo: Foo): Foo {
      foo.activeByID = true;
      return foo;
    }

    @activate('test.Config')
    private activateInstanceByKey(conf: Config) {
      conf.active = true;
      return conf;
    }
  }

  it('should register classes and instances', () => {
    expect(() => container.registerClass('test.Foo', Foo)).to.not.throw();
    expect(() => container.registerClass('test.Bar', Bar)).to.not.throw();
    expect(() => container.registerInstance('test.Config', {active: false})).to.not.throw();
    expect(() => container.registerInstance('test.Config2', {active: false})).to.not.throw();
  });

  it('should activate a class instance by constructor', () => {
    expect(container.get<Foo>('test.Foo').activeByConstructor).to.be.true;
  });

  it('should activate a class instance by ID', () => {
    expect(container.get<Foo>('test.Foo').activeByID).to.be.true;
  });

  it('should activate an interface instance by ID', () => {
    expect(container.get<Config>('test.Config').active).to.be.true;
  });

  it('should modify the class with activate decorator', () => {
    expect(container.get<Bar>('test.Bar').activatedObjects).to.have.lengthOf(1);
  });
});
