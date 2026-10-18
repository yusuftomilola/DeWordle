/**
 * CI guard for #1536: route handlers must return DTOs / plain objects, never
 * TypeORM entities. Resolves each handler's return type with the TypeScript
 * checker and flags any that is (or wraps) a class decorated with @Entity().
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const SRC = path.resolve(__dirname, '../..');
const ROUTE_DECORATORS = new Set(['Get', 'Post', 'Put', 'Patch', 'Delete']);

/** Handlers that knowingly return entities; each needs a reason and a ticket. */
const ALLOWLIST: Record<string, string> = {};

function controllerFiles(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') controllerFiles(full, out);
    } else if (e.name.endsWith('.controller.ts')) {
      out.push(full);
    }
  }
  return out;
}

const decoratorName = (d: ts.Decorator) => {
  const e = d.expression;
  if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) return e.expression.text;
  return ts.isIdentifier(e) ? e.text : undefined;
};
const decoratorsOf = (n: ts.Node) =>
  (ts.canHaveDecorators(n) ? ts.getDecorators(n) : undefined) ?? [];

function audit() {
  const configPath = path.resolve(SRC, '../tsconfig.json');
  const cfg = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, path.dirname(configPath));
  const files = controllerFiles(SRC);
  const program = ts.createProgram(files, {
    ...parsed.options,
    noEmit: true,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();

  const isEntityClass = (type: ts.Type): boolean => {
    const decls = type.getSymbol()?.declarations ?? [];
    return decls.some(
      (d) =>
        ts.isClassDeclaration(d) &&
        decoratorsOf(d).some((dec) => decoratorName(dec) === 'Entity'),
    );
  };

  const containsEntity = (type: ts.Type, depth = 0): boolean => {
    if (depth > 4) return false;
    if (type.isUnion() || type.isIntersection()) {
      return type.types.some((t) => containsEntity(t, depth + 1));
    }
    if (isEntityClass(type)) return true;
    // Promise<T>, T[], Array<T>, and other generic wrappers
    const args = checker.getTypeArguments(type as ts.TypeReference);
    if ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference && args?.length) {
      return args.some((t) => containsEntity(t, depth + 1));
    }
    return false;
  };

  let handlers = 0;
  const violations: string[] = [];
  for (const file of files) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const visit = (node: ts.Node) => {
      if (
        ts.isMethodDeclaration(node) &&
        decoratorsOf(node).some((d) => ROUTE_DECORATORS.has(decoratorName(d) ?? ''))
      ) {
        handlers += 1;
        const sig = checker.getSignatureFromDeclaration(node);
        if (sig && containsEntity(checker.getReturnTypeOfSignature(sig))) {
          const id = `${path.relative(SRC, file)}#${node.name.getText(sf)}`;
          if (!(id in ALLOWLIST)) violations.push(id);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return { handlers, violations };
}

describe('controller return types (#1536)', () => {
  let result: ReturnType<typeof audit>;
  beforeAll(() => {
    result = audit();
  }, 120_000);

  it('inspects the route handlers', () => {
    expect(result.handlers).toBeGreaterThan(20);
  });

  it('no route handler returns a TypeORM entity', () => {
    expect(result.violations).toEqual([]);
  });
});
