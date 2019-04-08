import 'reflect-metadata';
import {Container as InversifyContainer, decorate, injectable, interfaces} from 'inversify';
import {Newable} from '@ziggurat/meta';
import {
  Container, ServiceIdentifier, RegistrationPropertyAnnotation
} from '@ziggurat/tiamat';

@injectable()
export class InversifyAdapter implements Container {
  private container = new InversifyContainer({defaultScope: 'Singleton'});

  public get<T>(key: ServiceIdentifier<T>): T {
    return this.container.get<T>(key);
  }

  public registerInstance<T>(key: ServiceIdentifier<T>, instance: T) {
    this.createBinding<T>(key).toConstantValue(instance);
  }

  public registerSingletonFactory<T>(
    key: ServiceIdentifier<T>, fn: (...args: any[]) => T, deps: ServiceIdentifier<any>[] = []
  ) {
    this.createFactoryBinding<T>(key, fn, deps).inSingletonScope();
  }

  public registerTransientFactory<T>(
    key: ServiceIdentifier<T>, fn: (...args: any[]) => T, deps: ServiceIdentifier<any>[] = []
  ) {
    this.createFactoryBinding<T>(key, fn, deps).inTransientScope();
  }

  public registerSingleton<T>(
    key: ServiceIdentifier<T>, ctr: Newable<T>, deps: ServiceIdentifier<any>[] = []
  ) {
    this.createClassBinding(key, ctr, deps).inSingletonScope();
  }

  public registerTransient<T>(
    key: ServiceIdentifier<T>, ctr: Newable<T>, deps: ServiceIdentifier<any>[] = []
  ) {
    this.createClassBinding(key, ctr, deps).inTransientScope();
  }

  public isRegistered<T>(key: ServiceIdentifier<T>): boolean {
    return this.container.isBound(key);
  }

  private createClassBinding<T>(
    key: ServiceIdentifier<T>, ctr: Newable<T>, deps: ServiceIdentifier<any>[]
  ): interfaces.BindingInWhenOnSyntax<T> {
    try {
      decorate(injectable(), ctr);
    } catch (err) {
      // Already injectable, do nothing.
    }
    for (let providerAttr of RegistrationPropertyAnnotation.onClass(ctr, true)) {
      providerAttr.register(this, key);
    }
    return this.createBinding(key).toDynamicValue(() => new ctr(...deps.map(d => this.get(d))));
  }

  private createFactoryBinding<T>(
    key: ServiceIdentifier<any>, fn: (...args: any[]) => T, deps: ServiceIdentifier<any>[]
  ): interfaces.BindingInWhenOnSyntax<T> {
    return this.createBinding<T>(key)
      .toDynamicValue(() => fn(...deps.map(dep => this.get(dep))));
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
