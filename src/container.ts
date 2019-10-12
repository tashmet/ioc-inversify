import {Container as InversifyContainer, injectable} from 'inversify';
import {AbstractContainer, ServiceIdentifier, Resolver} from '@ziggurat/tiamat';

@injectable()
export class InversifyAdapter extends AbstractContainer {
  constructor(
    private container: InversifyContainer
  ) { super(); }

  public registerResolver<T>(key: ServiceIdentifier<T>, resolver: Resolver<T>) {
    try {
      this.container.unbind(key);
    } catch (e) {
      // Previous binding does not exist, do nothing.
    }
    this.container.bind(key).toDynamicValue(() => resolver.resolve(this)).inTransientScope();
  }

  public isRegistered<T>(key: ServiceIdentifier<T>): boolean {
    return this.container.isBound(key);
  }

  protected get<T>(req: ServiceIdentifier<T>): T {
    return this.container.get(req);
  }
}
