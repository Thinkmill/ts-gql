import { bindTypesToContext } from "../output";

const types = bindTypesToContext();

export const { field, fields, interfaceField, object, union } = types;

const interfaceType = types.interface;

export { interfaceType as interface };
