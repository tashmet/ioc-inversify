import 'reflect-metadata';
import {getType, Type} from 'reflect-helper';
import {Container as InversifyContainer, decorate, injectable, interfaces} from 'inversify';
import {Newable} from '@ziggurat/meta';
import {
  provider,
  ProviderAnnotation,
  Container,
  ServiceIdentifier,
  RegistrationPropertyAnnotation
} from '@ziggurat/tiamat';
import {MetadataReader} from './metadata';

@injectable()
export class InversifyAdapter implements Container {
  private container = new InversifyContainer({defaultScope: 'Singleton'});

  public constructor() {
    this.container.applyCustomMetadataReader(new MetadataReader());
  }

  public get<T>(key: ServiceIdentifier<T>): T {
    return this.container.get<T>(key);
  }

  public registerInstance<T>(key: ServiceIdentifier<T>, instance: T) {
    this.createBinding<T>(key).toConstantValue(instance);
  }

  public registerFactory<T>(key: ServiceIdentifier<T>, fn: () => T, transient = false) {
    if (transient) {
      this.createBinding<T>(key).toDynamicValue(fn).inTransientScope();
    } else {
      this.createBinding<T>(key).toDynamicValue(fn).inSingletonScope();
    }
  }

  public registerProvider<T>(ctr: Newable<T>) {
    ProviderAnnotation.onClass(ctr)[0].provide(this);
  }

  public registerClass<T>(key: ServiceIdentifier<T>, ctr: Newable<T>, transient = false) {
    const type = getType(ctr);
    if (!type.hasAnnotation(ProviderAnnotation)) {
      decorate(provider({key, transient}), ctr);
    }
    try {
      decorate(injectable(), ctr);
    } catch (err) {
      // Do nothing
    }

    function registerPropertyAnnotations(t: Type, container: Container) {
      if (t.name !== 'Object') {
        for (let providerAttr of t.getAnnotations(RegistrationPropertyAnnotation)) {
          providerAttr.register(container, key);
        }
        registerPropertyAnnotations(t.baseType, container);
      }
    }

    registerPropertyAnnotations(type, this);

    if (transient) {
      this.createBinding<T>(key).to(ctr).inTransientScope();
    } else {
      this.createBinding<T>(key).to(ctr).inSingletonScope();
    }
  }

  public isRegistered<T>(key: ServiceIdentifier<T>): boolean {
    return this.container.isBound(key);
  }

  private createBinding<T>(key: ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    try {
      this.container.unbind(key);
    } catch (e) {
      // Previous binding does not exist, do nothing.
    }
    return this.container.bind<T>(key);
  }
}
