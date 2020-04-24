//

import {
  ParserServices,
  TSESLint,
} from "@typescript-eslint/experimental-utils";

type RequiredParserServices = {
  [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>;
};

/**
 * Try to retrieve typescript parser service from context
 */
export function getParserServices(
  context: TSESLint.RuleContext<any, any>
): RequiredParserServices {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    /**
     * The user needs to have configured "project" in their parserOptions
     * for @typescript-eslint/parser
     */
    throw new Error(
      '`@ts-gql/eslint-plugin` requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.'
    );
  }
  return context.parserServices as RequiredParserServices;
}
