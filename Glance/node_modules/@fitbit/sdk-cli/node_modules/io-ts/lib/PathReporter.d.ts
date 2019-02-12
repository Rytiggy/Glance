import { Reporter } from './Reporter';
import { ValidationError } from './index';
export declare function failure(es: Array<ValidationError>): Array<string>;
export declare function success(): Array<string>;
export declare const PathReporter: Reporter<Array<string>>;
