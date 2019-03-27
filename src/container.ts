import 'reflect-metadata';
import {getType, Type} from 'reflect-helper';
import {Container as InversifyContainer, decorate, injectable, interfaces} from 'inversify';
import {Newable} from '@ziggurat/meta';
import {
  provider,
  ProviderAnnotation,
  Container,
  ServiceIdentifier,
  ActivationHandler,
  RegistrationPropertyAnnotation
} from '@ziggurat/tiamat';
import {MetadataReader} from './metadata';

@injectable()
export class InversifyAdapter implements Container {
  private activators: ActivationHandler<any>[] = [];
  private middleware: {key: ServiceIdentifier<any>, fn: Function}[] = [];
  private container = new InversifyContainer({defaultScope: 'Singleton'});

  public constructor() {
    this.container.applyCustomMetadataReader(new MetadataReader());
  }

  public get<T>(key: ServiceIdentifier<T>): T {
    return this.container.get<T>(key);
  }

  public registerInstance<T>(
    key: ServiceIdentifier<T>, instance: T, activate?: ActivationHandler<T>)
  {
    this.addActivators(key, this.createBinding<T>(key).toConstantValue(instance),
      activate ? [activate] : []);
  }

  public registerFactory<T>(
    key: ServiceIdentifier<T>, fn: () => T, transient = false, activate?: ActivationHandler<T>)
  {
    const binding = this.createBinding<T>(key).toDynamicValue(fn);

    this.addActivators(key, transient ? binding.inTransientScope() : binding.inSingletonScope(),
      activate ? [activate] : []);
  }

  public registerProvider<T>(ctr: Newable<T>, activate?: ActivationHandler<T>) {
    ProviderAnnotation.onClass(ctr)[0].provide(this, activate);
  }

  public registerClass<T>(
    key: ServiceIdentifier<T>, ctr: Newable<T>, transient = false, activate?: ActivationHandler<T>)
  {
    const type = getType(ctr);
    if (!type.hasAnnotation(ProviderAnnotation)) {
      decorate(provider({key, transient}), ctr);
    }
    try {
      decorate(injectable(), ctr);
    } catch (err) {
      // Do nothing
    }

    let activators: ActivationHandler<T>[] = activate ? [activate] : [];

    function registerPropertyAnnotations(t: Type, container: Container) {
      if (t.name !== 'Object') {
        for (let providerAttr of t.getAnnotations(RegistrationPropertyAnnotation)) {
          providerAttr.register(container, activators, key);
        }
        registerPropertyAnnotations(t.baseType, container);
      }
    }

    registerPropertyAnnotations(type, this);

    const binding = this.createBinding<T>(key).to(ctr);
    this.addActivators(key, transient ? binding.inTransientScope() : binding.inSingletonScope(),
      activators);
  }

  public isRegistered<T>(key: ServiceIdentifier<T>): boolean {
    return this.container.isBound(key);
  }

  public addActivationHandler<T>(handler: ActivationHandler<T>) {
    this.activators.push(handler);
  }

  public addMiddleware<T>(key: ServiceIdentifier<T>, fn: () => void) {
    this.middleware.push({key, fn});
  }

  private createBinding<T>(key: ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    try {
      this.container.unbind(key);
    } catch (e) {
      // Previous binding does not exist, do nothing.
    }
    return this.container.bind<T>(key);
  }

  private addActivators<T>(
    key: ServiceIdentifier<any>,
    binding: interfaces.BindingWhenOnSyntax<T>,
    activators: ActivationHandler<T>[]
  ) {
    binding.onActivation((context, instance) => {
      let result = instance;
      for (let activate of (activators).concat(this.activators)) {
        result = activate(instance, key, this);
      }
      return result;
    });
  }
}
