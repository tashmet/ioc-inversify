import {Container as InversifyContainer, injectable} from 'inversify';
import {AbstractContainer, ServiceIdentifier, ServiceRequest, Resolver} from '@ziggurat/tiamat';

@injectable()
export class InversifyAdapter extends AbstractContainer {
  constructor(
    private container: InversifyContainer
  ) { super(); }

  public get<T>(req: ServiceRequest<T>): T {
    return req instanceof Resolver ? req.get(this) : this.container.get(req);
  }

  public registerResolver<T>(key: ServiceIdentifier<T>, resolver: Resolver<T>) {
    try {
      this.container.unbind(key);
    } catch (e) {
      // Previous binding does not exist, do nothing.
    }
    this.container.bind(key).toDynamicValue(() => resolver.get(this)).inTransientScope();
  }

  public isRegistered<T>(key: ServiceIdentifier<T>): boolean {
    return this.container.isBound(key);
  }
}
