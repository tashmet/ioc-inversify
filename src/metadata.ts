import {interfaces} from 'inversify';
import {ConstructorAnnotation, ServiceIdentifier} from '@ziggurat/tiamat';

export class MetadataReader implements interfaces.MetadataReader {
  public getConstructorMetadata(ctr: any): interfaces.ConstructorMetadata {
    const formatMetadata = (injections: ServiceIdentifier<any>[]) => {
      const userGeneratedMetadata: interfaces.MetadataMap = {};
      injections.forEach((injection, index) => {
        const metadata = {key: 'inject', value: injection};
        if (Array.isArray(userGeneratedMetadata[index])) {
            userGeneratedMetadata[index].push(metadata);
        } else {
            userGeneratedMetadata[index] = [metadata];
        }
      });
      return userGeneratedMetadata;
    };
    let ctrInjections: ServiceIdentifier<any>[] = [];
    if (ConstructorAnnotation.existsOnClass(ctr)) {
      ctrInjections = ConstructorAnnotation.onClass(ctr)[0].injections;
    }
    const userGeneratedConsturctorMetadata = formatMetadata(ctrInjections);

    return {
      compilerGeneratedMetadata: new Array(ctrInjections.length),
      userGeneratedMetadata: userGeneratedConsturctorMetadata
    };
  }

  public getPropertiesMetadata(ctr: any): any {
    return {};
  }
}
