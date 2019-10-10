import {Container} from '@ziggurat/tiamat';
import {Container as InversifyContainer} from 'inversify';
import {InversifyAdapter} from './container';

export function container(cnt?: InversifyContainer): Container {
  return new InversifyAdapter(cnt || new InversifyContainer());
}
