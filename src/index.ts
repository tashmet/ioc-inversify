import {Container} from '@ziggurat/tiamat';
import {InversifyAdapter} from './container';

export function container(): Container {
  return new InversifyAdapter();
}
