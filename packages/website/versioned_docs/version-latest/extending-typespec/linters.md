---
id: linters
title: Linters
---

# Linters

## Linter vs `onValidate`

TypeSpec library can probide a `$onValidate` hook which can be used to validate the TypeSpec program is valid in the eye of your library.

A linter on the other hand might be a validation that is optional, the program is correct but there could be some improvements. For example requiring documentation on every type. This is not something that is needed to represent the TypeSpec program but without it the end user experience might suffer.
Linters need to be explicitly enabled. `$onValidate` will be run automatically if that library is imported.

## Writing a linter

See examples in `packages/best-practices`.

### 1. Define a rules

```ts
import {  createLinterRule } from "@typespec/compiler";
import { reportDiagnostic } from "../lib.js";

export const requiredDocRule = createLinterRule({
  name: "no-model-doc",
  severity: "warning",
  // Short description of what this linter rule does. To be used for generated summary of a linter.
  description: "Enforce documentation on models.",
  messages: {
    default: `Must be documented.`,
    // Different messages can be provided
    models: `Models must be documented.`,

    // Message can be parameterized
    enums: paramMessage`Enum ${"enumName"} must be documented.`,
  },
  create(context) {
    return {
      operation: (op) => {
        if (!getDoc(context.program, op)) {
          context.reportDiagnostic({
            target: model,
          });
        }
      },
      model: (model) => {
        if (!getDoc(context.program, model)) {
          context.reportDiagnostic({
            messageId: "models",
            target: model,
          });
        }
      },
      enums: (type) => {
        if (!getDoc(context.program, type)) {
          context.reportDiagnostic({
            messageId: "enums",
            format: {enumName: type.name}
            target: model,
          });
        }
      },
    };
  },
});
```

#### Provide a codefix

[See codefixes](./codefixes.md) for more details on how codefixes work in the TypeSpec ecosystem.

In the same way you can provide a codefix on any reported diagnostic, you can pass codefixes to the `reportDiagnostic` function.

```ts
context.reportDiagnostic({
  messageId: "models",
  target: model,
  codefixes: [
    defineCodeFix({
      id: "add-model-suffix",
      description: "Add 'Model' suffix to model name",
      apply: (program) => {
        program.update(model, {
          name: `${model.name}Model`,
        });
      },
    }),
  ],
});
```

#### Don'ts

- ❌ Do not call `program.reportDiagnostic` or your library `reportDiagnostic` helper directly in a linter rule

```ts
// ❌ Bad
program.reportDiagnostic({
  code: "other-code",
  target,
});
// ❌ Bad
reportDiagnostic(program, {
  code: "other-code",
  target,
});

// ✅ Good
context.reportDiagnostic({
  target,
});
```

### Register the rules

<!-- cspell:disable-next-line -->

Export a `$linter` variable from your library entrypoint:

```ts title="index.ts"
export { $linter } from "./linter.js";
```

```ts title="linter.ts"
import { defineLinter } from "@typespec/compiler";
// Import the rule defined previously
import { requiredDocRule } from "./rules/required-doc.rule.js";

export const $linter = defineLinter({
  // Include all the rules your linter is defining here.
  rules: [requiredDocRule],

  // Optionally a linter can provide a set of rulesets
  ruleSets: {
    recommended: {
      // (optional) A ruleset takes a map of rules to explicitly enable
      enable: { [`@typespec/my-linter/${requiredDocRule.name}`]: true },

      // (optional) A rule set can extend another rule set
      extends: ["@typespec/best-practices/recommended"],

      // (optional) A rule set can disable a rule enabled in a ruleset it extended.
      disable: {
        "`@typespec/best-practices/no-a": "This doesn't apply in this ruleset.",
      },
    },
  },
});
```

When referencing a rule or ruleset(in `enable`, `extends`, `disable`) the rule or rule set id must be used which in this format: `<libraryName>/<ruleName>`

## Testing a linter

To test linter rule an rule tester is provided letting you test a specific rule without enabling the others.

First you'll want to create an instance of the rule tester using `createLinterRuleTester` passing it the rule that is being tested.
You can then provide different test checking the rule pass or fails.

```ts
import { RuleTester, createLinterRuleTester, createTestRunner } from "@typespec/compiler/testing";
import { requiredDocRule } from "./rules/required-doc.rule.js";

describe("required-doc rule", () => {
  let ruleTester: RuleTester;

  beforeEach(() => {
    const runner = createTestRunner();
    ruleTester = createLinterRuleTester(runner, requiredDocRule, "@typespec/my-linter");
  });

  it("emit diagnostics when using model named foo", async () => {
    await ruleTester.expect(`model Foo {}`).toEmitDiagnostics({
      code: "@typespec/my-linter/no-foo-model",
      message: "Cannot name a model with 'Foo'",
    });
  });

  it("should be valid to use other names", async () => {
    await ruleTester.expect(`model Bar {}`).toBeValid();
  });
});
```

### Testing linter with codefixes

The linter rule tester provides an API to easily test a codefix. This is a different approach from the standalone codefix tester, which is more targeted at testing codefixes in isolation.

This can be done with calling `applyCodeFix` with the fix id. It will expect a single diagnostic to be emitted with a codefix with the given id.
Then calling `toEqual` with the expected code after the codefix is applied.

:::note
When using multi-line strings (with `\``) in typescript there is no de-indenting done so you will need to make sure the input and expected result are aligned to the left.
:::

```ts
await tester
  .expect(
    `        
    model Foo {}
    `
  )
  .applyCodeFix("add-model-suffix").toEqual(`
    model FooModel {}
  `);
```
